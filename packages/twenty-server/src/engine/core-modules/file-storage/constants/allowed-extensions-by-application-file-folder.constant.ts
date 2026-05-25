import { FileFolder } from 'twenty-shared/types';

// PublicAsset is intentionally not listed here: public assets are served
// from a dedicated eTLD+1 (Cloudflare-fronted) so any uploaded extension
// is safe by isolation, and developer flexibility is preferred.
// See packages/twenty-server/docs/PUBLIC_ASSETS_SAME_ORIGIN.md
export const ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER = {
  [FileFolder.BuiltLogicFunction]: { '.mjs': true },
  [FileFolder.BuiltFrontComponent]: { '.mjs': true },
  [FileFolder.Source]: { '.ts': true, '.tsx': true, '.json': true },
  [FileFolder.Dependencies]: { '.json': true, '.lock': true },
} as const satisfies Partial<Record<FileFolder, Record<string, true>>>;
