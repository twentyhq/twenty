import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ViewBarFilterDropdownFilterInputMenuHeader } from '@/views/components/ViewBarFilterDropdownFilterInputMenuHeader';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';
import { useContext } from 'react';
import { IconX } from 'twenty-ui/display';

// TODO: we shouldn't guess in which parent we are, this should be splitted in two components, one for each case
export const ObjectFilterDropdownFilterInputHeader = () => {
  const fieldMetadataItemUsedInDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const { closeDropdown } = useCloseDropdown();

  const dropdownInstanceId = useContext(
    DropdownComponentInstanceContext,
  )?.instanceId;

  const isInViewBarFilterDropdown =
    dropdownInstanceId === ViewBarFilterDropdownIds.MAIN;

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
        {fieldMetadataItemUsedInDropdown?.label}
      </DropdownMenuHeader>
    );
  }
};
