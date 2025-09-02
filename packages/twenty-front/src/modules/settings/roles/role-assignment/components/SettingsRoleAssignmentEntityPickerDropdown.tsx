import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { type ChangeEvent, useState } from 'react';
import {
  type Agent,
  useFindManyAgentsQuery,
  useGetApiKeysQuery,
} from '~/generated-metadata/graphql';
import { type ApiKeyForRole } from '~/generated/graphql';

const StyledLoadingContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: center;
`;

const StyledDropdownItem = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledItemName = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: center;
`;

type EntityType = 'agent' | 'apiKey';

type EntityData = Agent | ApiKeyForRole;

type SettingsRoleAssignmentEntityPickerDropdownProps = {
  entityType: EntityType;
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

  const { data: agentsData, loading: agentsLoading } = useFindManyAgentsQuery();
  const { data: apiKeysData, loading: apiKeysLoading } = useGetApiKeysQuery();

  const isAgent = entityType === 'agent';

  const loading = isAgent ? agentsLoading : apiKeysLoading;

  const entities = ((isAgent
    ? agentsData?.findManyAgents.filter((agent) => agent.isCustom)
    : apiKeysData?.apiKeys) || []) as EntityData[];

  const getFilteredEntities = () => {
    return entities.filter((entity) => {
      const isExcluded = excludedIds.includes(entity.id);

      if (isExcluded) {
        return false;
      }

      if (isAgent) {
        const agent = entity as Agent;
        return (
          agent.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          agent.label.toLowerCase().includes(searchFilter.toLowerCase())
        );
      } else {
        const apiKey = entity as ApiKeyForRole;
        return apiKey.name.toLowerCase().includes(searchFilter.toLowerCase());
      }
    });
  };

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

  const handleSearchFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  };

  const filteredEntities = getFilteredEntities();

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.Medium}>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleSearchFilterChange}
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
          <StyledEmptyState>{getEmptyStateMessage()}</StyledEmptyState>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
