import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { ICON_NAME_BY_SUB_FIELD } from '@/object-record/record-filter/constants/IconNameBySubField';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { useChartGroupByFieldSelectionContextOrThrow } from '@/side-panel/pages/page-layout/hooks/useChartGroupByFieldSelectionContextOrThrow';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { compositeTypeDefinitions } from 'twenty-shared/types';
import {
  isCompositePropertySupportedInGroupBy,
  isDefined,
} from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon';

type ChartGroupByFieldSelectionCompositeFieldViewProps = {
  pageId: string;
  compositeField: FieldMetadataItem;
  fieldMetadataId: string;
  subFieldNamePrefix?: string;
};

export const ChartGroupByFieldSelectionCompositeFieldView = ({
  pageId,
  compositeField,
  fieldMetadataId,
  subFieldNamePrefix,
}: ChartGroupByFieldSelectionCompositeFieldViewProps) => {
  const { getIcon } = useIcons();
  const { currentGroupByFieldMetadataId, currentSubFieldName, selectField } =
    useChartGroupByFieldSelectionContextOrThrow();
  const compositeFieldType = compositeField.type;

  if (!isCompositeFieldType(compositeFieldType)) {
    return null;
  }

  const getSubFieldName = (subFieldName: string) =>
    isDefined(subFieldNamePrefix)
      ? `${subFieldNamePrefix}.${subFieldName}`
      : subFieldName;
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
            onSelect={() =>
              selectField({
                fieldId: fieldMetadataId,
                subFieldName: getSubFieldName(subFieldName),
              })
            }
            selected={
              currentGroupByFieldMetadataId === fieldMetadataId &&
              currentSubFieldName === getSubFieldName(subFieldName)
            }
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
