import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { usePrepareCoreAgentRole } from '@/object-core/agents/hooks/usePrepareCoreAgentRole';
import { SettingsRolePermissions } from '@/settings/roles/role-permissions/components/SettingsRolePermissions';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledWarningText = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

export const CoreAgentRoleTab = ({ disabled }: { disabled: boolean }) => {
  const {
    session,
    roleId,
    isRoleEditable,
    isSaving,
    canPrepareRole,
    canReadRoles,
  } = useCoreAgentEditStatus();
  const { prepareCoreAgentRole } = usePrepareCoreAgentRole();

  if (!canReadRoles) {
    return (
      <Section.Root>
        <Section.Header
          title={t`Role`}
          description={t`You need role access to view these permissions.`}
        />
      </Section.Root>
    );
  }

  return (
    <Section.Root>
      {!isDefined(session?.roleId) ? (
        <>
          <Section.Header
            title={t`Role`}
            description={t`Prepare permissions for this agent. The role is created when you save settings.`}
          />
          <Button
            startIcon={<IconPlus />}
            onClick={prepareCoreAgentRole}
            disabled={disabled || isSaving || !canPrepareRole}
            variant="outline"
          >{t`Create Role`}</Button>
        </>
      ) : (
        <>
          {!isRoleEditable && (
            <StyledWarningText>{t`This role cannot be edited here. It must be editable and assigned only to this agent.`}</StyledWarningText>
          )}
          <SettingsRolePermissions
            roleId={roleId}
            isEditable={!disabled && isRoleEditable}
            fromAgentId={session.agent.id}
          />
        </>
      )}
    </Section.Root>
  );
};
