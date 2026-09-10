import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';

import { IconAlertTriangle, IconMessage, IconSparkles } from 'twenty-ui/icon';
import { MenuItemSwitch } from 'twenty-ui/navigation';

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
            <MenuItemSwitch
              LeftIcon={IconSparkles}
              onCheckedChange={() =>
                onFiltersChange({
                  ...filters,
                  onboardingOnly: !filters.onboardingOnly,
                })
              }
              checked={filters.onboardingOnly}
              text={t`Onboarding only`}
              size="sm"
            />
            <MenuItemSwitch
              LeftIcon={IconAlertTriangle}
              onCheckedChange={() =>
                onFiltersChange({
                  ...filters,
                  hasErrorOnly: !filters.hasErrorOnly,
                })
              }
              checked={filters.hasErrorOnly}
              text={t`Has error`}
              size="sm"
            />
            <MenuItemSwitch
              LeftIcon={IconMessage}
              onCheckedChange={() =>
                onFiltersChange({
                  ...filters,
                  userNeverEngagedOnly: !filters.userNeverEngagedOnly,
                })
              }
              checked={filters.userNeverEngagedOnly}
              text={t`No user reply`}
              size="sm"
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
