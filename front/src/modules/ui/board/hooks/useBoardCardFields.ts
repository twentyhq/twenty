import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { ViewFieldDefinition } from '@/views/types/ViewFieldDefinition';

import { boardCardFieldsScopedState } from '../states/boardCardFieldsScopedState';
import { boardCardFieldsByKeyScopedSelector } from '../states/selectors/boardCardFieldsByKeyScopedSelector';

import { useBoardContext } from './useBoardContext';

export const useBoardCardFields = () => {
  const { BoardRecoilScopeContext } = useBoardContext();

  const [boardCardFields, setBoardCardFields] = useRecoilScopedState(
    boardCardFieldsScopedState,
    BoardRecoilScopeContext,
  );
  const boardCardFieldsByKey = useRecoilScopedValue(
    boardCardFieldsByKeyScopedSelector,
    BoardRecoilScopeContext,
  );

  const handleFieldVisibilityChange = (
    field: ViewFieldDefinition<FieldMetadata>,
  ) => {
    const nextFields = boardCardFieldsByKey[field.key]
      ? boardCardFields.map((previousField) =>
          previousField.key === field.key
            ? { ...previousField, isVisible: !field.isVisible }
            : previousField,
        )
      : [...boardCardFields, { ...field, isVisible: true }];

    setBoardCardFields(nextFields);
  };

  return { handleFieldVisibilityChange };
};
