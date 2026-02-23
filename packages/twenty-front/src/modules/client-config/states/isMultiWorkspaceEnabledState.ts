import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isMultiWorkspaceEnabledState = createStateV2<boolean>({
  key: 'isMultiWorkspaceEnabled',
  defaultValue: false,
});
