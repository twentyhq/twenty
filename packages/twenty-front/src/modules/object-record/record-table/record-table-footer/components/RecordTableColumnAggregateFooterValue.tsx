import { useAggregateRecordsForRecordTableColumnFooter } from '@/object-record/record-table/record-table-footer/hooks/useAggregateRecordsForRecordTableColumnFooter';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { isDefined, OverflowingTextWithTooltip } from 'twenty-ui';

const StyledText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  height: 20px;
  align-items: center;
  gap: 4px;
  flex-grow: 1;

  padding-left: ${({ theme }) => theme.spacing(2)};
  z-index: 1;
`;

const StyledScrollableContainer = styled.div`
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const StyledValueContainer = styled(StyledScrollableContainer)`
  align-items: center;
  display: flex;
  gap: 4px;
  height: 32px;
  justify-content: flex-end;
  padding: 0 8px;
`;

const StyledValue = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
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
