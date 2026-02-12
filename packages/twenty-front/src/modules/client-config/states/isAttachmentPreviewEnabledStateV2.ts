import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isAttachmentPreviewEnabledStateV2 = createStateV2<boolean>({
  key: 'isAttachmentPreviewEnabledStateV2',
  defaultValue: false,
});
