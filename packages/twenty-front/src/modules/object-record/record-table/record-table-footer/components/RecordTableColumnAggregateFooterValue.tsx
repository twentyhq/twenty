import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useAggregateRecordsForRecordTableColumnFooter } from '@/object-record/record-table/record-table-footer/hooks/useAggregateRecordsForRecordTableColumnFooter';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

const StyledText = styled.span`
  align-items: center;
  display: flex;
  flex-grow: 1;
  gap: 4px;
  height: 20px;
  overflow: hidden;
  padding-left: ${themeCssVariables.spacing[2]};
  text-overflow: ellipsis;

  white-space: nowrap;
  z-index: 1;
`;

const StyledValueContainer = styled.div`
  -ms-overflow-style: none;
  align-items: center;
  display: flex;
  gap: 4px;

  &::-webkit-scrollbar {
    display: none;
  }

  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  justify-content: flex-end;
  overflow-x: auto;
  padding: 0 8px;
  scrollbar-width: none;
  white-space: nowrap;
`;

const StyledValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  max-width: 100%;
`;

export const RecordTableColumnAggregateFooterValue = ({
  dropdownId,
  fieldMetadataId,
}: {
  dropdownId: string;
  fieldMetadataId: string;
}) => {
  const sanitizedId = `tooltip-${dropdownId.replace(/[^a-zA-Z0-9-_]/g, '-')}`;

  const { aggregateValue, aggregateLabel, isLoading } =
    useAggregateRecordsForRecordTableColumnFooter(fieldMetadataId);

  return (
    <>
      {isDefined(aggregateValue) || isLoading ? (
        <StyledValueContainer>
          {isLoading ? (
            <></>
          ) : (
            <>
              <OverflowingTextWithTooltip text={aggregateLabel} />
              <StyledValue>{aggregateValue}</StyledValue>
            </>
          )}
        </StyledValueContainer>
      ) : (
        <StyledText id={sanitizedId}>
          <Trans>Calculate</Trans>
        </StyledText>
      )}
    </>
  );
};
