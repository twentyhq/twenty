import { getAdvancedFilterInputPlaceholderText } from '@/object-record/advanced-filter/utils/getAdvancedFilterInputPlacedholderText';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

import { isNonEmptyString } from '@sniptt/guards';

import { styled } from '@linaria/react';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useGetRecordFilterDisplayValue } from '@/object-record/record-filter/hooks/useGetRecordFilterDisplayValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// TODO: factorize this with https://github.com/twentyhq/core-team-issues/issues/752
const StyledControlContainer = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
  max-width: 100%;
  padding: 0 ${themeCssVariables.spacing[2]};
  text-align: left;
`;

type AdvancedFilterValueInputDropdownButtonClickableSelectProps = {
  recordFilterId: string;
};

export const AdvancedFilterValueInputDropdownButtonClickableSelect = ({
  recordFilterId,
}: AdvancedFilterValueInputDropdownButtonClickableSelectProps) => {
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const { getRecordFilterDisplayValue } = useGetRecordFilterDisplayValue();

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const isDisabled =
    !isDefined(recordFilter?.fieldMetadataId) ||
    !isDefined(recordFilter.operand);

  const shouldUsePlaceholder = !isNonEmptyString(recordFilter?.value);

  const { fieldMetadataItem } = useFieldMetadataItemById(
    recordFilter?.fieldMetadataId ?? '',
  );

  const placeholderText = isDefined(fieldMetadataItem)
    ? getAdvancedFilterInputPlaceholderText(fieldMetadataItem)
    : t`Enter filter`;

  const recordFilterDisplayValue = getRecordFilterDisplayValue(recordFilter);

  const advancedFilterInputText = shouldUsePlaceholder
    ? placeholderText
    : (recordFilterDisplayValue ?? '');

  const isDateTimeType =
    recordFilter?.type === 'DATE' || recordFilter?.type === 'DATE_TIME';

  return isDateTimeType ? (
    <StyledControlContainer>{advancedFilterInputText}</StyledControlContainer>
  ) : (
    <SelectControl
      selectedOption={{
        label: advancedFilterInputText,
        value: null,
        disabled: isDisabled,
      }}
      textAccent={shouldUsePlaceholder ? 'placeholder' : 'default'}
      isDisabled={isDateTimeType}
    />
  );
};
