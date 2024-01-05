import { IdentifiersMapper } from '@/object-record/relation-picker/types/IdentifiersMapper';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const identifiersMapperScopedState =
  createStateScopeMap<IdentifiersMapper | null>({
    key: 'identifiersMapperScopedState',
    defaultValue: null,
  });
