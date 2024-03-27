import { TextDisplay } from 'twenty-ui';

import { useFullNameField } from '@/object-record/record-field/meta-types/hooks/useFullNameField';

export const FullNameFieldDisplay = () => {
  const { fieldValue } = useFullNameField();

  const content = [fieldValue.firstName, fieldValue.lastName]
    .filter(Boolean)
    .join(' ');

  return <TextDisplay text={content} />;
};
