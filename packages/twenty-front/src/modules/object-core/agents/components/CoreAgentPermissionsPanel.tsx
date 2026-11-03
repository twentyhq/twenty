import { CoreAgentRolePolicy } from '@/object-core/agents/components/CoreAgentRolePolicy';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconExternalLink } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

type CoreAgentPermissionsPanelProps = { agentId: string; children: ReactNode };

const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;
const StyledScrollArea = styled.div`
  flex: 1;
  min-height: 0;
`;
const StyledContent = styled.div`
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
  const scrollId = useWorkspaceSurfaceScopedComponentInstanceId(
    `core-agent-permissions-${agentId}`,
  );
  const persistedRoleId = session?.agent.roleId;
  return (
    <StyledPage>
      {canReadRoles && <SettingsRolesQueryEffect />}
      {canReadRoles && isDefined(session?.roleId) && (
        <SettingsRoleDraftSyncEffect roleId={session.roleId} />
      )}
      <StyledScrollArea>
        <ScrollWrapper
          componentInstanceId={scrollId}
          defaultEnableXScroll={false}
        >
          <StyledContent>
            <CoreAgentRolePolicy agentId={agentId} />
            {children}
          </StyledContent>
        </ScrollWrapper>
      </StyledScrollArea>
      <SidePanelFooter
        actions={[
          canReadRoles && isDefined(persistedRoleId) ? (
            <Button
              key="open-in-roles"
              nativeButton={false}
              variant="outline"
              size="sm"
              startIcon={<IconExternalLink />}
              render={
                <Link
                  to={getSettingsPath(SettingsPath.RoleDetail, {
                    roleId: persistedRoleId,
                  })}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >{t`Open in Roles`}</Button>
          ) : null,
          <Button
            key="done"
            variant="outline"
            size="sm"
            onClick={goBackFromSidePanel}
          >{t`Done`}</Button>,
        ]}
      />
    </StyledPage>
  );
};
