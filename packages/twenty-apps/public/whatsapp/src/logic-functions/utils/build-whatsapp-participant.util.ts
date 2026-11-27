import { type IngestMessageParticipant } from 'twenty-sdk/logic-function';

import { type WhatsappCounterpart } from 'src/logic-functions/types/whatsapp-counterpart.type';
import { getWhatsappUserName } from 'src/logic-functions/utils/get-whatsapp-user-name.util';

export const buildWhatsappParticipant = ({
  role,
  counterpart: { user, handle },
}: {
  role: IngestMessageParticipant['role'];
  counterpart: WhatsappCounterpart;
}): IngestMessageParticipant => ({
  role,
  handle,
  displayName: getWhatsappUserName(user) || undefined,
});
