import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { SortDropdownButton } from '../SortDropdownButton';
import styled from '@emotion/styled';
import {
  SortOrder as Order_By,
  PersonOrderByWithRelationInput as People_Order_By,
} from '../../../../generated/graphql';
import { SortType } from '../../../../interfaces/sorts/interface';
import {
  TbBuilding,
  TbCalendar,
  TbMail,
  TbMapPin,
  TbPhone,
  TbUser,
} from 'react-icons/tb';

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
    icon: <TbUser size={16} />,
    _type: 'custom_sort',
    orderByTemplates: [() => ({ email: Order_By.Asc })],
  },
  {
    key: 'company_name',
    label: 'Company',
    icon: <TbBuilding size={16} />,
    _type: 'custom_sort',
    orderByTemplates: [() => ({ email: Order_By.Asc })],
  },
  {
    key: 'email',
    label: 'Email',
    icon: <TbMail size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'phone',
    label: 'Phone',
    icon: <TbPhone size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'createdAt',
    label: 'Created at',
    icon: <TbCalendar size={16} />,
    _type: 'default_sort',
  },
  {
    key: 'city',
    label: 'City',
    icon: <TbMapPin size={16} />,
    _type: 'default_sort',
  },
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
