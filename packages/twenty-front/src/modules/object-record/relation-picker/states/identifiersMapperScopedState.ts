import { IdentifiersMapper } from '@/object-record/relation-picker/types/IdentifiersMapper';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const identifiersMapperScopedState =
  createScopedState<IdentifiersMapper | null>({
    key: 'identifiersMapperScopedState',
    defaultValue: null,
  });
