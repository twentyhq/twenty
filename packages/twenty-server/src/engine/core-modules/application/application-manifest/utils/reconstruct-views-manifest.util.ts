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
import { type ParentStatus } from 'src/engine/core-modules/application/application-manifest/types/export-classification.type';
import { buildExportedCoverageEntry } from 'src/engine/core-modules/application/application-manifest/utils/build-exported-coverage-entry.util';
import { compareByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/compare-by-universal-identifier.util';
import { sortFlatEntitiesByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/sort-flat-entities-by-universal-identifier.util';
import {
  createChildDecider,
  type FlatChild,
} from 'src/engine/core-modules/application/application-manifest/utils/create-child-decider.util';
import { getUnexportedViewFieldGroupReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unexported-view-field-group-reason.util';
import { getUnresolvableFieldReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unresolvable-field-reason.util';
import { getUnsupportedViewFilterReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unsupported-view-filter-reason.util';
import { getUnsupportedViewReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unsupported-view-reason.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

type ViewChildren = Required<ViewChildrenManifests>;

type FlatViewChild = FlatChild & { viewUniversalIdentifier: string };

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
  const parentViewStatusByUniversalIdentifier = new Map<string, ParentStatus>();
  const exportedFlatViews: FlatView[] = [];

  for (const flatView of sortFlatEntitiesByUniversalIdentifier(
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
      applicationAllFlatEntityMaps,
      allFlatEntityMaps,
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
  const decideViewChild = createChildDecider<FlatViewChild>({
    coverage,
    parentMetadataName: 'view',
    parentStatusByUniversalIdentifier: parentViewStatusByUniversalIdentifier,
    getParentUniversalIdentifier: ({ viewUniversalIdentifier }) =>
      viewUniversalIdentifier,
  });
  const childrenOf = (
    viewUniversalIdentifier: string,
  ): ViewChildren | undefined =>
    childrenByViewUniversalIdentifier.get(viewUniversalIdentifier);

  for (const flatViewField of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatViewFieldMaps,
  )) {
    const decision = decideViewChild({
      metadataName: 'viewField',
      flatEntity: flatViewField,
      isEngineDerived: flatViewField.isSystemSideEffect,
      unsupportedReason:
        getUnexportedViewFieldGroupReason({
          viewFieldGroupUniversalIdentifier:
            flatViewField.viewFieldGroupUniversalIdentifier,
          applicationAllFlatEntityMaps,
          parentViewStatusByUniversalIdentifier,
        }) ??
        getUnresolvableFieldReason({
          metadataName: 'viewField',
          fieldMetadataUniversalIdentifier:
            flatViewField.fieldMetadataUniversalIdentifier,
          allFlatEntityMaps,
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

  for (const flatViewFieldGroup of sortFlatEntitiesByUniversalIdentifier(
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

  for (const flatViewFilterGroup of sortFlatEntitiesByUniversalIdentifier(
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

  for (const flatViewFilter of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatViewFilterMaps,
  )) {
    if (
      decideViewChild({
        metadataName: 'viewFilter',
        flatEntity: flatViewFilter,
        unsupportedReason: getUnsupportedViewFilterReason({
          flatViewFilter,
          allFlatEntityMaps,
        }),
      }) === 'nested'
    ) {
      childrenOf(flatViewFilter.viewUniversalIdentifier)?.filters.push(
        fromFlatViewFilterToViewFilterManifest({ flatViewFilter }),
      );
    }
  }

  for (const flatViewGroup of sortFlatEntitiesByUniversalIdentifier(
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

  for (const flatViewSort of sortFlatEntitiesByUniversalIdentifier(
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
          allFlatEntityMaps,
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
