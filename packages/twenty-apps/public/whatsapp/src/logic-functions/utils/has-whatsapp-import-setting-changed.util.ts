import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';

type WhatsappImportSettings = Pick<
  WhatsappSettings,
  'importPolicy' | 'selectedChats' | 'contactAutoCreationPolicy'
>;

const getSelectedChatIds = ({
  selectedChats,
}: Pick<WhatsappSettings, 'selectedChats'>): string =>
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
  previous.contactAutoCreationPolicy !== next.contactAutoCreationPolicy ||
  getSelectedChatIds(previous) !== getSelectedChatIds(next);
