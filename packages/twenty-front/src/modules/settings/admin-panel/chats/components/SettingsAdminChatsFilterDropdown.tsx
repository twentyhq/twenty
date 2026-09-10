import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';

import { IconAlertTriangle, IconMessage, IconSparkles } from 'twenty-ui/icon';
import { MenuItemToggle } from 'twenty-ui/navigation';

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
            <MenuItemToggle
              LeftIcon={IconSparkles}
              onToggleChange={() =>
                onFiltersChange({
                  ...filters,
                  onboardingOnly: !filters.onboardingOnly,
                })
              }
              toggled={filters.onboardingOnly}
              text={t`Onboarding only`}
              toggleSize="small"
            />
            <MenuItemToggle
              LeftIcon={IconAlertTriangle}
              onToggleChange={() =>
                onFiltersChange({
                  ...filters,
                  hasErrorOnly: !filters.hasErrorOnly,
                })
              }
              toggled={filters.hasErrorOnly}
              text={t`Has error`}
              toggleSize="small"
            />
            <MenuItemToggle
              LeftIcon={IconMessage}
              onToggleChange={() =>
                onFiltersChange({
                  ...filters,
                  userNeverEngagedOnly: !filters.userNeverEngagedOnly,
                })
              }
              toggled={filters.userNeverEngagedOnly}
              text={t`No user reply`}
              toggleSize="small"
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
