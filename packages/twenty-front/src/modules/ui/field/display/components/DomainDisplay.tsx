import { FieldDomainValue } from '@/object-record/record-field/types/FieldMetadata';
import { LinkDisplay } from '@/ui/field/display/components/LinkDisplay';

type DomainDisplayProps = {
  value?: FieldDomainValue;
};

export const DomainDisplay = ({ value }: DomainDisplayProps) => {
  const domain = value?.primaryLink ?? '';

  return <LinkDisplay value={{ url: domain, label: domain }} />;
};
