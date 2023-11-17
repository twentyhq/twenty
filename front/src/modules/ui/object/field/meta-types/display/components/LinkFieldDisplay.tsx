import { useLinkField } from '../../hooks/useLinkField';
import { LinkDisplay } from '../content-display/components/LinkDisplay';

export const LinkFieldDisplay = () => {
  const { fieldValue } = useLinkField();

  return <LinkDisplay value={fieldValue} />;
};
