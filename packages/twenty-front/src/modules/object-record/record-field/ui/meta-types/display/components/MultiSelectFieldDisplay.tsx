import { useLingui } from '@lingui/react/macro';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { FieldDisplayTooltipContext } from '@/ui/field/display/contexts/FieldDisplayTooltipContext';
import { useMultiSelectFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useMultiSelectFieldDisplay';
import { OverflowingList } from 'twenty-ui/components/layout';
import { Tag } from 'twenty-ui/primitives/data-display';
import { isDefined } from 'twenty-shared/utils';
import { useContext } from 'react';

export const MultiSelectFieldDisplay = () => {
  const { t } = useLingui();
  const { withTooltip, measureOverflowOnOpen, getInitialPointerPosition } =
    useContext(FieldDisplayTooltipContext);

  const { fieldValue, fieldDefinition } = useMultiSelectFieldDisplay();

  const { isFocused } = useFieldFocus();

  const selectedOptions = fieldValue
    ? fieldDefinition.metadata.options?.filter((option) =>
        fieldValue.includes(option.value),
      )
    : [];

  if (!isDefined(selectedOptions)) return null;

  const initialPointerPosition = withTooltip
    ? getInitialPointerPosition?.()
    : undefined;

  return (
    <OverflowingList
      overflowLabel={t`Show all items`}
      showOverflowCount={isFocused}
    >
      {selectedOptions.map((selectedOption, index) => (
        <Tag
          key={index}
          color={selectedOption.color}
          withTooltip={withTooltip}
          measureOverflowOnOpen={measureOverflowOnOpen}
          initialPointerPosition={initialPointerPosition}
        >
          {selectedOption.label}
        </Tag>
      ))}
    </OverflowingList>
  );
};
