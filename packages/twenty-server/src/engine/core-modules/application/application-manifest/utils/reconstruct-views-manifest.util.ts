import { isNonEmptyString } from '@sniptt/guards';
import {
  type StandaloneViewFieldManifest,
  type ViewManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromFlatViewFieldGroupToViewFieldGroupManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-field-group-to-view-field-group-manifest.util';
import { fromFlatViewFieldToStandaloneViewFieldManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-field-to-standalone-view-field-manifest.util';
import { fromFlatViewFieldToViewFieldManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-field-to-view-field-manifest.util';
import { fromFlatViewFilterGroupToViewFilterGroupManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-filter-group-to-view-filter-group-manifest.util';
import { fromFlatViewFilterToViewFilterManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-filter-to-view-filter-manifest.util';
import { fromFlatViewGroupToViewGroupManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-group-to-view-group-manifest.util';
import { fromFlatViewSortToViewSortManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-sort-to-view-sort-manifest.util';
import {
  fromFlatViewToViewManifest,
  type ViewChildrenManifests,
} from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-to-view-manifest.util';
import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { buildExportedCoverageEntry } from 'src/engine/core-modules/application/application-manifest/utils/build-exported-coverage-entry.util';
import { compareByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/compare-by-universal-identifier.util';
import { type WorkspaceLocalStateProperties } from 'src/engine/core-modules/application/application-manifest/utils/get-workspace-local-state-reason.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

type ParentViewStatus =
  | 'exported'
  | 'engineDerived'
  | 'unsupported'
  | 'outside';

type ViewChildren = Required<ViewChildrenManifests>;

const VIEW_CHILD_LABEL_BY_METADATA_NAME = {
  viewField: 'view field',
  viewFieldGroup: 'view field group',
  viewFilter: 'view filter',
  viewFilterGroup: 'view filter group',
  viewGroup: 'view group',
  viewSort: 'view sort',
} as const;

type ViewChildMetadataName = keyof typeof VIEW_CHILD_LABEL_BY_METADATA_NAME;

type FlatViewChild = {
  universalIdentifier: string;
  viewUniversalIdentifier: string;
} & Partial<WorkspaceLocalStateProperties>;

const MAX_VIEW_FILTER_VALUE_DEPTH = 8;

const isNestedDeeperThanMaxDepth = (value: unknown): boolean => {
  const pending = [{ value, depth: 0 }];

  for (let next = pending.pop(); isDefined(next); next = pending.pop()) {
    if (!isDefined(next.value) || typeof next.value !== 'object') {
      continue;
    }

    if (next.depth >= MAX_VIEW_FILTER_VALUE_DEPTH) {
      return true;
    }

    for (const child of Object.values(next.value)) {
      pending.push({ value: child, depth: next.depth + 1 });
    }
  }

  return false;
};

const sortedFlatEntities = <TFlatEntity extends SyncableFlatEntity>(
  flatEntityMaps: UniversalFlatEntityMaps<TFlatEntity>,
): TFlatEntity[] =>
  Object.values(flatEntityMaps.byUniversalIdentifier)
    .filter(isDefined)
    .sort(compareByUniversalIdentifier);

const getUnsupportedViewReason = ({
  flatView,
  applicationObjectUniversalIdentifiers,
  exportedObjectUniversalIdentifiers,
}: {
  flatView: FlatView;
  applicationObjectUniversalIdentifiers: Set<string>;
  exportedObjectUniversalIdentifiers: Set<string>;
}): string | undefined => {
  if (!isNonEmptyString(flatView.name)) {
    return 'view without a name';
  }

  const objectUniversalIdentifier = flatView.objectMetadataUniversalIdentifier;

  if (
    applicationObjectUniversalIdentifiers.has(objectUniversalIdentifier) &&
    !exportedObjectUniversalIdentifiers.has(objectUniversalIdentifier)
  ) {
    return 'view on an unsupported object';
  }

  return undefined;
};

const getParentViewReason = ({
  metadataName,
  parentViewStatus,
}: {
  metadataName: ViewChildMetadataName;
  parentViewStatus: Exclude<ParentViewStatus, 'exported'>;
}): string => {
  const label = VIEW_CHILD_LABEL_BY_METADATA_NAME[metadataName];

  switch (parentViewStatus) {
    case 'unsupported':
      return `${label} of an unsupported view`;
    case 'engineDerived':
      return `${label} on an engine-derived view`;
    case 'outside':
      return `${label} on a view outside the application`;
  }
};

export const reconstructViewsManifest = ({
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  exportedObjectUniversalIdentifiers,
}: {
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  exportedObjectUniversalIdentifiers: Set<string>;
}): {
  views: ViewManifest[];
  viewFields: StandaloneViewFieldManifest[];
  coverage: ApplicationExportCoverageEntry[];
} => {
  const coverage: ApplicationExportCoverageEntry[] = [];
  const applicationObjectUniversalIdentifiers = new Set(
    Object.values(
      applicationAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .map(({ universalIdentifier }) => universalIdentifier),
  );

  const parentViewStatusByUniversalIdentifier = new Map<
    string,
    ParentViewStatus
  >();
  const exportedFlatViews: FlatView[] = [];

  for (const flatView of sortedFlatEntities(
    applicationAllFlatEntityMaps.flatViewMaps,
  )) {
    if (flatView.isSystemSideEffect) {
      coverage.push({
        metadataName: 'view',
        universalIdentifier: flatView.universalIdentifier,
        status: ApplicationExportCoverageStatus.ENGINE_DERIVED,
      });
      parentViewStatusByUniversalIdentifier.set(
        flatView.universalIdentifier,
        'engineDerived',
      );
      continue;
    }

    const unsupportedReason = getUnsupportedViewReason({
      flatView,
      applicationObjectUniversalIdentifiers,
      exportedObjectUniversalIdentifiers,
    });

    if (isDefined(unsupportedReason)) {
      coverage.push({
        metadataName: 'view',
        universalIdentifier: flatView.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: unsupportedReason,
      });
      parentViewStatusByUniversalIdentifier.set(
        flatView.universalIdentifier,
        'unsupported',
      );
      continue;
    }

    exportedFlatViews.push(flatView);
    parentViewStatusByUniversalIdentifier.set(
      flatView.universalIdentifier,
      'exported',
    );
  }

  const childrenByViewUniversalIdentifier = new Map<string, ViewChildren>(
    exportedFlatViews.map(({ universalIdentifier }) => [
      universalIdentifier,
      {
        fields: [],
        filters: [],
        filterGroups: [],
        groups: [],
        fieldGroups: [],
        sorts: [],
      },
    ]),
  );
  const viewFields: StandaloneViewFieldManifest[] = [];

  const getUnresolvableFieldReason = ({
    metadataName,
    fieldMetadataUniversalIdentifier,
  }: {
    metadataName: ViewChildMetadataName;
    fieldMetadataUniversalIdentifier: string;
  }): string | undefined =>
    isDefined(
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        fieldMetadataUniversalIdentifier
      ],
    )
      ? undefined
      : `${VIEW_CHILD_LABEL_BY_METADATA_NAME[metadataName]} on a field that does not exist`;

  const getUnexportedViewFieldGroupReason = (
    viewFieldGroupUniversalIdentifier: string | null,
  ): string | undefined => {
    if (!isDefined(viewFieldGroupUniversalIdentifier)) {
      return undefined;
    }

    const flatViewFieldGroup =
      applicationAllFlatEntityMaps.flatViewFieldGroupMaps.byUniversalIdentifier[
        viewFieldGroupUniversalIdentifier
      ];

    if (
      !isDefined(flatViewFieldGroup) ||
      flatViewFieldGroup.isSystemSideEffect ||
      parentViewStatusByUniversalIdentifier.get(
        flatViewFieldGroup.viewUniversalIdentifier,
      ) === 'exported'
    ) {
      return undefined;
    }

    return 'view field in a view field group that is not exported';
  };

  const decideViewChild = ({
    metadataName,
    flatEntity,
    isEngineDerived = false,
    unsupportedReason,
    canStandAlone = false,
  }: {
    metadataName: ViewChildMetadataName;
    flatEntity: FlatViewChild;
    isEngineDerived?: boolean;
    unsupportedReason?: string;
    canStandAlone?: boolean;
  }): 'nested' | 'standalone' | undefined => {
    if (isEngineDerived) {
      coverage.push({
        metadataName,
        universalIdentifier: flatEntity.universalIdentifier,
        status: ApplicationExportCoverageStatus.ENGINE_DERIVED,
      });

      return undefined;
    }

    const parentViewStatus =
      parentViewStatusByUniversalIdentifier.get(
        flatEntity.viewUniversalIdentifier,
      ) ?? 'outside';

    if (
      parentViewStatus !== 'exported' &&
      (parentViewStatus === 'unsupported' || !canStandAlone)
    ) {
      coverage.push({
        metadataName,
        universalIdentifier: flatEntity.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: getParentViewReason({ metadataName, parentViewStatus }),
      });

      return undefined;
    }

    if (isDefined(unsupportedReason)) {
      coverage.push({
        metadataName,
        universalIdentifier: flatEntity.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: unsupportedReason,
      });

      return undefined;
    }

    coverage.push(buildExportedCoverageEntry({ metadataName, flatEntity }));

    return parentViewStatus === 'exported' ? 'nested' : 'standalone';
  };

  const childrenOf = (
    viewUniversalIdentifier: string,
  ): ViewChildren | undefined =>
    childrenByViewUniversalIdentifier.get(viewUniversalIdentifier);

  for (const flatViewField of sortedFlatEntities(
    applicationAllFlatEntityMaps.flatViewFieldMaps,
  )) {
    const decision = decideViewChild({
      metadataName: 'viewField',
      flatEntity: flatViewField,
      isEngineDerived: flatViewField.isSystemSideEffect,
      unsupportedReason:
        getUnexportedViewFieldGroupReason(
          flatViewField.viewFieldGroupUniversalIdentifier,
        ) ??
        getUnresolvableFieldReason({
          metadataName: 'viewField',
          fieldMetadataUniversalIdentifier:
            flatViewField.fieldMetadataUniversalIdentifier,
        }),
      canStandAlone: true,
    });

    if (decision === 'nested') {
      childrenOf(flatViewField.viewUniversalIdentifier)?.fields.push(
        fromFlatViewFieldToViewFieldManifest({ flatViewField }),
      );
    } else if (decision === 'standalone') {
      viewFields.push(
        fromFlatViewFieldToStandaloneViewFieldManifest({ flatViewField }),
      );
    }
  }

  for (const flatViewFieldGroup of sortedFlatEntities(
    applicationAllFlatEntityMaps.flatViewFieldGroupMaps,
  )) {
    if (
      decideViewChild({
        metadataName: 'viewFieldGroup',
        flatEntity: flatViewFieldGroup,
        isEngineDerived: flatViewFieldGroup.isSystemSideEffect,
      }) === 'nested'
    ) {
      childrenOf(flatViewFieldGroup.viewUniversalIdentifier)?.fieldGroups.push(
        fromFlatViewFieldGroupToViewFieldGroupManifest({ flatViewFieldGroup }),
      );
    }
  }

  for (const flatViewFilterGroup of sortedFlatEntities(
    applicationAllFlatEntityMaps.flatViewFilterGroupMaps,
  )) {
    if (
      decideViewChild({
        metadataName: 'viewFilterGroup',
        flatEntity: flatViewFilterGroup,
      }) === 'nested'
    ) {
      childrenOf(
        flatViewFilterGroup.viewUniversalIdentifier,
      )?.filterGroups.push(
        fromFlatViewFilterGroupToViewFilterGroupManifest({
          flatViewFilterGroup,
        }),
      );
    }
  }

  for (const flatViewFilter of sortedFlatEntities(
    applicationAllFlatEntityMaps.flatViewFilterMaps,
  )) {
    const unsupportedReason = isNestedDeeperThanMaxDepth(flatViewFilter.value)
      ? `view filter with a value nested deeper than ${MAX_VIEW_FILTER_VALUE_DEPTH} levels`
      : getUnresolvableFieldReason({
          metadataName: 'viewFilter',
          fieldMetadataUniversalIdentifier:
            flatViewFilter.fieldMetadataUniversalIdentifier,
        });

    if (
      decideViewChild({
        metadataName: 'viewFilter',
        flatEntity: flatViewFilter,
        unsupportedReason,
      }) === 'nested'
    ) {
      childrenOf(flatViewFilter.viewUniversalIdentifier)?.filters.push(
        fromFlatViewFilterToViewFilterManifest({ flatViewFilter }),
      );
    }
  }

  for (const flatViewGroup of sortedFlatEntities(
    applicationAllFlatEntityMaps.flatViewGroupMaps,
  )) {
    if (
      decideViewChild({
        metadataName: 'viewGroup',
        flatEntity: flatViewGroup,
      }) === 'nested'
    ) {
      childrenOf(flatViewGroup.viewUniversalIdentifier)?.groups.push(
        fromFlatViewGroupToViewGroupManifest({ flatViewGroup }),
      );
    }
  }

  for (const flatViewSort of sortedFlatEntities(
    applicationAllFlatEntityMaps.flatViewSortMaps,
  )) {
    if (
      decideViewChild({
        metadataName: 'viewSort',
        flatEntity: flatViewSort,
        unsupportedReason: getUnresolvableFieldReason({
          metadataName: 'viewSort',
          fieldMetadataUniversalIdentifier:
            flatViewSort.fieldMetadataUniversalIdentifier,
        }),
      }) === 'nested'
    ) {
      childrenOf(flatViewSort.viewUniversalIdentifier)?.sorts.push(
        fromFlatViewSortToViewSortManifest({ flatViewSort }),
      );
    }
  }

  const views = exportedFlatViews.map((flatView) => {
    coverage.push(
      buildExportedCoverageEntry({
        metadataName: 'view',
        flatEntity: flatView,
      }),
    );

    return fromFlatViewToViewManifest({
      flatView,
      children: childrenOf(flatView.universalIdentifier),
    });
  });

  viewFields.sort(compareByUniversalIdentifier);

  return { views, viewFields, coverage };
};
