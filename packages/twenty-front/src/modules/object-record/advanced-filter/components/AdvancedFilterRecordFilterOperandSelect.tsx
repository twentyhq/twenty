import { AdvancedFilterRecordFilterOperandSelectContent } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOperandSelectContent';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { useTimeZoneAbbreviationForNowInUserTimeZone } from '@/object-record/record-filter/hooks/useTimeZoneAbbreviationForNowInUserTimeZone';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  width: 100px;
`;

type AdvancedFilterRecordFilterOperandSelectProps = {
  recordFilterId: string;
};

export const AdvancedFilterRecordFilterOperandSelect = ({
  recordFilterId,
}: AdvancedFilterRecordFilterOperandSelectProps) => {
  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const filter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const isDisabled = !filter?.fieldMetadataId;

  const filterType = filter?.type;

  const operandsForFilterType = isDefined(filterType)
    ? getRecordFilterOperands({
        filterType,
        subFieldName: filter?.subFieldName,
      })
    : [];

  const { userTimeZoneAbbreviation } =
    useTimeZoneAbbreviationForNowInUserTimeZone();

  const { isSystemTimezone } = useUserTimezone();

  const timeZoneAbbreviation = !isSystemTimezone
    ? userTimeZoneAbbreviation
    : null;

  if (isDisabled) {
    return (
      <SelectControl
        selectedOption={{
          label: filter?.operand
            ? getOperandLabel(filter.operand, timeZoneAbbreviation)
            : t`Select operand`,
          value: null,
        }}
        isDisabled
      />
    );
  }

  return (
    <StyledContainer>
      <AdvancedFilterRecordFilterOperandSelectContent
        recordFilterId={recordFilterId}
        filter={filter}
        operandsForFilterType={operandsForFilterType}
      />
    </StyledContainer>
  );
};
