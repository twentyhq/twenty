import styled from '@emotion/styled';

import { AnalyticsQueryFilter as AnalyticsQueryFilterType } from '@/activities/reports/types/AnalyticsQueryFilter';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';

interface AnalyticsQueryFilterProps {
  analyticsQueryFilter?: AnalyticsQueryFilterType;
}

const StyledContainer = styled.div`
  display: flex;
`;

export const AnalyticsQueryFilter = (props: AnalyticsQueryFilterProps) => {
  const fieldOptions: { value: string; label: string }[] = [];
  const operatorOptions: { value: string; label: string }[] = [];

  return (
    <StyledContainer>
      <Select
        fullWidth
        dropdownId="analytics-query-field-select"
        options={fieldOptions}
        //value={}
        onChange={async () => {
          // TODO: Save
        }}
      />
      <Select
        fullWidth
        dropdownId="analytics-query-operator-select"
        options={operatorOptions}
        //value={}
        onChange={async () => {
          // TODO: Save
        }}
      />
      <TextInput />
    </StyledContainer>
  );
};
