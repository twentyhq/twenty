import { createContext } from 'react';

import { RecoilScopeContext } from '@/types/RecoilScopeContext';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { BoardFieldDefinition } from '@/ui/object/record-board/types/BoardFieldDefinition';

export const BoardContext = createContext<{
  BoardRecoilScopeContext: RecoilScopeContext;
  onFieldsChange: (fields: BoardFieldDefinition<FieldMetadata>[]) => void;
}>({
  BoardRecoilScopeContext: createContext<string | null>(null),
  onFieldsChange: () => {},
});
