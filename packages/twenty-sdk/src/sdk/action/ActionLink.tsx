import { useEffect, useRef } from 'react';

import { navigate } from '../front-component-api';

export type ActionLinkProps = {
  to: string;
  params?: Record<string, string | null>;
  queryParams?: Record<string, unknown>;
};

export const ActionLink = ({ to, params, queryParams }: ActionLinkProps) => {
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) {
      return;
    }
    hasExecutedRef.current = true;
    navigate(to as any, params, queryParams);
  }, [to, params, queryParams]);

  return null;
};
