import { FileFolder } from 'twenty-shared/types';

export const ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER = {
  [FileFolder.BuiltLogicFunction]: { '.mjs': true },
  [FileFolder.BuiltFrontComponent]: { '.mjs': true },
  [FileFolder.Source]: { '.ts': true, '.tsx': true, '.json': true },
  [FileFolder.Dependencies]: { '.json': true, '.lock': true },
} as const satisfies Partial<Record<FileFolder, Record<string, true>>>;
