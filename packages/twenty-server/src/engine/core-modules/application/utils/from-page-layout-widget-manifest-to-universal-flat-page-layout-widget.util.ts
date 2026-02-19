import { type PageLayoutWidgetManifest } from 'twenty-shared/application';

import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget = ({
  pageLayoutWidgetManifest,
  pageLayoutTabUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  pageLayoutWidgetManifest: PageLayoutWidgetManifest;
  pageLayoutTabUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatPageLayoutWidget => {
  return {
    universalIdentifier: pageLayoutWidgetManifest.universalIdentifier,
    applicationUniversalIdentifier,
    pageLayoutTabUniversalIdentifier,
    title: pageLayoutWidgetManifest.title,
    type: pageLayoutWidgetManifest.type as WidgetType,
    objectMetadataUniversalIdentifier:
      pageLayoutWidgetManifest.objectUniversalIdentifier ?? null,
    conditionalDisplay: pageLayoutWidgetManifest.conditionalDisplay ?? null,
    gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
    position: null,
    universalConfiguration:
      pageLayoutWidgetManifest.configuration as UniversalFlatPageLayoutWidget['universalConfiguration'],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
