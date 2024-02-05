import { atom } from 'recoil';

import { ActivityForEditor } from '@/activities/types/ActivityForEditor';

export const temporaryActivityForEditorState = atom<ActivityForEditor | null>({
  key: 'temporaryActivityForEditorState',
  default: null,
});
