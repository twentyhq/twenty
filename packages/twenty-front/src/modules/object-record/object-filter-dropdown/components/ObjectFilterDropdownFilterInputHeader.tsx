import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ViewBarFilterDropdownFilterInputMenuHeader } from '@/views/components/ViewBarFilterDropdownFilterInputMenuHeader';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';
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
    dropdownInstanceId === ViewBarFilterDropdownIds.MAIN;

  const isVectorSearchFilter =
    selectedOperandInDropdown === ViewFilterOperand.VECTOR_SEARCH;

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
