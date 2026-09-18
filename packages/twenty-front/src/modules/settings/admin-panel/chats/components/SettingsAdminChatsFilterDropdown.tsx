import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { SettingsRow } from 'twenty-ui/components';
import { IconAlertTriangle, IconMessage, IconSparkles } from 'twenty-ui/icon';
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
            <SettingsRow
              startIcon={<IconSparkles />}
              onCheckedChange={() =>
                onFiltersChange({
                  ...filters,
                  onboardingOnly: !filters.onboardingOnly,
                })
              }
              checked={filters.onboardingOnly}
            >{t`Onboarding only`}</SettingsRow>
            <SettingsRow
              startIcon={<IconAlertTriangle />}
              onCheckedChange={() =>
                onFiltersChange({
                  ...filters,
                  hasErrorOnly: !filters.hasErrorOnly,
                })
              }
              checked={filters.hasErrorOnly}
            >{t`Has error`}</SettingsRow>
            <SettingsRow
              startIcon={<IconMessage />}
              onCheckedChange={() =>
                onFiltersChange({
                  ...filters,
                  userNeverEngagedOnly: !filters.userNeverEngagedOnly,
                })
              }
              checked={filters.userNeverEngagedOnly}
            >{t`No user reply`}</SettingsRow>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
