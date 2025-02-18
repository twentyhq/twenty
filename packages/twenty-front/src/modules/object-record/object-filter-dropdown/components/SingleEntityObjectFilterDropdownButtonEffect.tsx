import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';

import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect } from 'react';

export const SingleEntityObjectFilterDropdownButtonEffect = () => {
  const setFieldMetadataItemIdUsedInDropdown = useSetRecoilComponentStateV2(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
  );

  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const firstFieldMetadataItem = filterableFieldMetadataItems[0];

  useEffect(() => {
    setFieldMetadataItemIdUsedInDropdown(firstFieldMetadataItem.id);

    const filterType = getFilterTypeFromFieldType(firstFieldMetadataItem.type);

    const defaultOperand = getRecordFilterOperands({ filterType })[0];

    setSelectedOperandInDropdown(defaultOperand);
  }, [
    firstFieldMetadataItem,
    setSelectedOperandInDropdown,
    setFieldMetadataItemIdUsedInDropdown,
  ]);

  return null;
};
