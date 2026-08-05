import { type PageLayoutWidgetManifest } from 'twenty-shared/application';
import { DEFAULT_WIDGET_SIZE } from 'twenty-shared/constants';
import {
  PageLayoutTabLayoutMode,
  type GridPosition,
  type PageLayoutWidgetPosition,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

// Widget placement is declared through the widgets array order and the tab layout mode:
// manifests published before the position union existed carry none at all
const getPageLayoutWidgetPosition = ({
  pageLayoutWidgetManifest,
  pageLayoutTabLayoutMode,
  gridPosition,
  widgetIndex,
}: {
  pageLayoutWidgetManifest: PageLayoutWidgetManifest;
  pageLayoutTabLayoutMode: PageLayoutTabLayoutMode;
  gridPosition: GridPosition;
  widgetIndex: number;
}): PageLayoutWidgetPosition => {
  if (isDefined(pageLayoutWidgetManifest.position)) {
    return pageLayoutWidgetManifest.position;
  }

  switch (pageLayoutTabLayoutMode) {
    case PageLayoutTabLayoutMode.VERTICAL_LIST:
      return {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: widgetIndex,
      };
    case PageLayoutTabLayoutMode.CANVAS:
      return {
        layoutMode: PageLayoutTabLayoutMode.CANVAS,
      };
    case PageLayoutTabLayoutMode.GRID:
      return {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        ...gridPosition,
      };
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
  pageLayoutTabLayoutMode: PageLayoutTabLayoutMode;
  widgetIndex: number;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatPageLayoutWidget => {
  const gridPosition = pageLayoutWidgetManifest.gridPosition ?? {
    row: 0,
    column: 0,
    rowSpan: DEFAULT_WIDGET_SIZE.default.h,
    columnSpan: DEFAULT_WIDGET_SIZE.default.w,
  };

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
    gridPosition,
    position: getPageLayoutWidgetPosition({
      pageLayoutWidgetManifest,
      pageLayoutTabLayoutMode,
      gridPosition,
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
