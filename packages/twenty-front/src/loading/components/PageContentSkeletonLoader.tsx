import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { type ReactNode } from 'react';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';

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
          title={<SkeletonLine width={104} height={SKELETON_HEIGHT_SIZES.s} />}
          actionButton={
            <SkeletonLine width={132} height={SKELETON_HEIGHT_SIZES.s} />
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
