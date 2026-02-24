import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const showHiddenGroupVariablesState = createState<boolean>({
  key: 'showHiddenGroupVariablesState',
  defaultValue: false,
});
