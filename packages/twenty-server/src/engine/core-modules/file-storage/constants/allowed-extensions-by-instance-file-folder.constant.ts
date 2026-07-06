import { InstanceFileFolder } from 'twenty-shared/types';

export const ALLOWED_EXTENSIONS_BY_INSTANCE_FILE_FOLDER = {
  [InstanceFileFolder.ApplicationRegistration]: { '.json': true },
} as const satisfies Record<InstanceFileFolder, Record<string, true>>;
