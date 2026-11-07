import { SettingsRolePermissionsObjectLevelSection } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelSection';
import { SettingsRolePermissionsObjectsSection } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsSection';
import { SettingsRolePermissionsSettingsSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsSection';
import { SettingsRolePermissionsToolSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsToolSection';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { SettingsRolePermissionsAgentChatChannelsSection } from '@/settings/roles/role-permissions/agent-chat-channels/components/SettingsRolePermissionsAgentChatChannelsSection';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledRolePermissionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
`;

type SettingsRolePermissionsProps = {
  roleId: string;
  isEditable: boolean;
  fromAgentId?: string;
};

export const SettingsRolePermissions = ({
  roleId,
  isEditable,
  fromAgentId,
}: SettingsRolePermissionsProps) => {
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const shouldShowAgentChatChannelsSection =
    isAiChatInboxEnabled &&
    settingsDraftRole.canBeAssignedToUsers &&
    !isDefined(fromAgentId);

  return (
    <StyledRolePermissionsContainer>
      <SettingsRoleDraftSyncEffect roleId={roleId} />
      <SettingsRolePermissionsObjectsSection
        roleId={roleId}
        isEditable={isEditable}
      />
      <SettingsRolePermissionsObjectLevelSection
        roleId={roleId}
        fromAgentId={fromAgentId}
        isEditable={isEditable}
      />
      <SettingsRolePermissionsSettingsSection
        roleId={roleId}
        isEditable={isEditable}
      />
      <SettingsRolePermissionsToolSection
        roleId={roleId}
        isEditable={isEditable}
      />
      {shouldShowAgentChatChannelsSection && (
        <SettingsRolePermissionsAgentChatChannelsSection
          roleId={roleId}
          isEditable={isEditable}
        />
      )}
    </StyledRolePermissionsContainer>
  );
};
