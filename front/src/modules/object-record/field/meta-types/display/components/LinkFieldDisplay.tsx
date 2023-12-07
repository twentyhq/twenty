import { LinkDisplay } from '@/ui/field/display/components/LinkDisplay';

import { useLinkField } from '../../hooks/useLinkField';

export const LinkFieldDisplay = () => {
  const { fieldValue } = useLinkField();

  return <LinkDisplay value={fieldValue} />;
};
