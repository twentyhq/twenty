/**
 * Runtime stub for `twenty-sdk/define`.
 *
 * `twenty-sdk/define` is an authoring API: its `defineXxx` helpers only run
 * build-time validation, and the full module transitively pulls in `zod`
 * (including every locale) plus `@sniptt/guards`. In a built logic function
 * or front component that only needs `default.config.handler` /
 * `default.config.component` at runtime, those extras inflate bundles by
 * ~1MB per file.
 *
 * The CLI aliases `twenty-sdk/define` to this stub when bundling user code,
 * so the published SDK continues to do build-time validation while user
 * bundles ship only the identity passthroughs and the handful of enum
 * constants they actually reference. Tree-shaking removes the rest.
 *
 * Keep this file free of imports that transitively reach `zod` — i.e. do not
 * re-export from the `twenty-shared/types` barrel, which pulls
 * `richTextValueSchema` (zod) in along for the ride.
 */

export { STANDARD_OBJECTS as STANDARD_OBJECT } from 'twenty-shared/metadata';
export { STANDARD_OBJECTS as STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';

export { generateDefaultFieldUniversalIdentifier } from '@/sdk/define/objects/generate-default-field-universal-identifier';
export { getPublicAssetUrl } from '@/sdk/define/get-public-asset-url';

type PassthroughResult<T> = {
  success: true;
  config: T;
  errors: readonly never[];
};

const passthrough = <T>(config: T): PassthroughResult<T> => ({
  success: true,
  config,
  errors: [],
});

export const defineAgent = passthrough;
export const defineApplication = passthrough;
export const defineField = passthrough;
export const defineFrontComponent = passthrough;
export const defineLogicFunction = passthrough;
export const defineNavigationMenuItem = passthrough;
export const defineObject = passthrough;
export const definePageLayout = passthrough;
export const definePageLayoutTab = passthrough;
export const definePostInstallLogicFunction = passthrough;
export const definePreInstallLogicFunction = passthrough;
export const defineRole = passthrough;
export const defineSkill = passthrough;
export const defineView = passthrough;

export const createValidationResult = <T>({
  config,
  errors = [],
}: {
  config: T;
  errors?: string[];
}) => ({
  success: errors.length === 0,
  config,
  errors,
});

export const validateFields = (): string[] => [];

// ─── Enum constants ─────────────────────────────────────────────────────────
// Values inlined (rather than re-exported from `twenty-shared/types`) to keep
// this stub free of the zod-using `richTextValueSchema` re-export that lives
// in the same barrel.

export const AggregateOperations = {
  MIN: 'MIN',
  MAX: 'MAX',
  AVG: 'AVG',
  SUM: 'SUM',
  COUNT: 'COUNT',
  COUNT_UNIQUE_VALUES: 'COUNT_UNIQUE_VALUES',
  COUNT_EMPTY: 'COUNT_EMPTY',
  COUNT_NOT_EMPTY: 'COUNT_NOT_EMPTY',
  COUNT_TRUE: 'COUNT_TRUE',
  COUNT_FALSE: 'COUNT_FALSE',
  PERCENTAGE_EMPTY: 'PERCENTAGE_EMPTY',
  PERCENTAGE_NOT_EMPTY: 'PERCENTAGE_NOT_EMPTY',
} as const;

export const DateDisplayFormat = {
  RELATIVE: 'RELATIVE',
  USER_SETTINGS: 'USER_SETTINGS',
  CUSTOM: 'CUSTOM',
} as const;

export const FieldMetadataSettingsOnClickAction = {
  COPY: 'COPY',
  OPEN_LINK: 'OPEN_LINK',
  OPEN_IN_APP: 'OPEN_IN_APP',
} as const;

export const FieldType = {
  ACTOR: 'ACTOR',
  ADDRESS: 'ADDRESS',
  ARRAY: 'ARRAY',
  BOOLEAN: 'BOOLEAN',
  CURRENCY: 'CURRENCY',
  DATE: 'DATE',
  DATE_TIME: 'DATE_TIME',
  EMAILS: 'EMAILS',
  FILES: 'FILES',
  FULL_NAME: 'FULL_NAME',
  LINKS: 'LINKS',
  MORPH_RELATION: 'MORPH_RELATION',
  MULTI_SELECT: 'MULTI_SELECT',
  NUMBER: 'NUMBER',
  NUMERIC: 'NUMERIC',
  PHONES: 'PHONES',
  POSITION: 'POSITION',
  RATING: 'RATING',
  RAW_JSON: 'RAW_JSON',
  RELATION: 'RELATION',
  RICH_TEXT: 'RICH_TEXT',
  SELECT: 'SELECT',
  TEXT: 'TEXT',
  TS_VECTOR: 'TS_VECTOR',
  UUID: 'UUID',
} as const;

export const HTTPMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export const NavigationMenuItemType = {
  VIEW: 'VIEW',
  FOLDER: 'FOLDER',
  LINK: 'LINK',
  OBJECT: 'OBJECT',
  RECORD: 'RECORD',
  PAGE_LAYOUT: 'PAGE_LAYOUT',
} as const;

export const NumberDataType = {
  FLOAT: 'float',
  INT: 'int',
  BIGINT: 'bigint',
} as const;

export const ObjectRecordGroupByDateGranularity = {
  DAY: 'DAY',
  MONTH: 'MONTH',
  QUARTER: 'QUARTER',
  YEAR: 'YEAR',
  WEEK: 'WEEK',
  DAY_OF_THE_WEEK: 'DAY_OF_THE_WEEK',
  MONTH_OF_THE_YEAR: 'MONTH_OF_THE_YEAR',
  QUARTER_OF_THE_YEAR: 'QUARTER_OF_THE_YEAR',
  NONE: 'NONE',
} as const;

export const OnDeleteAction = {
  CASCADE: 'CASCADE',
  RESTRICT: 'RESTRICT',
  SET_NULL: 'SET_NULL',
  NO_ACTION: 'NO_ACTION',
} as const;

export const PageLayoutTabLayoutMode = {
  GRID: 'GRID',
  VERTICAL_LIST: 'VERTICAL_LIST',
  CANVAS: 'CANVAS',
} as const;

export const PermissionFlag = {
  API_KEYS_AND_WEBHOOKS: 'API_KEYS_AND_WEBHOOKS',
  WORKSPACE: 'WORKSPACE',
  WORKSPACE_MEMBERS: 'WORKSPACE_MEMBERS',
  ROLES: 'ROLES',
  DATA_MODEL: 'DATA_MODEL',
  SECURITY: 'SECURITY',
  WORKFLOWS: 'WORKFLOWS',
  IMPERSONATE: 'IMPERSONATE',
  SSO_BYPASS: 'SSO_BYPASS',
  APPLICATIONS: 'APPLICATIONS',
  MARKETPLACE_APPS: 'MARKETPLACE_APPS',
  LAYOUTS: 'LAYOUTS',
  BILLING: 'BILLING',
  AI_SETTINGS: 'AI_SETTINGS',
  AI: 'AI',
  VIEWS: 'VIEWS',
  UPLOAD_FILE: 'UPLOAD_FILE',
  DOWNLOAD_FILE: 'DOWNLOAD_FILE',
  SEND_EMAIL_TOOL: 'SEND_EMAIL_TOOL',
  HTTP_REQUEST_TOOL: 'HTTP_REQUEST_TOOL',
  CODE_INTERPRETER_TOOL: 'CODE_INTERPRETER_TOOL',
  IMPORT_CSV: 'IMPORT_CSV',
  EXPORT_CSV: 'EXPORT_CSV',
  CONNECTED_ACCOUNTS: 'CONNECTED_ACCOUNTS',
  PROFILE_INFORMATION: 'PROFILE_INFORMATION',
} as const;

export const RelationType = {
  MANY_TO_ONE: 'MANY_TO_ONE',
  ONE_TO_MANY: 'ONE_TO_MANY',
} as const;

export const ViewFilterGroupLogicalOperator = {
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
} as const;

export const ViewFilterOperand = {
  IS: 'IS',
  IS_NOT_NULL: 'IS_NOT_NULL',
  IS_NOT: 'IS_NOT',
  LESS_THAN_OR_EQUAL: 'LESS_THAN_OR_EQUAL',
  GREATER_THAN_OR_EQUAL: 'GREATER_THAN_OR_EQUAL',
  IS_BEFORE: 'IS_BEFORE',
  IS_AFTER: 'IS_AFTER',
  CONTAINS: 'CONTAINS',
  DOES_NOT_CONTAIN: 'DOES_NOT_CONTAIN',
  IS_EMPTY: 'IS_EMPTY',
  IS_NOT_EMPTY: 'IS_NOT_EMPTY',
  IS_RELATIVE: 'IS_RELATIVE',
  IS_IN_PAST: 'IS_IN_PAST',
  IS_IN_FUTURE: 'IS_IN_FUTURE',
  IS_TODAY: 'IS_TODAY',
  VECTOR_SEARCH: 'VECTOR_SEARCH',
} as const;

export const ViewKey = {
  INDEX: 'INDEX',
} as const;

export const ViewOpenRecordIn = {
  SIDE_PANEL: 'SIDE_PANEL',
  RECORD_PAGE: 'RECORD_PAGE',
} as const;

export const ViewSortDirection = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

export const ViewType = {
  TABLE: 'TABLE',
  KANBAN: 'KANBAN',
  CALENDAR: 'CALENDAR',
  FIELDS_WIDGET: 'FIELDS_WIDGET',
  TABLE_WIDGET: 'TABLE_WIDGET',
} as const;

export const ViewVisibility = {
  WORKSPACE: 'WORKSPACE',
  UNLISTED: 'UNLISTED',
} as const;
