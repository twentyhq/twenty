import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  type Agent,
  type ApiKeyForRole,
  FindManyAgentsDocument,
  GetApiKeysDocument,
} from '~/generated-metadata/graphql';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

type EntityData = Agent | ApiKeyForRole;

type SettingsRoleAssignmentEntityPickerDropdownProps = {
  entityType: 'agent' | 'apiKey';
  excludedIds: string[];
  onSelect: (entity: EntityData) => void;
};

export const SettingsRoleAssignmentEntityPickerDropdown = ({
  entityType,
  excludedIds,
  onSelect,
}: SettingsRoleAssignmentEntityPickerDropdownProps) => {
  const [searchFilter, setSearchFilter] = useState('');
  const { t } = useLingui();

  const isAgent = entityType === 'agent';
  const isAdvancedModeEnabled = useAtomStateValue(isAdvancedModeEnabledState);

  const { data: agentsData, loading: agentsLoading } = useQuery(
    FindManyAgentsDocument,
    {
      skip: !isAgent,
    },
  );
  const { data: apiKeysData, loading: apiKeysLoading } = useQuery(
    GetApiKeysDocument,
    {
      skip: isAgent,
    },
  );

  const loading = isAgent ? agentsLoading : apiKeysLoading;

  const entities = useMemo(() => {
    return ((isAgent
      ? agentsData?.findManyAgents.filter(
          (agent) =>
            agent.isCustom && (!agent.isSystem || isAdvancedModeEnabled),
        )
      : apiKeysData?.apiKeys) || []) as EntityData[];
  }, [
    isAgent,
    agentsData?.findManyAgents,
    apiKeysData?.apiKeys,
    isAdvancedModeEnabled,
  ]);

  const placeholder = isAgent ? t`Search agents` : t`Search API keys`;

  const getEmptyStateMessage = () => {
    if (searchFilter !== '') {
      return isAgent
        ? t`No agents match your search`
        : t`No API keys match your search`;
    } else {
      return isAgent ? t`No agents available` : t`No API keys available`;
    }
  };

  const filteredEntities = useMemo(() => {
    const searchTerm = normalizeSearchText(searchFilter);
    return entities.filter((entity) => {
      const isExcluded = excludedIds.includes(entity.id);

      if (isExcluded) {
        return false;
      }

      if (isAgent) {
        const agent = entity as Agent;
        return (
          normalizeSearchText(agent.name).includes(searchTerm) ||
          normalizeSearchText(agent.label).includes(searchTerm)
        );
      } else {
        return normalizeSearchText((entity as ApiKeyForRole).name).includes(
          searchTerm,
        );
      }
    });
  }, [entities, searchFilter, excludedIds, isAgent]);

  return (
    <>
      <Dropdown.Search
        value={searchFilter}
        onValueChange={setSearchFilter}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        {loading && <Dropdown.Loading>{t`Loading...`}</Dropdown.Loading>}
        {!loading && filteredEntities.length === 0 && (
          <Dropdown.Empty>{getEmptyStateMessage()}</Dropdown.Empty>
        )}
        {!loading &&
          filteredEntities.map((entity) => (
            <Dropdown.ActionItem
              key={entity.id}
              onClick={() => onSelect(entity)}
            >
              {isAgent ? (entity as Agent).label : entity.name}
            </Dropdown.ActionItem>
          ))}
      </Dropdown.Section>
    </>
  );
};
