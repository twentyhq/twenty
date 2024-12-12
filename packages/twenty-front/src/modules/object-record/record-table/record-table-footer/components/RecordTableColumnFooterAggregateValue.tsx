import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import {
  AppTooltip,
  IconChevronDown,
  isDefined,
  TooltipDelay,
} from 'twenty-ui';

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

const StyledIcon = styled(IconChevronDown)`
  align-items: center;
  display: flex;
  height: 20px;
  justify-content: center;
  flex-grow: 0;
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

export const RecordTableColumnFooterAggregateValue = ({
  dropdownId,
  aggregateValue,
  aggregateLabel,
}: {
  dropdownId: string;
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
        {isHovered || isDefined(aggregateValue) ? (
          <>
            <StyledText id={sanitizedId}>
              {aggregateValue ?? 'Calculate'}
            </StyledText>
            <StyledIcon fontWeight={'light'} size={theme.icon.size.sm} />
            {aggregateValue && isDefined(aggregateLabel) && (
              <AppTooltip
                anchorSelect={`#${sanitizedId}`}
                content={aggregateLabel}
                noArrow
                place="top-start"
                positionStrategy="fixed"
                delay={TooltipDelay.shortDelay}
              />
            )}
          </>
        ) : (
          <></>
        )}
      </StyledCell>
    </div>
  );
};
