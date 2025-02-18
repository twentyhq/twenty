import { useEffect } from 'react';

import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';

import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isDefined } from 'twenty-shared';

type EditableFilterDropdownButtonEffectProps = {
  viewFilterDropdownId: string;
  viewFilter: RecordFilter;
};

export const EditableFilterDropdownButtonEffect = ({
  viewFilterDropdownId,
  viewFilter,
}: EditableFilterDropdownButtonEffectProps) => {
  const setFieldMetadataItemIdUsedInDropdown = useSetRecoilComponentStateV2(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
    viewFilterDropdownId,
  );

  const setSelectedFilter = useSetRecoilComponentStateV2(
    selectedFilterComponentState,
    viewFilterDropdownId,
  );

  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  useEffect(() => {
    const fieldMetadataItem = filterableFieldMetadataItems.find(
      (fieldMetadataItem) =>
        fieldMetadataItem.id === viewFilter.fieldMetadataId,
    );

    if (!isDefined(fieldMetadataItem)) {
      return;
    }

    setFieldMetadataItemIdUsedInDropdown(fieldMetadataItem.id);
    setSelectedOperandInDropdown(viewFilter.operand);
    setSelectedFilter(viewFilter);
  }, [
    filterableFieldMetadataItems,
    setFieldMetadataItemIdUsedInDropdown,
    viewFilter,
    setSelectedOperandInDropdown,
    setSelectedFilter,
    viewFilterDropdownId,
  ]);

  return null;
};
