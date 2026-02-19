import { useEffect, useRef } from 'react';

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
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) {
      return;
    }

    hasExecutedRef.current = true;

    const run = async () => {
      try {
        await navigate(to, params, queryParams, options);
      } finally {
        await unmountFrontComponent();
      }
    };

    run();
  }, [to, params, queryParams, options]);

  return null;
};
