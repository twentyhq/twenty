import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isAttachmentPreviewEnabledState = createStateV2<boolean>({
  key: 'isAttachmentPreviewEnabled',
  defaultValue: false,
});
