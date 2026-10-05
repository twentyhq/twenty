import { type DatabaseEventTriggerSettings } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

// Manifests built with twenty-sdk before 2.47 declare a single trigger object
export const normalizeManifestDatabaseEventTriggerSettings = (
  databaseEventTriggerSettings:
    | DatabaseEventTriggerSettings
    | DatabaseEventTriggerSettings[]
    | null
    | undefined,
): DatabaseEventTriggerSettings[] | null => {
  if (!isDefined(databaseEventTriggerSettings)) {
    return null;
  }

  return Array.isArray(databaseEventTriggerSettings)
    ? databaseEventTriggerSettings
    : [databaseEventTriggerSettings];
};
