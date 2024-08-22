import styled from '@emotion/styled';
import { IconForbid } from 'twenty-ui';

import { MatchColumnSelect } from '@/spreadsheet-import/components/MatchColumnSelect';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';

import { Columns, ColumnType } from '../MatchColumnsStep';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 10px;
  width: 100%;
`;

type TemplateColumnProps<T extends string> = {
  columns: Columns<string>;
  columnIndex: number;
  onChange: (val: T, index: number) => void;
};

export const TemplateColumn = <T extends string>({
  columns,
  columnIndex,
  onChange,
}: TemplateColumnProps<T>) => {
  const { fields } = useSpreadsheetImportInternal<T>();
  const column = columns[columnIndex];
  const isIgnored = column.type === ColumnType.ignored;

  const fieldOptions = fields.map(({ icon, label, key }) => {
    const isSelected =
      columns.findIndex((column) => {
        if ('value' in column) {
          return column.value === key;
        }
        return false;
      }) !== -1;

    return {
      icon: icon,
      value: key,
      label: label,
      disabled: isSelected,
    } as const;
  });

  const selectOptions = [
    {
      icon: IconForbid,
      value: 'do-not-import',
      label: 'Do not import',
    },
    ...fieldOptions,
  ];

  const selectValue = fieldOptions.find(
    ({ value }) => 'value' in column && column.value === value,
  );

  const ignoreValue = selectOptions.find(
    ({ value }) => value === 'do-not-import',
  );

  return (
    <StyledContainer>
      <MatchColumnSelect
        placeholder="Select column..."
        value={isIgnored ? ignoreValue : selectValue}
        onChange={(value) => onChange(value?.value as T, column.index)}
        options={selectOptions}
        name={column.header}
      />
    </StyledContainer>
  );
};
