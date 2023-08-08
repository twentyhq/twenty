// TODO: We should create our own accordion component
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/accordion';
import styled from '@emotion/styled';

import { MatchColumnSelect } from '../../../components/Selects/MatchColumnSelect';
import { useRsi } from '../../../hooks/useRsi';
import type { Translations } from '../../../translationsRSIProps';
import type { Fields } from '../../../types';
import type { Column } from '../MatchColumnsStep';
import { ColumnType } from '../MatchColumnsStep';

import { MatchIcon } from './MatchIcon';
import { SubMatchingSelect } from './SubMatchingSelect';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 10px;
  width: 100%;
`;

const ColumnIgnored = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const ColumnSelectContainer = styled.div`
  align-items: center;
  display: flex;
  min-height: 10px;
  width: 100%;
`;

const MatchColumnSelectContainer = styled.div`
  flex: 1;
`;

const AccordionContainer = styled.div`
  display: flex;
  width: 100%;
`;

const AccordionLabel = styled.span`
  color: ${({ theme }) => theme.color.blue};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding-left: ${({ theme }) => theme.spacing(1)};
  text-align: left;
`;

const getAccordionTitle = <T extends string>(
  fields: Fields<T>,
  column: Column<T>,
  translations: Translations,
) => {
  const fieldLabel = fields.find(
    (field) => 'value' in column && field.key === column.value,
  )!.label;
  return `${translations.matchColumnsStep.matchDropdownTitle} ${fieldLabel} (${
    'matchedOptions' in column && column.matchedOptions.length
  } ${translations.matchColumnsStep.unmatched})`;
};

type TemplateColumnProps<T extends string> = {
  onChange: (val: T, index: number) => void;
  onSubChange: (val: T, index: number, option: string) => void;
  column: Column<T>;
};

export const TemplateColumn = <T extends string>({
  column,
  onChange,
  onSubChange,
}: TemplateColumnProps<T>) => {
  const { translations, fields } = useRsi<T>();
  const isIgnored = column.type === ColumnType.ignored;
  const isChecked =
    column.type === ColumnType.matched ||
    column.type === ColumnType.matchedCheckbox ||
    column.type === ColumnType.matchedSelectOptions;
  const isSelect = 'matchedOptions' in column;
  const selectOptions = fields.map(({ label, key }) => ({ value: key, label }));
  const selectValue = selectOptions.find(
    ({ value }) => 'value' in column && column.value === value,
  );

  return (
    <Container>
      {isIgnored ? (
        <ColumnIgnored>Column ignored</ColumnIgnored>
      ) : (
        <>
          <ColumnSelectContainer>
            <MatchColumnSelectContainer>
              <MatchColumnSelect
                placeholder="Select column..."
                value={selectValue}
                onChange={(value) => onChange(value?.value as T, column.index)}
                options={selectOptions}
                name={column.header}
              />
            </MatchColumnSelectContainer>
            <MatchIcon isChecked={isChecked} />
          </ColumnSelectContainer>
          {isSelect && (
            <AccordionContainer>
              <Accordion allowMultiple width="100%">
                <AccordionItem border="none" py={1}>
                  <AccordionButton
                    _hover={{ bg: 'transparent' }}
                    _focus={{ boxShadow: 'none' }}
                    px={0}
                    py={4}
                    data-testid="accordion-button"
                  >
                    <AccordionIcon />
                    <AccordionLabel>
                      {getAccordionTitle<T>(fields, column, translations)}
                    </AccordionLabel>
                  </AccordionButton>
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
            </AccordionContainer>
          )}
        </>
      )}
    </Container>
  );
};
