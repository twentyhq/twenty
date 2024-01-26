import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const recordBoardObjectMetadataSingularNameStateScopeMap =
  createStateScopeMap<string | undefined>({
    key: 'recordBoardObjectMetadataSingularNameStateScopeMap',
    defaultValue: undefined,
  });
