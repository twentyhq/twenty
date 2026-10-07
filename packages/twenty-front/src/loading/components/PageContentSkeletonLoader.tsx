import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { type ReactNode } from 'react';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';

type PageContentSkeletonLoaderProps = {
  secondaryBar?: ReactNode;
};

export const PageContentSkeletonLoader = ({
  secondaryBar,
}: PageContentSkeletonLoaderProps) => {
  return (
    <PageCardLayout
      header={
        <PageCardHeader
          icon={<Skeleton width={20} height={20} />}
          title={<Skeleton width={120} height={SKELETON_HEIGHT_SIZES.s} />}
          actionButton={
            <Skeleton width={80} height={SKELETON_HEIGHT_SIZES.s} />
          }
        />
      }
      secondaryBar={secondaryBar}
      showInformationBanner={false}
    >
      {null}
    </PageCardLayout>
  );
};
