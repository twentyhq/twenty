import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme';

import { type LinkedinImportRange } from 'src/types/linkedin-import-range.type';

const StyledCardMedia = styled.div`
  background-color: ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: 40px;
  padding: 2px;
  width: 32px;
`;

const StyledCardMediaContent = styled.div`
  background-color: ${() => themeCssVariables.background.secondary};
  border-radius: ${() => themeCssVariables.border.radius.xs};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  justify-content: center;
  padding: 3px 2px;
`;

const StyledBubble = styled.div<{ $isActive: boolean; $isOutgoing: boolean }>`
  align-self: ${({ $isOutgoing }) => ($isOutgoing ? 'flex-end' : 'flex-start')};
  background-color: ${({ $isActive }) =>
    $isActive
      ? themeCssVariables.accent.accent7
      : themeCssVariables.border.color.medium};
  border-radius: 2px;
  flex: 1 0 0;
  width: 70%;
`;

const BUBBLE_COUNT = 4;

// Older conversations sit higher, so wider ranges light up more bubbles from the bottom
const ACTIVE_BUBBLE_COUNT_BY_IMPORT_RANGE: Record<LinkedinImportRange, number> =
  {
    LAST_30_DAYS: 1,
    LAST_90_DAYS: 2,
    LAST_365_DAYS: 3,
    ALL: 4,
  };

type LinkedinImportRangeIconProps = {
  importRange: LinkedinImportRange;
};

export const LinkedinImportRangeIcon = ({
  importRange,
}: LinkedinImportRangeIconProps) => {
  const firstActiveBubbleIndex =
    BUBBLE_COUNT - ACTIVE_BUBBLE_COUNT_BY_IMPORT_RANGE[importRange];

  return (
    <StyledCardMedia>
      <StyledCardMediaContent>
        {Array.from({ length: BUBBLE_COUNT }, (_, index) => (
          <StyledBubble
            key={index}
            $isActive={index >= firstActiveBubbleIndex}
            $isOutgoing={index % 2 === 1}
          />
        ))}
      </StyledCardMediaContent>
    </StyledCardMedia>
  );
};
