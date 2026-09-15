import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { type ReactNode, useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext } from 'twenty-ui/theme-constants';

type PageContentSkeletonLoaderProps = {
  secondaryBar?: ReactNode;
};

export const PageContentSkeletonLoader = ({
  secondaryBar,
}: PageContentSkeletonLoaderProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <PageCardLayout
        header={
          <PageCardHeader
            icon={<Skeleton width={20} height={20} />}
            title={
              <Skeleton
                width={120}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
            }
            actionButton={
              <Skeleton
                width={80}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
            }
          />
        }
        secondaryBar={secondaryBar}
        showInformationBanner={false}
      >
        {null}
      </PageCardLayout>
    </SkeletonTheme>
  );
};
