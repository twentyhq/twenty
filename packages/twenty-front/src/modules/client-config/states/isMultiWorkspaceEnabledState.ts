import { createState } from 'twenty-ui';

export const isMultiWorkspaceEnabledState = createState<boolean>({
  key: 'isMultiworkspaceEnabled',
  defaultValue: true,
});
