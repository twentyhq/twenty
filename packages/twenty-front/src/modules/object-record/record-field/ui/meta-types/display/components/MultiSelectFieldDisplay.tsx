import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { useMultiSelectFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useMultiSelectFieldDisplay';
import { OverflowingList } from 'twenty-ui/components/layout';
import { Tag } from 'twenty-ui/primitives/data-display';
import { isDefined } from 'twenty-shared/utils';

export const MultiSelectFieldDisplay = () => {
  const { t } = useLingui();

  const { fieldValue, fieldDefinition } = useMultiSelectFieldDisplay();

  const { isFocused } = useFieldFocus();

  const options = fieldDefinition.metadata.options;
  const overflowLabel = t`Show all items`;

  return useMemo(() => {
    const selectedOptions = isDefined(fieldValue)
      ? options?.filter((option) => fieldValue.includes(option.value))
      : [];

    if (!isDefined(selectedOptions)) return null;

    return (
      <OverflowingList
        triggerProps={{
          onClick: (event) => event.stopPropagation(),
          onKeyDown: (event) => event.stopPropagation(),
        }}
        popupProps={{
          onClick: (event) => event.stopPropagation(),
          onKeyDown: (event) => event.stopPropagation(),
        }}
        overflowLabel={overflowLabel}
        showOverflowCount={isFocused}
      >
        {selectedOptions.map((selectedOption, index) => (
          <Tag key={index} color={selectedOption.color}>
            {selectedOption.label}
          </Tag>
        ))}
      </OverflowingList>
    );
  }, [fieldValue, options, isFocused, overflowLabel]);
};
