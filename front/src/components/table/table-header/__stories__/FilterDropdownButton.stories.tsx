import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { FilterDropdownButton } from '../FilterDropdownButton';
import styled from '@emotion/styled';
import { FilterType } from '../SortAndFilterBar';
import {
  faUser,
  faBuildings,
  faEnvelope,
  faPhone,
  faCalendar,
  faMapPin,
} from '@fortawesome/pro-regular-svg-icons';

const component = {
  title: 'FilterDropdownButton',
  component: FilterDropdownButton,
};

export default component;

export const availableFilters = [
  {
    id: 'fullname',
    label: 'People',
    icon: faUser,
  },
  {
    id: 'company_name',
    label: 'Company',
    icon: faBuildings,
  },
  {
    id: 'email',
    label: 'Email',
    icon: faEnvelope,
  },
  { id: 'phone', label: 'Phone', icon: faPhone },
  {
    id: 'created_at',
    label: 'Created at',
    icon: faCalendar,
  },
  { id: 'city', label: 'City', icon: faMapPin },
] satisfies FilterType[];

const StyleDiv = styled.div`
  height: 200px;
  width: 200px;
`;

export const RegularFilterDropdownButton = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <StyleDiv>
        <FilterDropdownButton availableFilters={availableFilters} />
      </StyleDiv>
    </ThemeProvider>
  );
};
