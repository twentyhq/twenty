import { SettingsLogicFunctionsFieldItemTableRow } from '@/settings/logic-functions/components/SettingsLogicFunctionsFieldItemTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { type LogicFunction } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const LOGIC_FUNCTIONS_TABLE_ROW_GRID_TEMPLATE_COLUMNS =
  '164px 1fr 96px 32px';

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

export const SettingsLogicFunctionsTable = ({
  logicFunctions,
}: {
  logicFunctions: LogicFunction[];
}) => {
  const { applicationId = '' } = useParams();

  const { t } = useLingui();

  if (logicFunctions.length === 0) {
    return null;
  }

  return (
    <Table>
      <TableRow
        gridTemplateColumns={LOGIC_FUNCTIONS_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      >
        <TableHeader>{t`Name`}</TableHeader>
        <TableHeader></TableHeader>
        <TableHeader>{t`Runtime`}</TableHeader>
        <TableHeader></TableHeader>
      </TableRow>
      <StyledTableBodyContainer>
        <TableBody>
          {logicFunctions.map((logicFunction: LogicFunction) => (
            <SettingsLogicFunctionsFieldItemTableRow
              key={logicFunction.id}
              logicFunction={logicFunction}
              to={getSettingsPath(SettingsPath.ApplicationLogicFunctionDetail, {
                applicationId,
                logicFunctionId: logicFunction.id,
              })}
            />
          ))}
        </TableBody>
      </StyledTableBodyContainer>
    </Table>
  );
};
