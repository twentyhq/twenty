import { CoreAgentDataRestrictions } from '@/object-core/agents/components/CoreAgentDataRestrictions';
import { CORE_AGENT_DATA_ACCESS_PERMISSIONS } from '@/object-core/agents/constants/CoreAgentDataAccessPermissions';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { useUpdateCoreAgentRole } from '@/object-core/agents/hooks/useUpdateCoreAgentRole';
import { type CoreAgentDataAccessScope as CoreAgentDataAccessTarget } from '@/object-core/agents/types/CoreAgentDataAccessScope';
import { updateCoreAgentDataAccess } from '@/object-core/agents/utils/updateCoreAgentDataAccess';
import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { SettingsRow } from 'twenty-ui/components/settings';
import { Button } from 'twenty-ui/primitives/input';

type CoreAgentDataAccessScopeProps = {
  agentId: string;
  scope: CoreAgentDataAccessTarget;
  title: string;
};

export const CoreAgentDataAccessScope = ({
  agentId,
  scope,
  title,
}: CoreAgentDataAccessScopeProps) => {
  const { t } = useLingui();
  const { draftRole, isRoleEditable } = useCoreAgentEditStatus({ agentId });
  const { updateCoreAgentRole } = useUpdateCoreAgentRole({ agentId });
  const objectPermission =
    scope.type === 'object'
      ? draftRole.objectPermissions?.find(
          (permission) =>
            permission.objectMetadataId === scope.objectMetadataId,
        )
      : undefined;
  const resetObjectAccess = () => {
    for (const { key } of CORE_AGENT_DATA_ACCESS_PERMISSIONS) {
      updateCoreAgentRole((role) =>
        updateCoreAgentDataAccess({
          role,
          scope,
          permissionKey: key,
          value: null,
        }),
      );
    }
  };

  return (
    <Section.Root role="group" aria-label={title}>
      <Section.Header
        title={title}
        actions={
          scope.type === 'object' && (
            <Button
              size="sm"
              variant="ghost"
              disabled={!isRoleEditable}
              onClick={resetObjectAccess}
            >{t`Use global defaults`}</Button>
          )
        }
      />
      {CORE_AGENT_DATA_ACCESS_PERMISSIONS.map(({ key, label }) => {
        const globalValue =
          draftRole[
            SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING[
              key
            ]
          ];
        const override = objectPermission?.[key];
        const checked =
          scope.type === 'global' ? globalValue : (override ?? globalValue);
        const description =
          scope.type === 'global'
            ? t`Default for every object`
            : isDefined(override)
              ? t`Overridden for this object`
              : t`Uses the global default`;

        return (
          <SettingsRow
            key={key}
            checked={checked}
            disabled={!isRoleEditable}
            description={description}
            onCheckedChange={(value) =>
              updateCoreAgentRole((role) =>
                updateCoreAgentDataAccess({
                  role,
                  scope,
                  permissionKey: key,
                  value,
                }),
              )
            }
          >
            {t(label)}
          </SettingsRow>
        );
      })}
      {scope.type === 'object' && (
        <CoreAgentDataRestrictions
          agentId={agentId}
          objectMetadataId={scope.objectMetadataId}
        />
      )}
    </Section.Root>
  );
};
