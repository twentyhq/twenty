import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { ICON_NAME_BY_SUB_FIELD } from '@/object-record/record-filter/constants/IconNameBySubField';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { compositeTypeDefinitions } from 'twenty-shared/types';
import { isCompositePropertySupportedInGroupBy } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon';

type ChartGroupByFieldSelectionCompositeFieldViewProps = {
  pageId: string;
  compositeField: FieldMetadataItem;
  currentSubFieldName: string | undefined;
  onSelectSubField: (subFieldName: string) => void;
};

export const ChartGroupByFieldSelectionCompositeFieldView = ({
  pageId,
  compositeField,
  currentSubFieldName,
  onSelectSubField,
}: ChartGroupByFieldSelectionCompositeFieldViewProps) => {
  const { getIcon } = useIcons();
  const compositeFieldType = compositeField.type as CompositeFieldType;
  const groupableSubFieldNames = new Set(
    compositeTypeDefinitions
      .get(compositeField.type)
      ?.properties.filter(isCompositePropertySupportedInGroupBy)
      .map((property) => property.name),
  );
  const subFieldNames = SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
    compositeFieldType
  ].subFields
    .map((subField) => subField.subFieldName)
    .filter((subFieldName) => groupableSubFieldNames.has(subFieldName));

  return (
    <Dropdown.Page id={pageId}>
      <Dropdown.Back>{compositeField.label}</Dropdown.Back>
      <ChartSettingsDropdownSection>
        {subFieldNames.map((subFieldName) => (
          <Dropdown.OptionItem
            key={subFieldName}
            onSelect={() => onSelectSubField(subFieldName)}
            selected={currentSubFieldName === subFieldName}
            startIcon={
              <SelectOptionIcon
                Icon={getIcon(
                  ICON_NAME_BY_SUB_FIELD[subFieldName] ?? compositeField.icon,
                )}
              />
            }
          >
            {getCompositeSubFieldLabel(compositeFieldType, subFieldName)}
          </Dropdown.OptionItem>
        ))}
      </ChartSettingsDropdownSection>
    </Dropdown.Page>
  );
};
