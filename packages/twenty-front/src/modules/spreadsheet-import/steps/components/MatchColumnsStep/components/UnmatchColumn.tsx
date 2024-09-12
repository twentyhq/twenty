import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { SubMatchingSelect } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelect';
import { UnmatchColumnBanner } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/UnmatchColumnBanner';
import { Column } from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { Fields } from '@/spreadsheet-import/types';
import styled from '@emotion/styled';
import { useLayoutEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-ui';

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

const StyledContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledTransitionContainer = styled.div<{
  isExpanded: boolean;
  height: number;
}>`
  max-height: ${({ isExpanded, height, theme }) =>
    isExpanded ? `calc(${height}px + ${theme.spacing(4)})` : '0'};
  overflow: hidden;
  position: relative;
  transition: max-height 0.4s ease;
`;

const StyledContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const UnmatchColumn = <T extends string>({
  columns,
  columnIndex,
  onSubChange,
}: UnmatchColumnProps<T>) => {
  const { fields } = useSpreadsheetImportInternal<T>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const column = columns[columnIndex];
  const isSelect = 'matchedOptions' in column;

  useLayoutEffect(() => {
    if (isDefined(contentRef.current)) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded]);

  if (!isSelect) return null;

  return (
    <StyledContainer>
      <UnmatchColumnBanner
        message={getAccordionTitle(fields, column)}
        buttonOnClick={() => setIsExpanded(!isExpanded)}
        isExpanded={isExpanded}
      />
      <StyledTransitionContainer isExpanded={isExpanded} height={contentHeight}>
        <StyledContentWrapper ref={contentRef}>
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
      </StyledTransitionContainer>
    </StyledContainer>
  );
};
