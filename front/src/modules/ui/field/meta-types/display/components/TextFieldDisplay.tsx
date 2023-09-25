import { TextDisplay } from '@/ui/field/meta-types/display/content-display/components/TextDisplay';

import { useTextField } from '../../hooks/useTextField';

export const TextFieldDisplay = () => {
  const { fieldValue } = useTextField();

  return <TextDisplay text={fieldValue} />;
};
