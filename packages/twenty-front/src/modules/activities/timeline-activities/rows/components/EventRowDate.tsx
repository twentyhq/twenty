import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

const StyledEventRowDate = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
  color: ${themeCssVariables.font.color.tertiary};
  padding: 0 ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

type EventRowDateProps = {
  happensAt?: string;
};

export const EventRowDate = ({ happensAt }: EventRowDateProps) => {
  const { dateFormat, timeFormat, timeZone } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const instanceId = useId();
  const dateElementId = `event-row-date-${instanceId.replace(/[^a-zA-Z0-9-_]/g, '-')}`;

  if (!isNonEmptyString(happensAt)) {
    return null;
  }

  const relativeHappensAt = beautifyPastDateRelativeToNow(
    happensAt,
    localeCatalog,
  );
  const exactHappensAt = formatDateTimeString({
    value: happensAt,
    timeZone,
    dateFormat,
    timeFormat,
    localeCatalog,
  });

  return (
    <>
      <StyledEventRowDate id={dateElementId} tabIndex={0}>
        {relativeHappensAt}
      </StyledEventRowDate>
      <AppTooltip
        anchorSelect={`#${dateElementId}`}
        content={exactHappensAt}
        delay={TooltipDelay.mediumDelay}
        noArrow
        place="left"
      />
    </>
  );
};
