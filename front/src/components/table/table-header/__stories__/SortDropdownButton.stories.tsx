import { SortType } from '../interface';
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
import { Order_By, People_Order_By } from '../../../../generated/graphql';

const component = {
  title: 'SortDropdownButton',
  component: SortDropdownButton,
};

export default component;

type OwnProps = {
  setSorts: () => void;
};

const availableSorts = [
  {
    key: 'fullname',
    label: 'People',
    icon: <FaRegUser />,
    _type: 'custom_sort',
    orderByTemplate: () => ({ email: Order_By.Asc }),
  },
  {
    key: 'company_name',
    label: 'Company',
    icon: <FaRegBuilding />,
    _type: 'custom_sort',
    orderByTemplate: () => ({ email: Order_By.Asc }),
  },
  {
    key: 'email',
    label: 'Email',
    icon: <FaEnvelope />,
    _type: 'default_sort',
  },
  { key: 'phone', label: 'Phone', icon: <FaPhone />, _type: 'default_sort' },
  {
    key: 'created_at',
    label: 'Created at',
    icon: <FaCalendar />,
    _type: 'default_sort',
  },
  { key: 'city', label: 'City', icon: <FaMapPin />, _type: 'default_sort' },
] satisfies SortType<People_Order_By>[];

const StyleDiv = styled.div`
  height: 200px;
  width: 200px;
`;

export const RegularSortDropdownButton = ({ setSorts }: OwnProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <StyleDiv>
        <SortDropdownButton<People_Order_By>
          isSortSelected={true}
          availableSorts={availableSorts}
          onSortSelect={setSorts}
        />
      </StyleDiv>
    </ThemeProvider>
  );
};
