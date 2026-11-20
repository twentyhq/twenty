import { SettingsRolePermissionsObjectsSection } from '@/settings/roles/role-permissions/object-overrides/components/SettingsRolePermissionsObjectsSection';
import { SettingsRolePermissionsSettingsSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsSection';
import { SettingsRolePermissionsToolSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsToolSection';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { SettingsRolePermissionsInboxChannelsSection } from '@/settings/roles/role-permissions/inbox-channels/components/SettingsRolePermissionsInboxChannelsSection';
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

  const shouldShowInboxChannelsSection =
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
      <SettingsRolePermissionsSettingsSection
        roleId={roleId}
        isEditable={isEditable}
      />
      <SettingsRolePermissionsToolSection
        roleId={roleId}
        isEditable={isEditable}
      />
      {shouldShowInboxChannelsSection && (
        <SettingsRolePermissionsInboxChannelsSection
          roleId={roleId}
          isEditable={isEditable}
        />
      )}
    </StyledRolePermissionsContainer>
  );
};
