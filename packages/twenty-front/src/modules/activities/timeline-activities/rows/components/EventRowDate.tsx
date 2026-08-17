import { styled } from '@linaria/react';
import { useId } from 'react';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { AppTooltip } from 'twenty-ui/surfaces';
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
  createdAt?: string;
};

export const EventRowDate = ({ createdAt }: EventRowDateProps) => {
  const { dateFormat, timeFormat, timeZone } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const instanceId = useId();
  const dateElementId = `event-row-date-${instanceId.replace(/[^a-zA-Z0-9-_]/g, '-')}`;

  if (!isDefined(createdAt) || createdAt === '') {
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
      <StyledEventRowDate id={dateElementId}>
        {relativeCreatedAt}
      </StyledEventRowDate>
      <AppTooltip
        anchorSelect={`#${dateElementId}`}
        content={exactCreatedAt}
        noArrow
        place="left"
      />
    </>
  );
};
