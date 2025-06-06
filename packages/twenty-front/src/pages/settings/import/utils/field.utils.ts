import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';
import { RESERVED_FIELD_NAMES } from '../constants/reservedFieldNames';
import { RESERVED_FIELD_PREFIXES } from '../constants/reservedFieldPrefixes';

import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '../constants/settingsFieldType';
import { ColumnType } from '../types/ColumnType';
import { CompositeFieldType } from '../types/CompositeFieldType';

export const isCompositeType = (
  type: ColumnType,
): type is CompositeFieldType => {
  return (
    type !== 'DO_NOT_IMPORT' && type in SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS
  );
};

export const getDefaultIconForType = (type: ColumnType): string => {
  const iconMap: Record<string, string> = {
    TEXT: 'IconFileText',
    EMAIL: 'IconMail',
    PHONE: 'IconPhone',
    URL: 'IconLink',
    NUMBER: 'IconHash',
    BOOLEAN: 'IconToggleLeft',
    DATE_TIME: 'IconCalendarEvent',
    DATE: 'IconCalendar',
    CURRENCY: 'IconCurrencyDollar',
    FULL_NAME: 'IconUser',
    ADDRESS: 'IconMap',
    LINKS: 'IconLink',
    SELECT: 'IconList',
    MULTI_SELECT: 'IconChecklist',
    RICH_TEXT: 'IconNotes',
    RAW_JSON: 'IconCode',
    ARRAY: 'IconList',
    RATING: '',
  };
  return iconMap[type as string] || 'IconFileText';
};

export const parseErrorMessage = (error: any): string => {
  if (error?.message !== undefined) {
    if (error.message.includes('workspace has been updated') !== undefined) {
      return 'Workspace updating - retrying automatically';
    }
    if (error.message.includes('not available') !== undefined) {
      return 'Field name is reserved or already exists';
    }
    if (error.message.includes('duplicate') !== undefined) {
      return 'Field name already exists';
    }
    if (error.message.includes('reserved') !== undefined) {
      return 'Field name is reserved';
    }
    if (error.message.includes('invalid') !== undefined) {
      return 'Invalid field configuration';
    }
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
};

export const isReservedFieldName = (fieldName: string): boolean => {
  const normalizedName = fieldName.toLowerCase();
  return (
    RESERVED_FIELD_NAMES.some(
      (reserved) => normalizedName === reserved.toLowerCase(),
    ) ||
    RESERVED_FIELD_PREFIXES.some((prefix) => normalizedName.startsWith(prefix))
  );
};

export const generateUniqueFieldName = (
  baseName: string,
  existingNames: string[],
): string => {
  const fieldName = computeMetadataNameFromLabel(baseName);

  if (isReservedFieldName(fieldName) || existingNames.includes(fieldName)) {
    let counter = 1;
    let uniqueName = `${fieldName}${counter}`;

    while (
      isReservedFieldName(uniqueName) ||
      existingNames.includes(uniqueName)
    ) {
      counter++;
      uniqueName = `${fieldName}${counter}`;
    }

    return uniqueName;
  }

  return fieldName;
};
