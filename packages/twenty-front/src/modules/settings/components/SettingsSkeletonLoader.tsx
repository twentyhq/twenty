import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext } from 'twenty-ui-deprecated/theme-constants';

export const SettingsSkeletonLoader = () => {
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
        <SettingsPageContainer>
          <SettingsSectionSkeletonLoader />
        </SettingsPageContainer>
      </PageCardLayout>
    </SkeletonTheme>
  );
};
