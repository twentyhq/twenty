import { isNonEmptyString } from '@sniptt/guards';

import { useFullNameFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useFullNameFieldDisplay';
import { TextDisplay } from 'twenty-ui/data-display';

export const FullNameFieldDisplay = () => {
  const { fieldValue } = useFullNameFieldDisplay();

  const content = [fieldValue?.firstName, fieldValue?.lastName]
    .filter(isNonEmptyString)
    .join(' ');

  return <TextDisplay text={content} />;
};
