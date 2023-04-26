import { SelectedSortType, SortType } from '../interface';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import {
  faBuildings,
  faCalendar,
  faEnvelope,
  faMapPin,
  faPhone,
  faUser,
} from '@fortawesome/pro-regular-svg-icons';
import { SortDropdownButton } from '../SortDropdownButton';
import styled from '@emotion/styled';

const component = {
  title: 'SortDropdownButton',
  component: SortDropdownButton,
};

export default component;

type OwnProps = {
  setSorts: () => void;
};

const sorts = [] satisfies SelectedSortType[];

const availableSorts = [
  {
    key: 'fullname',
    label: 'People',
    icon: faUser,
  },
  {
    key: 'company_name',
    label: 'Company',
    icon: faBuildings,
  },
  {
    key: 'email',
    label: 'Email',
    icon: faEnvelope,
  },
  { key: 'phone', label: 'Phone', icon: faPhone },
  {
    key: 'created_at',
    label: 'Created at',
    icon: faCalendar,
  },
  { key: 'city', label: 'City', icon: faMapPin },
] satisfies SortType[];

const StyleDiv = styled.div`
  height: 200px;
  width: 200px;
`;

export const RegularSortDropdownButton = ({ setSorts }: OwnProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <StyleDiv>
        <SortDropdownButton
          sorts={sorts}
          availableSorts={availableSorts}
          setSorts={setSorts}
        />
      </StyleDiv>
    </ThemeProvider>
  );
};
