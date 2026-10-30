import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLock } from 'twenty-ui/icon';

import { SidePanelCoreAgentReadOnlyBanner } from '@/object-core/agents/components/SidePanelCoreAgentReadOnlyBanner';
import { SidePanelCoreAgentRecordAccessGroup } from '@/object-core/agents/components/SidePanelCoreAgentRecordAccessGroup';
import { CORE_AGENT_RECORD_ACCESS_LEVELS } from '@/object-core/agents/constants/CoreAgentRecordAccessLevels';
import { useCoreAgentSidePanelRole } from '@/object-core/agents/hooks/useCoreAgentSidePanelRole';
import { type CoreAgentRecordAccessLevel } from '@/object-core/agents/types/CoreAgentRecordAccessLevel';
import { getCoreAgentRecordAccessItemId } from '@/object-core/agents/utils/getCoreAgentRecordAccessItemId';
import { getRoleWithCoreAgentRecordAccessLevel } from '@/object-core/agents/utils/getRoleWithCoreAgentRecordAccessLevel';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectMetadataItemsThatCanHavePermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useObjectMetadataItemsThatCanHavePermission';
import { SidePanelList } from '@/side-panel/components/SidePanelList';

export const SidePanelCoreAgentDataAccessPage = () => {
  const { t } = useLingui();
  const { agent, role, updateRole, isAgentReadOnly, isReadOnly } =
    useCoreAgentSidePanelRole();
  const { objectMetadataItemsThatCanHavePermission } =
    useObjectMetadataItemsThatCanHavePermission();

  const handleLevelChange = (
    level: CoreAgentRecordAccessLevel,
    isEnabled: boolean,
    objectMetadataId?: string,
  ) =>
    updateRole((currentRole) =>
      getRoleWithCoreAgentRecordAccessLevel({
        role: currentRole,
        level,
        isEnabled,
        objectMetadataId,
      }),
    );

  const selectableItemIds = [
    undefined,
    ...objectMetadataItemsThatCanHavePermission.map(({ id }) => id),
  ].flatMap((objectMetadataId) =>
    CORE_AGENT_RECORD_ACCESS_LEVELS.map(({ level }) =>
      getCoreAgentRecordAccessItemId({ objectMetadataId, level }),
    ),
  );

  const readOnlyMessage = isAgentReadOnly
    ? t`This agent comes from an app, so its access can't be changed here.`
    : t`This agent shares its role with other members or agents. Change its access in Settings > Roles.`;

  return (
    <SidePanelList selectableItemIds={selectableItemIds}>
      {isDefined(agent) && isReadOnly && (
        <SidePanelCoreAgentReadOnlyBanner message={readOnlyMessage} />
      )}
      <SidePanelCoreAgentRecordAccessGroup
        heading={t`General`}
        Icon={IconLock}
        role={role}
        isReadOnly={isReadOnly}
        onLevelChange={(level, isEnabled) =>
          handleLevelChange(level, isEnabled)
        }
      />
      {objectMetadataItemsThatCanHavePermission.map((objectMetadataItem) => (
        <SidePanelCoreAgentRecordAccessGroup
          key={objectMetadataItem.id}
          heading={objectMetadataItem.labelPlural}
          objectIcon={
            <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
          }
          role={role}
          objectMetadataId={objectMetadataItem.id}
          isReadOnly={isReadOnly}
          onLevelChange={(level, isEnabled) =>
            handleLevelChange(level, isEnabled, objectMetadataItem.id)
          }
        />
      ))}
    </SidePanelList>
  );
};
