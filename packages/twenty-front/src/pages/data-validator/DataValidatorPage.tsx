import { DataValidatorBody } from '@/data-validator/components/DataValidatorBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { IconListCheck } from 'twenty-ui/display';

export const DataValidatorPage = () => {
  return (
    <PageContainer>
      <PageHeader title="Data Validator" Icon={IconListCheck} />
      <DataValidatorBody />
    </PageContainer>
  );
};
