import { CoatApprovalBody } from '@/coat-approval/components/CoatApprovalBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useState } from 'react';
import { IconFileCheck } from 'twenty-ui/display';

export const CoatApprovalPage = () => {
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null,
  );

  return (
    <PageContainer>
      <PageHeader title="COAT Approval" Icon={IconFileCheck} />
      <CoatApprovalBody
        selectedContractId={selectedContractId}
        onSelectContract={setSelectedContractId}
      />
    </PageContainer>
  );
};
