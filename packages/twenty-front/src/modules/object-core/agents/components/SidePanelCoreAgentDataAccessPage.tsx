import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconLock } from 'twenty-ui/icon';

import { SidePanelCoreAgentReadOnlyBanner } from '@/object-core/agents/components/SidePanelCoreAgentReadOnlyBanner';
import { SidePanelCoreAgentSearchInput } from '@/object-core/agents/components/SidePanelCoreAgentSearchInput';
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
  const [search, setSearch] = useState('');
  const { objectMetadataItemsThatCanHavePermission } =
    useObjectMetadataItemsThatCanHavePermission();

  const handleLevelChange = ({
    level,
    isEnabled,
    objectMetadataId,
  }: {
    level: CoreAgentRecordAccessLevel;
    isEnabled: boolean;
    objectMetadataId?: string;
  }) =>
    updateRole((currentRole) =>
      getRoleWithCoreAgentRecordAccessLevel({
        role: currentRole,
        level,
        isEnabled,
        objectMetadataId,
      }),
    );

  const searchTerm = search.trim().toLowerCase();
  const isGeneralShown = !isNonEmptyString(searchTerm);
  const matchingObjectMetadataItems =
    objectMetadataItemsThatCanHavePermission.filter(({ labelPlural }) =>
      labelPlural.toLowerCase().includes(searchTerm),
    );

  const selectableItemIds = [
    ...(isGeneralShown ? [undefined] : []),
    ...matchingObjectMetadataItems.map(({ id }) => id),
  ].flatMap((objectMetadataId) =>
    CORE_AGENT_RECORD_ACCESS_LEVELS.map(({ level }) =>
      getCoreAgentRecordAccessItemId({ objectMetadataId, level }),
    ),
  );

  const readOnlyMessage = isAgentReadOnly
    ? t`This agent comes from an app, so its access can't be changed here.`
    : t`This agent shares its role with other members or agents. Change its access in Settings > Roles.`;

  return (
    <>
      <SidePanelCoreAgentSearchInput
        value={search}
        placeholder={t`Search objects`}
        onChange={setSearch}
      />
      <SidePanelList
        selectableItemIds={selectableItemIds}
        noResults={selectableItemIds.length === 0}
        noResultsText={t`No objects match your search`}
      >
        {isDefined(agent) && isReadOnly && (
          <SidePanelCoreAgentReadOnlyBanner message={readOnlyMessage} />
        )}
        {isGeneralShown && (
          <SidePanelCoreAgentRecordAccessGroup
            heading={t`General`}
            Icon={IconLock}
            role={role}
            isReadOnly={isReadOnly}
            onLevelChange={({ level, isEnabled }) =>
              handleLevelChange({ level, isEnabled })
            }
          />
        )}
        {matchingObjectMetadataItems.map((objectMetadataItem) => (
          <SidePanelCoreAgentRecordAccessGroup
            key={objectMetadataItem.id}
            heading={objectMetadataItem.labelPlural}
            objectIcon={
              <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
            }
            role={role}
            objectMetadataId={objectMetadataItem.id}
            isReadOnly={isReadOnly}
            onLevelChange={({ level, isEnabled }) =>
              handleLevelChange({
                level,
                isEnabled,
                objectMetadataId: objectMetadataItem.id,
              })
            }
          />
        ))}
      </SidePanelList>
    </>
  );
};
