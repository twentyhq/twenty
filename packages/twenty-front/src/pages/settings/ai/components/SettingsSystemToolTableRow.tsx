import { useLazyQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';

import { GET_TOOL_INPUT_SCHEMAS } from '@/ai/graphql/queries/getToolInputSchemas';
import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  IconChevronRight,
  IconCode,
  IconDatabase,
  IconPlayerPlay,
  IconSettings,
  IconTable,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { JsonTree } from 'twenty-ui/json-visualizer';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { type JsonValue } from 'type-fest';

import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

type ToolInputSchemaEntry = {
  name: string;
  inputSchema?: object;
};

type GetToolInputSchemasQuery = {
  getToolIndex: ToolInputSchemaEntry[];
};

export type SystemTool = {
  name: string;
  description: string;
  category: string;
  objectName?: string;
};

export type SettingsSystemToolTableRowProps = {
  tool: SystemTool;
};

export const StyledSystemToolTableRow = styled(TableRow)<{
  isExpandable?: boolean;
}>`
  grid-template-columns: 1fr 100px 36px;
  opacity: 0.7;
  cursor: ${({ isExpandable }) => (isExpandable ? 'pointer' : 'default')};

  &:hover {
    opacity: ${({ isExpandable }) => (isExpandable ? 0.85 : 0.7)};
  }
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  overflow: hidden;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

const StyledActionTableCell = styled(TableCell)`
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledExpandableContent = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledSectionTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'database':
      return IconDatabase;
    case 'workflow':
      return IconPlayerPlay;
    case 'metadata':
      return IconSettings;
    case 'view':
      return IconTable;
    default:
      return IconCode;
  }
};

export const SettingsSystemToolTableRow = ({
  tool,
}: SettingsSystemToolTableRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { copyToClipboard } = useCopyToClipboard();

  // Lazy-load input schemas on first expand (Apollo caches across all rows)
  const [fetchSchemas, { data: schemasData, loading: schemasLoading }] =
    useLazyQuery<GetToolInputSchemasQuery>(GET_TOOL_INPUT_SCHEMAS);

  const inputSchema = schemasData?.getToolIndex.find(
    (entry) => entry.name === tool.name,
  )?.inputSchema;

  const hasInputSchema =
    isDefined(inputSchema) && Object.keys(inputSchema).length > 0;

  const Icon = getCategoryIcon(tool.category);

  const handleRowClick = () => {
    if (!schemasData && !schemasLoading) {
      fetchSchemas();
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <StyledSystemToolTableRow
        key={tool.name}
        onClick={handleRowClick}
        isExpandable
      >
        <StyledNameTableCell>
          <StyledIconContainer>
            <Icon size={16} />
          </StyledIconContainer>
          <OverflowingTextWithTooltip text={tool.name} />
        </StyledNameTableCell>
        <TableCell>
          <SettingsItemTypeTag item={{ isCustom: false }} />
        </TableCell>
        <StyledActionTableCell>
          {isExpanded ? (
            <IconChevronDown size={16} />
          ) : (
            <IconChevronRight size={16} />
          )}
        </StyledActionTableCell>
      </StyledSystemToolTableRow>

      <AnimatedExpandableContainer isExpanded={isExpanded} mode="fit-content">
        <StyledExpandableContent>
          {tool.description && (
            <StyledDescription>{tool.description}</StyledDescription>
          )}
          {schemasLoading && (
            <StyledSectionTitle>{t`Loading schema...`}</StyledSectionTitle>
          )}
          {hasInputSchema && (
            <>
              <StyledSectionTitle>{t`Input Schema`}</StyledSectionTitle>
              <JsonTree
                value={inputSchema as JsonValue}
                shouldExpandNodeInitially={() => true}
                emptyArrayLabel={t`Empty Array`}
                emptyObjectLabel={t`No parameters`}
                emptyStringLabel={t`[empty string]`}
                arrowButtonCollapsedLabel={t`Expand`}
                arrowButtonExpandedLabel={t`Collapse`}
                onNodeValueClick={copyToClipboard}
              />
            </>
          )}
          {!schemasLoading && !hasInputSchema && (
            <StyledSectionTitle>{t`No parameters`}</StyledSectionTitle>
          )}
        </StyledExpandableContent>
      </AnimatedExpandableContainer>
    </>
  );
};
