import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const onRecordBoardFetchMoreVisibilityChangeStateScopeMap =
  createStateScopeMap<(visbility: boolean) => void>({
    key: 'onRecordBoardFetchMoreVisibilityChangeStateScopeMap',
    defaultValue: () => {},
  });
