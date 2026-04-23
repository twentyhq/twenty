import { HIDDEN_SYSTEM_FIELD_NAMES } from '@/object-metadata/constants/HiddenSystemFieldNames';

export const isHiddenSystemField = (field: {
  isSystem?: boolean | null;
  name: string;
}) => field.isSystem === true && HIDDEN_SYSTEM_FIELD_NAMES.has(field.name);
