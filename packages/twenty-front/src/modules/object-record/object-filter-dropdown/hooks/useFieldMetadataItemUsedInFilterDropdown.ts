import { useGetFieldMetadataItemById } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { filterDefinitionUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/filterDefinitionUsedInDropdownComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-ui';

export const useFieldMetadataItemUsedInFilterDropdown = () => {
  const filterDefinitionUsedInDropdown = useRecoilComponentValueV2(
    filterDefinitionUsedInDropdownComponentState,
  );

  const { getFieldMetadataItemById } = useGetFieldMetadataItemById();

  const fieldMetadataItem = isDefined(filterDefinitionUsedInDropdown)
    ? getFieldMetadataItemById(filterDefinitionUsedInDropdown.fieldMetadataId)
    : undefined;

  return {
    fieldMetadataItemUsedInFilterDropdown: fieldMetadataItem,
  };
};
