import { createState } from 'twenty-ui/utilities';

export const qrCodeState = createState<string>({
  key: 'qrCodeState',
  defaultValue: '',
});