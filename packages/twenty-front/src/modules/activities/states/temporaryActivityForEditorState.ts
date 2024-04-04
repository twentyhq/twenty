import { createState } from 'twenty-ui';

import { ActivityForEditor } from '@/activities/types/ActivityForEditor';

export const temporaryActivityForEditorState =
  createState<ActivityForEditor | null>({
    key: 'temporaryActivityForEditorState',
    defaultValue: null,
  });
