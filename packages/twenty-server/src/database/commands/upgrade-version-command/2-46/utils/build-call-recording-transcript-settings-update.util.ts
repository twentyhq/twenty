import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const buildCallRecordingTranscriptSettingsUpdate = ({
  settings,
  universalSettings,
}: {
  settings?: unknown;
  universalSettings?: unknown;
}):
  | Pick<UniversalFlatFieldMetadata<FieldMetadataType.RAW_JSON>, 'universalSettings'>
  | undefined => {
  const settingsObject = isPlainObject(settings) ? settings : null;
  const universalSettingsObject = isPlainObject(universalSettings)
    ? universalSettings
    : null;

  if (
    (isDefined(settings) && !isDefined(settingsObject)) ||
    (isDefined(universalSettings) && !isDefined(universalSettingsObject))
  ) {
    return undefined;
  }

  const existingSettings = { ...universalSettingsObject, ...settingsObject };

  if (isDefined(existingSettings.isValueLoadedOnOpen)) {
    return undefined;
  }

  return {
    universalSettings: { ...existingSettings, isValueLoadedOnOpen: true },
  };
};
