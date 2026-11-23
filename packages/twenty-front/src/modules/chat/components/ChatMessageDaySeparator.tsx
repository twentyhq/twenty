import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { getChatMessageDayLabel } from '@/chat/utils/getChatMessageDayLabel';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledDaySeparator = styled.div`
  display: flex;
  justify-content: center;
  margin-block: ${themeCssVariables.spacing[4]};

  &:first-child {
    margin-top: 0;
  }
`;

const StyledDayLabel = styled.span`
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.secondary};
  corner-shape: round;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: ${themeCssVariables.spacing[6]};
  padding-inline: ${themeCssVariables.spacing[2]};
  user-select: none;
`;

type ChatMessageDaySeparatorProps = {
  date: Date | string;
};

export const ChatMessageDaySeparator = ({
  date,
}: ChatMessageDaySeparatorProps) => {
  const { timeZone, dateFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const dayLabel = getChatMessageDayLabel({
    date,
    timeZone,
    dateFormat,
    localeCatalog,
  });

  return (
    <StyledDaySeparator role="separator" aria-label={dayLabel}>
      <StyledDayLabel>{dayLabel}</StyledDayLabel>
    </StyledDaySeparator>
  );
};
