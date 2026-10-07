import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { Skeleton } from 'twenty-ui/primitives/feedback';

export const SettingsSkeletonLoader = () => {
  return (
    <PageCardLayout
      header={
        <PageCardHeader
          links={[
            {
              children: <Skeleton width={64} height={16} />,
            },
          ]}
          title={<Skeleton width={120} height={16} />}
        />
      }
      showInformationBanner={false}
    >
      {null}
    </PageCardLayout>
  );
};
