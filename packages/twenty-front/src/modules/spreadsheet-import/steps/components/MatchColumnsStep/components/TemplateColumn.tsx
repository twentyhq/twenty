import styled from '@emotion/styled';

import { MatchColumnToFieldSelect } from '@/spreadsheet-import/components/MatchColumnToFieldSelect';
import { DO_NOT_IMPORT_OPTION_KEY } from '@/spreadsheet-import/constants/DoNotImportOptionKey';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { suggestedFieldsByColumnHeaderState } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/states/suggestedFieldsByColumnHeaderState';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { type SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { spreadsheetImportBuildFieldOptions } from '@/spreadsheet-import/utils/spreadsheetImportBuildFieldOptions';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { IconForbid } from 'twenty-ui/display';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 10px;
  width: 100%;
`;

const StyledErrorMessage = styled.span`
  color: ${({ theme }) => theme.font.color.danger};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

type TemplateColumnProps = {
  columns: SpreadsheetColumns;
  columnIndex: number;
  onChange: (val: string, index: number) => void;
};

export const TemplateColumn = ({
  columns,
  columnIndex,
  onChange,
}: TemplateColumnProps) => {
  const { spreadsheetImportFields: fields } = useSpreadsheetImportInternal();
  const suggestedFieldsByColumnHeader = useRecoilValue(
    suggestedFieldsByColumnHeaderState,
  );

  const column = columns[columnIndex];
  const isIgnored = column.type === SpreadsheetColumnType.ignored;

  const { t } = useLingui();

  const fieldOptions = spreadsheetImportBuildFieldOptions(fields, columns);
  const suggestedFieldOptions = spreadsheetImportBuildFieldOptions(
    suggestedFieldsByColumnHeader[column.header] ?? [],
    columns,
  );

  const selectOptions = [
    {
      Icon: IconForbid,
      value: DO_NOT_IMPORT_OPTION_KEY,
      label: t`Do not import`,
    },
    ...fieldOptions,
  ];

  const selectValue = fieldOptions.find(
    ({ value }) => 'value' in column && column.value === value,
  );

  const ignoreValue = selectOptions.find(
    ({ value }) => value === DO_NOT_IMPORT_OPTION_KEY,
  );

  return (
    <StyledContainer>
      <MatchColumnToFieldSelect
        placeholder={t`Select column...`}
        value={isIgnored ? ignoreValue : selectValue}
        onChange={(value) => onChange(value?.value as string, column.index)}
        options={selectOptions}
        suggestedOptions={suggestedFieldOptions}
        columnIndex={column.index.toString()}
      />
      {column.type === SpreadsheetColumnType.matchedError && (
        <StyledErrorMessage>{`"${column.header}" ${column.errorMessage}`}</StyledErrorMessage>
      )}
    </StyledContainer>
  );
};
