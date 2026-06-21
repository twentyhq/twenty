import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const formatFieldMetadataItemInput = (
  input: Partial<
    Pick<
      FieldMetadataItem,
      | 'name'
      | 'label'
      | 'icon'
      | 'description'
      | 'defaultValue'
      | 'type'
      | 'options'
      | 'settings'
      | 'isLabelSyncedWithName'
      | 'isNullable'
      | 'isUnique'
    >
  >,
) => {
  // Required (non-nullable) fields must not carry a null defaultValue — the
  // backend rejects that combination. Omit it by returning undefined so Apollo
  // strips the key from the mutation variables entirely.
  const defaultValue =
    input.isNullable === false && input.defaultValue === null
      ? undefined
      : input.defaultValue;

  return {
    defaultValue,
    description: input.description?.trim() ?? null,
    icon: input.icon,
    label: input.label?.trim(),
    name: input.name?.trim(),
    options: input.options,
    settings: input.settings,
    isLabelSyncedWithName: input.isLabelSyncedWithName,
    isUnique: input.isUnique,
  };
};
