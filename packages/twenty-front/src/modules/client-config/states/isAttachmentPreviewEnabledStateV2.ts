import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isAttachmentPreviewEnabledStateV2 = createAtomState<boolean>({
  key: 'isAttachmentPreviewEnabledStateV2',
  defaultValue: false,
});
