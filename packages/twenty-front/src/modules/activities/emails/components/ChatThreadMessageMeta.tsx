import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { formatInTimeZone } from 'date-fns-tz';
import { isDefined } from 'twenty-shared/utils';

import { ChatThreadMessageDeliveryStatusIcon } from '@/activities/emails/components/ChatThreadMessageDeliveryStatusIcon';
import { type ChatMessageDeliveryStatus } from '@/activities/emails/types/ChatMessageDeliveryStatus';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { themeCssVariables } from 'twenty-ui/theme';

// Floating keeps the time on the last text line when it fits, like chat apps do
const StyledMeta = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: inline-flex;
  float: right;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  margin-left: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

type ChatThreadMessageMetaProps = {
  receivedAt?: string | null;
  deliveryStatus?: ChatMessageDeliveryStatus | null;
};

export const ChatThreadMessageMeta = ({
  receivedAt,
  deliveryStatus,
}: ChatThreadMessageMetaProps) => {
  const { timeZone, timeFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  if (!isNonEmptyString(receivedAt) && !isDefined(deliveryStatus)) {
    return null;
  }

  return (
    <StyledMeta>
      {isNonEmptyString(receivedAt) &&
        formatInTimeZone(new Date(receivedAt), timeZone, timeFormat, {
          locale: localeCatalog,
        })}
      {isDefined(deliveryStatus) && (
        <ChatThreadMessageDeliveryStatusIcon deliveryStatus={deliveryStatus} />
      )}
    </StyledMeta>
  );
};
