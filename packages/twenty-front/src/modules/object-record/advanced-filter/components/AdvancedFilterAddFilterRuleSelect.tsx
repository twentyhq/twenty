import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { useGetDefaultFieldMetadataItemForFilter } from '@/object-record/advanced-filter/hooks/useGetDefaultFieldMetadataItemForFilter';
import { useSetRecordFilterUsedInAdvancedFilterDropdownRow } from '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { getAdvancedFilterAddFilterRuleSelectDropdownId } from '@/object-record/advanced-filter/utils/getAdvancedFilterAddFilterRuleSelectDropdownId';
import { getDefaultAdvancedFilterOperand } from '@/object-record/advanced-filter/utils/getDefaultAdvancedFilterOperand';
import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getDefaultSubFieldNameForCompositeFilterableFieldType } from '@/object-record/record-filter/utils/getDefaultSubFieldNameForCompositeFilterableFieldType';
import { Dropdown } from 'twenty-ui/components/navigation';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { IconLibraryPlus, IconPlus } from 'twenty-ui/icon';
import { v4 } from 'uuid';

type AdvancedFilterAddFilterRuleSelectProps = {
  recordFilterGroup: RecordFilterGroup;
};

export const AdvancedFilterAddFilterRuleSelect = ({
  recordFilterGroup,
}: AdvancedFilterAddFilterRuleSelectProps) => {
  const dropdownId = getAdvancedFilterAddFilterRuleSelectDropdownId(
    recordFilterGroup.id,
  );

  const { currentView } = useGetCurrentViewOnly();

  const { upsertRecordFilterGroup } = useUpsertRecordFilterGroup();

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const { lastChildPosition } = useChildRecordFiltersAndRecordFilterGroups({
    recordFilterGroupId: recordFilterGroup.id,
  });

  const newPositionInRecordFilterGroup = lastChildPosition + 1;

  const { getDefaultFieldMetadataItemForFilter } =
    useGetDefaultFieldMetadataItemForFilter();

  const { setRecordFilterUsedInAdvancedFilterDropdownRow } =
    useSetRecordFilterUsedInAdvancedFilterDropdownRow();

  const { objectMetadataItem } = useContext(AdvancedFilterContext);

  const handleAddFilter = () => {
    const { defaultFieldMetadataItemForFilter } =
      getDefaultFieldMetadataItemForFilter(objectMetadataItem);

    if (!isDefined(defaultFieldMetadataItemForFilter)) {
      throw new Error('Missing default field metadata item for filter');
    }

    const filterType = getFilterTypeFromFieldType(
      defaultFieldMetadataItemForFilter.type,
    );

    const defaultSubFieldName =
      getDefaultSubFieldNameForCompositeFilterableFieldType(filterType);

    const newRecordFilter: RecordFilter = {
      id: v4(),
      fieldMetadataId: defaultFieldMetadataItemForFilter.id,
      type: filterType,
      operand: getDefaultAdvancedFilterOperand({ filterType }),
      value: '',
      displayValue: '',
      recordFilterGroupId: recordFilterGroup.id,
      positionInRecordFilterGroup: newPositionInRecordFilterGroup,
      label: defaultFieldMetadataItemForFilter.label,
      subFieldName: defaultSubFieldName,
    };

    upsertRecordFilter(newRecordFilter);

    setRecordFilterUsedInAdvancedFilterDropdownRow(newRecordFilter);
  };

  const handleAddFilterGroup = () => {
    const { defaultFieldMetadataItemForFilter } =
      getDefaultFieldMetadataItemForFilter(objectMetadataItem);

    if (!isDefined(defaultFieldMetadataItemForFilter)) {
      throw new Error('Missing default field metadata item for filter');
    }

    if (!isDefined(currentView)) {
      throw new Error('Missing view');
    }

    const newRecordFilterGroupId = v4();

    const newRecordFilterGroup: RecordFilterGroup = {
      id: newRecordFilterGroupId,
      logicalOperator: RecordFilterGroupLogicalOperator.AND,
      parentRecordFilterGroupId: recordFilterGroup.id,
      positionInRecordFilterGroup: newPositionInRecordFilterGroup,
    };

    upsertRecordFilterGroup(newRecordFilterGroup);

    const filterType = getFilterTypeFromFieldType(
      defaultFieldMetadataItemForFilter.type,
    );

    const newRecordFilter: RecordFilter = {
      id: v4(),
      fieldMetadataId: defaultFieldMetadataItemForFilter.id,
      type: filterType,
      operand: getDefaultAdvancedFilterOperand({ filterType }),
      value: '',
      displayValue: '',
      recordFilterGroupId: newRecordFilterGroupId,
      positionInRecordFilterGroup: 1,
      label: defaultFieldMetadataItemForFilter.label,
    };

    upsertRecordFilter(newRecordFilter);

    setRecordFilterUsedInAdvancedFilterDropdownRow(newRecordFilter);
  };

  const isFilterRuleGroupOptionVisible = !isDefined(
    recordFilterGroup.parentRecordFilterGroupId,
  );

  if (!isFilterRuleGroupOptionVisible) {
    return (
      <CommandMenuButton
        command={{
          Icon: IconPlus,
          label: t`Add rule`,
          shortLabel: t`Add rule`,
          key: 'add-rule',
        }}
        onClick={handleAddFilter}
      />
    );
  }

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      <Dropdown.Trigger
        render={
          <NavigationButton
            size="sm"
            variant="outline"
            color="neutral"
            startIcon={<IconPlus />}
          >
            {t`Add filter rule`}
          </NavigationButton>
        }
      />
      <DropdownContent sideOffset={8}>
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconPlus />}
            onClick={handleAddFilter}
          >
            {t`Add rule`}
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            startIcon={<IconLibraryPlus />}
            onClick={handleAddFilterGroup}
          >
            {t`Add rule group`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
