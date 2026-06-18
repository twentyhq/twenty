import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type IconComponent } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/input';
import { compositeTypeDefinitions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type FieldMetadataType } from '~/generated-metadata/graphql';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { encodeIndexableOptionValue } from '@/settings/data-model/indexes/utils/encodeIndexableOptionValue';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';

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
