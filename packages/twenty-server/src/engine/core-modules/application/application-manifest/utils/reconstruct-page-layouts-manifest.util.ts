import {
  type PageLayoutManifest,
  type PageLayoutTabManifest,
  type PageLayoutWidgetManifest,
  type StandalonePageLayoutWidgetManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromFlatPageLayoutTabToPageLayoutTabManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-tab-to-page-layout-tab-manifest.util';
import { fromFlatPageLayoutTabToStandalonePageLayoutTabManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-tab-to-standalone-page-layout-tab-manifest.util';
import { fromFlatPageLayoutToPageLayoutManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-to-page-layout-manifest.util';
import { fromFlatPageLayoutWidgetToPageLayoutWidgetManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-widget-to-page-layout-widget-manifest.util';
import { fromFlatPageLayoutWidgetToStandalonePageLayoutWidgetManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-widget-to-standalone-page-layout-widget-manifest.util';
import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { type ParentStatus } from 'src/engine/core-modules/application/application-manifest/types/export-classification.type';
import { buildExportedCoverageEntry } from 'src/engine/core-modules/application/application-manifest/utils/build-exported-coverage-entry.util';
import { sortFlatEntitiesByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/sort-flat-entities-by-universal-identifier.util';
import {
  createChildDecider,
  type FlatChild,
} from 'src/engine/core-modules/application/application-manifest/utils/create-child-decider.util';
import { getUnsupportedPageLayoutReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unsupported-page-layout-reason.util';
import { getUnsupportedPageLayoutWidgetReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unsupported-page-layout-widget-reason.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';

type FlatPageLayoutChild = FlatChild & {
  pageLayoutUniversalIdentifier: string;
};
type FlatPageLayoutTabChild = FlatChild & {
  pageLayoutTabUniversalIdentifier: string;
};

export const reconstructPageLayoutsManifest = ({
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  exportedObjectUniversalIdentifiers,
}: {
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  exportedObjectUniversalIdentifiers: Set<string>;
}): {
  pageLayouts: PageLayoutManifest[];
  pageLayoutTabs: PageLayoutTabManifest[];
  pageLayoutWidgets: StandalonePageLayoutWidgetManifest[];
  coverage: ApplicationExportCoverageEntry[];
} => {
  const coverage: ApplicationExportCoverageEntry[] = [];
  const pageLayoutStatusByUniversalIdentifier = new Map<string, ParentStatus>();
  const exportedFlatPageLayouts: FlatPageLayout[] = [];

  for (const flatPageLayout of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatPageLayoutMaps,
  )) {
    if (flatPageLayout.isSystemSideEffect) {
      coverage.push({
        metadataName: 'pageLayout',
        universalIdentifier: flatPageLayout.universalIdentifier,
        status: ApplicationExportCoverageStatus.ENGINE_DERIVED,
      });
      pageLayoutStatusByUniversalIdentifier.set(
        flatPageLayout.universalIdentifier,
        'engineDerived',
      );
      continue;
    }

    const unsupportedReason = getUnsupportedPageLayoutReason({
      flatPageLayout,
      applicationAllFlatEntityMaps,
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers,
    });

    if (isDefined(unsupportedReason)) {
      coverage.push({
        metadataName: 'pageLayout',
        universalIdentifier: flatPageLayout.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: unsupportedReason,
      });
      pageLayoutStatusByUniversalIdentifier.set(
        flatPageLayout.universalIdentifier,
        'unsupported',
      );
      continue;
    }

    exportedFlatPageLayouts.push(flatPageLayout);
    pageLayoutStatusByUniversalIdentifier.set(
      flatPageLayout.universalIdentifier,
      'exported',
    );
  }

  const decidePageLayoutTab = createChildDecider<FlatPageLayoutChild>({
    coverage,
    parentMetadataName: 'pageLayout',
    parentStatusByUniversalIdentifier: pageLayoutStatusByUniversalIdentifier,
    getParentUniversalIdentifier: ({ pageLayoutUniversalIdentifier }) =>
      pageLayoutUniversalIdentifier,
  });
  const pageLayoutTabStatusByUniversalIdentifier = new Map<
    string,
    ParentStatus
  >();
  const nestedFlatPageLayoutTabs: FlatPageLayoutTab[] = [];
  const standaloneFlatPageLayoutTabs: FlatPageLayoutTab[] = [];

  for (const flatPageLayoutTab of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatPageLayoutTabMaps,
  )) {
    const decision = decidePageLayoutTab({
      metadataName: 'pageLayoutTab',
      flatEntity: flatPageLayoutTab,
      isEngineDerived: flatPageLayoutTab.isSystemSideEffect,
      unsupportedReason: isDefined(
        allFlatEntityMaps.flatPageLayoutMaps.byUniversalIdentifier[
          flatPageLayoutTab.pageLayoutUniversalIdentifier
        ],
      )
        ? undefined
        : 'page layout tab on a page layout that does not exist',
      canStandAlone: true,
    });

    if (decision === 'nested') {
      nestedFlatPageLayoutTabs.push(flatPageLayoutTab);
    } else if (decision === 'standalone') {
      standaloneFlatPageLayoutTabs.push(flatPageLayoutTab);
    }

    pageLayoutTabStatusByUniversalIdentifier.set(
      flatPageLayoutTab.universalIdentifier,
      isDefined(decision)
        ? 'exported'
        : flatPageLayoutTab.isSystemSideEffect
          ? 'engineDerived'
          : 'unsupported',
    );
  }

  const decidePageLayoutWidget = createChildDecider<FlatPageLayoutTabChild>({
    coverage,
    parentMetadataName: 'pageLayoutTab',
    parentStatusByUniversalIdentifier: pageLayoutTabStatusByUniversalIdentifier,
    getParentUniversalIdentifier: ({ pageLayoutTabUniversalIdentifier }) =>
      pageLayoutTabUniversalIdentifier,
  });
  const widgetsByPageLayoutTabUniversalIdentifier = new Map<
    string,
    PageLayoutWidgetManifest[]
  >();
  const pageLayoutWidgets: StandalonePageLayoutWidgetManifest[] = [];

  for (const flatPageLayoutWidget of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatPageLayoutWidgetMaps,
  )) {
    const flatPageLayoutTab =
      allFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier[
        flatPageLayoutWidget.pageLayoutTabUniversalIdentifier
      ];
    const decision = decidePageLayoutWidget({
      metadataName: 'pageLayoutWidget',
      flatEntity: flatPageLayoutWidget,
      isEngineDerived: flatPageLayoutWidget.isSystemSideEffect,
      unsupportedReason: isDefined(flatPageLayoutTab)
        ? getUnsupportedPageLayoutWidgetReason({
            flatPageLayoutWidget,
            flatPageLayoutTab,
            applicationAllFlatEntityMaps,
            allFlatEntityMaps,
            exportedObjectUniversalIdentifiers,
          })
        : 'page layout widget on a page layout tab that does not exist',
      canStandAlone: true,
    });

    if (decision === 'nested') {
      const widgets =
        widgetsByPageLayoutTabUniversalIdentifier.get(
          flatPageLayoutWidget.pageLayoutTabUniversalIdentifier,
        ) ?? [];

      widgets.push(
        fromFlatPageLayoutWidgetToPageLayoutWidgetManifest({
          flatPageLayoutWidget,
        }),
      );
      widgetsByPageLayoutTabUniversalIdentifier.set(
        flatPageLayoutWidget.pageLayoutTabUniversalIdentifier,
        widgets,
      );
    } else if (
      decision === 'standalone' &&
      isDefined(flatPageLayoutWidget.position)
    ) {
      pageLayoutWidgets.push(
        fromFlatPageLayoutWidgetToStandalonePageLayoutWidgetManifest({
          flatPageLayoutWidget,
          position: flatPageLayoutWidget.position,
        }),
      );
    }
  }

  const tabsByPageLayoutUniversalIdentifier = new Map<
    string,
    PageLayoutTabManifest[]
  >();

  for (const flatPageLayoutTab of nestedFlatPageLayoutTabs) {
    const tabs =
      tabsByPageLayoutUniversalIdentifier.get(
        flatPageLayoutTab.pageLayoutUniversalIdentifier,
      ) ?? [];

    tabs.push(
      fromFlatPageLayoutTabToPageLayoutTabManifest({
        flatPageLayoutTab,
        widgets: widgetsByPageLayoutTabUniversalIdentifier.get(
          flatPageLayoutTab.universalIdentifier,
        ),
      }),
    );
    tabsByPageLayoutUniversalIdentifier.set(
      flatPageLayoutTab.pageLayoutUniversalIdentifier,
      tabs,
    );
  }

  const pageLayouts = exportedFlatPageLayouts.map((flatPageLayout) => {
    coverage.push(
      buildExportedCoverageEntry({
        metadataName: 'pageLayout',
        flatEntity: flatPageLayout,
      }),
    );

    return fromFlatPageLayoutToPageLayoutManifest({
      flatPageLayout,
      tabs: tabsByPageLayoutUniversalIdentifier.get(
        flatPageLayout.universalIdentifier,
      ),
    });
  });
  const pageLayoutTabs = standaloneFlatPageLayoutTabs.map((flatPageLayoutTab) =>
    fromFlatPageLayoutTabToStandalonePageLayoutTabManifest({
      flatPageLayoutTab,
      widgets: widgetsByPageLayoutTabUniversalIdentifier.get(
        flatPageLayoutTab.universalIdentifier,
      ),
    }),
  );

  return { pageLayouts, pageLayoutTabs, pageLayoutWidgets, coverage };
};
