import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const showHiddenGroupVariablesState = createStateV2<boolean>({
  key: 'showHiddenGroupVariablesState',
  defaultValue: false,
});
