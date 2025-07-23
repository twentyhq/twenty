import { createState } from 'twenty-ui/utilities';

export const qrCodeState = createState<string | null>({
  key: 'qrCodeState',
  defaultValue: null,
});
