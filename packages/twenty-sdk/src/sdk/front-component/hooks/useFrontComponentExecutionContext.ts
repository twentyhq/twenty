import { useEffect, useRef, useState } from 'react';

import {
  getFrontComponentExecutionContext,
  subscribeToFrontComponentExecutionContext,
  unsubscribeFromFrontComponentExecutionContext,
} from '../context/frontComponentContext';
import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { isShallowEqual } from '../utils/is-shallow-equal.util';

export type FrontComponentSelectorEqualityFn<T> = (
  previousValue: T,
  newValue: T,
) => boolean;

export const useFrontComponentExecutionContext = <T>(
  selector: (context: FrontComponentExecutionContext) => T,
  isEqual: FrontComponentSelectorEqualityFn<T> = isShallowEqual,
): T => {
  const selectorRef = useRef(selector);
  const isEqualRef = useRef(isEqual);

  selectorRef.current = selector;
  isEqualRef.current = isEqual;

  const [currentSelectedValue, setCurrentSelectedValue] = useState(() =>
    selector(getFrontComponentExecutionContext()),
  );

  const previousSelectedValueRef = useRef(currentSelectedValue);

  const latestSelectedValue = selector(getFrontComponentExecutionContext());

  if (!isEqual(previousSelectedValueRef.current, latestSelectedValue)) {
    previousSelectedValueRef.current = latestSelectedValue;
    setCurrentSelectedValue(latestSelectedValue);
  }

  useEffect(() => {
    const onContextChange = () => {
      const newSelectedValue = selectorRef.current(
        getFrontComponentExecutionContext(),
      );

      const hasSelectedValueChanged = !isEqualRef.current(
        previousSelectedValueRef.current,
        newSelectedValue,
      );

      if (hasSelectedValueChanged) {
        previousSelectedValueRef.current = newSelectedValue;
        setCurrentSelectedValue(newSelectedValue);
      }
    };

    subscribeToFrontComponentExecutionContext(onContextChange);

    return () => unsubscribeFromFrontComponentExecutionContext(onContextChange);
  }, []);

  return currentSelectedValue;
};
