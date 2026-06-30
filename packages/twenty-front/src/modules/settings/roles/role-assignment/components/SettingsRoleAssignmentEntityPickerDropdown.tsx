import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  type Agent,
  type ApiKeyForRole,
  FindManyAgentsDocument,
  GetApiKeysDocument,
} from '~/generated-metadata/graphql';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledLoadingContainer = styled.div`
  padding: ${themeCssVariables.spacing[2]};
  text-align: center;
`;

const StyledDropdownItem = styled.div`
  cursor: pointer;
  padding: ${themeCssVariables.spacing[2]};

  &:hover {
    background-color: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledItemName = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

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
      ? agentsData?.findManyAgents.filter((agent) => agent.isCustom)
      : apiKeysData?.apiKeys) || []) as EntityData[];
  }, [isAgent, agentsData?.findManyAgents, apiKeysData?.apiKeys]);

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
    <DropdownContent widthInPixels={GenericDropdownContentWidth.Medium}>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={(event) => setSearchFilter(event.target.value)}
        placeholder={placeholder}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {loading ? (
          <StyledLoadingContainer>{t`Loading...`}</StyledLoadingContainer>
        ) : filteredEntities.length > 0 ? (
          filteredEntities.map((entity) => (
            <StyledDropdownItem
              key={entity.id}
              onClick={() => onSelect(entity as EntityData)}
            >
              <StyledItemName>
                {isAgent ? (entity as Agent).label : entity.name}
              </StyledItemName>
            </StyledDropdownItem>
          ))
        ) : (
          <SettingsEmptyPlaceholder padding="2">
            {getEmptyStateMessage()}
          </SettingsEmptyPlaceholder>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
