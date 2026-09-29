import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from 'twenty-ui/theme';

export const SettingsSkeletonLoader = () => {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <PageCardLayout
        header={
          <PageCardHeader
            links={[
              {
                children: (
                  <Skeleton
                    width={64}
                    height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
                  />
                ),
              },
            ]}
            title={
              <Skeleton
                width={120}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
            }
          />
        }
        showInformationBanner={false}
      >
        {null}
      </PageCardLayout>
    </SkeletonTheme>
  );
};
