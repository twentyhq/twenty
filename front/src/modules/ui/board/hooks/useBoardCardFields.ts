import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

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
    field: ViewFieldDefinition<ViewFieldMetadata>,
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
