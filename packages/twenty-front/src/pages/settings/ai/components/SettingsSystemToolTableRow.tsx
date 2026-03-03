import { useLazyQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';

import { GET_TOOL_INPUT_SCHEMA } from '@/ai/graphql/queries/getToolInputSchemas';
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
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type JsonValue } from 'type-fest';

import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

type GetToolInputSchemaQuery = {
  getToolInputSchema: object | null;
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

export const StyledSystemToolTableRow = styled(TableRow)`
  grid-template-columns: 1fr 100px 36px;
  opacity: 0.7;

  &[data-clickable='true']:hover {
    opacity: 0.85;
  }
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${themeCssVariables.font.color.primary};
  gap: ${themeCssVariables.spacing[2]};
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
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledExpandableContent = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSectionTitle = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-bottom: ${themeCssVariables.spacing[4]};
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

  const [fetchSchema, { data: schemaData, loading: schemaLoading }] =
    useLazyQuery<GetToolInputSchemaQuery>(GET_TOOL_INPUT_SCHEMA, {
      variables: { toolName: tool.name },
    });

  const inputSchema = schemaData?.getToolInputSchema;

  const hasInputSchema =
    isDefined(inputSchema) && Object.keys(inputSchema).length > 0;

  const Icon = getCategoryIcon(tool.category);

  const handleRowClick = () => {
    if (!schemaData && !schemaLoading) {
      fetchSchema();
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <StyledSystemToolTableRow
        key={tool.name}
        onClick={handleRowClick}
        isClickable
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
          {schemaLoading && (
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
          {!schemaLoading && !hasInputSchema && (
            <StyledSectionTitle>{t`No parameters`}</StyledSectionTitle>
          )}
        </StyledExpandableContent>
      </AnimatedExpandableContainer>
    </>
  );
};
