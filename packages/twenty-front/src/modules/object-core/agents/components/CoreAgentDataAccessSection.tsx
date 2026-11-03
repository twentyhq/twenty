import { CoreAgentDataRestrictions } from '@/object-core/agents/components/CoreAgentDataRestrictions';
import { CORE_AGENT_DATA_ACCESS_PERMISSIONS } from '@/object-core/agents/constants/CoreAgentDataAccessPermissions';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { useOpenCoreAgentDataAccess } from '@/object-core/agents/hooks/useOpenCoreAgentDataAccess';
import { useUpdateCoreAgentRole } from '@/object-core/agents/hooks/useUpdateCoreAgentRole';
import { updateCoreAgentDataAccess } from '@/object-core/agents/utils/updateCoreAgentDataAccess';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { IconDatabase, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';

type CoreAgentDataAccessSectionProps = { agentId?: string };

export const CoreAgentDataAccessSection = ({
  agentId,
}: CoreAgentDataAccessSectionProps) => {
  const { t } = useLingui();
  const { session, draftRole, isRoleEditable, canReadRoles } =
    useCoreAgentEditStatus({
      agentId,
    });
  const { openCoreAgentDataAccess } = useOpenCoreAgentDataAccess({ agentId });
  const { updateCoreAgentRole } = useUpdateCoreAgentRole({ agentId });
  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const globalGrants = CORE_AGENT_DATA_ACCESS_PERMISSIONS.filter(
    ({ key }) =>
      draftRole[
        SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING[
          key
        ]
      ],
  );
  const objectIds = new Set([
    ...(draftRole.objectPermissions ?? []).map(
      (permission) => permission.objectMetadataId,
    ),
    ...(draftRole.fieldPermissions ?? []).map(
      (permission) => permission.objectMetadataId,
    ),
    ...(draftRole.rowLevelPermissionPredicates ?? []).map(
      (predicate) => predicate.objectMetadataId,
    ),
  ]);

  if (
    !canReadRoles ||
    (isDefined(session?.roleId) && draftRole.id !== session.roleId)
  ) {
    return (
      <Section.Root>
        <Section.Header title={t`Data access`} />
        <Text color="secondary">{t`Permission details are unavailable until the assigned role can be loaded.`}</Text>
      </Section.Root>
    );
  }

  return (
    <Section.Root>
      <Section.Header
        title={t`Data access`}
        actions={
          <Button
            size="sm"
            variant="outline"
            disabled={!isDefined(session)}
            onClick={openCoreAgentDataAccess}
          >{t`Configure access`}</Button>
        }
      />
      {!isNonEmptyArray(globalGrants) ? (
        <Text color="secondary">{t`No data access by default`}</Text>
      ) : (
        <ListItem
          startIcon={<IconDatabase />}
          description={globalGrants.map(({ label }) => t(label)).join(', ')}
          actionsVisibility="always"
          actions={
            <LightIconButton
              aria-label={t`Revoke global grants`}
              disabled={!isRoleEditable}
              onClick={() => {
                for (const { key } of globalGrants) {
                  updateCoreAgentRole((role) =>
                    updateCoreAgentDataAccess({
                      role,
                      scope: { type: 'global' },
                      permissionKey: key,
                      value: false,
                    }),
                  );
                }
              }}
            >
              <IconTrash />
            </LightIconButton>
          }
        >{t`All objects`}</ListItem>
      )}
      {[...objectIds].map((objectMetadataId) => {
        const object = objectMetadataItems.find(
          (item) => item.id === objectMetadataId,
        );
        const permission = draftRole.objectPermissions?.find(
          (item) => item.objectMetadataId === objectMetadataId,
        );
        const grants = CORE_AGENT_DATA_ACCESS_PERMISSIONS.filter(
          ({ key }) => permission?.[key] === true,
        );
        const denials = CORE_AGENT_DATA_ACCESS_PERMISSIONS.filter(
          ({ key }) => permission?.[key] === false,
        );
        const objectLabel = object?.labelPlural ?? t`Unavailable object`;
        const grantLabel =
          grants.map(({ label }) => t(label)).join(', ') || t`None`;
        const denialLabel =
          denials.map(({ label }) => t(label)).join(', ') || t`None`;

        return (
          <Section.Root key={objectMetadataId}>
            <ListItem
              startIcon={<IconDatabase />}
              description={t`Granted: ${grantLabel}. Denied: ${denialLabel}. Other actions use global defaults.`}
              descriptionPlacement="below"
              actionsVisibility="always"
              actions={
                isNonEmptyArray(grants) && (
                  <LightIconButton
                    aria-label={t`Revoke grants for ${objectLabel}`}
                    disabled={!isRoleEditable}
                    onClick={() => {
                      for (const { key } of grants) {
                        updateCoreAgentRole((role) =>
                          updateCoreAgentDataAccess({
                            role,
                            scope: { type: 'object', objectMetadataId },
                            permissionKey: key,
                            value: false,
                          }),
                        );
                      }
                    }}
                  >
                    <IconTrash />
                  </LightIconButton>
                )
              }
            >
              {objectLabel}
            </ListItem>
            <CoreAgentDataRestrictions
              agentId={agentId}
              objectMetadataId={objectMetadataId}
            />
          </Section.Root>
        );
      })}
    </Section.Root>
  );
};
