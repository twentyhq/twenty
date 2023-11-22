import { createContext } from 'react';

import { RecoilScopeContext } from '@/types/RecoilScopeContext';
import { BoardFieldDefinition } from '@/ui/layout/board/types/BoardFieldDefinition';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';

export const BoardContext = createContext<{
  BoardRecoilScopeContext: RecoilScopeContext;
  onFieldsChange: (fields: BoardFieldDefinition<FieldMetadata>[]) => void;
}>({
  BoardRecoilScopeContext: createContext<string | null>(null),
  onFieldsChange: () => {},
});
