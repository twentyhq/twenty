import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isAttachmentPreviewEnabledStateV2 = createState<boolean>({
  key: 'isAttachmentPreviewEnabledStateV2',
  defaultValue: false,
});
