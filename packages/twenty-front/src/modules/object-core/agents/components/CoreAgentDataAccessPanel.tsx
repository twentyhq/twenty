import { CoreAgentDataAccessScope } from '@/object-core/agents/components/CoreAgentDataAccessScope';
import { CoreAgentPermissionsPanel } from '@/object-core/agents/components/CoreAgentPermissionsPanel';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { useObjectMetadataItemsThatCanHavePermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useObjectMetadataItemsThatCanHavePermission';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconSearch } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';

type CoreAgentDataAccessPanelProps = { agentId: string };

export const CoreAgentDataAccessPanel = ({
  agentId,
}: CoreAgentDataAccessPanelProps) => {
  const { t } = useLingui();
  const [search, setSearch] = useState('');
  const { session, draftRole, canReadRoles } = useCoreAgentEditStatus({
    agentId,
  });
  const { objectMetadataItemsThatCanHavePermission } =
    useObjectMetadataItemsThatCanHavePermission();
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const objects = objectMetadataItemsThatCanHavePermission.filter((object) =>
    `${object.labelPlural} ${object.nameSingular}`
      .toLocaleLowerCase()
      .includes(normalizedSearch),
  );
  const hasRole =
    canReadRoles &&
    isDefined(session?.roleId) &&
    draftRole.id === session.roleId;

  return (
    <CoreAgentPermissionsPanel agentId={agentId}>
      {hasRole && (
        <>
          <CoreAgentDataAccessScope
            agentId={agentId}
            title={t`All objects`}
            scope={{ type: 'global' }}
          />
          <SettingsTextInput
            instanceId={`agent-access-search-${agentId}`}
            label={t`Objects`}
            placeholder={t`Search objects`}
            LeftIcon={IconSearch}
            value={search}
            onChange={setSearch}
            fullWidth
          />
          {!isNonEmptyArray(objects) && (
            <Text color="secondary">{t`No matching objects`}</Text>
          )}
          {objects.map((object) => (
            <CoreAgentDataAccessScope
              key={object.id}
              agentId={agentId}
              title={object.labelPlural}
              scope={{ type: 'object', objectMetadataId: object.id }}
            />
          ))}
        </>
      )}
    </CoreAgentPermissionsPanel>
  );
};
