import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isConfigVariablesInDbEnabledState = createStateV2<boolean>({
  key: 'isConfigVariablesInDbEnabled',
  defaultValue: false,
});
