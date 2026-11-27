import { type IngestMessage } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type WhatsappCounterpart } from 'src/logic-functions/types/whatsapp-counterpart.type';
import { mapUnipileMessageToIngestMessage } from 'src/logic-functions/utils/map-unipile-message-to-ingest-message.util';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';

export const mapWhatsappMessages = ({
  messages,
  channelHandle,
  counterparts,
}: {
  messages: UnipileMessage[];
  channelHandle: string;
  counterparts: WhatsappCounterpart[];
}): { message: UnipileMessage; ingestMessage: IngestMessage }[] =>
  messages.flatMap((message) => {
    const ingestMessage = mapUnipileMessageToIngestMessage({
      message,
      channelHandle,
      counterparts,
    });

    return isDefined(ingestMessage) ? [{ message, ingestMessage }] : [];
  });
