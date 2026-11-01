import { useUpdateObjectViewOptions } from '@/object-record/object-options-dropdown/hooks/useUpdateObjectViewOptions';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useEffect } from 'react';
import { Key } from 'ts-key-enum';
import { useDebouncedCallback } from 'use-debounce';

export const useDebouncedSetAndPersistViewName = ({
  focusId,
}: {
  focusId: string;
}) => {
  const { setAndPersistViewName } = useUpdateObjectViewOptions();

  const debouncedSetAndPersistViewName = useDebouncedCallback(
    (viewName: string) => {
      setAndPersistViewName(viewName);
    },
    500,
  );

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: () => {
      debouncedSetAndPersistViewName.flush();
    },
    focusId,
    dependencies: [debouncedSetAndPersistViewName],
  });

  // Closing the dropdown unmounts the input, and use-debounce drops a
  // pending call on unmount
  useEffect(
    () => () => {
      debouncedSetAndPersistViewName.flush();
    },
    [debouncedSetAndPersistViewName],
  );

  return { debouncedSetAndPersistViewName };
};
