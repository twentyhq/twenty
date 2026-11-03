import { CoreAgentRolePolicy } from '@/object-core/agents/components/CoreAgentRolePolicy';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

type CoreAgentPermissionsPanelProps = { agentId: string; children: ReactNode };
const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

export const CoreAgentPermissionsPanel = ({
  agentId,
  children,
}: CoreAgentPermissionsPanelProps) => {
  const { t } = useLingui();
  const { session, canReadRoles } = useCoreAgentEditStatus({ agentId });
  const { goBackFromSidePanel } = useSidePanelHistory();

  return (
    <StyledPage>
      {canReadRoles && <SettingsRolesQueryEffect />}
      {canReadRoles && isDefined(session?.roleId) && (
        <SettingsRoleDraftSyncEffect roleId={session.roleId} />
      )}
      <CoreAgentRolePolicy agentId={agentId} />
      {children}
      <Button variant="outline" onClick={goBackFromSidePanel}>{t`Done`}</Button>
    </StyledPage>
  );
};
