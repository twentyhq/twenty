import { createState } from "twenty-ui";

export const isMicrosoftMessagingEnabledState = createState<boolean>({
  key: 'isMicrosoftMessagingEnabled',
  defaultValue: false,
});
