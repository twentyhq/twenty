import { SERVER_MANAGED_SYSTEM_FIELD_NAMES } from '@/object-metadata/constants/ServerManagedSystemFieldNames';

export const isServerManagedField = (field: {
  isSystem?: boolean | null;
  name: string;
}) =>
  field.isSystem === true && SERVER_MANAGED_SYSTEM_FIELD_NAMES.has(field.name);
