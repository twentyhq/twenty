import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { SubMatchingSelect } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelect';
import { Column } from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { Fields } from '@/spreadsheet-import/types';
import {
  Accordion,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AccordionButton as ChakraAccordionButton,
} from '@chakra-ui/accordion';
import styled from '@emotion/styled';
import { IconChevronDown, IconInfoCircle, isDefined } from 'twenty-ui';

const StyledAccordionButton = styled(ChakraAccordionButton)`
  align-items: center;
  background-color: ${({ theme }) => theme.accent.secondary};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  height: 40px;

  &:hover {
    background-color: ${({ theme }) => theme.accent.primary};
  }
`;

const StyledAccordionContainer = styled.div`
  display: flex;
  width: 100%;
  height: auto;
`;

const StyledAccordionLabel = styled.span`
  color: ${({ theme }) => theme.color.blue};
  display: flex;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  text-align: left;
`;

const StyledIconChevronDown = styled(IconChevronDown)`
  color: ${({ theme }) => theme.color.blue} !important;
`;

const getAccordionTitle = <T extends string>(
  fields: Fields<T>,
  column: Column<T>,
) => {
  const fieldLabel = fields.find(
    (field) => 'value' in column && field.key === column.value,
  )?.label;

  return `Match ${fieldLabel} (${
    'matchedOptions' in column &&
    column.matchedOptions.filter((option) => !isDefined(option.value)).length
  } Unmatched)`;
};

type UnmatchColumnProps<T extends string> = {
  columns: Column<T>[];
  columnIndex: number;
  onSubChange: (val: T, index: number, option: string) => void;
};

export const UnmatchColumn = <T extends string>({
  columns,
  columnIndex,
  onSubChange,
}: UnmatchColumnProps<T>) => {
  const { fields } = useSpreadsheetImportInternal<T>();

  const column = columns[columnIndex];
  const isSelect = 'matchedOptions' in column;

  return (
    isSelect && (
      <StyledAccordionContainer>
        <Accordion allowMultiple width="100%" height="100%">
          <AccordionItem border="none" py={1} height="100%">
            <StyledAccordionButton data-testid="accordion-button">
              <StyledAccordionLabel>
                <IconInfoCircle />
                {getAccordionTitle(fields, column)}
              </StyledAccordionLabel>
              <AccordionIcon as={StyledIconChevronDown} />
            </StyledAccordionButton>
            <AccordionPanel mt={16} gap={12} display="flex" flexDir="column">
              {column.matchedOptions.map((option) => (
                <SubMatchingSelect
                  option={option}
                  column={column}
                  onSubChange={onSubChange}
                  key={option.entry}
                  placeholder="Select an option"
                />
              ))}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </StyledAccordionContainer>
    )
  );
};
