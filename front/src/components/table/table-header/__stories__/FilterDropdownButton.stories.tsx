import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { FilterDropdownButton } from '../FilterDropdownButton';
import styled from '@emotion/styled';
import { FilterType, SelectedFilterType } from '../interface';
import { faUser } from '@fortawesome/pro-regular-svg-icons';
import { useCallback, useState } from 'react';
import { GET_PEOPLE } from '../../../../services/people';
import { People_Bool_Exp } from '../../../../generated/graphql';

const component = {
  title: 'FilterDropdownButton',
  component: FilterDropdownButton,
};

export default component;

type OwnProps<FilterProperties> = {
  setFilter: (filters: SelectedFilterType<FilterProperties>) => void;
};

const availableFilters = [
  {
    key: 'fullname',
    label: 'People',
    icon: faUser,
    searchQuery: GET_PEOPLE,
    searchTemplate: {
      _or: [
        { firstname: { _ilike: 'value' } },
        { lastname: { _ilike: 'value' } },
      ],
    },
    whereTemplate: {
      _or: [
        { firstname: { _ilike: 'value' } },
        { lastname: { _ilike: 'value' } },
      ],
    },
  },
] satisfies FilterType<People_Bool_Exp>[];

const StyleDiv = styled.div`
  height: 200px;
  width: 200px;
`;

export const RegularFilterDropdownButton = ({
  setFilter: setFilters,
}: OwnProps<People_Bool_Exp>) => {
  const [, innerSetFilters] = useState<SelectedFilterType<People_Bool_Exp>>();
  const outerSetFilters = useCallback(
    (filter: SelectedFilterType<People_Bool_Exp>) => {
      innerSetFilters(filter);
      setFilters(filter);
    },
    [setFilters],
  );
  return (
    <ThemeProvider theme={lightTheme}>
      <StyleDiv>
        <FilterDropdownButton
          availableFilters={availableFilters}
          isFilterSelected={true}
          onFilterSearch={jest.fn()}
          onFilterSelect={outerSetFilters}
          filterSearchResults={['John Doe']}
        />
      </StyleDiv>
    </ThemeProvider>
  );
};
