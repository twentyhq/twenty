import { SelectedSortType, SortType } from '../interface';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import {
  FaRegBuilding,
  FaCalendar,
  FaEnvelope,
  FaMapPin,
  FaPhone,
  FaRegUser,
} from 'react-icons/fa';
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
