import { useLazyQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';

import { GET_TOOL_INPUT_SCHEMA } from '@/ai/graphql/queries/getToolInputSchemas';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  IconChevronRight,
  IconCode,
  IconDatabase,
  IconPlayerPlay,
  IconSettings,
  IconTable,
} from 'twenty-ui/display';
import { JsonTree } from 'twenty-ui/json-visualizer';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type JsonValue } from 'type-fest';

import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { SettingsToolTableRow } from './SettingsToolTableRow';

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

  const [fetchSchemaRaw, { data: schemaData, loading: schemaLoading }] =
    useLazyQuery<GetToolInputSchemaQuery>(GET_TOOL_INPUT_SCHEMA);

  const fetchSchema = useCallback(
    () => fetchSchemaRaw({ variables: { toolName: tool.name } }),
    [fetchSchemaRaw, tool.name],
  );

  const inputSchema = schemaData?.getToolInputSchema;

  const hasInputSchema =
    isDefined(inputSchema) && Object.keys(inputSchema).length > 0;

  const handleRowClick = () => {
    if (!schemaData && !schemaLoading) {
      fetchSchema();
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <SettingsToolTableRow
        LeftIcon={getCategoryIcon(tool.category)}
        name={tool.name}
        isCustom={false}
        action={
          isExpanded ? (
            <IconChevronDown size={16} />
          ) : (
            <IconChevronRight size={16} />
          )
        }
        onClick={handleRowClick}
        isClickable
      />

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
