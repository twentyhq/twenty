import { useEffect, useRef } from 'react';

import { unmountFrontComponent } from '../front-component-api';

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

    const run = async () => {
      try {
        await execute();
      } finally {
        await unmountFrontComponent();
      }
    };

    run();
  }, [execute]);

  return null;
};
