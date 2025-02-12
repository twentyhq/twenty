import { formatFieldMetadataItemAsFilterDefinition } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { filterDefinitionUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/filterDefinitionUsedInDropdownComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { getRecordFilterOperandsForRecordFilterDefinition } from '@/object-record/record-filter/utils/getRecordFilterOperandsForRecordFilterDefinition';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect } from 'react';

export const SingleEntityObjectFilterDropdownButtonEffect = () => {
  const setFilterDefinitionUsedInDropdown = useSetRecoilComponentStateV2(
    filterDefinitionUsedInDropdownComponentState,
  );

  const setFieldMetadataItemIdUsedInDropdown = useSetRecoilComponentStateV2(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
  );

  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const firstFieldMetadataItem = filterableFieldMetadataItems[0];

  const firstFieldDefinition = formatFieldMetadataItemAsFilterDefinition({
    field: firstFieldMetadataItem,
  });

  useEffect(() => {
    setFieldMetadataItemIdUsedInDropdown(firstFieldDefinition.fieldMetadataId);
    setFilterDefinitionUsedInDropdown(firstFieldDefinition);

    const defaultOperand =
      getRecordFilterOperandsForRecordFilterDefinition(firstFieldDefinition)[0];

    setSelectedOperandInDropdown(defaultOperand);
  }, [
    firstFieldDefinition,
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setFieldMetadataItemIdUsedInDropdown,
  ]);

  return null;
};
