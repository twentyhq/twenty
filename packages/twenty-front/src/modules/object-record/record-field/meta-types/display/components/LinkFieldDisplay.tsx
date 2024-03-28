import { LinkDisplay } from 'twenty-ui';

import { useLinkField } from '../../hooks/useLinkField';

export const LinkFieldDisplay = () => {
  const { fieldValue } = useLinkField();

  return <LinkDisplay value={fieldValue} />;
};
