import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useLingui } from '@lingui/react/macro';
import { ViewFilterOperand } from 'twenty-shared/types';
import { IconX } from 'twenty-ui/display';

export const EditableFilterChipDropdownMenuHeader = () => {
  const { t } = useLingui();

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const selectedOperandInDropdown = useRecoilComponentValueV2(
    selectedOperandInDropdownComponentState,
  );

  const isVectorSearchFilter =
    selectedOperandInDropdown === ViewFilterOperand.VectorSearch;

  const { closeDropdown } = useCloseDropdown();

  const handleBackButtonClick = () => {
    closeDropdown();
  };

  return (
    <DropdownMenuHeader
      StartComponent={
        <DropdownMenuHeaderLeftComponent
          onClick={handleBackButtonClick}
          Icon={IconX}
        />
      }
    >
      {isVectorSearchFilter
        ? t`Search`
        : fieldMetadataItemUsedInDropdown?.label}
    </DropdownMenuHeader>
  );
};
