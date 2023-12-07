import { LinkDisplay } from '@/ui/field/components/LinkDisplay';

import { useLinkField } from '../../hooks/useLinkField';

export const LinkFieldDisplay = () => {
  const { fieldValue } = useLinkField();

  return <LinkDisplay value={fieldValue} />;
};
