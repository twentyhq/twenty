import { ActivityForEditor } from '@/activities/types/ActivityForEditor';
import { createState } from '@/ui/utilities/state/utils/createState';

export const temporaryActivityForEditorState =
  createState<ActivityForEditor | null>({
    key: 'temporaryActivityForEditorState',
    defaultValue: null,
  });
