import { SelectFieldDisplayContent } from '@/object-record/record-field/meta-types/display/components/SelectFieldDisplayContent';
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
    <SelectFieldDisplayContent
      color={selectedOption.color}
      label={selectedOption.label}
    />
  );
};
