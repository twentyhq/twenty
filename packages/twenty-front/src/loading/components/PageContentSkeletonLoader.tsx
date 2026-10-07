import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { type ReactNode } from 'react';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

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
          icon={
            <Skeleton
              layout="line"
              baseColor={themeCssVariables.background.tertiary}
              highlightColor={themeCssVariables.background.transparent.lighter}
              borderRadius={4}
              width={20}
              height={20}
            />
          }
          title={
            <Skeleton
              layout="line"
              baseColor={themeCssVariables.background.tertiary}
              highlightColor={themeCssVariables.background.transparent.lighter}
              borderRadius={4}
              width={120}
              height={SKELETON_HEIGHT_SIZES.s}
            />
          }
          actionButton={
            <Skeleton
              layout="line"
              baseColor={themeCssVariables.background.tertiary}
              highlightColor={themeCssVariables.background.transparent.lighter}
              borderRadius={4}
              width={80}
              height={SKELETON_HEIGHT_SIZES.s}
            />
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
