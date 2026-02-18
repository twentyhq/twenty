import { useEffect, useRef } from 'react';

export type ActionProps = {
  execute: () => void | Promise<void>;
};

export const Action = ({ execute }: ActionProps) => {
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) {
      return;
    }
    hasExecutedRef.current = true;
    execute();
  }, [execute]);

  return null;
};
