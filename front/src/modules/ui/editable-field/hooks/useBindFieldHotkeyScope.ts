import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';

import { currentHotkeyScopeState } from '@/ui/hotkey/states/internal/currentHotkeyScopeState';
import { HotkeyScope } from '@/ui/hotkey/types/HotkeyScope';
import { isSameHotkeyScope } from '@/ui/hotkey/utils/isSameHotkeyScope';
import { useContextScopeId } from '@/ui/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';
import { getSnapshotScopedState } from '@/ui/recoil-scope/utils/getSnapshotScopedState';
import { getSnapshotState } from '@/ui/recoil-scope/utils/getSnapshotState';

import { customEditHotkeyScopeForFieldScopedState } from '../states/customEditHotkeyScopeForFieldScopedState';
import { FieldContext } from '../states/FieldContext';
import { parentHotkeyScopeForFieldScopedState } from '../states/parentHotkeyScopeForFieldScopedState';

export function useBindFieldHotkeyScope({
  customEditHotkeyScope,
  parentHotkeyScope,
}: {
  customEditHotkeyScope?: HotkeyScope;
  parentHotkeyScope?: HotkeyScope;
}) {
  const [customEditHotkeyScopeForField, setCustomEditHotkeyScopeForField] =
    useRecoilScopedState(
      customEditHotkeyScopeForFieldScopedState,
      FieldContext,
    );

  const fieldContextScopeId = useContextScopeId(FieldContext);

  useEffect(() => {
    if (
      customEditHotkeyScope &&
      !isSameHotkeyScope(customEditHotkeyScope, customEditHotkeyScopeForField)
    ) {
      setCustomEditHotkeyScopeForField(customEditHotkeyScope);
    }
  }, [
    customEditHotkeyScope,
    customEditHotkeyScopeForField,
    setCustomEditHotkeyScopeForField,
  ]);

  const setParentHotkeyScopeForField = useRecoilCallback(
    ({ snapshot, set }) =>
      (parentHotkeyScopeToSet: HotkeyScope | null | undefined) => {
        const currentHotkeyScope = getSnapshotState({
          snapshot,
          state: currentHotkeyScopeState,
        });

        const parentHotkeyScopeForField = getSnapshotScopedState({
          snapshot,
          state: parentHotkeyScopeForFieldScopedState,
          contextScopeId: fieldContextScopeId,
        });

        if (!parentHotkeyScopeToSet) {
          set(
            parentHotkeyScopeForFieldScopedState(fieldContextScopeId),
            currentHotkeyScope,
          );
        } else if (
          !isSameHotkeyScope(parentHotkeyScopeToSet, parentHotkeyScopeForField)
        ) {
          setParentHotkeyScopeForField(parentHotkeyScopeToSet);
        }
      },
    [fieldContextScopeId],
  );

  useEffect(() => {
    setParentHotkeyScopeForField(parentHotkeyScope);
  }, [parentHotkeyScope, setParentHotkeyScopeForField]);
}
