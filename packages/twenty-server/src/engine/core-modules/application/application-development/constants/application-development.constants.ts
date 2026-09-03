import {
  DOCUMENTATION_BASE_URL,
  DOCUMENTATION_PATHS,
} from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';

export const APP_DEV_RATE_LIMIT_MAX = 30;
export const APP_DEV_RATE_LIMIT_WINDOW_MS = 30_000;

export const MAX_APPLICATION_FILE_UPLOAD_BATCH_SIZE = 100;

export const ALLOWED_APPLICATION_FILE_FOLDERS: FileFolder[] = [
  FileFolder.BuiltLogicFunction,
  FileFolder.BuiltFrontComponent,
  FileFolder.PublicAsset,
  FileFolder.Source,
  FileFolder.Dependencies,
];

export const REGISTRATION_OWNERSHIP_DOCUMENTATION_URL = `${DOCUMENTATION_BASE_URL}${DOCUMENTATION_PATHS.DEVELOPERS_EXTEND_APPS_OPERATIONS_PUBLISHING}#registration-ownership`;

// Read by the settings applications page to prefill the claim lookup.
export const CLAIM_UNIVERSAL_IDENTIFIER_SEARCH_PARAM =
  'claimUniversalIdentifier';

export const APPLICATIONS_DEVELOPER_TAB_HASH = 'developer';
