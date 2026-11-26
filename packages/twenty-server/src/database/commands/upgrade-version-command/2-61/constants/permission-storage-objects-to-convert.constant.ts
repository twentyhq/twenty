// Kept as literals: the standard object definitions go away once every workspace is converted
export const PERMISSION_STORAGE_OBJECTS_TO_CONVERT = [
  {
    universalIdentifier: 'fecdb92c-d150-4544-81f8-f1158d18a7a2',
    tableName: 'recordShare',
  },
  {
    universalIdentifier: '47f4ed44-4312-467f-b6f5-787f91037a1d',
    tableName: 'accessGroup',
  },
];

export const STANDARD_OBJECT_ONLY_COLUMN_NAMES = [
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
  'createdByContext',
  'updatedBySource',
  'updatedByWorkspaceMemberId',
  'updatedByName',
  'updatedByContext',
  'position',
  'searchVector',
];

export const STANDARD_OBJECT_ONLY_ENUM_SUFFIXES = [
  'createdBySource_enum',
  'updatedBySource_enum',
];

export const PERMISSION_TABLES_FEATURE_FLAG_KEY = 'IS_PERMISSION_TABLES_ENABLED';
