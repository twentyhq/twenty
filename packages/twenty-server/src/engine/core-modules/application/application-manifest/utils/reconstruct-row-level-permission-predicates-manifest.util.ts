import {
  type RowLevelPermissionPredicateGroupManifest,
  type RowLevelPermissionPredicateManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromFlatRowLevelPermissionPredicateGroupToRowLevelPermissionPredicateGroupManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-row-level-permission-predicate-group-to-row-level-permission-predicate-group-manifest.util';
import { fromFlatRowLevelPermissionPredicateToRowLevelPermissionPredicateManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-row-level-permission-predicate-to-row-level-permission-predicate-manifest.util';
import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import {
  type ChildMetadataName,
  type ParentStatus,
} from 'src/engine/core-modules/application/application-manifest/types/export-classification.type';
import { computeExportedRowLevelPermissionPredicateGroupUniversalIdentifiers } from 'src/engine/core-modules/application/application-manifest/utils/compute-exported-row-level-permission-predicate-group-universal-identifiers.util';
import { createChildDecider } from 'src/engine/core-modules/application/application-manifest/utils/create-child-decider.util';
import { MANIFEST_ENTITY_REGISTRY } from 'src/engine/core-modules/application/application-manifest/utils/find-manifest-entity-descriptor-by-universal-identifier.util';
import { getUnresolvableReferenceReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unresolvable-reference-reason.util';
import {
  isSameRowLevelPermissionScope,
  type RowLevelPermissionScope,
} from 'src/engine/core-modules/application/application-manifest/utils/is-same-row-level-permission-scope.util';
import { sortFlatEntitiesByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/sort-flat-entities-by-universal-identifier.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate-group.type';
import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';

type RowLevelPermissionMetadataName = Extract<
  ChildMetadataName,
  'rowLevelPermissionPredicate' | 'rowLevelPermissionPredicateGroup'
>;

const appendByRole = <TManifest>({
  manifestsByRoleUniversalIdentifier,
  roleUniversalIdentifier,
  manifest,
}: {
  manifestsByRoleUniversalIdentifier: Map<string, TManifest[]>;
  roleUniversalIdentifier: string;
  manifest: TManifest;
}): void => {
  const manifests =
    manifestsByRoleUniversalIdentifier.get(roleUniversalIdentifier) ?? [];

  manifests.push(manifest);
  manifestsByRoleUniversalIdentifier.set(roleUniversalIdentifier, manifests);
};

export const reconstructRowLevelPermissionPredicatesManifest = ({
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  exportedObjectUniversalIdentifiers,
  resolvableFieldUniversalIdentifiers,
  parentRoleStatusByUniversalIdentifier,
}: {
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  exportedObjectUniversalIdentifiers: ReadonlySet<string>;
  resolvableFieldUniversalIdentifiers: ReadonlySet<string>;
  parentRoleStatusByUniversalIdentifier: ReadonlyMap<string, ParentStatus>;
}): {
  predicateGroupsByRoleUniversalIdentifier: Map<
    string,
    RowLevelPermissionPredicateGroupManifest[]
  >;
  predicatesByRoleUniversalIdentifier: Map<
    string,
    RowLevelPermissionPredicateManifest[]
  >;
  coverage: ApplicationExportCoverageEntry[];
} => {
  const coverage: ApplicationExportCoverageEntry[] = [];
  const {
    flatRowLevelPermissionPredicateGroupMaps,
    flatRowLevelPermissionPredicateMaps,
  } = applicationAllFlatEntityMaps;
  const decideRoleChild = createChildDecider<
    | UniversalFlatRowLevelPermissionPredicateGroup
    | UniversalFlatRowLevelPermissionPredicate
  >({
    coverage,
    parentMetadataName: 'role',
    parentStatusByUniversalIdentifier: parentRoleStatusByUniversalIdentifier,
    getParentUniversalIdentifier: ({ roleUniversalIdentifier }) =>
      roleUniversalIdentifier,
  });
  const getUnresolvableObjectReason = ({
    metadataName,
    objectMetadataUniversalIdentifier,
  }: {
    metadataName: RowLevelPermissionMetadataName;
    objectMetadataUniversalIdentifier: string;
  }) =>
    getUnresolvableReferenceReason({
      metadataName,
      referenceMetadataName: 'objectMetadata',
      referenceUniversalIdentifier: objectMetadataUniversalIdentifier,
      applicationAllFlatEntityMaps,
      allFlatEntityMaps,
      resolvableReferenceUniversalIdentifiers:
        exportedObjectUniversalIdentifiers,
    });
  const getUnresolvableFieldReason = ({
    fieldMetadataUniversalIdentifier,
  }: {
    fieldMetadataUniversalIdentifier: string | null;
  }) =>
    getUnresolvableReferenceReason({
      metadataName: 'rowLevelPermissionPredicate',
      referenceMetadataName: 'fieldMetadata',
      referenceUniversalIdentifier: fieldMetadataUniversalIdentifier,
      applicationAllFlatEntityMaps,
      allFlatEntityMaps,
      resolvableReferenceUniversalIdentifiers:
        resolvableFieldUniversalIdentifiers,
    });

  const exportedPredicateGroupUniversalIdentifiers =
    computeExportedRowLevelPermissionPredicateGroupUniversalIdentifiers({
      flatRowLevelPermissionPredicateGroupMaps,
      isExportableOnItsOwn: (flatRowLevelPermissionPredicateGroup) =>
        !isDefined(flatRowLevelPermissionPredicateGroup.deletedAt) &&
        parentRoleStatusByUniversalIdentifier.get(
          flatRowLevelPermissionPredicateGroup.roleUniversalIdentifier,
        ) === 'exported' &&
        !isDefined(
          getUnresolvableObjectReason({
            metadataName: 'rowLevelPermissionPredicateGroup',
            objectMetadataUniversalIdentifier:
              flatRowLevelPermissionPredicateGroup.objectMetadataUniversalIdentifier,
          }),
        ),
    });

  const getUnexportedPredicateGroupReason = ({
    metadataName,
    scope,
    predicateGroupUniversalIdentifier,
  }: {
    metadataName: RowLevelPermissionMetadataName;
    scope: RowLevelPermissionScope;
    predicateGroupUniversalIdentifier: string | null;
  }): string | undefined => {
    if (!isDefined(predicateGroupUniversalIdentifier)) {
      return undefined;
    }

    const flatRowLevelPermissionPredicateGroup =
      flatRowLevelPermissionPredicateGroupMaps.byUniversalIdentifier[
        predicateGroupUniversalIdentifier
      ];

    return isDefined(flatRowLevelPermissionPredicateGroup) &&
      isSameRowLevelPermissionScope({
        scope,
        otherScope: flatRowLevelPermissionPredicateGroup,
      }) &&
      exportedPredicateGroupUniversalIdentifiers.has(
        predicateGroupUniversalIdentifier,
      )
      ? undefined
      : `${MANIFEST_ENTITY_REGISTRY[metadataName].entityKind} in a ${MANIFEST_ENTITY_REGISTRY.rowLevelPermissionPredicateGroup.entityKind} that is not exported`;
  };

  const predicateGroupsByRoleUniversalIdentifier = new Map<
    string,
    RowLevelPermissionPredicateGroupManifest[]
  >();
  const predicatesByRoleUniversalIdentifier = new Map<
    string,
    RowLevelPermissionPredicateManifest[]
  >();

  for (const flatRowLevelPermissionPredicateGroup of sortFlatEntitiesByUniversalIdentifier(
    flatRowLevelPermissionPredicateGroupMaps,
  )) {
    if (isDefined(flatRowLevelPermissionPredicateGroup.deletedAt)) {
      continue;
    }

    if (
      decideRoleChild({
        metadataName: 'rowLevelPermissionPredicateGroup',
        flatEntity: flatRowLevelPermissionPredicateGroup,
        unsupportedReason:
          getUnresolvableObjectReason({
            metadataName: 'rowLevelPermissionPredicateGroup',
            objectMetadataUniversalIdentifier:
              flatRowLevelPermissionPredicateGroup.objectMetadataUniversalIdentifier,
          }) ??
          getUnexportedPredicateGroupReason({
            metadataName: 'rowLevelPermissionPredicateGroup',
            scope: flatRowLevelPermissionPredicateGroup,
            predicateGroupUniversalIdentifier:
              flatRowLevelPermissionPredicateGroup.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
          }),
      }) === 'nested'
    ) {
      appendByRole({
        manifestsByRoleUniversalIdentifier:
          predicateGroupsByRoleUniversalIdentifier,
        roleUniversalIdentifier:
          flatRowLevelPermissionPredicateGroup.roleUniversalIdentifier,
        manifest:
          fromFlatRowLevelPermissionPredicateGroupToRowLevelPermissionPredicateGroupManifest(
            { flatRowLevelPermissionPredicateGroup },
          ),
      });
    }
  }

  for (const flatRowLevelPermissionPredicate of sortFlatEntitiesByUniversalIdentifier(
    flatRowLevelPermissionPredicateMaps,
  )) {
    if (isDefined(flatRowLevelPermissionPredicate.deletedAt)) {
      continue;
    }

    if (
      decideRoleChild({
        metadataName: 'rowLevelPermissionPredicate',
        flatEntity: flatRowLevelPermissionPredicate,
        unsupportedReason:
          getUnresolvableObjectReason({
            metadataName: 'rowLevelPermissionPredicate',
            objectMetadataUniversalIdentifier:
              flatRowLevelPermissionPredicate.objectMetadataUniversalIdentifier,
          }) ??
          getUnresolvableFieldReason({
            fieldMetadataUniversalIdentifier:
              flatRowLevelPermissionPredicate.fieldMetadataUniversalIdentifier,
          }) ??
          getUnresolvableFieldReason({
            fieldMetadataUniversalIdentifier:
              flatRowLevelPermissionPredicate.workspaceMemberFieldMetadataUniversalIdentifier,
          }) ??
          getUnexportedPredicateGroupReason({
            metadataName: 'rowLevelPermissionPredicate',
            scope: flatRowLevelPermissionPredicate,
            predicateGroupUniversalIdentifier:
              flatRowLevelPermissionPredicate.rowLevelPermissionPredicateGroupUniversalIdentifier,
          }),
      }) === 'nested'
    ) {
      appendByRole({
        manifestsByRoleUniversalIdentifier: predicatesByRoleUniversalIdentifier,
        roleUniversalIdentifier:
          flatRowLevelPermissionPredicate.roleUniversalIdentifier,
        manifest:
          fromFlatRowLevelPermissionPredicateToRowLevelPermissionPredicateManifest(
            { flatRowLevelPermissionPredicate },
          ),
      });
    }
  }

  return {
    predicateGroupsByRoleUniversalIdentifier,
    predicatesByRoleUniversalIdentifier,
    coverage,
  };
};
