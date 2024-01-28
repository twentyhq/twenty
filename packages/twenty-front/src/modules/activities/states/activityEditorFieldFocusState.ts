import { atom } from 'recoil';

export const activityEditorAnyFieldInFocusState = atom<boolean>({
  key: 'activities/any-field-focus-state',
  default: false,
});
