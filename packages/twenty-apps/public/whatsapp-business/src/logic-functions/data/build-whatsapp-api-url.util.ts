import { WHATSAPP_API_BASE_URL } from 'src/constants/whatsapp-api-base-url.constant';
import { WHATSAPP_API_VERSION } from 'src/constants/whatsapp-api-version.constant';

export const buildWhatsAppApiUrl = (path: string) =>
  `${WHATSAPP_API_BASE_URL}/${WHATSAPP_API_VERSION}/${path}`;
