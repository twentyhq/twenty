import { createState } from 'twenty-ui';

export const isMultiWorkspaceEnabledState = createState<boolean>({
  key: 'isMultiWorkspaceEnabled',
  defaultValue: false,
});
