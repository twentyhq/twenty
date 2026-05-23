import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type IconComponent } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { compositeTypeDefinitions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type FieldMetadataType } from '~/generated-metadata/graphql';
import { getCompositeSubFieldLabel } from '@/settings/data-model/indexes/utils/getCompositeSubFieldLabel';

// The Select component takes string values. We encode (fieldMetadataId,
// subFieldName) as `${id}` for scalar fields and `${id}::${subFieldName}` for
// composite sub-fields. Stable, easy to parse, no collisions because UUIDs
// don't contain `::`.
export const INDEXABLE_OPTION_SEPARATOR = '::';

export const encodeIndexableOptionValue = (
  fieldMetadataId: string,
  subFieldName: string | null,
): string =>
  isDefined(subFieldName) && subFieldName !== ''
    ? `${fieldMetadataId}${INDEXABLE_OPTION_SEPARATOR}${subFieldName}`
    : fieldMetadataId;

export const decodeIndexableOptionValue = (
  value: string,
): { fieldMetadataId: string; subFieldName: string | null } => {
  const [fieldMetadataId, subFieldName] = value.split(
    INDEXABLE_OPTION_SEPARATOR,
  );

  return {
    fieldMetadataId,
    subFieldName:
      isDefined(subFieldName) && subFieldName !== '' ? subFieldName : null,
  };
};

export const buildIndexableSelectOptions = ({
  indexableFields,
  getIcon,
}: {
  indexableFields: FieldMetadataItem[];
  getIcon: (icon?: string | null) => IconComponent | undefined;
}): SelectOption<string>[] => {
  const sortedFields = [...indexableFields].sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  return sortedFields.flatMap<SelectOption<string>>((field) => {
    const compositeType = compositeTypeDefinitions.get(
      field.type as FieldMetadataType,
    );

    if (isDefined(compositeType)) {
      // Composite parent — emit one option per sub-property. The parent
      // itself is NOT selectable because the SQL index requires picking a
      // specific column.
      return compositeType.properties.map<SelectOption<string>>(
        (property) => ({
          Icon: getIcon(field.icon),
          label: `${field.label} > ${getCompositeSubFieldLabel(field.type as FieldMetadataType, property.name)}`,
          value: encodeIndexableOptionValue(field.id, property.name),
        }),
      );
    }

    return [
      {
        Icon: getIcon(field.icon),
        label: field.label,
        value: encodeIndexableOptionValue(field.id, null),
      },
    ];
  });
};
