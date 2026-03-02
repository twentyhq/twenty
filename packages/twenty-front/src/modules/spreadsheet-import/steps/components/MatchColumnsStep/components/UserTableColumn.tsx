import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type ImportedRow } from '@/spreadsheet-import/types';

import { type SpreadsheetColumn } from '@/spreadsheet-import/types/SpreadsheetColumn';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledExample = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type UserTableColumnProps = {
  column: SpreadsheetColumn;
  importedRow: ImportedRow;
};

export const UserTableColumn = ({
  column,
  importedRow,
}: UserTableColumnProps) => {
  const { header } = column;
  const firstDefinedValue = importedRow.find(isDefined);

  return (
    <StyledContainer>
      <StyledValue>{header}</StyledValue>
      {firstDefinedValue && (
        <StyledExample>{`ex: ${firstDefinedValue}`}</StyledExample>
      )}
    </StyledContainer>
  );
};
