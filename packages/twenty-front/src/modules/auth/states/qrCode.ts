import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const qrCodeState = createState<string | null>({
  key: 'qrCodeState',
  defaultValue: null,
});
