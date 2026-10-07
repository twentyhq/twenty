import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';

export const SettingsSkeletonLoader = () => {
  return (
    <PageCardLayout
      header={
        <PageCardHeader
          links={[
            {
              children: (
                <Skeleton width={64} height={SKELETON_HEIGHT_SIZES.s} />
              ),
            },
          ]}
          title={<Skeleton width={120} height={SKELETON_HEIGHT_SIZES.s} />}
        />
      }
      showInformationBanner={false}
    >
      {null}
    </PageCardLayout>
  );
};
