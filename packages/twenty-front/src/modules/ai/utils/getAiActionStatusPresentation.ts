import { t } from '@lingui/core/macro';
import { type SetuAiActionProjection } from 'twenty-shared/ai';
import { type ThemeColor } from 'twenty-ui/theme';

import { getAiActionErrorMessage } from '@/ai/utils/getAiActionErrorMessage';

// What the card says about an action's state. A succeeded email means the
// provider accepted it, never that it was delivered or answered.
export const getAiActionStatusPresentation = (
  action: SetuAiActionProjection,
): { label: string; color: ThemeColor; description: string } => {
  const isEmail = action.kind === 'send_email';

  switch (action.status) {
    case 'pending_review':
      return {
        label: t`Review needed`,
        color: 'orange',
        description: isEmail
          ? t`Ready for review. Nothing has been queued or sent.`
          : t`Ready for review. Nothing has changed yet.`,
      };
    case 'queued':
      return {
        label: t`Approved`,
        color: 'blue',
        description: t`Approved and queued. You can still cancel or edit it until it starts.`,
      };
    case 'running':
      return {
        label: t`Running`,
        color: 'blue',
        description: isEmail ? t`Sending now…` : t`Applying the change…`,
      };
    case 'succeeded':
      return {
        label: isEmail ? t`Accepted by provider` : t`Applied`,
        color: 'green',
        description: action.receipt?.summary ?? t`Done.`,
      };
    case 'delivery_unknown':
      return {
        label: t`Outcome unknown`,
        color: 'amber',
        description: t`The email provider may have accepted this message. It will not be retried automatically; check your Sent folder before sending it again.`,
      };
    case 'failed':
      return {
        label: t`Failed`,
        color: 'red',
        description: `${getAiActionErrorMessage(action.errorCode)} ${isEmail ? t`The email was not sent.` : t`Nothing was changed.`}`,
      };
    case 'blocked':
      return {
        label: t`Blocked`,
        color: 'red',
        description: getAiActionErrorMessage(action.errorCode),
      };
    case 'cancelled':
      return {
        label: t`Cancelled`,
        color: 'gray',
        description: t`Cancelled before it ran. Nothing was sent or changed.`,
      };
    case 'rejected':
      return {
        label: t`Rejected`,
        color: 'gray',
        description: t`Rejected. Nothing was sent or changed.`,
      };
    case 'expired':
      return {
        label: t`Expired`,
        color: 'gray',
        description: getAiActionErrorMessage('APPROVAL_EXPIRED'),
      };
    case 'superseded':
      return {
        label: t`Replaced`,
        color: 'gray',
        description: t`A newer version replaced this one.`,
      };
  }
};
