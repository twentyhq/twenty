import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { SubMatchingSelectRow } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectRow';
import { UnmatchColumnBanner } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/UnmatchColumnBanner';
import { SpreadsheetImportFields } from '@/spreadsheet-import/types';
import { SpreadsheetColumn } from '@/spreadsheet-import/types/SpreadsheetColumn';
import { SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

const getExpandableContainerTitle = (
  fields: SpreadsheetImportFields,
  column: SpreadsheetColumn,
) => {
  const fieldLabel = fields.find(
    (field) => 'value' in column && field.key === column.value,
  )?.label;

  return `Match ${fieldLabel} (${
    'matchedOptions' in column &&
    column.matchedOptions?.filter((option) => !isDefined(option.value)).length
  } Unmatched)`;
};

type UnmatchColumnProps = {
  columns: SpreadsheetColumns;
  columnIndex: number;
  onSubChange: (val: string, index: number, option: string) => void;
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

export const UnmatchColumn = ({
  columns,
  columnIndex,
  onSubChange,
}: UnmatchColumnProps) => {
  const { spreadsheetImportFields: fields } = useSpreadsheetImportInternal();
  const [isExpanded, setIsExpanded] = useState(false);
  const column = columns[columnIndex];
  const isSelect = 'matchedOptions' in column;
  const { t } = useLingui();

  const allMatched = column.type === SpreadsheetColumnType.matchedSelectOptions;

  if (!isSelect) return null;

  return (
    <StyledContainer>
      <UnmatchColumnBanner
        message={getExpandableContainerTitle(fields, column)}
        buttonOnClick={() => setIsExpanded(!isExpanded)}
        isExpanded={isExpanded}
        allMatched={allMatched}
      />
      <AnimatedExpandableContainer
        isExpanded={isExpanded}
        dimension="height"
        mode="scroll-height"
        containAnimation
      >
        <StyledContentWrapper>
          {column.matchedOptions?.map((option) => (
            <SubMatchingSelectRow
              option={option}
              column={column}
              onSubChange={onSubChange}
              key={option.entry}
              placeholder={t`Select an option`}
            />
          ))}
        </StyledContentWrapper>
      </AnimatedExpandableContainer>
    </StyledContainer>
  );
};
