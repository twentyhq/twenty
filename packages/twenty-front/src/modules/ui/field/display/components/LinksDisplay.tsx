import { FieldLinksValue } from '@/object-record/record-field/types/FieldMetadata';
import { LinkDisplay } from '@/ui/field/display/components/LinkDisplay';

type LinksDisplayProps = {
  value?: FieldLinksValue;
};

export const LinksDisplay = ({ value }: LinksDisplayProps) => {
  const url = value?.primaryLinkUrl || '';
  const label = value?.primaryLinkLabel || '';

  return <LinkDisplay value={{ url, label }} />;
};
