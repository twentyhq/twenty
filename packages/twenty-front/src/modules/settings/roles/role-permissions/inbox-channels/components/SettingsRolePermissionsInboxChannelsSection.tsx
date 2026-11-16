import { styled } from '@linaria/react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconHash } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { SettingsRolePermissionsInboxChannelTableRow } from '@/settings/roles/role-permissions/inbox-channels/components/SettingsRolePermissionsInboxChannelTableRow';
import { useRoleInboxChannelIds } from '@/settings/roles/role-permissions/inbox-channels/hooks/useRoleInboxChannelIds';
import { useSettingsInboxChannels } from '@/settings/roles/role-permissions/inbox-channels/hooks/useSettingsInboxChannels';
import { useToggleRoleInboxChannelAccess } from '@/settings/roles/role-permissions/inbox-channels/hooks/useToggleRoleInboxChannelAccess';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useLingui } from '@lingui/react/macro';

const StyledCardContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledTable = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

type SettingsRolePermissionsInboxChannelsSectionProps = {
  roleId: string;
  isEditable: boolean;
};

export const SettingsRolePermissionsInboxChannelsSection = ({
  roleId,
  isEditable,
}: SettingsRolePermissionsInboxChannelsSectionProps) => {
  const { t } = useLingui();
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );
  // Channels list the roles they open to, so a role picks them once it exists
  const isRoleSaved = isDefined(
    useAtomFamilyStateValue(settingsPersistedRoleFamilyState, roleId),
  );
  const settingsInboxChannels = useSettingsInboxChannels();
  const roleInboxChannelIds = useRoleInboxChannelIds(roleId);
  const { toggleRoleInboxChannelAccess } =
    useToggleRoleInboxChannelAccess(roleId);

  return (
    <Section.Root>
      <Section.Header
        title={t`Channels`}
        description={t`Chat channels this role reads and replies in`}
      />
      <StyledCardContainer>
        <Card.Root>
          <SettingsOptionCardContentSwitch
            Icon={IconHash}
            title={t`All channels`}
            description={t`Every channel, including the ones created later`}
            checked={settingsDraftRole.canAccessAllAgentChatChannels}
            disabled={!isEditable}
            onChange={() =>
              setSettingsDraftRole({
                ...settingsDraftRole,
                canAccessAllAgentChatChannels:
                  !settingsDraftRole.canAccessAllAgentChatChannels,
              })
            }
          />
        </Card.Root>
      </StyledCardContainer>
      {isRoleSaved && isNonEmptyArray(settingsInboxChannels) && (
        <Collapsible.Root
          open={!settingsDraftRole.canAccessAllAgentChatChannels}
        >
          <Collapsible.Panel
            dimension="height"
            style={{ transitionDuration: '0.4s, 0.2s' }}
            containAnimation={false}
          >
            <StyledTable>
              <TableRow gridAutoColumns="1fr 24px">
                <TableHeader>{t`Name`}</TableHeader>
                <TableHeader />
              </TableRow>
              <StyledTableRows>
                {settingsInboxChannels.map((channel) => (
                  <SettingsRolePermissionsInboxChannelTableRow
                    key={channel.id}
                    channel={channel}
                    isChecked={roleInboxChannelIds.includes(channel.id)}
                    isEditable={isEditable}
                    onToggle={() => toggleRoleInboxChannelAccess(channel.id)}
                  />
                ))}
              </StyledTableRows>
            </StyledTable>
          </Collapsible.Panel>
        </Collapsible.Root>
      )}
    </Section.Root>
  );
};
