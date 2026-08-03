import { type PageLayoutWidgetManifest } from 'twenty-shared/application';
import { DEFAULT_WIDGET_SIZE } from 'twenty-shared/constants';
import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetPosition,
} from 'twenty-shared/types';

import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

const computePageLayoutWidgetPosition = ({
  pageLayoutWidgetManifest,
  pageLayoutTabLayoutMode,
  widgetIndex,
}: {
  pageLayoutWidgetManifest: PageLayoutWidgetManifest;
  pageLayoutTabLayoutMode: PageLayoutTabLayoutMode | undefined;
  widgetIndex: number;
}): PageLayoutWidgetPosition | null => {
  switch (pageLayoutTabLayoutMode) {
    case PageLayoutTabLayoutMode.VERTICAL_LIST:
      return {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: widgetIndex,
      };
    case PageLayoutTabLayoutMode.GRID: {
      const gridPosition = pageLayoutWidgetManifest.gridPosition ?? {
        row: 0,
        column: 0,
        rowSpan: DEFAULT_WIDGET_SIZE.default.h,
        columnSpan: DEFAULT_WIDGET_SIZE.default.w,
      };

      return { layoutMode: PageLayoutTabLayoutMode.GRID, ...gridPosition };
    }
    case PageLayoutTabLayoutMode.CANVAS:
      return { layoutMode: PageLayoutTabLayoutMode.CANVAS };
    default:
      return null;
  }
};

export const fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget = ({
  pageLayoutWidgetManifest,
  pageLayoutTabUniversalIdentifier,
  pageLayoutTabLayoutMode,
  widgetIndex,
  applicationUniversalIdentifier,
  now,
}: {
  pageLayoutWidgetManifest: PageLayoutWidgetManifest;
  pageLayoutTabUniversalIdentifier: string;
  pageLayoutTabLayoutMode: PageLayoutTabLayoutMode | undefined;
  widgetIndex: number;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatPageLayoutWidget => {
  return {
    universalIdentifier: pageLayoutWidgetManifest.universalIdentifier,
    applicationUniversalIdentifier,
    pageLayoutTabUniversalIdentifier,
    title: pageLayoutWidgetManifest.title,
    isActive: true,
    isSystemSideEffect: false,
    type: pageLayoutWidgetManifest.type as WidgetType,
    objectMetadataUniversalIdentifier:
      pageLayoutWidgetManifest.objectUniversalIdentifier ?? null,
    conditionalDisplay: pageLayoutWidgetManifest.conditionalDisplay ?? null,
    gridPosition: pageLayoutWidgetManifest.gridPosition ?? {
      row: 0,
      column: 0,
      rowSpan: DEFAULT_WIDGET_SIZE.default.h,
      columnSpan: DEFAULT_WIDGET_SIZE.default.w,
    },
    position: computePageLayoutWidgetPosition({
      pageLayoutWidgetManifest,
      pageLayoutTabLayoutMode,
      widgetIndex,
    }),
    universalConfiguration:
      pageLayoutWidgetManifest.configuration as UniversalFlatPageLayoutWidget['universalConfiguration'],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    conditionalAvailabilityExpression: null,
    universalOverrides: null,
  };
};
