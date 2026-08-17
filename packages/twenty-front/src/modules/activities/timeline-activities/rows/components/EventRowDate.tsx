import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useId, useState } from 'react';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AppTooltip } from 'twenty-ui/surfaces';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

const TOOLTIP_SHOW_DELAY_IN_MS = 500;

const StyledEventRowDate = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
  color: ${themeCssVariables.font.color.tertiary};
  padding: 0 ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

type EventRowDateProps = {
  createdAt?: string;
};

export const EventRowDate = ({ createdAt }: EventRowDateProps) => {
  const { dateFormat, timeFormat, timeZone } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  // the tooltip is mounted only once the date has been hovered or focused for
  // a while, so a long timeline does not keep one tooltip observer per row
  const [isDateHighlighted, setIsDateHighlighted] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const instanceId = useId();
  const dateElementId = `event-row-date-${instanceId.replace(/[^a-zA-Z0-9-_]/g, '-')}`;

  useEffect(() => {
    if (!isDateHighlighted) {
      setIsTooltipVisible(false);
      return;
    }

    const showTooltipTimer = setTimeout(
      () => setIsTooltipVisible(true),
      TOOLTIP_SHOW_DELAY_IN_MS,
    );

    return () => clearTimeout(showTooltipTimer);
  }, [isDateHighlighted]);

  if (!isNonEmptyString(createdAt)) {
    return null;
  }

  const relativeCreatedAt = beautifyPastDateRelativeToNow(
    createdAt,
    localeCatalog,
  );
  const exactCreatedAt = formatDateTimeString({
    value: createdAt,
    timeZone,
    dateFormat,
    timeFormat,
    localeCatalog,
  });

  return (
    <>
      <StyledEventRowDate
        id={dateElementId}
        tabIndex={0}
        onMouseEnter={() => setIsDateHighlighted(true)}
        onMouseLeave={() => setIsDateHighlighted(false)}
        onFocus={() => setIsDateHighlighted(true)}
        onBlur={() => setIsDateHighlighted(false)}
      >
        {relativeCreatedAt}
      </StyledEventRowDate>
      {isTooltipVisible && (
        <AppTooltip
          anchorSelect={`#${dateElementId}`}
          content={exactCreatedAt}
          isOpen
          noArrow
          place="left"
        />
      )}
    </>
  );
};
