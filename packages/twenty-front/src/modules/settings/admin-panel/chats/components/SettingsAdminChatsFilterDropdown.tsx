import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { t } from '@lingui/core/macro';
import { useContext, type ReactElement } from 'react';
import { Dropdown, SettingsRow } from 'twenty-ui/components';

import { IconAlertTriangle, IconMessage, IconSparkles } from 'twenty-ui/icon';

import { type AdminChatsFilterState } from '@/settings/admin-panel/chats/types/AdminChatsFilterState';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

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
  const { excludedClickOutsideId } = useContext(ClickOutsideListenerContext);
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);

  return (
    <DropdownRoot
      dropdownId="settings-admin-chats-filter-dropdown"
      type="panel"
    >
      <Dropdown.Trigger render={filterButton} />
      <Dropdown.Content
        side="bottom"
        align="end"
        sideOffset={8}
        alignOffset={0}
        data-click-outside-id={excludedClickOutsideId}
      >
        <div data-click-outside-id={parentClickOutsideId}>
          <Dropdown.Section>
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
          </Dropdown.Section>
        </div>
      </Dropdown.Content>
    </DropdownRoot>
  );
};
