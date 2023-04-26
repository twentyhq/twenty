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
import { SelectedFilterType } from '../TableHeader';
import { useCallback, useState } from 'react';

const component = {
  title: 'FilterDropdownButton',
  component: FilterDropdownButton,
};

export default component;

type OwnProps = {
  setFilters: (filters: SelectedFilterType[]) => void;
};

const availableFilters = [
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

export const RegularFilterDropdownButton = ({ setFilters }: OwnProps) => {
  const [filters, innerSetFilters] = useState<SelectedFilterType[]>([]);
  const outerSetFilters = useCallback(
    (filters: SelectedFilterType[]) => {
      innerSetFilters(filters);
      setFilters(filters);
    },
    [setFilters],
  );
  return (
    <ThemeProvider theme={lightTheme}>
      <StyleDiv>
        <FilterDropdownButton
          availableFilters={availableFilters}
          filters={filters}
          setFilters={outerSetFilters}
        />
      </StyleDiv>
    </ThemeProvider>
  );
};
