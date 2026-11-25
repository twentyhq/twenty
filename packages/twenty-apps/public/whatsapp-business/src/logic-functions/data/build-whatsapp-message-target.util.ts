import { isBusinessScopedUserId } from 'src/logic-functions/data/is-business-scoped-user-id.util';

const PHONE_NUMBER_PATTERN = /^\d+$/;

export const buildWhatsAppMessageTarget = (
  threadExternalId: string,
): { recipient_type: 'individual' | 'group'; to: string } | { recipient_type: 'individual'; recipient: string } => {
  if (isBusinessScopedUserId(threadExternalId)) {
    return { recipient_type: 'individual', recipient: threadExternalId };
  }

  return {
    recipient_type: PHONE_NUMBER_PATTERN.test(threadExternalId) ? 'individual' : 'group',
    to: threadExternalId,
  };
};
