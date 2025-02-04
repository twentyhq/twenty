import { useTheme } from '@emotion/react';
import { IconChevronDown } from 'twenty-ui';

import { ObjectFilterDropdownRecordRemoveFilterMenuItem } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordRemoveFilterMenuItem';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { SingleEntityObjectFilterDropdownButtonEffect } from '@/object-record/object-filter-dropdown/components/SingleEntityObjectFilterDropdownButtonEffect';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useLingui } from '@lingui/react/macro';
import { GenericEntityFilterChip } from './GenericEntityFilterChip';
import { ObjectFilterDropdownRecordSelect } from './ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownSearchInput } from './ObjectFilterDropdownSearchInput';

const SINGLE_ENTITY_FILTER_DROPDOWN_ID = 'single-entity-filter-dropdown';

export const SingleEntityObjectFilterDropdownButton = ({
  hotkeyScope,
}: {
  hotkeyScope: HotkeyScope;
}) => {
  const selectedFilter = useRecoilComponentValueV2(
    selectedFilterComponentState,
  );

  const theme = useTheme();
  const { t } = useLingui();

  return (
    <>
      <SingleEntityObjectFilterDropdownButtonEffect />
      <Dropdown
        dropdownId={SINGLE_ENTITY_FILTER_DROPDOWN_ID}
        dropdownHotkeyScope={hotkeyScope}
        dropdownOffset={{ x: 0, y: -28 }}
        clickableComponent={
          <StyledHeaderDropdownButton>
            {selectedFilter ? (
              <GenericEntityFilterChip filter={selectedFilter} />
            ) : (
              t`Filter`
            )}
            <IconChevronDown size={theme.icon.size.md} />
          </StyledHeaderDropdownButton>
        }
        dropdownComponents={
          <>
            <ObjectFilterDropdownSearchInput />
            <DropdownMenuSeparator />
            <ObjectFilterDropdownRecordRemoveFilterMenuItem />
            <ObjectFilterDropdownRecordSelect
              viewComponentId={SINGLE_ENTITY_FILTER_DROPDOWN_ID}
            />
          </>
        }
      />
    </>
  );
};
