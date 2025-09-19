import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  type Agent,
  useFindManyAgentsQuery,
  useGetApiKeysQuery,
} from '~/generated-metadata/graphql';
import { type ApiKeyForRole } from '~/generated/graphql';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

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

  const { data: agentsData, loading: agentsLoading } = useFindManyAgentsQuery({
    skip: !isAgent,
  });
  const { data: apiKeysData, loading: apiKeysLoading } = useGetApiKeysQuery({
    skip: isAgent,
  });

  const loading = isAgent ? agentsLoading : apiKeysLoading;

  const entities = ((isAgent
    ? agentsData?.findManyAgents.filter((agent) => agent.isCustom)
    : apiKeysData?.apiKeys) || []) as EntityData[];

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

  const filteredEntities = entities.filter((entity) => {
    const isExcluded = excludedIds.includes(entity.id);

    if (isExcluded) {
      return false;
    }

    if (isAgent) {
      const agent = entity as Agent;
      const searchTerm = normalizeSearchText(searchFilter);
      return (
        normalizeSearchText(agent.name).includes(searchTerm) ||
        normalizeSearchText(agent.label).includes(searchTerm)
      );
    } else {
      const searchTerm = normalizeSearchText(searchFilter);
      return normalizeSearchText((entity as ApiKeyForRole).name).includes(
        searchTerm,
      );
    }
  });

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
          <StyledEmptyState>{getEmptyStateMessage()}</StyledEmptyState>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
