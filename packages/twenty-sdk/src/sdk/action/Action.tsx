import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  enqueueSnackbar,
  unmountFrontComponent,
  useFrontComponentId,
} from '../front-component-api';

export type ActionProps = {
  execute: () => void | Promise<void>;
  notifyOnEnd?: {
    message: string;
    detailedMessage?: string;
  };
};

export const Action = ({ execute, notifyOnEnd }: ActionProps) => {
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

        if (isDefined(notifyOnEnd)) {
          await enqueueSnackbar({
            message: notifyOnEnd.message,
            variant: 'success',
            detailedMessage: notifyOnEnd.detailedMessage,
            dedupeKey: `${frontComponentId}-action-end`,
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          await enqueueSnackbar({
            message: 'Action failed',
            detailedMessage: error.message,
            variant: 'error',
            dedupeKey: `${frontComponentId}-action-error`,
          });
        }
      } finally {
        await unmountFrontComponent();
      }
    };

    run();
  }, [execute, hasExecuted, notifyOnEnd, frontComponentId]);

  return null;
};
