import { createState } from '@/ui/utilities/state/utils/createState';

export const qrCodeState = createState<string | null>({
  key: 'qrCodeState',
  defaultValue: null,
});
