import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordBoardColumnIdsComponentState = createComponentState<
  string[]
>({
  key: 'recordBoardColumnIdsComponentState',
  defaultValue: [],
});
