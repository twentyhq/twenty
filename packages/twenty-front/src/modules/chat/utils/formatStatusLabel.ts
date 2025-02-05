import { statusEnum } from '@/chat/types/WhatsappDocument';

export const formatStatusLabel = (status: statusEnum): string => {
  return status
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, (c) => c.toUpperCase());
};
