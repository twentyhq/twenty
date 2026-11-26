import { type LinkedinSettings } from 'src/types/linkedin-settings.type';

export const hasLinkedinHistoryToImport = ({
  importPolicy,
  selectedChats,
}: Pick<LinkedinSettings, 'importPolicy' | 'selectedChats'>): boolean =>
  importPolicy !== 'SELECTED' || selectedChats.length > 0;
