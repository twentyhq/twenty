import { JustusTruthsBody } from '@/data-validator/components/JustusTruthsBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { IconListCheck } from 'twenty-ui/display';

export const JustusTruthsValidatorPage = () => {
  return (
    <PageContainer>
      <PageHeader title="Justus Truths" Icon={IconListCheck} />
      <JustusTruthsBody />
    </PageContainer>
  );
};
