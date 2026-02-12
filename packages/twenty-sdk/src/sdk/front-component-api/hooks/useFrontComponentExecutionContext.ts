import { useEffect, useRef, useState } from 'react';
import {
  getFrontComponentExecutionContext,
  subscribeToFrontComponentExecutionContext,
  unsubscribeFromFrontComponentExecutionContext,
} from '../context/frontComponentContext';
import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';

export const useFrontComponentExecutionContext = <T>(
  selector: (context: FrontComponentExecutionContext | undefined) => T,
): T => {
  const [currentSelectedValue, setCurrentSelectedValue] = useState(() =>
    selector(getFrontComponentExecutionContext()),
  );

  const previousSelectedValueRef = useRef(currentSelectedValue);

  useEffect(() => {
    const onContextChange = () => {
      const newSelectedValue = selector(getFrontComponentExecutionContext());

      const hasSelectedValueChanged =
        newSelectedValue !== previousSelectedValueRef.current;

      if (hasSelectedValueChanged) {
        previousSelectedValueRef.current = newSelectedValue;
        setCurrentSelectedValue(newSelectedValue);
      }
    };

    subscribeToFrontComponentExecutionContext(onContextChange);

    onContextChange();

    return () => unsubscribeFromFrontComponentExecutionContext(onContextChange);
  }, [selector]);

  return currentSelectedValue;
};
