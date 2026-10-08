import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';

export const SettingsSkeletonLoader = () => {
  return (
    <PageCardLayout
      header={
        <PageCardHeader
          links={[
            {
              children: (
                <SkeletonLine width={64} height={SKELETON_HEIGHT_SIZES.s} />
              ),
            },
          ]}
          title={<SkeletonLine width={120} height={SKELETON_HEIGHT_SIZES.s} />}
        />
      }
      showInformationBanner={false}
    >
      {null}
    </PageCardLayout>
  );
};
