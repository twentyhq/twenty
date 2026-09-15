import { type ReactNode, Suspense } from 'react';
import { PageContentSkeletonLoader } from '~/loading/components/PageContentSkeletonLoader';

type LazyRouteProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export const LazyRoute = ({
  children,
  fallback = <PageContentSkeletonLoader />,
}: LazyRouteProps) => <Suspense fallback={fallback}>{children}</Suspense>;
