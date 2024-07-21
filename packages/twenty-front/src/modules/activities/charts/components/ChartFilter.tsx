import styled from '@emotion/styled';

import { ChartFilter as ChartFilterType } from '@/activities/charts/types/ChartFilter';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';

interface ChartFilterProps {
  chartFilter?: ChartFilterType;
}

const StyledContainer = styled.div`
  display: flex;
`;

export const ChartFilter = (props: ChartFilterProps) => {
  return (
    <StyledContainer>
      <Select
        fullWidth
        dropdownId="analytics-query-field-select"
        options={[]}
        //value={}
        onChange={async () => {
          // TODO: Save
        }}
      />
      <Select
        fullWidth
        dropdownId="analytics-query-operator-select"
        options={[]}
        //value={}
        onChange={async () => {
          // TODO: Save
        }}
      />
      <TextInput />
    </StyledContainer>
  );
};
