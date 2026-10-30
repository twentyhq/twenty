import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLock, useIcons } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { SidePanelCoreAgentRecordAccessGroup } from '@/object-core/agents/components/SidePanelCoreAgentRecordAccessGroup';
import { CORE_AGENT_RECORD_ACCESS_LEVELS } from '@/object-core/agents/constants/CoreAgentRecordAccessLevels';
import { useCoreAgentRole } from '@/object-core/agents/hooks/useCoreAgentRole';
import { useCoreAgentSidePanelAgent } from '@/object-core/agents/hooks/useCoreAgentSidePanelAgent';
import { useIsCoreAgentReadOnly } from '@/object-core/agents/hooks/useIsCoreAgentReadOnly';
import { type CoreAgentRecordAccessLevel } from '@/object-core/agents/types/CoreAgentRecordAccessLevel';
import { setCoreAgentRecordAccessLevel } from '@/object-core/agents/utils/setCoreAgentRecordAccessLevel';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { useObjectMetadataItemsThatCanHavePermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useObjectMetadataItemsThatCanHavePermission';
import { SidePanelInformationBanner } from '@/side-panel/components/SidePanelInformationBanner/SidePanelInformationBanner';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';

const StyledBannerContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

export const SidePanelCoreAgentDataAccessPage = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { agent } = useCoreAgentSidePanelAgent();

  const { role, updateRole, canEditRole } = useCoreAgentRole({
    id: agent?.id ?? '',
    roleId: agent?.roleId,
  });
  const isAgentReadOnly = useIsCoreAgentReadOnly({
    applicationId: agent?.applicationId,
  });
  const { objectMetadataItemsThatCanHavePermission } =
    useObjectMetadataItemsThatCanHavePermission();

  const isReadOnly =
    !isDefined(agent) || !isDefined(role) || isAgentReadOnly || !canEditRole;

  const handleLevelChange = (
    level: CoreAgentRecordAccessLevel,
    isEnabled: boolean,
    objectMetadataId?: string,
  ) =>
    updateRole((currentRole) =>
      setCoreAgentRecordAccessLevel({
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
    CORE_AGENT_RECORD_ACCESS_LEVELS.map(
      ({ level }) => `${objectMetadataId ?? 'all-records'}-${level}`,
    ),
  );

  const readOnlyMessage = isAgentReadOnly
    ? t`This agent comes from an app, so its access can't be changed here.`
    : t`This agent shares its role with other members or agents. Change its access in Settings > Roles.`;

  return (
    <SidePanelList selectableItemIds={selectableItemIds}>
      {isDefined(agent) && isReadOnly && (
        <StyledBannerContainer>
          <SidePanelInformationBanner message={readOnlyMessage} />
        </StyledBannerContainer>
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
          icon={
            <ColoredIcon
              Icon={getIcon(objectMetadataItem.icon)}
              color={getObjectColorWithFallback(objectMetadataItem)}
            />
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
