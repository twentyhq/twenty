import { createState } from 'twenty-ui';

export const isAttachmentPreviewEnabledState = createState<boolean>({
  key: 'isAttachmentPreviewEnabled',
  defaultValue: false,
});
