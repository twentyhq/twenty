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
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
`;

const StyledNewLabelCell = styled.span`
  display: flex;
  min-width: 0;
  padding-inline-start: ${themeCssVariables.spacing[2]};
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
    <Chip
      variant="soft"
      shape="round"
      size="md"
      color="secondary"
      weight="medium"
      padding="md"
    >
      {dayLabel}
    </Chip>
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
          {''}
        </LabeledSeparator>
        {dayChip}
        <StyledNewLabelCell>
          <LabeledSeparator labelPosition="end" tone="danger" aria-hidden>
            {newLabel}
          </LabeledSeparator>
        </StyledNewLabelCell>
      </StyledNewDaySeparator>
    );
  }

  return (
    <StyledDaySeparator role="separator" aria-label={dayLabel}>
      {dayChip}
    </StyledDaySeparator>
  );
};
