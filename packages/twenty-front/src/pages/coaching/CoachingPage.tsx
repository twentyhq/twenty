import { CoachingBody } from '@/coaching/components/CoachingBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useState } from 'react';
import { IconUser } from 'twenty-ui/display';

export const CoachingPage = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );

  return (
    <PageContainer>
      <PageHeader title="Customer Dashboard" Icon={IconUser} />
      <CoachingBody
        selectedCustomerId={selectedCustomerId}
        onSelectCustomer={setSelectedCustomerId}
      />
    </PageContainer>
  );
};
