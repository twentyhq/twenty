import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type IconComponent } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { compositeTypeDefinitions } from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type FieldMetadataType } from '~/generated-metadata/graphql';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';

// The Select component takes string values. We encode (fieldMetadataId,
// subFieldName) as `${id}` for scalar fields and `${id}::${subFieldName}` for
// composite sub-fields. Stable, easy to parse, no collisions because UUIDs
// don't contain `::`.
export const INDEXABLE_OPTION_SEPARATOR = '::';

export const encodeIndexableOptionValue = (
  fieldMetadataId: string,
  subFieldName: string | null,
): string =>
  isNonEmptyString(subFieldName)
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
    subFieldName: isNonEmptyString(subFieldName) ? subFieldName : null,
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
      return compositeType.properties.map<SelectOption<string>>((property) => ({
        Icon: getIcon(field.icon),
        label: `${field.label} > ${getCompositeSubFieldLabel(field.type as CompositeFieldType, property.name as CompositeFieldSubFieldName)}`,
        value: encodeIndexableOptionValue(field.id, property.name),
      }));
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
