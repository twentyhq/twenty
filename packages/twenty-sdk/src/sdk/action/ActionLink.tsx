import { useEffect, useState } from 'react';

import { type NavigateOptions } from 'react-router-dom';
import { type AppPath } from 'twenty-shared/types';
import { type getAppPath } from 'twenty-shared/utils';
import { navigate, unmountFrontComponent } from '../front-component-api';

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

  useEffect(() => {
    if (hasExecuted) {
      return;
    }

    setHasExecuted(true);

    const run = async () => {
      try {
        await navigate(to, params, queryParams, options);
      } finally {
        await unmountFrontComponent();
      }
    };

    run();
  }, [to, params, queryParams, options, hasExecuted]);

  return null;
};
