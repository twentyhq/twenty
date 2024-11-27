import { useLinksFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useLinksFieldDisplay';
import { LinksDisplay } from '@/ui/field/display/components/LinksDisplay';

export const LinksFieldDisplay = () => {
  const { fieldValue } = useLinksFieldDisplay();

  return <LinksDisplay value={fieldValue} />;
};
