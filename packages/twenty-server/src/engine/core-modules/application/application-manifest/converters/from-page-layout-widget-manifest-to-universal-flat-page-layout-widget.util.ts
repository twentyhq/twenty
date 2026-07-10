import { type PageLayoutWidgetManifest } from 'twenty-shared/application';
import { DEFAULT_WIDGET_SIZE } from 'twenty-shared/constants';
import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetPosition,
} from 'twenty-shared/types';

import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

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
  const layoutMode = pageLayoutTabLayoutMode ?? PageLayoutTabLayoutMode.GRID;

  const manifestGridPosition =
    pageLayoutWidgetManifest.position?.layoutMode ===
    PageLayoutTabLayoutMode.GRID
      ? pageLayoutWidgetManifest.position
      : undefined;

  const position: PageLayoutWidgetPosition =
    layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
      ? {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: widgetIndex,
        }
      : layoutMode === PageLayoutTabLayoutMode.CANVAS
        ? { layoutMode: PageLayoutTabLayoutMode.CANVAS }
        : {
            layoutMode: PageLayoutTabLayoutMode.GRID,
            row: manifestGridPosition?.row ?? 0,
            column: manifestGridPosition?.column ?? 0,
            rowSpan:
              manifestGridPosition?.rowSpan ?? DEFAULT_WIDGET_SIZE.default.h,
            columnSpan:
              manifestGridPosition?.columnSpan ?? DEFAULT_WIDGET_SIZE.default.w,
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
