import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IconSettingsAutomation } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { MultiSelectDisplay } from '@/ui/field/display/components/MultiSelectDisplay';
import { useCoreWorkflowStatusOptions } from '@/object-core/workflows/hooks/useCoreWorkflowStatusOptions';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { WORKFLOW_CORE_TABLE_GRID_TEMPLATE_COLUMNS } from '@/object-core/workflows/constants/WorkflowCoreTableGridTemplateColumns';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';

const StyledNameContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledNameLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPlaceholder = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

type WorkflowCoreTableRowProps = {
  workflow: CoreWorkflow;
};

export const WorkflowCoreTableRow = ({
  workflow,
}: WorkflowCoreTableRowProps) => {
  const { t } = useLingui();

  const statusOptions = useCoreWorkflowStatusOptions();

  return (
    <TableRow
      gridTemplateColumns={WORKFLOW_CORE_TABLE_GRID_TEMPLATE_COLUMNS}
      to={
        isDefined(workflow.workspaceWorkflowId)
          ? `/object/workflow/${workflow.workspaceWorkflowId}`
          : undefined
      }
    >
      <TableCell>
        <StyledNameContainer>
          <IconSettingsAutomation size={16} />
          <StyledNameLabel>
            {isNonEmptyString(workflow.name) ? (
              workflow.name
            ) : (
              <StyledPlaceholder>{t`Untitled`}</StyledPlaceholder>
            )}
          </StyledNameLabel>
        </StyledNameContainer>
      </TableCell>
      <TableCell>
        <MultiSelectDisplay
          values={[workflow.status]}
          options={statusOptions}
        />
      </TableCell>
      <TableCell>{workflow.applicationName ?? '-'}</TableCell>
      <TableCell>{new Date(workflow.updatedAt).toLocaleDateString()}</TableCell>
    </TableRow>
  );
};
