import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const onRecordBoardFetchMoreVisibilityChangeComponentState =
  createComponentState<(visbility: boolean) => void>({
    key: 'onRecordBoardFetchMoreVisibilityChangeComponentState',
    defaultValue: () => {},
  });
