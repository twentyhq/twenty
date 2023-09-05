// TODO: We should create our own accordion component
import {
  Accordion,
  AccordionButton as ChakraAccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/accordion';
import styled from '@emotion/styled';

import { MatchColumnSelect } from '@/spreadsheet-import/components/MatchColumnSelect';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import type { Fields } from '@/spreadsheet-import/types';
import { IconChevronDown, IconForbid } from '@/ui/icon';

import type { Column, Columns } from '../MatchColumnsStep';
import { ColumnType } from '../MatchColumnsStep';

import { SubMatchingSelect } from './SubMatchingSelect';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 10px;
  width: 100%;
`;

const StyledAccordionButton = styled(ChakraAccordionButton)`
  align-items: center;
  background-color: ${({ theme }) => theme.accent.secondary};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  width: 100%;

  &:hover {
    background-color: ${({ theme }) => theme.accent.primary};
  }
`;

const StyledAccordionContainer = styled.div`
  display: flex;
  width: 100%;
`;

const StyledAccordionLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  padding-left: ${({ theme }) => theme.spacing(1)};
  text-align: left;
`;

const getAccordionTitle = <T extends string>(
  fields: Fields<T>,
  column: Column<T>,
) => {
  const fieldLabel = fields.find(
    (field) => 'value' in column && field.key === column.value,
  )?.label;

  return `Match ${fieldLabel} (${
    'matchedOptions' in column && column.matchedOptions.length
  } Unmatched)`;
};

type TemplateColumnProps<T extends string> = {
  columns: Columns<T>;
  columnIndex: number;
  onChange: (val: T, index: number) => void;
  onSubChange: (val: T, index: number, option: string) => void;
};

export const TemplateColumn = <T extends string>({
  columns,
  columnIndex,
  onChange,
  onSubChange,
}: TemplateColumnProps<T>) => {
  const { fields } = useSpreadsheetImportInternal<T>();
  const column = columns[columnIndex];
  const isIgnored = column.type === ColumnType.ignored;
  const isSelect = 'matchedOptions' in column;
  const fieldOptions = fields.map(({ icon, label, key }) => {
    const isSelected =
      columns.findIndex((column) => {
        if ('value' in column) {
          return column.value === key;
        }

        return false;
      }) !== -1;

    return {
      icon,
      value: key,
      label,
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
      {isSelect && (
        <StyledAccordionContainer>
          <Accordion allowMultiple width="100%">
            <AccordionItem border="none" py={1}>
              <StyledAccordionButton data-testid="accordion-button">
                <StyledAccordionLabel>
                  {getAccordionTitle<T>(fields, column)}
                </StyledAccordionLabel>
                <AccordionIcon as={IconChevronDown} />
              </StyledAccordionButton>
              <AccordionPanel pb={4} pr={3} display="flex" flexDir="column">
                {column.matchedOptions.map((option) => (
                  <SubMatchingSelect
                    option={option}
                    column={column}
                    onSubChange={onSubChange}
                    key={option.entry}
                  />
                ))}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </StyledAccordionContainer>
      )}
    </StyledContainer>
  );
};
