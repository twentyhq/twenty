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
} from '~/generated-metadata/graphql';

const StyledLoadingContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: center;
`;

const StyledDropdownItem = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledItemName = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledItemSubtext = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: center;
`;

type SettingsRoleAssignmentAgentPickerDropdownProps = {
  excludedAgentIds: string[];
  onSelect: (agent: Agent) => void;
};

export const SettingsRoleAssignmentAgentPickerDropdown = ({
  excludedAgentIds,
  onSelect,
}: SettingsRoleAssignmentAgentPickerDropdownProps) => {
  const [searchFilter, setSearchFilter] = useState('');
  const { t } = useLingui();

  const { data: agentsData, loading } = useFindManyAgentsQuery();
  const agents = agentsData?.findManyAgents || [];

  const filteredAgents = agents.filter(
    (agent) =>
      !excludedAgentIds.includes(agent.id) &&
      (agent.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        agent.label.toLowerCase().includes(searchFilter.toLowerCase())),
  );

  const handleSearchFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  };

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.Medium}>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleSearchFilterChange}
        placeholder={t`Search agents`}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {loading ? (
          <StyledLoadingContainer>{t`Loading...`}</StyledLoadingContainer>
        ) : filteredAgents.length > 0 ? (
          filteredAgents.map((agent) => (
            <StyledDropdownItem key={agent.id} onClick={() => onSelect(agent)}>
              <StyledItemName>{agent.name}</StyledItemName>
              <StyledItemSubtext>{agent.label}</StyledItemSubtext>
            </StyledDropdownItem>
          ))
        ) : (
          <StyledEmptyState>
            {searchFilter
              ? t`No agents match your search`
              : t`No agents available`}
          </StyledEmptyState>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
