import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';

import { IconAlertTriangle, IconMessage, IconSparkles } from 'twenty-ui/icon';
import { Switch } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';

import { type AdminChatsFilterState } from '@/settings/admin-panel/chats/types/AdminChatsFilterState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

type SettingsAdminChatsFilterDropdownProps = {
  filterButton: ReactNode;
  filters: AdminChatsFilterState;
  onFiltersChange: (filters: AdminChatsFilterState) => void;
};

export const SettingsAdminChatsFilterDropdown = ({
  filterButton,
  filters,
  onFiltersChange,
}: SettingsAdminChatsFilterDropdownProps) => {
  return (
    <Dropdown
      dropdownId="settings-admin-chats-filter-dropdown"
      dropdownPlacement="bottom-end"
      dropdownOffset={{ x: 0, y: 8 }}
      clickableComponent={filterButton}
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <ListItem
              startIcon={<IconSparkles />}
              render={<label />}
              endIcon={
                <Switch
                  onCheckedChange={() =>
                    onFiltersChange({
                      ...filters,
                      onboardingOnly: !filters.onboardingOnly,
                    })
                  }
                  checked={filters.onboardingOnly}
                  size="sm"
                />
              }
            >{t`Onboarding only`}</ListItem>
            <ListItem
              startIcon={<IconAlertTriangle />}
              render={<label />}
              endIcon={
                <Switch
                  onCheckedChange={() =>
                    onFiltersChange({
                      ...filters,
                      hasErrorOnly: !filters.hasErrorOnly,
                    })
                  }
                  checked={filters.hasErrorOnly}
                  size="sm"
                />
              }
            >{t`Has error`}</ListItem>
            <ListItem
              startIcon={<IconMessage />}
              render={<label />}
              endIcon={
                <Switch
                  onCheckedChange={() =>
                    onFiltersChange({
                      ...filters,
                      userNeverEngagedOnly: !filters.userNeverEngagedOnly,
                    })
                  }
                  checked={filters.userNeverEngagedOnly}
                  size="sm"
                />
              }
            >{t`No user reply`}</ListItem>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
