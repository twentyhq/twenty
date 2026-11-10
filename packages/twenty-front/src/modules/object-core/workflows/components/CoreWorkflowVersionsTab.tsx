import { useLingui } from '@lingui/react/macro';
import {
  IconCalendarTime,
  IconStatusChange,
  IconVersions,
} from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  CoreObjectTableBody,
  CoreObjectTableRow,
} from '@/object-core/components/CoreObjectTableRow';
import { CORE_WORKFLOW_VERSIONS_GRID_TEMPLATE_COLUMNS } from '@/object-core/workflows/constants/CoreWorkflowVersionsGridTemplateColumns';
import { CORE_WORKFLOW_VERSION_STATUS_COLORS } from '@/object-core/workflows/versions/constants/CoreWorkflowVersionStatusColors';
import { CORE_WORKFLOW_VERSION_STATUS_LABELS } from '@/object-core/workflows/versions/constants/CoreWorkflowVersionStatusLabels';
import { useOpenCoreWorkflowVersionSidePanel } from '@/object-core/workflows/versions/hooks/useOpenCoreWorkflowVersionSidePanel';
import { handleCoreObjectTableRowKeyDown } from '@/object-core/utils/handleCoreObjectTableRowKeyDown';
import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableHeaderText } from '@/ui/layout/table/components/TableHeaderText';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type GetCoreWorkflowVersionsQuery } from '~/generated/graphql';

type CoreWorkflowVersionsTabProps = {
  coreWorkflowVersions: GetCoreWorkflowVersionsQuery['coreWorkflowVersions'];
};

export const CoreWorkflowVersionsTab = ({
  coreWorkflowVersions,
}: CoreWorkflowVersionsTabProps) => {
  const { t } = useLingui();
  const { openCoreWorkflowVersionSidePanel } =
    useOpenCoreWorkflowVersionSidePanel();

  return (
    <Table>
      <TableRow
        gridTemplateColumns={CORE_WORKFLOW_VERSIONS_GRID_TEMPLATE_COLUMNS}
      >
        <TableHeader>
          <IconVersions size={14} />
          <TableHeaderText>{t`Version`}</TableHeaderText>
        </TableHeader>
        <TableHeader>
          <IconStatusChange size={14} />
          <TableHeaderText>{t`Status`}</TableHeaderText>
        </TableHeader>
        <TableHeader>
          <IconCalendarTime size={14} />
          <TableHeaderText>{t`Created`}</TableHeaderText>
        </TableHeader>
      </TableRow>
      <CoreObjectTableBody>
        {coreWorkflowVersions.map((coreWorkflowVersion) => {
          const openVersion = () =>
            openCoreWorkflowVersionSidePanel({
              coreWorkflowVersionId: coreWorkflowVersion.id,
              pageTitle: coreWorkflowVersion.label,
            });

          return (
            <CoreObjectTableRow
              key={coreWorkflowVersion.id}
              gridTemplateColumns={CORE_WORKFLOW_VERSIONS_GRID_TEMPLATE_COLUMNS}
              onClick={openVersion}
              onKeyDown={handleCoreObjectTableRowKeyDown(openVersion)}
              role="button"
              tabIndex={0}
            >
              <TableCell>{coreWorkflowVersion.label}</TableCell>
              <TableCell>
                <Tag
                  color={
                    CORE_WORKFLOW_VERSION_STATUS_COLORS[
                      coreWorkflowVersion.status
                    ]
                  }
                >
                  {t(
                    CORE_WORKFLOW_VERSION_STATUS_LABELS[
                      coreWorkflowVersion.status
                    ],
                  )}
                </Tag>
              </TableCell>
              <TableCell color={themeCssVariables.font.color.secondary}>
                <DateTimeDisplay value={coreWorkflowVersion.createdAt} />
              </TableCell>
            </CoreObjectTableRow>
          );
        })}
      </CoreObjectTableBody>
    </Table>
  );
};
