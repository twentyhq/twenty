import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ViewBarFilterDropdownFilterInputMenuHeader } from '@/views/components/ViewBarFilterDropdownFilterInputMenuHeader';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { ViewFilterOperand } from 'twenty-shared/types';
import { IconX } from 'twenty-ui/display';

export const ObjectFilterDropdownFilterInputHeader = () => {
  const { t } = useLingui();

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const selectedOperandInDropdown = useRecoilComponentValue(
    selectedOperandInDropdownComponentState,
  );

  const { closeDropdown } = useCloseDropdown();

  const dropdownInstanceId = useContext(
    DropdownComponentInstanceContext,
  )?.instanceId;

  const isInViewBarFilterDropdown =
    dropdownInstanceId === VIEW_BAR_FILTER_DROPDOWN_ID;

  const isVectorSearchFilter =
    selectedOperandInDropdown === ViewFilterOperand.VectorSearch;

  if (isInViewBarFilterDropdown) {
    return <ViewBarFilterDropdownFilterInputMenuHeader />;
  } else {
    return (
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => closeDropdown(dropdownInstanceId)}
            Icon={IconX}
          />
        }
      >
        {isVectorSearchFilter
          ? t`Search`
          : fieldMetadataItemUsedInDropdown?.label}
      </DropdownMenuHeader>
    );
  }
};
