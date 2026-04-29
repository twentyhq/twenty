import { type PageLayoutWidgetManifest } from 'twenty-shared/application';
import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetPosition,
} from 'twenty-shared/types';

import { WIDGET_GRID_MAX_COLUMNS } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-grid-max-columns.constant';
import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

const getDefaultPositionForLayoutMode = (
  layoutMode: PageLayoutTabLayoutMode,
  widgetIndexInTab: number,
): PageLayoutWidgetPosition => {
  switch (layoutMode) {
    case PageLayoutTabLayoutMode.CANVAS:
      return { layoutMode: PageLayoutTabLayoutMode.CANVAS };
    case PageLayoutTabLayoutMode.VERTICAL_LIST:
      return {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: widgetIndexInTab,
      };
    case PageLayoutTabLayoutMode.GRID:
      return {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: Math.floor(widgetIndexInTab / WIDGET_GRID_MAX_COLUMNS),
        column: widgetIndexInTab % WIDGET_GRID_MAX_COLUMNS,
        rowSpan: 1,
        columnSpan: 1,
      };
  }
};

export const fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget = ({
  pageLayoutWidgetManifest,
  pageLayoutTabUniversalIdentifier,
  pageLayoutTabLayoutMode,
  widgetIndexInTab,
  applicationUniversalIdentifier,
  now,
}: {
  pageLayoutWidgetManifest: PageLayoutWidgetManifest;
  pageLayoutTabUniversalIdentifier: string;
  pageLayoutTabLayoutMode?: PageLayoutTabLayoutMode;
  widgetIndexInTab: number;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatPageLayoutWidget => {
  const resolvedLayoutMode =
    pageLayoutTabLayoutMode ?? PageLayoutTabLayoutMode.GRID;

  const position =
    pageLayoutWidgetManifest.position ??
    getDefaultPositionForLayoutMode(resolvedLayoutMode, widgetIndexInTab);

  return {
    universalIdentifier: pageLayoutWidgetManifest.universalIdentifier,
    applicationUniversalIdentifier,
    pageLayoutTabUniversalIdentifier,
    title: pageLayoutWidgetManifest.title,
    isActive: true,
    type: pageLayoutWidgetManifest.type as WidgetType,
    objectMetadataUniversalIdentifier:
      pageLayoutWidgetManifest.objectUniversalIdentifier ?? null,
    conditionalDisplay: pageLayoutWidgetManifest.conditionalDisplay ?? null,
    position,
    universalConfiguration:
      pageLayoutWidgetManifest.configuration as UniversalFlatPageLayoutWidget['universalConfiguration'],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    conditionalAvailabilityExpression: null,
    universalOverrides: null,
  };
};
