import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { LabeledSeparator } from 'twenty-ui/components/layout';
import { Chip } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { getChatMessageDayLabel } from '@/chat/utils/getChatMessageDayLabel';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledDaySeparator = styled.div`
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  justify-content: center;
  margin-block: ${themeCssVariables.spacing[4]};

  &:first-child {
    margin-top: 0;
  }
`;

const StyledNewDaySeparator = styled(StyledDaySeparator)`
  align-items: center;
  min-height: ${themeCssVariables.spacing[6]};
  position: relative;
`;

const StyledDayChip = styled.span`
  display: flex;

  & > * {
    --tw-chip-padding-end: ${themeCssVariables.spacing[2]};
    --tw-chip-padding-start: ${themeCssVariables.spacing[2]};
  }
`;

const StyledCenteredDayChip = styled.span`
  background: ${themeCssVariables.background.primary};
  left: 50%;
  padding-inline: ${themeCssVariables.spacing[2]};
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
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
  const dayChip = (
    <StyledDayChip>
      <Chip
        variant="soft"
        shape="round"
        size="md"
        color="secondary"
        weight="medium"
      >
        {dayLabel}
      </Chip>
    </StyledDayChip>
  );

  if (isFirstUnread) {
    const newLabel = t`New`;

    return (
      <StyledNewDaySeparator
        role="separator"
        aria-label={`${dayLabel}, ${newLabel}`}
      >
        <LabeledSeparator
          labelPosition="end"
          tone="danger"
          hasStartMarker
          aria-hidden
        >
          {newLabel}
        </LabeledSeparator>
        <StyledCenteredDayChip>{dayChip}</StyledCenteredDayChip>
      </StyledNewDaySeparator>
    );
  }

  return (
    <StyledDaySeparator role="separator" aria-label={dayLabel}>
      {dayChip}
    </StyledDaySeparator>
  );
};
