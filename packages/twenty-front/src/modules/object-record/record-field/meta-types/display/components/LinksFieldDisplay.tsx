import { useLinksField } from '@/object-record/record-field/meta-types/hooks/useLinksField';
import { LinksDisplay } from '@/ui/field/display/components/LinksDisplay';

export const LinksFieldDisplay = () => {
  const { fieldValue } = useLinksField();

  return <LinksDisplay value={fieldValue} />;
};
