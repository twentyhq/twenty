import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { useTheme } from '@emotion/react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconChevronRight, IconSearch } from 'twenty-ui/display';
import { type Agent } from '~/generated-metadata/graphql';
import { SETTINGS_AI_AGENT_TABLE_METADATA } from '~/pages/settings/ai/constants/SettingsAiAgentTableMetadata';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

import {
  SettingsAIAgentTableRow,
  StyledAIAgentTableRow,
} from './SettingsAIAgentTableRow';

const StyledSearchInput = styled(SettingsTextInput)`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledTableHeaderRow = styled(StyledAIAgentTableRow)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAIAgentsTable = ({
  agents,
  withSearchBar = false,
}: {
  agents: Agent[];
  withSearchBar?: boolean;
}) => {
  const { t } = useLingui();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const sortedAgents = useSortedArray(agents, SETTINGS_AI_AGENT_TABLE_METADATA);

  const filteredAgents = sortedAgents.filter((agent) => {
    const searchNormalized = normalizeSearchText(searchTerm);
    return (
      normalizeSearchText(agent.name).includes(searchNormalized) ||
      normalizeSearchText(agent.label).includes(searchNormalized)
    );
  });

  return (
    <>
      {withSearchBar && (
        <StyledSearchInput
          instanceId="settings-ai-agents-search"
          LeftIcon={IconSearch}
          placeholder={t`Search an agent...`}
          value={searchTerm}
          onChange={setSearchTerm}
        />
      )}

      <StyledTable>
        <StyledTableHeaderRow>
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
        </StyledTableHeaderRow>
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
      </StyledTable>
    </>
  );
};
