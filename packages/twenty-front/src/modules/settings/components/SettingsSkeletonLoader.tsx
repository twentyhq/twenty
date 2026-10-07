import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

export const SettingsSkeletonLoader = () => {
  return (
    <PageCardLayout
      header={
        <PageCardHeader
          links={[
            {
              children: (
                <Skeleton
                  layout="line"
                  baseColor={themeCssVariables.background.tertiary}
                  highlightColor={
                    themeCssVariables.background.transparent.lighter
                  }
                  borderRadius={4}
                  width={64}
                  height={SKELETON_HEIGHT_SIZES.s}
                />
              ),
            },
          ]}
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
        />
      }
      showInformationBanner={false}
    >
      {null}
    </PageCardLayout>
  );
};
