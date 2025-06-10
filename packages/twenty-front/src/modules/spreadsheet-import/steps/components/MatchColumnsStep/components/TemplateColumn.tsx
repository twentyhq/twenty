import styled from '@emotion/styled';

import { MatchColumnToFieldSelect } from '@/spreadsheet-import/components/MatchColumnToFieldSelect';
import { DO_NOT_IMPORT_OPTION_KEY } from '@/spreadsheet-import/constants/DoNotImportOptionKey';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { useLingui } from '@lingui/react/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { IconForbid } from 'twenty-ui/display';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 10px;
  width: 100%;
`;

type TemplateColumnProps<T extends string> = {
  columns: SpreadsheetColumns<string>;
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
  const isIgnored = column.type === SpreadsheetColumnType.ignored;

  const { t } = useLingui();

  const fieldOptions = fields
    .filter((field) => field.fieldMetadataType !== FieldMetadataType.RICH_TEXT)
    .map(({ Icon, label, key }) => {
      const isSelected =
        columns.findIndex((column) => {
          if ('value' in column) {
            return column.value === key;
          }
          return false;
        }) !== -1;

      return {
        Icon: Icon,
        value: key,
        label: label,
        disabled: isSelected,
      } as const;
    });

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
        onChange={(value) => onChange(value?.value as T, column.index)}
        options={selectOptions}
        columnIndex={column.index.toString()}
      />
    </StyledContainer>
  );
};
