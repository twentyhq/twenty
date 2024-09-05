import { useEffect, useRef } from 'react';

export const useFocus = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  });
  return { inputRef };
};
