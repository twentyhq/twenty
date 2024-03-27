import { TextDisplay } from 'twenty-ui';

import { useUuidField } from '@/object-record/record-field/meta-types/hooks/useUuidField';

export const UuidFieldDisplay = () => {
  const { fieldValue } = useUuidField();

  return <TextDisplay text={fieldValue} />;
};
