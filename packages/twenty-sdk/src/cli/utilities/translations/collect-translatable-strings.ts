import { type Manifest } from 'twenty-shared/application';
import {
  TRANSLATABLE_PROPERTIES_BY_METADATA_NAME,
  type TranslatableMetadataName,
} from 'twenty-shared/i18n';

// Which manifest collection carries which metadata entity. The properties to
// extract are not listed here on purpose: they come from the shared registry,
// so the SDK cannot drift from what the server actually resolves at runtime.
// Metadata names with no manifest collection (viewFieldGroup) are simply absent.
const MANIFEST_KEY_BY_METADATA_NAME = {
  objectMetadata: 'objects',
  fieldMetadata: 'fields',
  view: 'views',
  pageLayoutTab: 'pageLayoutTabs',
  commandMenuItem: 'commandMenuItems',
  navigationMenuItem: 'navigationMenuItems',
} as const satisfies Partial<Record<TranslatableMetadataName, keyof Manifest>>;

export const collectTranslatableStrings = (manifest: Manifest): string[] => {
  const strings = new Set<string>();

  const addString = (value: unknown) => {
    if (typeof value === 'string' && value.length > 0) {
      strings.add(value);
    }
  };

  const addEntityStrings = (
    entity: unknown,
    metadataName: TranslatableMetadataName,
  ) => {
    if (entity === null || typeof entity !== 'object') {
      return;
    }

    for (const property of TRANSLATABLE_PROPERTIES_BY_METADATA_NAME[
      metadataName
    ]) {
      addString((entity as Record<string, unknown>)[property]);
    }
  };

  for (const [metadataName, manifestKey] of Object.entries(
    MANIFEST_KEY_BY_METADATA_NAME,
  ) as [TranslatableMetadataName, keyof Manifest][]) {
    const entities = manifest[manifestKey];

    if (!Array.isArray(entities)) {
      continue;
    }

    for (const entity of entities) {
      addEntityStrings(entity, metadataName);
    }
  }

  // Tab and widget titles live nested under pageLayouts[].tabs[], not in the
  // flat pageLayoutTabs array, so walk the tree to reach them.
  for (const pageLayout of manifest.pageLayouts ?? []) {
    for (const tab of pageLayout.tabs ?? []) {
      addEntityStrings(tab, 'pageLayoutTab');

      for (const widget of tab.widgets ?? []) {
        addEntityStrings(widget, 'pageLayoutWidget');
      }
    }
  }

  return [...strings].sort();
};
