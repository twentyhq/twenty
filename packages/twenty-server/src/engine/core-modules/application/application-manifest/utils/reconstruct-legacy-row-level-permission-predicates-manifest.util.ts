import {
  nestRowLevelPermissionRuleManifests,
  type LegacyRowLevelPermissionPredicateGroupManifest,
  type LegacyRowLevelPermissionPredicateManifest,
  type RowLevelPermissionRuleManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromFlatRowLevelPermissionPredicateGroupToLegacyRowLevelPermissionPredicateGroupManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-row-level-permission-predicate-group-to-legacy-row-level-permission-predicate-group-manifest.util';
import { fromFlatRowLevelPermissionPredicateToLegacyRowLevelPermissionPredicateManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-row-level-permission-predicate-to-legacy-row-level-permission-predicate-manifest.util';
import { fromFlatRowLevelPermissionRuleToRowLevelPermissionRuleManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-row-level-permission-rule-to-row-level-permission-rule-manifest.util';
import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import {
  type ChildMetadataName,
  type ParentStatus,
} from 'src/engine/core-modules/application/application-manifest/types/export-classification.type';
import { buildExportedCoverageEntry } from 'src/engine/core-modules/application/application-manifest/utils/build-exported-coverage-entry.util';
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

type RowLevelPermissionRuleLink = {
  rowLevelPermissionRuleUniversalIdentifier: string | null;
};

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

export const reconstructLegacyRowLevelPermissionPredicatesManifest = ({
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
  rowLevelPermissionsByRoleUniversalIdentifier: Map<
    string,
    {
      rules: RowLevelPermissionRuleManifest[];
      predicateGroups: LegacyRowLevelPermissionPredicateGroupManifest[];
      predicates: LegacyRowLevelPermissionPredicateManifest[];
    }
  >;
  coverage: ApplicationExportCoverageEntry[];
} => {
  const coverage: ApplicationExportCoverageEntry[] = [];
  const {
    flatRowLevelPermissionRuleMaps,
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
    (LegacyRowLevelPermissionPredicateGroupManifest &
      RowLevelPermissionRuleLink)[]
  >();
  const predicatesByRoleUniversalIdentifier = new Map<
    string,
    (LegacyRowLevelPermissionPredicateManifest & RowLevelPermissionRuleLink)[]
  >();
  const exportedRuleUniversalIdentifiers = new Set<string>();
  const addExportedRuleUniversalIdentifier = ({
    rowLevelPermissionRuleUniversalIdentifier,
  }: RowLevelPermissionRuleLink): void => {
    if (isDefined(rowLevelPermissionRuleUniversalIdentifier)) {
      exportedRuleUniversalIdentifiers.add(
        rowLevelPermissionRuleUniversalIdentifier,
      );
    }
  };

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
      addExportedRuleUniversalIdentifier(flatRowLevelPermissionPredicateGroup);
      appendByRole({
        manifestsByRoleUniversalIdentifier:
          predicateGroupsByRoleUniversalIdentifier,
        roleUniversalIdentifier:
          flatRowLevelPermissionPredicateGroup.roleUniversalIdentifier,
        manifest: {
          ...fromFlatRowLevelPermissionPredicateGroupToLegacyRowLevelPermissionPredicateGroupManifest(
            { flatRowLevelPermissionPredicateGroup },
          ),
          rowLevelPermissionRuleUniversalIdentifier:
            flatRowLevelPermissionPredicateGroup.rowLevelPermissionRuleUniversalIdentifier,
        },
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
      addExportedRuleUniversalIdentifier(flatRowLevelPermissionPredicate);
      appendByRole({
        manifestsByRoleUniversalIdentifier: predicatesByRoleUniversalIdentifier,
        roleUniversalIdentifier:
          flatRowLevelPermissionPredicate.roleUniversalIdentifier,
        manifest: {
          ...fromFlatRowLevelPermissionPredicateToLegacyRowLevelPermissionPredicateManifest(
            { flatRowLevelPermissionPredicate },
          ),
          rowLevelPermissionRuleUniversalIdentifier:
            flatRowLevelPermissionPredicate.rowLevelPermissionRuleUniversalIdentifier,
        },
      });
    }
  }

  const flatRulesByRoleUniversalIdentifier = new Map<
    string,
    Omit<RowLevelPermissionRuleManifest, 'predicates' | 'predicateGroups'>[]
  >();

  for (const flatRowLevelPermissionRule of sortFlatEntitiesByUniversalIdentifier(
    flatRowLevelPermissionRuleMaps,
  )) {
    if (
      !exportedRuleUniversalIdentifiers.has(
        flatRowLevelPermissionRule.universalIdentifier,
      )
    ) {
      continue;
    }

    coverage.push(
      buildExportedCoverageEntry({
        metadataName: 'rowLevelPermissionRule',
        flatEntity: flatRowLevelPermissionRule,
      }),
    );
    appendByRole({
      manifestsByRoleUniversalIdentifier: flatRulesByRoleUniversalIdentifier,
      roleUniversalIdentifier:
        flatRowLevelPermissionRule.roleUniversalIdentifier,
      manifest: fromFlatRowLevelPermissionRuleToRowLevelPermissionRuleManifest({
        flatRowLevelPermissionRule,
      }),
    });
  }

  const rowLevelPermissionsByRoleUniversalIdentifier = new Map(
    [
      ...new Set([
        ...flatRulesByRoleUniversalIdentifier.keys(),
        ...predicateGroupsByRoleUniversalIdentifier.keys(),
        ...predicatesByRoleUniversalIdentifier.keys(),
      ]),
    ].map((roleUniversalIdentifier) => [
      roleUniversalIdentifier,
      nestRowLevelPermissionRuleManifests({
        rules:
          flatRulesByRoleUniversalIdentifier.get(roleUniversalIdentifier) ?? [],
        predicateGroups:
          predicateGroupsByRoleUniversalIdentifier.get(
            roleUniversalIdentifier,
          ) ?? [],
        predicates:
          predicatesByRoleUniversalIdentifier.get(roleUniversalIdentifier) ??
          [],
      }),
    ]),
  );

  return { rowLevelPermissionsByRoleUniversalIdentifier, coverage };
};
