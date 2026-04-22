import { SettingsLogicFunctionsFieldItemTableRow } from '@/settings/logic-functions/components/SettingsLogicFunctionsFieldItemTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import React from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type LogicFunctionTableRow = {
  key: string;
  name: string;
  trigger: string;
  link?: string;
};

export const StyledTableRow = (
  props: React.ComponentProps<typeof TableRow>,
) => (
  <TableRow
    gridTemplateColumns="300px 1fr 32px"
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

export const SettingsLogicFunctionsTable = ({
  logicFunctions,
}: {
  logicFunctions: LogicFunctionTableRow[];
}) => {
  const { t } = useLingui();

  if (logicFunctions.length === 0) {
    return null;
  }

  return (
    <Table>
      <StyledTableRow>
        <TableHeader>{t`Name`}</TableHeader>
        <TableHeader align={'right'}>{t`Trigger`}</TableHeader>
        <TableHeader></TableHeader>
      </StyledTableRow>
      <StyledTableBodyContainer>
        <TableBody>
          {logicFunctions.map((logicFunction) => (
            <SettingsLogicFunctionsFieldItemTableRow
              key={logicFunction.key}
              logicFunction={logicFunction}
            />
          ))}
        </TableBody>
      </StyledTableBodyContainer>
    </Table>
  );
};
