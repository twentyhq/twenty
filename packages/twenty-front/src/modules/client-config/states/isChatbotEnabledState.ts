import { createState } from 'twenty-ui/utilities';
export const isChatbotEnabledState = createState<boolean>({
  key: 'isChatbotEnabledState',
  defaultValue: false,
});
