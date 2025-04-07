import { useEffect } from 'react';

import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';

import { objectFilterDropdownSelectedRecordIdsComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedRecordIdsComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isDefined } from 'twenty-shared/utils';

type EditableFilterDropdownButtonEffectProps = {
  recordFilter: RecordFilter;
};

export const EditableFilterDropdownButtonEffect = ({
  recordFilter,
}: EditableFilterDropdownButtonEffectProps) => {
  const setFieldMetadataItemIdUsedInDropdown = useSetRecoilComponentStateV2(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
    recordFilter.id,
  );

  const setSubFieldNameUsedInDropdown = useSetRecoilComponentStateV2(
    subFieldNameUsedInDropdownComponentState,
    recordFilter.id,
  );

  const setSelectedFilter = useSetRecoilComponentStateV2(
    selectedFilterComponentState,
    recordFilter.id,
  );

  const setObjectFilterDropdownSelectedRecordIds = useSetRecoilComponentStateV2(
    objectFilterDropdownSelectedRecordIdsComponentState,
    recordFilter.id,
  );

  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  useEffect(() => {
    const fieldMetadataItem = filterableFieldMetadataItems.find(
      (fieldMetadataItem) =>
        fieldMetadataItem.id === recordFilter.fieldMetadataId,
    );

    if (!isDefined(fieldMetadataItem)) {
      return;
    }

    setFieldMetadataItemIdUsedInDropdown(fieldMetadataItem.id);
    setSelectedOperandInDropdown(recordFilter.operand);
    setSelectedFilter(recordFilter);
    setSubFieldNameUsedInDropdown(recordFilter.subFieldName);

    try {
      const selectedOptions = JSON.parse(recordFilter.value);

      setObjectFilterDropdownSelectedRecordIds(selectedOptions);
    } catch {
      setObjectFilterDropdownSelectedRecordIds([]);
    }
  }, [
    filterableFieldMetadataItems,
    setFieldMetadataItemIdUsedInDropdown,
    recordFilter,
    setSelectedOperandInDropdown,
    setSelectedFilter,
    setSubFieldNameUsedInDropdown,
    setObjectFilterDropdownSelectedRecordIds,
  ]);

  return null;
};
