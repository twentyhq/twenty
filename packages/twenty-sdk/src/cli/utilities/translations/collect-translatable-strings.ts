import { type Manifest } from 'twenty-shared/application';
import {
  getMetadataLabelContext,
  TRANSLATABLE_PROPERTIES_BY_METADATA_NAME,
  type TranslatableMetadataName,
} from 'twenty-shared/i18n';

import { type MessageDescriptor } from '@/sdk/front-component/translations/message';

// Which manifest collection carries which metadata entity. The properties to
// extract are not listed here on purpose: they come from the shared registry,
// so the SDK cannot drift from what the server actually resolves at runtime.
// Metadata names with no manifest collection (viewFieldGroup) are simply absent.
const MANIFEST_KEY_BY_METADATA_NAME = {
  objectMetadata: 'objects',
  fieldMetadata: 'fields',
  view: 'views',
  pageLayout: 'pageLayouts',
  pageLayoutTab: 'pageLayoutTabs',
  commandMenuItem: 'commandMenuItems',
  navigationMenuItem: 'navigationMenuItems',
  timelineActivityType: 'timelineActivityTypes',
} as const satisfies Partial<Record<TranslatableMetadataName, keyof Manifest>>;

export const collectTranslatableStrings = (
  manifest: Manifest,
): MessageDescriptor[] => {
  // The same string can label several roles ('Invoice' as an object name and a
  // field label), and each role is its own catalog entry, so descriptors are
  // deduplicated per (context, message) rather than per message.
  const descriptorByKey = new Map<string, MessageDescriptor>();

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
      const value = (entity as Record<string, unknown>)[property];

      if (typeof value !== 'string' || value.length === 0) {
        continue;
      }

      const context = getMetadataLabelContext(metadataName, property);

      descriptorByKey.set(JSON.stringify([context, value]), {
        message: value,
        context,
      });
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

  return [...descriptorByKey.values()];
};
