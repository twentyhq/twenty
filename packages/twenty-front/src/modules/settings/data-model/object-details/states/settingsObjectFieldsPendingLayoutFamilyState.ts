import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export type PendingViewFieldLayout = {
  position?: number;
  isVisible?: boolean;
};

export type SettingsObjectFieldsPendingLayoutFamilyStateKey = {
  objectMetadataItemId: string;
};

export const settingsObjectFieldsPendingLayoutFamilyState =
  createAtomFamilyState<
    Map<string, PendingViewFieldLayout>,
    SettingsObjectFieldsPendingLayoutFamilyStateKey
  >({
    key: 'settingsObjectFieldsPendingLayoutFamilyState',
    defaultValue: new Map(),
  });
