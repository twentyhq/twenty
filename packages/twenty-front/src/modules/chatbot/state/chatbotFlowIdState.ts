import { createState } from 'twenty-ui/utilities';
export const chatbotFlowIdState = createState<string | undefined>({
  key: 'chatbotFlowIdState',
  defaultValue: undefined,
});
