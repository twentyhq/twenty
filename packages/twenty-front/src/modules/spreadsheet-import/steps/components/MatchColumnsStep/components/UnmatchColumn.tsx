import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { SubMatchingSelect } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelect';
import { UnmatchColumnBanner } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/UnmatchColumnBanner';
import { Column } from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { Fields } from '@/spreadsheet-import/types';
import styled from '@emotion/styled';
import { useState } from 'react';
import { AnimatedExpandableContainer, isDefined } from 'twenty-ui';

const getExpandableContainerTitle = <T extends string>(
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

const StyledContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  padding-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const UnmatchColumn = <T extends string>({
  columns,
  columnIndex,
  onSubChange,
}: UnmatchColumnProps<T>) => {
  const { fields } = useSpreadsheetImportInternal<T>();
  const [isExpanded, setIsExpanded] = useState(false);
  const column = columns[columnIndex];
  const isSelect = 'matchedOptions' in column;

  if (!isSelect) return null;

  return (
    <StyledContainer>
      <UnmatchColumnBanner
        message={getExpandableContainerTitle(fields, column)}
        buttonOnClick={() => setIsExpanded(!isExpanded)}
        isExpanded={isExpanded}
      />
      <AnimatedExpandableContainer
        isExpanded={isExpanded}
        dimension="height"
        mode="scroll-height"
        containAnimation
      >
        <StyledContentWrapper>
          {column.matchedOptions.map((option) => (
            <SubMatchingSelect
              option={option}
              column={column}
              onSubChange={onSubChange}
              key={option.entry}
              placeholder="Select an option"
            />
          ))}
        </StyledContentWrapper>
      </AnimatedExpandableContainer>
    </StyledContainer>
  );
};
