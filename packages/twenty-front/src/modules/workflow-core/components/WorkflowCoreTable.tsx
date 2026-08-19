import { useLingui } from '@lingui/react/macro';

import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { WORKFLOW_CORE_TABLE_METADATA } from '@/workflow-core/constants/WorkflowCoreTableMetadata';
import { WORKFLOW_CORE_TABLE_ROW_GRID_TEMPLATE_COLUMNS } from '@/workflow-core/constants/WorkflowCoreTableRowGridTemplateColumns';
import { WorkflowCoreTableRow } from '@/workflow-core/components/WorkflowCoreTableRow';
import { type CoreWorkflow } from '@/workflow-core/types/CoreWorkflow';

type WorkflowCoreTableProps = {
  coreWorkflows: CoreWorkflow[];
};

export const WorkflowCoreTable = ({
  coreWorkflows,
}: WorkflowCoreTableProps) => {
  const { t } = useLingui();

  const sortedCoreWorkflows = useSortedArray(
    coreWorkflows,
    WORKFLOW_CORE_TABLE_METADATA,
  );

  return (
    <Table>
      <TableRow
        gridTemplateColumns={WORKFLOW_CORE_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      >
        {WORKFLOW_CORE_TABLE_METADATA.fields.map((field) => (
          <SortableTableHeader
            key={String(field.fieldName)}
            fieldName={String(field.fieldName)}
            label={t(field.fieldLabel)}
            tableId={WORKFLOW_CORE_TABLE_METADATA.tableId}
            initialSort={WORKFLOW_CORE_TABLE_METADATA.initialSort}
            align={field.align}
          />
        ))}
      </TableRow>
      <TableBody>
        {sortedCoreWorkflows.map((workflow) => (
          <WorkflowCoreTableRow key={workflow.id} workflow={workflow} />
        ))}
      </TableBody>
    </Table>
  );
};
