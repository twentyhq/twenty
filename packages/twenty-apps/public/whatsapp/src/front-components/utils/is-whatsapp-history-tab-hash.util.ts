import { WHATSAPP_HISTORY_TAB_SLUG } from 'src/constants/whatsapp-history-tab-slug.constant';

export const isWhatsappHistoryTabHash = (hash: string | undefined): boolean =>
  hash?.replace('#', '').split('/')[0] === WHATSAPP_HISTORY_TAB_SLUG;
