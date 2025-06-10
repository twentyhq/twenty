import { useGetFieldMetadataItemById } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { getAdvancedFilterInputPlaceholderText } from '@/object-record/advanced-filter/utils/getAdvancedFilterInputPlacedholderText';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

import { isNonEmptyString } from '@sniptt/guards';

import styled from '@emotion/styled';

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
  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const isDisabled =
    !isDefined(recordFilter?.fieldMetadataId) ||
    !isDefined(recordFilter.operand);

  const shouldUsePlaceholder = !isNonEmptyString(recordFilter?.value);

  const { getFieldMetadataItemById } = useGetFieldMetadataItemById();

  const fieldMetadataItem = isNonEmptyString(recordFilter?.fieldMetadataId)
    ? getFieldMetadataItemById(recordFilter?.fieldMetadataId)
    : undefined;

  const placeholderText = isDefined(fieldMetadataItem)
    ? getAdvancedFilterInputPlaceholderText(fieldMetadataItem)
    : 'Enter filter';

  const advancedFilterInputText = shouldUsePlaceholder
    ? placeholderText
    : (recordFilter?.displayValue ?? '');

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
