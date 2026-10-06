import { useLingui } from '@lingui/react/macro';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { useMultiSelectFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useMultiSelectFieldDisplay';
import { OverflowingList } from 'twenty-ui/components';
import { Tag } from 'twenty-ui/primitives/data-display';
import { isDefined } from 'twenty-shared/utils';

export const MultiSelectFieldDisplay = () => {
  const { t } = useLingui();

  const { fieldValue, fieldDefinition } = useMultiSelectFieldDisplay();

  const { isFocused } = useFieldFocus();

  const selectedOptions = fieldValue
    ? fieldDefinition.metadata.options?.filter((option) =>
        fieldValue.includes(option.value),
      )
    : [];

  if (!isDefined(selectedOptions)) return null;

  return (
    <OverflowingList
      overflowLabel={t`Show all items`}
      showOverflowCount={isFocused}
    >
      {selectedOptions.map((selectedOption, index) => (
        <Tag key={index} color={selectedOption.color}>
          {selectedOption.label}
        </Tag>
      ))}
    </OverflowingList>
  );
};
