import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useState } from 'react';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconChevronRight,
  IconFilter,
  IconSearch,
  IconSettingsAutomation,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { MenuItemToggle } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { SETTINGS_AI_AGENT_TABLE_METADATA } from '~/pages/settings/ai/constants/SettingsAiAgentTableMetadata';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

import Skeleton from 'react-loading-skeleton';
import { useQuery } from '@apollo/client/react';
import { FindManyAgentsDocument } from '~/generated-metadata/graphql';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import {
  AI_AGENT_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
  SettingsAIAgentTableRow,
} from './SettingsAIAgentTableRow';

const StyledSearchAndFilterContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledSearchInputContainer = styled.div`
  flex: 1;
`;

const StyledTableContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledTableHeaderRowContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsAIAgentsTable = () => {
  const { theme } = useContext(ThemeContext);
  const { data, loading } = useQuery(FindManyAgentsDocument);

  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');
  const [showWorkflowAgents, setShowWorkflowAgents] = useState(false);

  const sortedAgents = useSortedArray(
    data?.findManyAgents || [],
    SETTINGS_AI_AGENT_TABLE_METADATA,
  );

  const filteredAgents = sortedAgents.filter((agent) => {
    const isWorkflowAgent = agent.name.includes('workflow-service-agent');
    const matchesType = !isWorkflowAgent || showWorkflowAgents;

    const searchNormalized = normalizeSearchText(searchTerm);
    const matchesSearch =
      normalizeSearchText(agent.name).includes(searchNormalized) ||
      normalizeSearchText(agent.label).includes(searchNormalized);

    return matchesType && matchesSearch;
  });

  return (
    <>
      <StyledSearchAndFilterContainer>
        <StyledSearchInputContainer>
          <SettingsTextInput
            instanceId="settings-ai-agents-search"
            LeftIcon={IconSearch}
            placeholder={t`Search an agent...`}
            value={searchTerm}
            onChange={setSearchTerm}
            fullWidth
          />
        </StyledSearchInputContainer>
        <Dropdown
          dropdownId="settings-ai-agents-filter-dropdown"
          dropdownPlacement="bottom-end"
          dropdownOffset={{ x: 0, y: 8 }}
          clickableComponent={
            <Button
              Icon={IconFilter}
              size="medium"
              variant="secondary"
              accent="default"
              ariaLabel={t`Filter`}
            />
          }
          dropdownComponents={
            <DropdownContent>
              <DropdownMenuItemsContainer>
                <MenuItemToggle
                  LeftIcon={IconSettingsAutomation}
                  onToggleChange={() =>
                    setShowWorkflowAgents(!showWorkflowAgents)
                  }
                  toggled={showWorkflowAgents}
                  text={t`Workflow agents`}
                  toggleSize="small"
                />
              </DropdownMenuItemsContainer>
            </DropdownContent>
          }
        />
      </StyledSearchAndFilterContainer>

      <StyledTableContainer>
        <Table>
          <StyledTableHeaderRowContainer>
            <TableRow
              gridTemplateColumns={AI_AGENT_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
            >
              {SETTINGS_AI_AGENT_TABLE_METADATA.fields.map(
                (settingsAIAgentTableMetadataField) => (
                  <SortableTableHeader
                    key={settingsAIAgentTableMetadataField.fieldName}
                    fieldName={settingsAIAgentTableMetadataField.fieldName}
                    label={t(settingsAIAgentTableMetadataField.fieldLabel)}
                    tableId={SETTINGS_AI_AGENT_TABLE_METADATA.tableId}
                    align={settingsAIAgentTableMetadataField.align}
                    initialSort={SETTINGS_AI_AGENT_TABLE_METADATA.initialSort}
                  />
                ),
              )}
              <TableHeader />
            </TableRow>
          </StyledTableHeaderRowContainer>
          {loading &&
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton height={32} borderRadius={4} key={index} />
            ))}
          {filteredAgents.map((agent) => (
            <SettingsAIAgentTableRow
              key={agent.id}
              agent={agent}
              action={
                <IconChevronRight
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
              }
              link={getSettingsPath(SettingsPath.AIAgentDetail, {
                agentId: agent.id,
              })}
            />
          ))}
        </Table>
      </StyledTableContainer>
    </>
  );
};
