import { useEffect, useState } from 'react';

import { type NavigateOptions } from 'react-router-dom';
import { type AppPath } from 'twenty-shared/types';
import { type getAppPath } from 'twenty-shared/utils';
import {
  enqueueSnackbar,
  getFrontComponentActionErrorDedupeKey,
  navigate,
  unmountFrontComponent,
  useFrontComponentId,
} from '../front-component-api';

export type ActionLinkProps<T extends AppPath> = {
  to: T;
  params?: Parameters<typeof getAppPath<T>>[1];
  queryParams?: Record<string, any>;
  options?: NavigateOptions;
};

export const ActionLink = <T extends AppPath>({
  to,
  params,
  queryParams,
  options,
}: ActionLinkProps<T>) => {
  const [hasExecuted, setHasExecuted] = useState(false);

  const frontComponentId = useFrontComponentId();

  useEffect(() => {
    if (hasExecuted) {
      return;
    }

    setHasExecuted(true);

    const run = async () => {
      try {
        await navigate(to, params, queryParams, options);
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
  }, [to, params, queryParams, options, hasExecuted, frontComponentId]);

  return null;
};
