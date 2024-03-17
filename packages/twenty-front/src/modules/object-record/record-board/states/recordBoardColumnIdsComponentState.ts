import { createComponentState } from 'twenty-ui';

export const recordBoardColumnIdsComponentState = createComponentState<
  string[]
>({
  key: 'recordBoardColumnIdsComponentState',
  defaultValue: [],
});
