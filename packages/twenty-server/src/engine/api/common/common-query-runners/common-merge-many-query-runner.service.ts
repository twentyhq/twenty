import { Injectable, Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import {
  MUTATION_MAX_MERGE_RECORDS,
  QUERY_MAX_RECORDS_FROM_RELATION,
} from 'twenty-shared/constants';
import {
  FieldMetadataSettingsMapping,
  FieldMetadataType,
  ObjectRecord,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FindOptionsRelations, In, ObjectLiteral } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  type PersonAvatarFileHandover,
  getPersonAvatarFileHandover,
} from 'src/engine/api/common/common-query-runners/utils/get-person-avatar-file-handover.util';
import { getRedundantSourceRecordIds } from 'src/engine/api/common/common-query-runners/utils/get-redundant-source-record-ids.util';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  MergeManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import {
  PERSON_AVATAR_FIELD_NAMES,
  getNewestPersonAvatarFieldValues,
} from 'src/engine/api/graphql/graphql-query-runner/utils/get-newest-person-avatar-field-values.util';
import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';
import { mergeFieldValues } from 'src/engine/api/graphql/graphql-query-runner/utils/merge-field-values.util';
import { WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { PersonRecordMergeEntity } from 'src/engine/core-modules/person-duplicate-review/entities/person-record-merge.entity';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

@Injectable()
export class CommonMergeManyQueryRunnerService extends CommonBaseQueryRunnerService<
  MergeManyQueryArgs,
  ObjectRecord
> {
  private readonly logger = new Logger(CommonMergeManyQueryRunnerService.name);

  protected readonly operationName = CommonQueryNames.MERGE_MANY;

  async run(
    args: CommonExtendedInput<MergeManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<ObjectRecord> {
    const { flatFieldMetadataMaps, flatObjectMetadata } = queryRunnerContext;

    const recordsToMerge = await this.fetchRecordsToMerge(
      queryRunnerContext,
      args,
    );

    const priorityRecord = this.validateAndGetPriorityRecord(
      recordsToMerge,
      args.ids,
      args.conflictPriorityIndex,
    );

    const automaticallyMergedData = this.performDeepMerge(
      recordsToMerge,
      priorityRecord.id,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      args.dryRun ?? false,
    );
    const mergedData = {
      ...automaticallyMergedData,
      ...(args.data ?? {}),
    };

    if (args.dryRun) {
      return this.createDryRunResponse(priorityRecord, mergedData);
    }

    const idsToDelete = args.ids.filter((id) => id !== priorityRecord.id);

    const personAvatarFileHandover = this.isPersonObject(flatObjectMetadata)
      ? getPersonAvatarFileHandover({
          mergedAvatarFile: mergedData.avatarFile,
          recordsToMerge,
          survivorPersonId: priorityRecord.id,
        })
      : null;

    const updatedRecord =
      await queryRunnerContext.workspaceDataSource.transaction(
        (transactionManager: WorkspaceEntityManager) =>
          this.executeMergeWithinTransaction(transactionManager, {
            args,
            queryRunnerContext,
            idsToDelete,
            priorityRecordId: priorityRecord.id,
            mergedData,
            personAvatarFileHandover,
          }),
      );

    if (this.isPersonObject(flatObjectMetadata)) {
      await this.recordPersonMergeProvenance({
        queryRunnerContext,
        sourcePersonIds: idsToDelete,
        targetPersonId: priorityRecord.id,
      });
    }

    await this.processNestedRelations({
      args,
      queryRunnerContext,
      updatedRecords: [updatedRecord],
    });

    return updatedRecord;
  }

  private async executeMergeWithinTransaction(
    transactionManager: WorkspaceEntityManager,
    {
      args,
      queryRunnerContext,
      idsToDelete,
      priorityRecordId,
      mergedData,
      personAvatarFileHandover,
    }: {
      args: CommonExtendedInput<MergeManyQueryArgs>;
      queryRunnerContext: CommonExtendedQueryRunnerContext;
      idsToDelete: string[];
      priorityRecordId: string;
      mergedData: Partial<ObjectRecord>;
      personAvatarFileHandover: PersonAvatarFileHandover | null;
    },
  ): Promise<ObjectRecord> {
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = queryRunnerContext;

    const columnsToReturn = buildColumnsToReturn({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const transactionRepository = transactionManager.getRepository(
      flatObjectMetadata.nameSingular,
      queryRunnerContext.rolePermissionConfig,
      queryRunnerContext.authContext,
    );

    if (this.isPersonObject(flatObjectMetadata)) {
      // Keep ambiguous source-to-source collisions; only remove a source row
      // when the survivor already has an otherwise identical interaction.
      await this.deleteClearlyRedundantPersonRelationRecords(
        transactionManager,
        queryRunnerContext,
        idsToDelete,
        priorityRecordId,
      );
    }

    if (isDefined(personAvatarFileHandover)) {
      await this.releasePersonAvatarFileOwnership(
        transactionRepository,
        personAvatarFileHandover.previousOwnerPersonIds,
      );
    }

    await this.migrateRelatedRecords(
      transactionManager,
      queryRunnerContext,
      idsToDelete,
      priorityRecordId,
    );

    if (this.isPersonObject(flatObjectMetadata)) {
      await this.releaseAbsorbedPersonUniqueValues(
        transactionRepository,
        idsToDelete,
      );
    }

    const deleteQueryBuilder = transactionRepository.createQueryBuilder(
      flatObjectMetadata.nameSingular,
    );

    if (this.isPersonObject(flatObjectMetadata)) {
      await deleteQueryBuilder
        .softDelete()
        .whereInIds(idsToDelete)
        .returning(columnsToReturn)
        .execute();
    } else {
      await deleteQueryBuilder
        .delete()
        .whereInIds(idsToDelete)
        .returning(columnsToReturn)
        .execute();
    }

    if (!isDefined(personAvatarFileHandover)) {
      return this.updatePriorityRecord(
        args,
        queryRunnerContext,
        transactionRepository,
        priorityRecordId,
        mergedData,
      );
    }

    // The FILES sync only accepts a file as an addition while it is still marked temporary,
    // which is what an upload looks like just before it lands on a record. Put the handed
    // over file back in that state so the survivor's update claims it the ordinary way; the
    // sync marks it permanent again, and a failure here restores it rather than leaving it
    // looking like an abandoned upload for the cleanup job to collect.
    await this.setPersonAvatarFilesTemporary(
      queryRunnerContext,
      personAvatarFileHandover.fileIdsToClaim,
      true,
    );

    try {
      return await this.updatePriorityRecord(
        args,
        queryRunnerContext,
        transactionRepository,
        priorityRecordId,
        mergedData,
      );
    } catch (error) {
      await this.setPersonAvatarFilesTemporary(
        queryRunnerContext,
        personAvatarFileHandover.fileIdsToClaim,
        false,
      );

      throw error;
    }
  }

  // A null value makes the FILES sync skip the field entirely, so the absorbed record lets go
  // of the avatar without the file being soft deleted along with it. Clearing it with an empty
  // array instead would read as a removal and take the file the survivor is about to claim.
  private async releasePersonAvatarFileOwnership(
    repository: WorkspaceRepository<ObjectLiteral>,
    previousOwnerPersonIds: string[],
  ): Promise<void> {
    if (previousOwnerPersonIds.length === 0) {
      return;
    }

    await repository
      .createQueryBuilder('person')
      .update()
      .set({ avatarFile: null })
      .where({ id: In(previousOwnerPersonIds) })
      .returning(['id'])
      .execute();
  }

  private async setPersonAvatarFilesTemporary(
    queryRunnerContext: CommonExtendedQueryRunnerContext,
    fileIds: string[],
    isTemporaryFile: boolean,
  ): Promise<void> {
    if (fileIds.length === 0) {
      return;
    }

    await queryRunnerContext.workspaceDataSource.coreDataSource
      .getRepository(FileEntity)
      .update(
        { id: In(fileIds) },
        { settings: { isTemporaryFile, toDelete: false } },
      );
  }

  private async releaseAbsorbedPersonUniqueValues(
    repository: WorkspaceRepository<ObjectLiteral>,
    personIds: string[],
  ): Promise<void> {
    // Person emails remain subject to a workspace unique index after a soft
    // delete. Release them inside the merge transaction so a reviewed email
    // can be assigned to the survivor. Use null because PostgreSQL unique
    // indexes allow multiple nulls; the API still exposes this as an empty
    // primary email in Trash. Other record details remain in Trash.
    await repository
      .createQueryBuilder('person')
      .update()
      .set({
        emails: {
          primaryEmail: null,
          additionalEmails: [],
        },
      })
      .where({ id: In(personIds) })
      .returning(['id'])
      .execute();
  }

  private async fetchRecordsToMerge(
    context: CommonExtendedQueryRunnerContext,
    args: CommonExtendedInput<MergeManyQueryArgs>,
  ): Promise<ObjectRecord[]> {
    const columnsToSelect: Record<string, boolean> = buildColumnsToSelect({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      flatObjectMetadata: context.flatObjectMetadata,
      flatObjectMetadataMaps: context.flatObjectMetadataMaps,
      flatFieldMetadataMaps: context.flatFieldMetadataMaps,
    });

    // The avatar fields are system fields excluded from the normal merge, so we select them
    // (and updatedAt) explicitly to keep the newest person's avatar. See performDeepMerge.
    if (this.isPersonObject(context.flatObjectMetadata)) {
      columnsToSelect.updatedAt = true;

      for (const avatarFieldName of PERSON_AVATAR_FIELD_NAMES) {
        columnsToSelect[avatarFieldName] = true;
      }
    }

    const fetchedRecords = (await context.repository.find({
      where: { id: In(args.ids) },
      select: columnsToSelect,
    })) as ObjectRecord[];

    if (fetchedRecords.length !== args.ids.length) {
      throw new CommonQueryRunnerException(
        'One or more records not found',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
        { userFriendlyMessage: msg`One or more records were not found.` },
      );
    }

    const orderIndex = new Map(args.ids.map((id, index) => [id, index]));

    fetchedRecords.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    );

    const recordsToMerge = fetchedRecords;

    if (args.dryRun && args.selectedFieldsResult.relations) {
      await this.processNestedRelationsHelper.processNestedRelations({
        flatObjectMetadataMaps: context.flatObjectMetadataMaps,
        flatFieldMetadataMaps: context.flatFieldMetadataMaps,
        parentObjectMetadataItem: context.flatObjectMetadata,
        parentObjectRecords: recordsToMerge,
        relations: args.selectedFieldsResult.relations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        limit: QUERY_MAX_RECORDS_FROM_RELATION,
        authContext: context.authContext,
        workspaceDataSource: context.workspaceDataSource,
        rolePermissionConfig: context.rolePermissionConfig,
        selectedFields: args.selectedFieldsResult.select,
      });
    }

    return recordsToMerge;
  }

  private validateAndGetPriorityRecord(
    recordsToMerge: ObjectRecord[],
    ids: string[],
    conflictPriorityIndex: number,
  ): ObjectRecord {
    const priorityRecordId = ids[conflictPriorityIndex];
    const priorityRecord = recordsToMerge.find(
      (record) => record.id === priorityRecordId,
    );

    if (!priorityRecord) {
      throw new CommonQueryRunnerException(
        'Priority record not found',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
        {
          userFriendlyMessage: msg`This record does not exist or has been deleted.`,
        },
      );
    }

    return priorityRecord;
  }

  private performDeepMerge(
    recordsToMerge: ObjectRecord[],
    priorityRecordId: string,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    isDryRun = false,
  ): Partial<ObjectRecord> {
    const mergedResult: Partial<ObjectRecord> = {};

    const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    const allFieldNames = new Set<string>();

    recordsToMerge.forEach((record) => {
      Object.keys(record).forEach((fieldName) => {
        if (
          !this.shouldExcludeFieldFromMerge(
            fieldName,
            fieldIdByName,
            flatFieldMetadataMaps,
          )
        ) {
          allFieldNames.add(fieldName);
        }
      });
    });

    allFieldNames.forEach((fieldName) => {
      const recordsWithValues: { value: unknown; recordId: string }[] = [];

      recordsToMerge.forEach((record) => {
        const fieldValue = record[fieldName];

        if (hasRecordFieldValue(fieldValue)) {
          recordsWithValues.push({ value: fieldValue, recordId: record.id });
        }
      });

      if (recordsWithValues.length === 0) {
        return;
      } else if (recordsWithValues.length === 1) {
        mergedResult[fieldName] = recordsWithValues[0].value;
      } else {
        const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldIdByName[fieldName],
          flatEntityMaps: flatFieldMetadataMaps,
        });

        if (!fieldMetadata) {
          return;
        }

        const relationType =
          isDryRun && fieldMetadata.type === FieldMetadataType.RELATION
            ? (
                fieldMetadata.settings as FieldMetadataSettingsMapping['RELATION']
              )?.relationType
            : undefined;

        mergedResult[fieldName] = mergeFieldValues(
          fieldMetadata.type,
          recordsWithValues,
          priorityRecordId,
          isDryRun,
          relationType,
        );
      }
    });

    if (this.isPersonObject(flatObjectMetadata)) {
      Object.assign(
        mergedResult,
        getNewestPersonAvatarFieldValues(recordsToMerge),
      );
    }

    return mergedResult;
  }

  private isPersonObject(flatObjectMetadata: FlatObjectMetadata): boolean {
    return flatObjectMetadata.nameSingular === 'person';
  }

  private shouldExcludeFieldFromMerge(
    fieldName: string,
    fieldIdByName: Record<string, string>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): boolean {
    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldIdByName[fieldName],
      flatEntityMaps: flatFieldMetadataMaps,
    });

    return fieldMetadata?.isSystem ?? false;
  }

  private createDryRunResponse(
    priorityRecord: ObjectRecord,
    mergedData: Partial<ObjectRecord>,
  ): ObjectRecord {
    const dryRunRecord: ObjectRecord = {
      ...priorityRecord,
      ...mergedData,
      id: uuidv4(),
      deletedAt: new Date().toISOString(),
    };

    return dryRunRecord;
  }

  private async updatePriorityRecord(
    args: CommonExtendedInput<MergeManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
    repository: WorkspaceRepository<ObjectLiteral>,
    priorityRecordId: string,
    mergedData: Partial<ObjectRecord>,
  ): Promise<ObjectRecord> {
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = queryRunnerContext;

    const queryBuilder = repository.createQueryBuilder(
      flatObjectMetadata.nameSingular,
    );

    const columnsToReturn = buildColumnsToReturn({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const updatedObjectRecords = await queryBuilder
      .update()
      .set(mergedData)
      .where({ id: priorityRecordId })
      .returning(columnsToReturn)
      .execute();

    if (!updatedObjectRecords.generatedMaps.length) {
      throw new CommonQueryRunnerException(
        'Failed to update record',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const updatedRecord = updatedObjectRecords.generatedMaps[0] as ObjectRecord;

    return updatedRecord;
  }

  private async migrateRelatedRecords(
    transactionManager: WorkspaceEntityManager,
    context: CommonExtendedQueryRunnerContext,
    fromIds: string[],
    toId: string,
  ): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata,
    } = context;

    const relationFieldsPointingToCurrentObject: Array<{
      objectMetadata: FlatObjectMetadata;
      joinColumnName: string | undefined;
    }> = [];

    for (const field of Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      // Notes, tasks, timeline activities and attachments reach a person through a morph
      // relation, so restricting this to plain relations left them behind on the absorbed
      // record and the merge silently dropped them.
      if (
        !isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION) &&
        !isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION)
      ) {
        continue;
      }

      if (
        field.relationTargetObjectMetadataId !== flatObjectMetadata.id ||
        !field.isActive
      ) {
        continue;
      }

      const relationSettings = field.settings as
        | FieldMetadataSettingsMapping['RELATION']
        | undefined;

      if (relationSettings?.relationType !== RelationType.MANY_TO_ONE) {
        continue;
      }

      const objMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: field.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!objMetadata) {
        continue;
      }

      relationFieldsPointingToCurrentObject.push({
        objectMetadata: objMetadata,
        joinColumnName: computeMorphOrRelationFieldJoinColumnName({
          name: field.name,
        }),
      });
    }

    for (const relationField of relationFieldsPointingToCurrentObject) {
      if (!relationField.joinColumnName) {
        continue;
      }

      const repository = transactionManager.getRepository(
        relationField.objectMetadata.nameSingular,
        context.rolePermissionConfig,
        context.authContext,
      );

      // repository.update() runs outside the transaction; build from the transaction-scoped repository so the migration rolls back with the merge.
      await repository
        .createQueryBuilder(relationField.objectMetadata.nameSingular)
        .update()
        .set({ [relationField.joinColumnName]: toId })
        .where({ [relationField.joinColumnName]: In(fromIds) })
        .returning('*')
        .execute();
    }
  }

  private async deleteClearlyRedundantPersonRelationRecords(
    transactionManager: WorkspaceEntityManager,
    context: CommonExtendedQueryRunnerContext,
    sourcePersonIds: string[],
    survivorPersonId: string,
  ): Promise<void> {
    await this.deleteSourceRecordsWithSurvivorEquivalent({
      transactionManager,
      context,
      objectNameSingular: 'noteTarget',
      personRelationIdFieldName: 'targetPersonId',
      sourcePersonIds,
      survivorPersonId,
    });

    await this.deleteSourceRecordsWithSurvivorEquivalent({
      transactionManager,
      context,
      objectNameSingular: 'taskTarget',
      personRelationIdFieldName: 'targetPersonId',
      sourcePersonIds,
      survivorPersonId,
    });

    await this.deleteSourceRecordsWithSurvivorEquivalent({
      transactionManager,
      context,
      objectNameSingular: 'timelineActivity',
      personRelationIdFieldName: 'targetPersonId',
      sourcePersonIds,
      survivorPersonId,
      canBeDeduplicated: (record) =>
        isDefined(record.linkedRecordId) &&
        (record.name === 'message.linked' ||
          record.name === 'calendarEvent.linked' ||
          record.name?.startsWith('linked-note.') ||
          record.name?.startsWith('linked-task.')),
    });
  }

  private async deleteSourceRecordsWithSurvivorEquivalent({
    transactionManager,
    context,
    objectNameSingular,
    personRelationIdFieldName,
    sourcePersonIds,
    survivorPersonId,
    canBeDeduplicated,
  }: {
    transactionManager: WorkspaceEntityManager;
    context: CommonExtendedQueryRunnerContext;
    objectNameSingular: 'noteTarget' | 'taskTarget' | 'timelineActivity';
    personRelationIdFieldName: string;
    sourcePersonIds: string[];
    survivorPersonId: string;
    canBeDeduplicated?: (record: ObjectLiteral) => boolean;
  }): Promise<void> {
    const repository = transactionManager.getRepository(
      objectNameSingular,
      context.rolePermissionConfig,
      context.authContext,
    );

    const records = await repository.find({
      where: {
        [personRelationIdFieldName]: In([survivorPersonId, ...sourcePersonIds]),
      },
    });

    const redundantSourceRecordIds = getRedundantSourceRecordIds({
      records,
      sourcePersonIds,
      survivorPersonId,
      personRelationIdFieldName,
      canBeDeduplicated,
    });

    if (redundantSourceRecordIds.length === 0) {
      return;
    }

    await repository
      .createQueryBuilder(objectNameSingular)
      .delete()
      .whereInIds(redundantSourceRecordIds)
      .returning(['id'])
      .execute();
  }

  private async processNestedRelations({
    args,
    queryRunnerContext,
    updatedRecords,
  }: {
    args: CommonExtendedInput<MergeManyQueryArgs>;
    queryRunnerContext: CommonExtendedQueryRunnerContext;
    updatedRecords: ObjectRecord[];
  }): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata,
      authContext,
      workspaceDataSource,
      rolePermissionConfig,
    } = queryRunnerContext;

    if (args.selectedFieldsResult.relations) {
      await this.processNestedRelationsHelper.processNestedRelations({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        parentObjectMetadataItem: flatObjectMetadata,
        parentObjectRecords: updatedRecords,
        relations: args.selectedFieldsResult.relations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        limit: QUERY_MAX_RECORDS_FROM_RELATION,
        authContext,
        workspaceDataSource,
        rolePermissionConfig,
        selectedFields: args.selectedFieldsResult.select,
      });
    }
  }

  private async recordPersonMergeProvenance({
    queryRunnerContext,
    sourcePersonIds,
    targetPersonId,
  }: {
    queryRunnerContext: CommonExtendedQueryRunnerContext;
    sourcePersonIds: string[];
    targetPersonId: string;
  }): Promise<void> {
    const mergedByWorkspaceMemberId = isUserAuthContext(
      queryRunnerContext.authContext,
    )
      ? queryRunnerContext.authContext.workspaceMemberId
      : null;

    try {
      await queryRunnerContext.workspaceDataSource.coreDataSource
        .getRepository(PersonRecordMergeEntity)
        .insert(
          sourcePersonIds.map((sourcePersonId) => ({
            workspaceId: queryRunnerContext.authContext.workspace.id,
            sourcePersonId,
            targetPersonId,
            mergedByWorkspaceMemberId,
          })),
        );
    } catch {
      // The workspace merge has already committed. Do not report the merge as
      // failed after the records and their relationships have been changed.
      this.logger.error('Failed to record person merge provenance');
    }
  }

  async computeArgs(
    args: CommonInput<MergeManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<MergeManyQueryArgs>> {
    if (!isDefined(args.data)) {
      return args;
    }

    const {
      authContext,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    } = queryRunnerContext;

    return {
      ...args,
      data: (
        await this.dataArgProcessor.process({
          partialRecordInputs: [args.data],
          authContext,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          flatObjectMetadataMaps,
          shouldBackfillPositionIfUndefined: false,
        })
      )[0],
    };
  }

  async processQueryResult(
    queryResult: ObjectRecord,
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    authContext: WorkspaceAuthContext,
  ): Promise<ObjectRecord> {
    // Run the shared result getters (like every other mutation) so FILES fields such as the
    // person avatarFile get their signed url resolved; without this the merged record carries
    // only a fileId and the UI falls back to placeholder initials.
    return this.commonResultGettersService.processRecord(
      queryResult,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      authContext.workspace.id,
    );
  }

  async validate(
    args: CommonInput<MergeManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<void> {
    const { flatObjectMetadata } = queryRunnerContext;

    assertMutationNotOnRemoteObject(flatObjectMetadata);

    if (!isDefined(flatObjectMetadata.duplicateCriteria)) {
      throw new CommonQueryRunnerException(
        `Merge is only available for objects with duplicate criteria. Object '${flatObjectMetadata.nameSingular}' does not have duplicate criteria defined.`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: msg`This type of record cannot be merged.` },
      );
    }

    const { ids, conflictPriorityIndex } = args;

    if (!ids || ids.length < 2) {
      throw new CommonQueryRunnerException(
        'At least 2 record IDs are required for merge',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        {
          userFriendlyMessage: msg`Please select at least 2 records to merge.`,
        },
      );
    }

    if (ids.length > MUTATION_MAX_MERGE_RECORDS) {
      throw new CommonQueryRunnerException(
        `Maximum ${MUTATION_MAX_MERGE_RECORDS} records can be merged at once`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        {
          userFriendlyMessage: msg`You can merge up to ${MUTATION_MAX_MERGE_RECORDS} records at once.`,
        },
      );
    }

    if (conflictPriorityIndex < 0 || conflictPriorityIndex >= ids.length) {
      throw new CommonQueryRunnerException(
        `Invalid conflict priority '${conflictPriorityIndex}'. Valid options for ${ids.length} records: 0-${ids.length - 1}`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }
}
