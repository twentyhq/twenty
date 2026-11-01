import { Injectable } from '@nestjs/common';

import { type RoleManifest } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';

// Hidden fields and record filters chosen at install, written with the same services as the Access tab
@Injectable()
export class ApplicationGrantRestrictionsService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly fieldPermissionService: FieldPermissionService,
    private readonly rowLevelPermissionPredicateService: RowLevelPermissionPredicateService,
  ) {}

  async writeInstallRestrictions({
    workspaceId,
    grantRoleId,
    grantRoleManifest,
  }: {
    workspaceId: string;
    grantRoleId: string;
    grantRoleManifest: RoleManifest;
  }): Promise<void> {
    const fieldPermissions = grantRoleManifest.fieldPermissions ?? [];
    const predicates = grantRoleManifest.rowLevelPermissionPredicates ?? [];
    const predicateGroups =
      grantRoleManifest.rowLevelPermissionPredicateGroups ?? [];

    if (!isNonEmptyArray(fieldPermissions) && !isNonEmptyArray(predicates)) {
      return;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const findObjectId = (universalIdentifier: string) =>
      this.findIdOrThrow(
        flatObjectMetadataMaps.byUniversalIdentifier[universalIdentifier]?.id,
        universalIdentifier,
      );
    const findFieldId = (universalIdentifier: string) =>
      this.findIdOrThrow(
        flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier]?.id,
        universalIdentifier,
      );

    if (isNonEmptyArray(fieldPermissions)) {
      await this.fieldPermissionService.upsertFieldPermissions({
        workspaceId,
        isSystemBuild: true,
        input: {
          roleId: grantRoleId,
          fieldPermissions: fieldPermissions.map((fieldPermission) => ({
            objectMetadataId: findObjectId(
              fieldPermission.objectUniversalIdentifier,
            ),
            fieldMetadataId: findFieldId(
              fieldPermission.fieldUniversalIdentifier,
            ),
            canReadFieldValue: fieldPermission.canReadFieldValue,
            canUpdateFieldValue: fieldPermission.canUpdateFieldValue,
          })),
        },
      });
    }

    const groupIdByUniversalIdentifier = new Map(
      predicateGroups.map((predicateGroup) => [
        predicateGroup.universalIdentifier,
        v4(),
      ]),
    );
    const objectUniversalIdentifiers = new Set(
      predicates.map((predicate) => predicate.objectUniversalIdentifier),
    );

    for (const objectUniversalIdentifier of objectUniversalIdentifiers) {
      await this.rowLevelPermissionPredicateService.upsertRowLevelPermissionPredicates(
        {
          workspaceId,
          isSystemBuild: true,
          input: {
            roleId: grantRoleId,
            objectMetadataId: findObjectId(objectUniversalIdentifier),
            predicateGroups: predicateGroups
              .filter(
                (predicateGroup) =>
                  predicateGroup.objectUniversalIdentifier ===
                  objectUniversalIdentifier,
              )
              .map((predicateGroup) => ({
                id: groupIdByUniversalIdentifier.get(
                  predicateGroup.universalIdentifier,
                ),
                objectMetadataId: findObjectId(objectUniversalIdentifier),
                logicalOperator: predicateGroup.logicalOperator,
                parentRowLevelPermissionPredicateGroupId: isDefined(
                  predicateGroup.parentPredicateGroupUniversalIdentifier,
                )
                  ? groupIdByUniversalIdentifier.get(
                      predicateGroup.parentPredicateGroupUniversalIdentifier,
                    )
                  : null,
                positionInRowLevelPermissionPredicateGroup:
                  predicateGroup.position,
              })),
            predicates: predicates
              .filter(
                (predicate) =>
                  predicate.objectUniversalIdentifier ===
                  objectUniversalIdentifier,
              )
              .map((predicate) => ({
                id: v4(),
                fieldMetadataId: findFieldId(
                  predicate.fieldUniversalIdentifier,
                ),
                operand: predicate.operand,
                value: predicate.value,
                subFieldName: predicate.subFieldName,
                workspaceMemberFieldMetadataId: isDefined(
                  predicate.workspaceMemberFieldUniversalIdentifier,
                )
                  ? findFieldId(predicate.workspaceMemberFieldUniversalIdentifier)
                  : null,
                workspaceMemberSubFieldName:
                  predicate.workspaceMemberSubFieldName,
                rowLevelPermissionPredicateGroupId: isDefined(
                  predicate.predicateGroupUniversalIdentifier,
                )
                  ? groupIdByUniversalIdentifier.get(
                      predicate.predicateGroupUniversalIdentifier,
                    )
                  : null,
                positionInRowLevelPermissionPredicateGroup: predicate.position,
              })),
          },
        },
      );
    }
  }

  private findIdOrThrow(
    id: string | undefined,
    universalIdentifier: string,
  ): string {
    if (!isDefined(id)) {
      throw new ApplicationException(
        `Metadata ${universalIdentifier} not found`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    return id;
  }
}
