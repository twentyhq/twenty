import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';

import { TextInput } from '@/ui/input/components/TextInput';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { useTheme } from '@emotion/react';
import {
  IconChevronRight,
  IconDotsVertical,
  IconSearch,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { GET_SETTINGS_AI_AGENT_TABLE_METADATA } from '~/pages/settings/ai/constants/SettingsAIAgentTableMetadata';
import { SettingsAIAgentTableItem } from '~/pages/settings/ai/types/SettingsAIAgentTableItem';
import {
  SettingsAIAgentTableRow,
  StyledAIAgentTableRow,
} from './SettingsAIAgentTableRow';

const StyledSearchInput = styled(TextInput)`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

export type SettingsAIAgentsTableProps = {
  agents: SettingsAIAgentTableItem[];
};

export const SettingsAIAgentsTable = ({
  agents,
}: SettingsAIAgentsTableProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const sortedAgents = useSortedArray(
    agents,
    GET_SETTINGS_AI_AGENT_TABLE_METADATA,
  );

  const filteredAgents = useMemo(
    () =>
      sortedAgents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.type.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [sortedAgents, searchTerm],
  );

  return (
    <>
      <StyledSearchInput
        instanceId="settings-ai-agents-search"
        LeftIcon={IconSearch}
        placeholder={t`Search an agent...`}
        value={searchTerm}
        onChange={setSearchTerm}
      />

      <StyledTable>
        <StyledAIAgentTableRow>
          {GET_SETTINGS_AI_AGENT_TABLE_METADATA.fields.map(
            (settingsAIAgentTableMetadataField) => (
              <SortableTableHeader
                key={settingsAIAgentTableMetadataField.fieldName}
                fieldName={settingsAIAgentTableMetadataField.fieldName}
                label={t(settingsAIAgentTableMetadataField.fieldLabel)}
                tableId={GET_SETTINGS_AI_AGENT_TABLE_METADATA.tableId}
                align={settingsAIAgentTableMetadataField.align}
                initialSort={GET_SETTINGS_AI_AGENT_TABLE_METADATA.initialSort}
              />
            ),
          )}
          <TableHeader></TableHeader>
        </StyledAIAgentTableRow>
        {filteredAgents.map((agent) => (
          <SettingsAIAgentTableRow
            key={agent.id}
            agent={agent}
            action={
              agent.type === 'Custom' ? (
                <LightIconButton
                  Icon={IconDotsVertical}
                  accent="tertiary"
                  size="small"
                />
              ) : (
                <IconChevronRight
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
              )
            }
          />
        ))}
      </StyledTable>
    </>
  );
};
