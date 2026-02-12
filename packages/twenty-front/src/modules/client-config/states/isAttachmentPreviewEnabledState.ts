import { createState } from '@/ui/utilities/state/utils/createState';
export const isAttachmentPreviewEnabledState = createState<boolean>({
  key: 'isAttachmentPreviewEnabled',
  defaultValue: false,
});
