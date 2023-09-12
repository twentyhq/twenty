import type { Context } from 'react';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { boardCardFieldsScopedState } from '../states/boardCardFieldsScopedState';
import { boardCardFieldsByKeyScopedSelector } from '../states/selectors/boardCardFieldsByKeyScopedSelector';

export const useBoardCardFields = ({
  scopeContext,
}: {
  scopeContext: Context<string | null>;
}) => {
  const [boardCardFields, setBoardCardFields] = useRecoilScopedState(
    boardCardFieldsScopedState,
    scopeContext,
  );
  const boardCardFieldsByKey = useRecoilScopedValue(
    boardCardFieldsByKeyScopedSelector,
    scopeContext,
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
