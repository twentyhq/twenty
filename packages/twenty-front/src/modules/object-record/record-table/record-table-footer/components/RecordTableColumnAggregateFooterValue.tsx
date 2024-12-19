import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { IconChevronDown, isDefined } from 'twenty-ui';

const StyledCell = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  font-weight: ${({ theme }) => theme.font.weight.medium};

  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(7)};
  justify-content: space-between;
  min-width: ${({ theme }) => theme.spacing(7)};
  flex-grow: 1;
  width: 100%;
`;

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

const StyledValueContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 0;
  gap: 4px;
  height: 32px;
  justify-content: flex-end;
  padding: 8px;
`;

const StyledLabel = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
`;

const StyledValue = styled.div`
  color: ${({ theme }) => theme.color.gray60};
  flex: 1 0 0;
`;

const StyledIcon = styled(IconChevronDown)`
  align-items: center;
  display: flex;
  height: 20px;
  justify-content: center;
  flex-grow: 0;
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

export const RecordTableColumnAggregateFooterValue = ({
  dropdownId,
  aggregateValue,
  aggregateLabel,
  isFirstCell,
}: {
  dropdownId: string;
  isFirstCell: boolean;
  aggregateValue?: string | number | null;
  aggregateLabel?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const sanitizedId = `tooltip-${dropdownId.replace(/[^a-zA-Z0-9-_]/g, '-')}`;
  const theme = useTheme();
  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <StyledCell>
        {isHovered || isDefined(aggregateValue) || isFirstCell ? (
          <>
            {isDefined(aggregateValue) ? (
              <StyledValueContainer>
                <StyledLabel>{aggregateLabel}</StyledLabel>
                <StyledValue>{aggregateValue}</StyledValue>
              </StyledValueContainer>
            ) : (
              <StyledText id={sanitizedId}>Calculate</StyledText>
            )}
            <StyledIcon fontWeight={'light'} size={theme.icon.size.sm} />
          </>
        ) : (
          <></>
        )}
      </StyledCell>
    </div>
  );
};
