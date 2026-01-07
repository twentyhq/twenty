import { getAdvancedFilterInputPlaceholderText } from '@/object-record/advanced-filter/utils/getAdvancedFilterInputPlacedholderText';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { isNonEmptyString } from '@sniptt/guards';

import styled from '@emotion/styled';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useGetRecordFilterDisplayValue } from '@/object-record/record-filter/hooks/useGetRecordFilterDisplayValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

// TODO: factorize this with https://github.com/twentyhq/core-team-issues/issues/752
const StyledControlContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  box-sizing: border-box;
  height: ${({ theme }) => theme.spacing(8)};
  max-width: 100%;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  text-align: left;
`;

type AdvancedFilterValueInputDropdownButtonClickableSelectProps = {
  recordFilterId: string;
};

export const AdvancedFilterValueInputDropdownButtonClickableSelect = ({
  recordFilterId,
}: AdvancedFilterValueInputDropdownButtonClickableSelectProps) => {
  const currentRecordFilters = useRecoilComponentValue(
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
