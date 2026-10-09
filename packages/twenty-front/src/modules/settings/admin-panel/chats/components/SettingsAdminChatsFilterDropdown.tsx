import { t } from '@lingui/core/macro';
import { type ReactElement } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';
import { SettingsRow } from 'twenty-ui/components/settings';

import { IconAlertTriangle, IconMessage, IconSparkles } from 'twenty-ui/icon';

import { type AdminChatsFilterState } from '@/settings/admin-panel/chats/types/AdminChatsFilterState';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';

type SettingsAdminChatsFilterDropdownProps = {
  filterButton: ReactElement;
  filters: AdminChatsFilterState;
  onFiltersChange: (filters: AdminChatsFilterState) => void;
};

export const SettingsAdminChatsFilterDropdown = ({
  filterButton,
  filters,
  onFiltersChange,
}: SettingsAdminChatsFilterDropdownProps) => {
  return (
    <DropdownRoot
      dropdownId="settings-admin-chats-filter-dropdown"
      type="panel"
    >
      <Dropdown.Trigger render={filterButton} />
      <DropdownContent side="bottom" align="end" sideOffset={8} alignOffset={0}>
        <Dropdown.Section>
          <SettingsRow
            startElement={<IconSparkles />}
            switchProps={{
              onCheckedChange: () =>
                onFiltersChange({
                  ...filters,
                  onboardingOnly: !filters.onboardingOnly,
                }),
              checked: filters.onboardingOnly,
            }}
          >{t`Onboarding only`}</SettingsRow>
          <SettingsRow
            startElement={<IconAlertTriangle />}
            switchProps={{
              onCheckedChange: () =>
                onFiltersChange({
                  ...filters,
                  hasErrorOnly: !filters.hasErrorOnly,
                }),
              checked: filters.hasErrorOnly,
            }}
          >{t`Has error`}</SettingsRow>
          <SettingsRow
            startElement={<IconMessage />}
            switchProps={{
              onCheckedChange: () =>
                onFiltersChange({
                  ...filters,
                  userNeverEngagedOnly: !filters.userNeverEngagedOnly,
                }),
              checked: filters.userNeverEngagedOnly,
            }}
          >{t`No user reply`}</SettingsRow>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
