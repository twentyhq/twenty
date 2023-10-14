import { ViewFieldForVisibility } from '@/ui/data/view-bar/types/ViewFieldForVisibility';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { boardCardFieldsScopedState } from '../states/boardCardFieldsScopedState';

import { useBoardContext } from './useBoardContext';

export const useBoardCardFields = () => {
  const { BoardRecoilScopeContext } = useBoardContext();

  const [, setBoardCardFields] = useRecoilScopedState(
    boardCardFieldsScopedState,
    BoardRecoilScopeContext,
  );

  const handleFieldVisibilityChange = (field: ViewFieldForVisibility) => {
    setBoardCardFields((previousFields) =>
      previousFields.map((previousField) =>
        previousField.key === field.key
          ? { ...previousField, isVisible: !field.isVisible }
          : previousField,
      ),
    );
  };

  return { handleFieldVisibilityChange };
};
