import { useEffect, useState } from 'react';

import {
  enqueueSnackbar,
  getFrontComponentActionErrorDedupeKey,
  unmountFrontComponent,
  useFrontComponentId,
} from '../front-component-api';

export type ActionProps = {
  execute: () => void | Promise<void>;
};

export const Action = ({ execute }: ActionProps) => {
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
            message: 'Action failed',
            detailedMessage: error.message,
            variant: 'error',
            dedupeKey: getFrontComponentActionErrorDedupeKey(frontComponentId),
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
