import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type SettingsTranslationsSidePanelTarget = {
  metadataName: 'objectMetadata' | 'fieldMetadata';
  recordId: string;
  objectMetadataId?: string;
  label: string;
};

export const settingsTranslationsSidePanelTargetState =
  createAtomState<SettingsTranslationsSidePanelTarget | null>({
    key: 'settings/translations/settingsTranslationsSidePanelTargetState',
    defaultValue: null,
  });
