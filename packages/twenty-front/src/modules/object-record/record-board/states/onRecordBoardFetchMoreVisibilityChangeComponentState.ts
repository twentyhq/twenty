import { createComponentState } from 'twenty-ui';

export const onRecordBoardFetchMoreVisibilityChangeComponentState =
  createComponentState<(visbility: boolean) => void>({
    key: 'onRecordBoardFetchMoreVisibilityChangeComponentState',
    defaultValue: () => {},
  });
