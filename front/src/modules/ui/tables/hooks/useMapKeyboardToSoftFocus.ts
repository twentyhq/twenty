import { useEffect } from 'react';
import { useHotkeys, useHotkeysContext } from 'react-hotkeys-hook';

import { useMoveSoftFocus } from './useMoveSoftFocus';

export function useMapKeyboardToSoftFocus() {
  const { enableScope } = useHotkeysContext();

  useEffect(() => {
    enableScope('entity-table');
  }, [enableScope]);

  const { moveDown, moveLeft, moveRight, moveUp } = useMoveSoftFocus();

  useHotkeys(
    'up',
    () => {
      moveUp();
    },
    [moveUp],
    {
      preventDefault: true,
      enableOnContentEditable: true,
      enableOnFormTags: true,
      scopes: 'entity-table',
    },
  );

  useHotkeys(
    'down',
    () => {
      moveDown();
    },
    [moveDown],
    {
      preventDefault: true,
      enableOnContentEditable: true,
      enableOnFormTags: true,
      scopes: 'entity-table',
    },
  );

  useHotkeys(
    ['left', 'shift+tab'],
    () => {
      moveLeft();
    },
    [moveLeft],
    {
      preventDefault: true,
      enableOnContentEditable: true,
      enableOnFormTags: true,
      scopes: 'entity-table',
    },
  );

  useHotkeys(
    ['right', 'tab'],
    (event) => {
      moveRight();
      console.log({ event });
    },
    [moveRight],
    {
      preventDefault: true,
      enableOnContentEditable: true,
      enableOnFormTags: true,
      scopes: 'entity-table',
    },
  );
}
