import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { type ReactNode, Suspense } from 'react';
import { PageContentSkeletonLoader } from '~/loading/components/PageContentSkeletonLoader';

type LazyRouteProps = {
  children: ReactNode;
};

const LazyRouteFallback = () => (
  <PageContainer>
    <PageContentSkeletonLoader />
  </PageContainer>
);

export const LazyRoute = ({ children }: LazyRouteProps) => (
  <Suspense fallback={<LazyRouteFallback />}>{children}</Suspense>
);
