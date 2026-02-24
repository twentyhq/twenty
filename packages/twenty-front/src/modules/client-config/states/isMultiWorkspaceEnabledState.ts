import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const isMultiWorkspaceEnabledState = createState<boolean>({
  key: 'isMultiWorkspaceEnabled',
  defaultValue: false,
});
