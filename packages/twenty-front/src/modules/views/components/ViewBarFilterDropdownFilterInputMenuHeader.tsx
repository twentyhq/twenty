import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useClearVectorSearchInput } from '@/views/hooks/useClearVectorSearchInput';
import { useLingui } from '@lingui/react/macro';
import { ViewFilterOperand } from 'twenty-shared/types';
import { IconChevronLeft } from 'twenty-ui/display';

export const ViewBarFilterDropdownFilterInputMenuHeader = () => {
  const { t } = useLingui();

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const selectedOperandInDropdown = useRecoilComponentValue(
    selectedOperandInDropdownComponentState,
  );

  const isVectorSearchFilter =
    selectedOperandInDropdown === ViewFilterOperand.VectorSearch;

  const { clearVectorSearchInput } = useClearVectorSearchInput();

  const { resetFilterDropdown } = useResetFilterDropdown();

  const handleBackButtonClick = () => {
    resetFilterDropdown();
    clearVectorSearchInput();
  };

  return (
    <DropdownMenuHeader
      StartComponent={
        <DropdownMenuHeaderLeftComponent
          onClick={handleBackButtonClick}
          Icon={IconChevronLeft}
        />
      }
    >
      {isVectorSearchFilter
        ? t`Search`
        : fieldMetadataItemUsedInDropdown?.label}
    </DropdownMenuHeader>
  );
};
