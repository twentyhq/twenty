import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isAttachmentPreviewEnabledState = createAtomState<boolean>({
  key: 'isAttachmentPreviewEnabled',
  defaultValue: false,
});
