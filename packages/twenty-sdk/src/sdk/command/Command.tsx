import { useEffect, useState } from 'react';

import {
  enqueueSnackbar,
  getFrontComponentCommandErrorDedupeKey,
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
      try {
        await execute();
      } catch (error) {
        if (error instanceof Error) {
          await enqueueSnackbar({
            message: 'Command failed',
            detailedMessage: error.message,
            variant: 'error',
            dedupeKey: getFrontComponentCommandErrorDedupeKey(frontComponentId),
          });
        }
      } finally {
        await unmountFrontComponent();
      }
    };

    run();
  }, [execute, hasExecuted, frontComponentId]);

  return null;
};
