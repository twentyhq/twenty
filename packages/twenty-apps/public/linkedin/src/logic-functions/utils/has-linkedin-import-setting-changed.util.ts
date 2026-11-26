import { type LinkedinSettings } from 'src/types/linkedin-settings.type';

type LinkedinImportSettings = Pick<
  LinkedinSettings,
  | 'importPolicy'
  | 'selectedChats'
  | 'contactAutoCreationPolicy'
  | 'isNameMatchingEnabled'
>;

const getSelectedChatIds = ({
  selectedChats,
}: Pick<LinkedinSettings, 'selectedChats'>): string =>
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
  previous.contactAutoCreationPolicy !== next.contactAutoCreationPolicy ||
  previous.isNameMatchingEnabled !== next.isNameMatchingEnabled ||
  getSelectedChatIds(previous) !== getSelectedChatIds(next);
