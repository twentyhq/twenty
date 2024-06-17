import { useLinkFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useLinkFieldDisplay';
import { LinkDisplay } from '@/ui/field/display/components/LinkDisplay';

export const LinkFieldDisplay = () => {
  const { fieldValue } = useLinkFieldDisplay();

  return <LinkDisplay value={fieldValue} />;
};
