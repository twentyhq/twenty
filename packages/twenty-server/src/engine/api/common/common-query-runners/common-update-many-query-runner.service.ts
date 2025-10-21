import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { ObjectRecord } from 'twenty-shared/types';
import { FindOptionsRelations, ObjectLiteral } from 'typeorm';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import {
  CommonQueryNames,
  UpdateManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { isWorkspaceAuthContext } from 'src/engine/api/common/utils/is-workspace-auth-context.util';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

@Injectable()
export class CommonUpdateManyQueryRunnerService extends CommonBaseQueryRunnerService {
  async run({
    args,
    authContext,
    objectMetadataMaps,
    objectMetadataItemWithFieldMaps,
  }: {
    args: UpdateManyQueryArgs;
    authContext: AuthContext;
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  }): Promise<ObjectRecord[]> {
    this.validate(args, objectMetadataItemWithFieldMaps);

    if (!isWorkspaceAuthContext(authContext)) {
      throw new CommonQueryRunnerException(
        'Invalid auth context',
        CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT,
      );
    }

    const { workspaceDataSource, repository, rolePermissionConfig } =
      await this.prepareQueryRunnerContext({
        authContext,
        objectMetadataItemWithFieldMaps,
      });

    const commonQueryParser = new GraphqlQueryParser(
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    const selectedFieldsResult = commonQueryParser.parseSelectedFields(
      objectMetadataItemWithFieldMaps,
      args.selectedFields,
      objectMetadataMaps,
    );

    const processedArgs = await this.processQueryArgs({
      authContext,
      objectMetadataItemWithFieldMaps,
      args,
    });

    const queryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const tableName = computeTableName(
      objectMetadataItemWithFieldMaps.nameSingular,
      objectMetadataItemWithFieldMaps.isCustom,
    );

    commonQueryParser.applyFilterToBuilder(
      queryBuilder,
      tableName,
      processedArgs.filter,
    );

    const columnsToReturn = buildColumnsToReturn({
      select: selectedFieldsResult.select,
      relations: selectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });

    const updatedObjectRecords = await queryBuilder
      .update()
      .set(processedArgs.data)
      .returning(columnsToReturn)
      .execute();

    const updatedRecords = updatedObjectRecords.generatedMaps as ObjectRecord[];

    if (selectedFieldsResult.relations) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: updatedRecords,
        //TODO : Refacto-common - Typing to fix when switching processNestedRelationsHelper to Common
        relations: selectedFieldsResult.relations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        limit: QUERY_MAX_RECORDS,
        authContext,
        workspaceDataSource,
        rolePermissionConfig,
        selectedFields: selectedFieldsResult.select,
      });
    }

    const enrichedRecords = await this.enrichResultsWithGettersAndHooks({
      results: updatedRecords,
      operationName: CommonQueryNames.updateMany,
      authContext,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });

    return enrichedRecords;
  }

  validate(
    args: UpdateManyQueryArgs,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ) {
    assertMutationNotOnRemoteObject(objectMetadataItemWithFieldMaps);

    if (!args.filter) {
      throw new CommonQueryRunnerException(
        'Filter is required',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    //TODO : Refacto-common - To remove when adding filter validation
    args.filter.id?.in?.forEach((id: string) => assertIsValidUuid(id));
  }

  async processQueryArgs({
    authContext,
    objectMetadataItemWithFieldMaps,
    args,
  }: {
    authContext: WorkspaceAuthContext;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    args: UpdateManyQueryArgs;
  }): Promise<UpdateManyQueryArgs> {
    const hookedArgs =
      (await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItemWithFieldMaps.nameSingular,
        CommonQueryNames.updateMany,
        args,
        //TODO : Refacto-common - To fix when updating workspaceQueryHookService, removing gql typing dependency
      )) as UpdateManyQueryArgs;

    return {
      ...hookedArgs,
      filter:
        this.queryRunnerArgsFactory.overrideFilterByFieldMetadata(
          hookedArgs.filter,
          objectMetadataItemWithFieldMaps,
        ) || {},
      data: (
        await this.queryRunnerArgsFactory.overrideDataByFieldMetadata({
          partialRecordInputs: [hookedArgs.data],
          authContext,
          objectMetadataItemWithFieldMaps,
          shouldBackfillPositionIfUndefined: false,
        })
      )[0],
    };
  }
}
