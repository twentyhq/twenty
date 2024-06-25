import { useLinkFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useLinkFieldDisplay';
import { LinkDisplay } from '@/ui/field/display/components/LinkDisplay';

export const LinkFieldDisplay = () => {
  const { fieldValue, maxWidth } = useLinkFieldDisplay();

  return <LinkDisplay value={fieldValue} maxWidth={maxWidth} />;
};
