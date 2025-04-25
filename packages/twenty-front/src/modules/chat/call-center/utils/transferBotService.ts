import { SendEventMessageInput } from '@/chat/call-center/types/SendMessage';
import { MessageEventType } from '@/chat/types/MessageEventType';
import { MessageType } from '@/chat/types/MessageType';
import { statusEnum } from '@/chat/types/WhatsappDocument';
import { Sector } from '@/settings/service-center/sectors/types/Sector';

export const transferBotService = (
  integrationId: string,
  phone: string,
  chosenSector: string,
  currentStatus: statusEnum,
  sendWhatsappEventMessage: (input: SendEventMessageInput) => void,
  sectors: Sector[],
  chatbotName: string,
) => {
  const sector = sectors.find(
    (s: Sector) => s.id === chosenSector || s.name === chosenSector,
  );
  if (!sector) return;

  const today = new Date();

  sendWhatsappEventMessage({
    sector: { id: sector.id, name: sector.name },
    eventStatus: MessageType.TRANSFER,
    status: currentStatus,
    from: chatbotName,
    integrationId,
    to: phone,
    type: MessageType.TRANSFER,
    message: `${chatbotName} ${MessageEventType.TRANSFER} ${sector.name} (${today.toISOString().split('T')[0].replaceAll('-', '/')} - ${today.getHours()}:${(today.getMinutes() < 10 ? '0' : '') + today.getMinutes()})`,
  });
};
