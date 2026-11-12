import { APPLICATION_SOURCE_FILE_EXTENSIONS } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

export const ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER = {
  [FileFolder.BuiltLogicFunction]: { '.mjs': true },
  [FileFolder.BuiltFrontComponent]: { '.mjs': true },
  [FileFolder.Source]: Object.fromEntries(
    APPLICATION_SOURCE_FILE_EXTENSIONS.map((extension) => [
      extension,
      true as const,
    ]),
  ),
  [FileFolder.Dependencies]: { '.json': true, '.lock': true, '.gz': true },
} as const satisfies Partial<Record<FileFolder, Record<string, true>>>;
