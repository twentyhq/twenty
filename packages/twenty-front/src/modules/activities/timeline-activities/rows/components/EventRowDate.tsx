import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

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
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const showTooltipAfterDelay = useDebouncedCallback(
    () => setIsTooltipVisible(true),
    TOOLTIP_SHOW_DELAY_IN_MS,
  );

  const instanceId = useId();
  const dateElementId = `event-row-date-${instanceId.replace(/[^a-zA-Z0-9-_]/g, '-')}`;

  const handleHideTooltip = () => {
    showTooltipAfterDelay.cancel();
    setIsTooltipVisible(false);
  };

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
        onMouseEnter={showTooltipAfterDelay}
        onMouseLeave={handleHideTooltip}
        onFocus={showTooltipAfterDelay}
        onBlur={handleHideTooltip}
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
