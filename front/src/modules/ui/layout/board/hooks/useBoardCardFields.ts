import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { boardCardFieldsScopedState } from '../states/boardCardFieldsScopedState';

import { useBoardContext } from './useBoardContext';

export const useBoardCardFields = () => {
  const { BoardRecoilScopeContext } = useBoardContext();

  const [, setBoardCardFields] = useRecoilScopedState(
    boardCardFieldsScopedState,
    BoardRecoilScopeContext,
  );

  const handleFieldVisibilityChange = (
    field: Omit<ColumnDefinition<FieldMetadata>, 'size' | 'position'>,
  ) => {
    setBoardCardFields((previousFields) =>
      previousFields.map((previousField) =>
        previousField.fieldId === field.fieldId
          ? { ...previousField, isVisible: !field.isVisible }
          : previousField,
      ),
    );
  };

  return { handleFieldVisibilityChange };
};
