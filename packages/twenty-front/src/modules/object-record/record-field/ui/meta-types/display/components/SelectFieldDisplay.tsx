import { useSelectFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useSelectFieldDisplay';
import { SelectDisplay } from '@/ui/field/display/components/SelectDisplay';
import { isDefined } from 'twenty-shared/utils';

export const SelectFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useSelectFieldDisplay();

  const selectedOption = fieldDefinition.metadata.options?.find(
    (option) => option.value === fieldValue,
  );

  if (!isDefined(selectedOption)) {
    return <></>;
  }

  return (
    <SelectDisplay color={selectedOption.color} label={selectedOption.label} />
  );
};
