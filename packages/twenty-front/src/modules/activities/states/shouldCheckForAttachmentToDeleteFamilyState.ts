import { createState } from 'twenty-ui/utilities';

export const isActivityAttachmentDeletionCheckNeededState =
  createState<boolean>({
    key: 'isActivityAttachmentDeletionCheckNeededState',
    defaultValue: false,
  });
