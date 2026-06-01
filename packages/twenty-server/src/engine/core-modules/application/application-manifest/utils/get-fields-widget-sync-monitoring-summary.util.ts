import { type Manifest } from 'twenty-shared/application';

export type FieldsWidgetSyncMonitoringSummary = {
  fieldsWidgetWithLegacyViewIdCount: number;
  fieldsWidgetWithoutViewReferenceCount: number;
};

export const getFieldsWidgetSyncMonitoringSummary = ({
  manifest,
}: {
  manifest: Manifest;
}): FieldsWidgetSyncMonitoringSummary => {
  let fieldsWidgetWithLegacyViewIdCount = 0;
  let fieldsWidgetWithoutViewReferenceCount = 0;

  for (const pageLayoutManifest of manifest.pageLayouts ?? []) {
    for (const pageLayoutTabManifest of pageLayoutManifest.tabs ?? []) {
      for (const pageLayoutWidgetManifest of pageLayoutTabManifest.widgets ?? []) {
        const configuration = pageLayoutWidgetManifest.configuration as {
          configurationType?: string;
          viewUniversalIdentifier?: unknown;
          viewId?: unknown;
        };

        if (configuration.configurationType !== 'FIELDS') {
          continue;
        }

        if (Object.prototype.hasOwnProperty.call(configuration, 'viewId')) {
          fieldsWidgetWithLegacyViewIdCount += 1;
        }

        if (
          !Object.prototype.hasOwnProperty.call(configuration, 'viewId') &&
          !Object.prototype.hasOwnProperty.call(
            configuration,
            'viewUniversalIdentifier',
          )
        ) {
          fieldsWidgetWithoutViewReferenceCount += 1;
        }
      }
    }
  }

  return {
    fieldsWidgetWithLegacyViewIdCount,
    fieldsWidgetWithoutViewReferenceCount,
  };
};
