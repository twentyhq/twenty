import { isNonEmptyString } from '@sniptt/guards';
import { type Manifest } from 'twenty-shared/application';
import {
  getMetadataLabelContext,
  listManifestTranslatableValues,
  type ManifestTranslatableEntity,
  TRANSLATABLE_PROPERTIES_BY_METADATA_NAME,
  type TranslatableMetadataName,
} from 'twenty-shared/i18n';

import { type MessageDescriptor } from '@/sdk/front-component/translations/message';

// Manifest collection per metadata entity; the properties come from the shared registry so the SDK cannot drift from the server
const MANIFEST_KEY_BY_METADATA_NAME = {
  objectMetadata: 'objects',
  fieldMetadata: 'fields',
  view: 'views',
  pageLayout: 'pageLayouts',
  pageLayoutTab: 'pageLayoutTabs',
  pageLayoutWidget: 'pageLayoutWidgets',
  commandMenuItem: 'commandMenuItems',
  navigationMenuItem: 'navigationMenuItems',
  timelineActivityType: 'timelineActivityTypes',
  settingsMenuItem: 'settingsMenuItems',
} as const satisfies Partial<Record<TranslatableMetadataName, keyof Manifest>>;

const MANIFEST_KEY_BY_MANIFEST_TRANSLATABLE_ENTITY = {
  fieldMetadata: 'fields',
  role: 'roles',
  skill: 'skills',
  agent: 'agents',
  logicFunction: 'logicFunctions',
  frontComponent: 'frontComponents',
  permissionFlag: 'permissionFlags',
  connectionProvider: 'connectionProviders',
} as const satisfies Partial<
  Record<ManifestTranslatableEntity, keyof Manifest>
>;

export const collectTranslatableStrings = (
  manifest: Manifest,
): MessageDescriptor[] => {
  // One string can label several roles, each its own catalog entry, so dedupe per (context, message)
  const descriptorByKey = new Map<string, MessageDescriptor>();

  const addString = ({
    message,
    context,
  }: {
    message: unknown;
    context: string;
  }) => {
    if (!isNonEmptyString(message)) {
      return;
    }

    descriptorByKey.set(JSON.stringify([context, message]), {
      message,
      context,
    });
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
      addString({
        message: (entity as Record<string, unknown>)[property],
        context: getMetadataLabelContext(metadataName, property),
      });
    }
  };

  const addManifestEntityStrings = (
    value: unknown,
    entity: ManifestTranslatableEntity,
  ) => {
    for (const { value: message, context } of listManifestTranslatableValues({
      entity,
      value,
    })) {
      addString({ message, context });
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

  for (const [entity, manifestKey] of Object.entries(
    MANIFEST_KEY_BY_MANIFEST_TRANSLATABLE_ENTITY,
  ) as [ManifestTranslatableEntity, keyof Manifest][]) {
    const values = manifest[manifestKey];

    if (!Array.isArray(values)) {
      continue;
    }

    for (const value of values) {
      addManifestEntityStrings(value, entity);
    }
  }

  for (const objectManifest of manifest.objects ?? []) {
    for (const field of objectManifest.fields ?? []) {
      addEntityStrings(field, 'fieldMetadata');
      addManifestEntityStrings(field, 'fieldMetadata');
    }
  }

  addManifestEntityStrings(manifest.application, 'application');

  for (const applicationVariable of Object.values(
    manifest.application.applicationVariables ?? {},
  )) {
    addManifestEntityStrings(applicationVariable, 'applicationVariable');
  }

  for (const serverVariable of Object.values(
    manifest.application.serverVariables ?? {},
  )) {
    addManifestEntityStrings(serverVariable, 'serverVariable');
  }

  // Tab and widget titles are nested under pageLayouts[].tabs[], not in the flat pageLayoutTabs array
  for (const pageLayout of manifest.pageLayouts ?? []) {
    for (const tab of pageLayout.tabs ?? []) {
      addEntityStrings(tab, 'pageLayoutTab');

      for (const widget of tab.widgets ?? []) {
        addEntityStrings(widget, 'pageLayoutWidget');
      }
    }
  }

  for (const pageLayoutTab of manifest.pageLayoutTabs ?? []) {
    for (const widget of pageLayoutTab.widgets ?? []) {
      addEntityStrings(widget, 'pageLayoutWidget');
    }
  }

  return [...descriptorByKey.values()];
};
