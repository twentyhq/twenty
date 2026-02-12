import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const qrCodeState = createStateV2<string | null>({
  key: 'qrCodeState',
  defaultValue: null,
});
