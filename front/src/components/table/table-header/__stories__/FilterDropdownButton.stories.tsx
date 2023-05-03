import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { FilterDropdownButton } from '../FilterDropdownButton';
import styled from '@emotion/styled';
import { FilterType, SelectedFilterType } from '../interface';
import {
  FaRegUser,
  FaRegBuilding,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaMapPin,
} from 'react-icons/fa';
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
    key: 'fullname',
    label: 'People',
    icon: <FaRegUser />,
  },
  {
    key: 'company_name',
    label: 'Company',
    icon: <FaRegBuilding />,
  },
  {
    key: 'email',
    label: 'Email',
    icon: <FaEnvelope />,
  },
  { key: 'phone', label: 'Phone', icon: <FaPhone /> },
  {
    key: 'created_at',
    label: 'Created at',
    icon: <FaCalendar />,
  },
  { key: 'city', label: 'City', icon: <FaMapPin /> },
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
