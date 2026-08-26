import { type PageLayoutWidgetManifest } from 'twenty-shared/application';
import { DEFAULT_WIDGET_SIZE } from 'twenty-shared/constants';
import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetPosition,
  type WidgetType,
} from 'twenty-shared/types';

import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget = ({
  pageLayoutWidgetManifest,
  pageLayoutTabUniversalIdentifier,
  pageLayoutTabLayoutMode = PageLayoutTabLayoutMode.GRID,
  widgetIndex = 0,
  applicationUniversalIdentifier,
  now,
}: {
  pageLayoutWidgetManifest: PageLayoutWidgetManifest;
  pageLayoutTabUniversalIdentifier: string;
  pageLayoutTabLayoutMode?: PageLayoutTabLayoutMode;
  widgetIndex?: number;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatPageLayoutWidget => {
  const defaultPosition: PageLayoutWidgetPosition =
    pageLayoutTabLayoutMode === PageLayoutTabLayoutMode.GRID
      ? {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: 0,
          column: 0,
          rowSpan: DEFAULT_WIDGET_SIZE.default.h,
          columnSpan: DEFAULT_WIDGET_SIZE.default.w,
        }
      : pageLayoutTabLayoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
        ? {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: widgetIndex,
          }
        : { layoutMode: PageLayoutTabLayoutMode.CANVAS };

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
    position: pageLayoutWidgetManifest.position ?? defaultPosition,
    universalConfiguration:
      pageLayoutWidgetManifest.configuration as UniversalFlatPageLayoutWidget['universalConfiguration'],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    conditionalAvailabilityExpression: null,
    universalOverrides: null,
  };
};
