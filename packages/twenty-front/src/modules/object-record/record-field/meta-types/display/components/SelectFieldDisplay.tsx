import { Tag } from 'twenty-ui';

import { useSelectFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useSelectFieldDisplay';
import { isDefined } from '~/utils/isDefined';

export const SelectFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useSelectFieldDisplay();

  const selectedOption = fieldDefinition.metadata.options?.find(
    (option) => option.value === fieldValue,
  );

  if (!isDefined(selectedOption)) {
    return <></>;
  }

  return (
    <Tag
      preventShrink
      color={selectedOption.color}
      text={selectedOption.label}
    />
  );
};
