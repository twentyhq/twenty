import { type LinkedinSettings } from 'src/types/linkedin-settings.type';

type LinkedinImportSettings = Pick<
  LinkedinSettings,
  | 'importPolicy'
  | 'selectedChats'
  | 'areGroupChatsImported'
  | 'contactAutoCreationPolicy'
  | 'isNameMatchingEnabled'
>;

const getSelectedChatIds = ({
  selectedChats,
}: LinkedinImportSettings): string =>
  selectedChats
    .map(({ id }) => id)
    .sort()
    .join(',');

export const hasLinkedinImportSettingChanged = ({
  previous,
  next,
}: {
  previous: LinkedinImportSettings;
  next: LinkedinImportSettings;
}): boolean =>
  previous.importPolicy !== next.importPolicy ||
  previous.areGroupChatsImported !== next.areGroupChatsImported ||
  previous.contactAutoCreationPolicy !== next.contactAutoCreationPolicy ||
  previous.isNameMatchingEnabled !== next.isNameMatchingEnabled ||
  getSelectedChatIds(previous) !== getSelectedChatIds(next);
