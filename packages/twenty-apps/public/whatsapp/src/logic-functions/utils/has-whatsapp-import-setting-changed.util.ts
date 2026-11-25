import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';

type WhatsappImportSettings = Pick<
  WhatsappSettings,
  | 'importPolicy'
  | 'selectedChats'
  | 'areGroupChatsImported'
  | 'contactAutoCreationPolicy'
>;

const getSelectedChatIds = ({
  selectedChats,
}: WhatsappImportSettings): string =>
  selectedChats
    .map(({ id }) => id)
    .sort()
    .join(',');

export const hasWhatsappImportSettingChanged = ({
  previous,
  next,
}: {
  previous: WhatsappImportSettings;
  next: WhatsappImportSettings;
}): boolean =>
  previous.importPolicy !== next.importPolicy ||
  previous.areGroupChatsImported !== next.areGroupChatsImported ||
  previous.contactAutoCreationPolicy !== next.contactAutoCreationPolicy ||
  getSelectedChatIds(previous) !== getSelectedChatIds(next);
