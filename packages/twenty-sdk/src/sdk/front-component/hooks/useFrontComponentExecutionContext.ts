import { useEffect, useRef, useState } from 'react';
import {
  getFrontComponentExecutionContext,
  subscribeToFrontComponentExecutionContext,
  unsubscribeFromFrontComponentExecutionContext,
} from '../context/frontComponentContext';
import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { isContextValueEqual } from '../utils/isContextValueEqual';

export const useFrontComponentExecutionContext = <T>(
  selector: (context: FrontComponentExecutionContext) => T,
): T => {
  const [currentSelectedValue, setCurrentSelectedValue] = useState(() =>
    selector(getFrontComponentExecutionContext()),
  );

  const previousSelectedValueRef = useRef(currentSelectedValue);

  useEffect(() => {
    const onContextChange = () => {
      const newSelectedValue = selector(getFrontComponentExecutionContext());

      const hasSelectedValueChanged = !isContextValueEqual({
        previousValue: previousSelectedValueRef.current,
        nextValue: newSelectedValue,
      });

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
