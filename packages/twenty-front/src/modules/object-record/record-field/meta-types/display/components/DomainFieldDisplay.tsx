import { useDomainField } from '@/object-record/record-field/meta-types/hooks/useDomainField';
import { DomainDisplay } from '@/ui/field/display/components/DomainDisplay';

export const DomainFieldDisplay = () => {
  const { fieldValue } = useDomainField();

  return <DomainDisplay value={fieldValue} />;
};
