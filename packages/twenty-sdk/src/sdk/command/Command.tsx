import { useEffect, useState } from 'react';

import {
  unmountFrontComponent,
  useFrontComponentId,
} from '../front-component-api';

export type CommandProps = {
  execute: () => void | Promise<void>;
};

export const Command = ({ execute }: CommandProps) => {
  const [hasExecuted, setHasExecuted] = useState(false);

  const frontComponentId = useFrontComponentId();

  useEffect(() => {
    if (hasExecuted) {
      return;
    }

    setHasExecuted(true);

    const run = async () => {
      await execute();

      await unmountFrontComponent();
    };

    run();
  }, [execute, hasExecuted, frontComponentId]);

  return null;
};
