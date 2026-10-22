import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { ChartGroupByFieldSelectionCompositeFieldView } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionCompositeFieldView';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { useChartGroupByFieldSelectionContextOrThrow } from '@/side-panel/pages/page-layout/hooks/useChartGroupByFieldSelectionContextOrThrow';
import { isFieldSupportedAsChartGroupBySubField } from '@/side-panel/pages/page-layout/utils/isFieldSupportedAsChartGroupBySubField';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon';
import { normalizeSearchText } from 'twenty-ui/utilities';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type ChartGroupByFieldSelectionTargetObjectFieldsViewProps = {
  pageId: string;
  targetObjectNameSingular?: string;
  headerLabel: string;
  fieldMetadataId: string;
};

export const ChartGroupByFieldSelectionTargetObjectFieldsView = ({
  pageId,
  targetObjectNameSingular,
  headerLabel,
  fieldMetadataId,
}: ChartGroupByFieldSelectionTargetObjectFieldsViewProps) => {
  const { getIcon } = useIcons();
  const { currentGroupByFieldMetadataId, currentSubFieldName, selectField } =
    useChartGroupByFieldSelectionContextOrThrow();
  const isCurrentGroupByField =
    currentGroupByFieldMetadataId === fieldMetadataId;
  const [searchQuery, setSearchQuery] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const targetObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === targetObjectNameSingular,
  );
  const groupableFields = (targetObjectMetadataItem?.fields ?? []).filter(
    isFieldSupportedAsChartGroupBySubField,
  );
  const availableFields = filterBySearchQuery({
    items: groupableFields,
    searchQuery,
    getSearchableValues: (field) => [field.label, field.name],
  });
  const [currentNestedFieldName] = currentSubFieldName?.split('.') ?? [];
  const recordOptionLabel = t`Record`;
  const isRecordOptionVisible = normalizeSearchText(recordOptionLabel).includes(
    normalizeSearchText(searchQuery),
  );

  return (
    <>
      <Dropdown.Page id={pageId}>
        <Dropdown.Back>{headerLabel}</Dropdown.Back>
        <Dropdown.Search
          placeholder={t`Search fields`}
          aria-label={t`Search fields`}
          onValueChange={setSearchQuery}
          value={searchQuery}
        />
        <ChartSettingsDropdownSection>
          {isRecordOptionVisible && (
            <Dropdown.OptionItem
              onSelect={() => selectField({ fieldId: fieldMetadataId })}
              selected={
                isCurrentGroupByField && !isDefined(currentSubFieldName)
              }
              startIcon={
                <SelectOptionIcon
                  Icon={getIcon(targetObjectMetadataItem?.icon)}
                />
              }
            >
              {recordOptionLabel}
            </Dropdown.OptionItem>
          )}
          {availableFields.map((fieldMetadataItem) => {
            const fieldIcon = (
              <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
            );

            if (isCompositeFieldType(fieldMetadataItem.type)) {
              return (
                <Dropdown.ActionItem
                  key={fieldMetadataItem.id}
                  page={`${pageId}:${fieldMetadataItem.id}`}
                  startIcon={fieldIcon}
                >
                  {fieldMetadataItem.label}
                </Dropdown.ActionItem>
              );
            }

            return (
              <Dropdown.OptionItem
                key={fieldMetadataItem.id}
                onSelect={() =>
                  selectField({
                    fieldId: fieldMetadataId,
                    subFieldName: fieldMetadataItem.name,
                  })
                }
                selected={
                  isCurrentGroupByField &&
                  currentNestedFieldName === fieldMetadataItem.name
                }
                startIcon={fieldIcon}
              >
                {fieldMetadataItem.label}
              </Dropdown.OptionItem>
            );
          })}
          {!isNonEmptyArray(availableFields) && !isRecordOptionVisible && (
            <Dropdown.Empty>{t`No fields available`}</Dropdown.Empty>
          )}
        </ChartSettingsDropdownSection>
      </Dropdown.Page>
      {groupableFields
        .filter((fieldMetadataItem) =>
          isCompositeFieldType(fieldMetadataItem.type),
        )
        .map((fieldMetadataItem) => (
          <ChartGroupByFieldSelectionCompositeFieldView
            key={fieldMetadataItem.id}
            pageId={`${pageId}:${fieldMetadataItem.id}`}
            compositeField={fieldMetadataItem}
            fieldMetadataId={fieldMetadataId}
            subFieldNamePrefix={fieldMetadataItem.name}
          />
        ))}
    </>
  );
};
