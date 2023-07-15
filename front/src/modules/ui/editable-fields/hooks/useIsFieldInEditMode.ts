import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { FieldContext } from '../states/FieldContext';
import { isFieldInEditModeScopedState } from '../states/isFieldInEditModeScopedState';

export function useIsFieldInEditMode() {
  const [isFieldInEditMode] = useRecoilScopedState(
    isFieldInEditModeScopedState,
    FieldContext,
  );

  return isFieldInEditMode;
}
