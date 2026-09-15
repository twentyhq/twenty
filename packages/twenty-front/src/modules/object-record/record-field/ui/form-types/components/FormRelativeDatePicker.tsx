import { RelativeDateFilterRangeHint } from '@/object-record/record-field/ui/form-types/components/RelativeDateFilterRangeHint';
import { useGetRelativeDateFilterWithUserTimezone } from '@/object-record/record-filter/hooks/useGetRelativeDateFilterWithUserTimezone';
import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';
import { stringifyRelativeDateFilter } from '@/views/view-filter-value/utils/stringifyRelativeDateFilter';

import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { DEFAULT_RELATIVE_DATE_FILTER_VALUE } from 'twenty-shared/constants';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type RelativeDateFilter,
  resolveRelativeDateFilterStringified,
} from 'twenty-shared/utils';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

export type FormRelativeDatePickerProps = {
  label?: string;
  defaultValue?: string;
  onChange: (value: RelativeDateFilter) => void;
  readonly?: boolean;
  isDateTimeField?: boolean;
};

export const FormRelativeDatePicker = ({
  defaultValue,
  onChange,
  readonly,
  isDateTimeField,
}: FormRelativeDatePickerProps) => {
  const instanceId = useId();

  const { getRelativeDateFilterWithUserTimezone } =
    useGetRelativeDateFilterWithUserTimezone();

  const valueParsed = isNonEmptyString(defaultValue)
    ? resolveRelativeDateFilterStringified(defaultValue)
    : DEFAULT_RELATIVE_DATE_FILTER_VALUE;

  const effectiveRelativeDateFilterValue = isNonEmptyString(defaultValue)
    ? defaultValue
    : stringifyRelativeDateFilter(
        getRelativeDateFilterWithUserTimezone(
          DEFAULT_RELATIVE_DATE_FILTER_VALUE,
        ),
      );

  const handleValueChange = (newValue: RelativeDateFilter) => {
    const newValueWithTimezone =
      getRelativeDateFilterWithUserTimezone(newValue);

    onChange(newValueWithTimezone);
  };

  return (
    <StyledContainer>
      <RelativeDatePickerHeader
        instanceId={instanceId}
        onChange={handleValueChange}
        direction={valueParsed?.direction ?? 'THIS'}
        unit={valueParsed?.unit ?? 'DAY'}
        amount={valueParsed?.amount ?? undefined}
        isFormField={true}
        readonly={readonly}
        unitDropdownWidth={150}
        allowIntraDayUnits={isDateTimeField}
      />
      <RelativeDateFilterRangeHint
        relativeDateFilterValue={effectiveRelativeDateFilterValue}
        isDateTimeField={isDateTimeField}
      />
    </StyledContainer>
  );
};
