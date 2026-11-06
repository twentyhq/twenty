import { useLingui } from '@lingui/react/macro';

import { type ChatMessageDeliveryStatus } from '@/activities/emails/types/ChatMessageDeliveryStatus';
import { IconCheck, IconChecks, IconClock } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const DELIVERY_STATUS_ICON_SIZE = 14;

type ChatThreadMessageDeliveryStatusIconProps = {
  deliveryStatus: ChatMessageDeliveryStatus;
};

export const ChatThreadMessageDeliveryStatusIcon = ({
  deliveryStatus,
}: ChatThreadMessageDeliveryStatusIconProps) => {
  const { t } = useLingui();

  switch (deliveryStatus) {
    case 'SENDING':
      return (
        <IconClock aria-label={t`Sending`} size={DELIVERY_STATUS_ICON_SIZE} />
      );
    case 'SENT':
      return (
        <IconCheck aria-label={t`Sent`} size={DELIVERY_STATUS_ICON_SIZE} />
      );
    case 'DELIVERED':
      return (
        <IconChecks
          aria-label={t`Delivered`}
          size={DELIVERY_STATUS_ICON_SIZE}
        />
      );
    case 'READ':
      return (
        <IconChecks
          aria-label={t`Read`}
          color={themeCssVariables.color.blue}
          size={DELIVERY_STATUS_ICON_SIZE}
        />
      );
  }
};
