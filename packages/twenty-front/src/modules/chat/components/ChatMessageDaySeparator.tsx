import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
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

const StyledNewDaySeparator = styled(StyledDaySeparator)`
  align-items: center;
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
`;

const StyledNewRule = styled.span`
  align-items: center;
  display: flex;
  min-width: 0;
`;

const StyledNewMarker = styled.span`
  background: ${themeCssVariables.font.color.danger};
  border-radius: 1px;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[1]};
  width: ${themeCssVariables.spacing[1]};
`;

const StyledNewLine = styled.span`
  background: ${themeCssVariables.font.color.danger};
  flex: 1;
  height: 1.5px;
  min-width: 0;
`;

const StyledNewLabel = styled.span`
  color: ${themeCssVariables.tag.text.red};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: ${themeCssVariables.spacing[4]};
  margin-inline-start: ${themeCssVariables.spacing[2]};
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
  isFirstUnread?: boolean;
};

export const ChatMessageDaySeparator = ({
  date,
  isFirstUnread = false,
}: ChatMessageDaySeparatorProps) => {
  const { t } = useLingui();
  const { timeZone, dateFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const dayLabel = getChatMessageDayLabel({
    date,
    timeZone,
    dateFormat,
    localeCatalog,
  });

  if (isFirstUnread) {
    const newLabel = t`New`;

    return (
      <StyledNewDaySeparator
        role="separator"
        aria-label={`${dayLabel}, ${newLabel}`}
      >
        <StyledNewRule aria-hidden>
          <StyledNewMarker />
          <StyledNewLine />
        </StyledNewRule>
        <StyledDayLabel>{dayLabel}</StyledDayLabel>
        <StyledNewRule>
          <StyledNewLine aria-hidden />
          <StyledNewLabel>{newLabel}</StyledNewLabel>
        </StyledNewRule>
      </StyledNewDaySeparator>
    );
  }

  return (
    <StyledDaySeparator role="separator" aria-label={dayLabel}>
      <StyledDayLabel>{dayLabel}</StyledDayLabel>
    </StyledDaySeparator>
  );
};
