import { useEffect, useState } from 'react';

import { unmountFrontComponent } from '../front-component-api';

export type ActionProps = {
  execute: () => void | Promise<void>;
};

export const Action = ({ execute }: ActionProps) => {
  const [hasExecuted, setHasExecuted] = useState(false);

  useEffect(() => {
    if (hasExecuted) {
      return;
    }

    setHasExecuted(true);

    const run = async () => {
      try {
        await execute();
      } finally {
        await unmountFrontComponent();
      }
    };

    run();
  }, [execute, hasExecuted]);

  return null;
};
