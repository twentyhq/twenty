import { type ReactNode, Suspense } from 'react';

type LazyRouteProps = {
  children: ReactNode;
};

export const LazyRoute = ({ children }: LazyRouteProps) => (
  <Suspense fallback={<></>}>{children}</Suspense>
);
