import {
  faBuilding,
  faCalendar,
  faEnvelope,
  faRectangleList,
  faUser,
} from '@fortawesome/free-regular-svg-icons';
import { faList, faMapPin, faPhone } from '@fortawesome/free-solid-svg-icons';
import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
import Table from '../../components/table/Table';
import { Company } from '../../interfaces/company.interface';
import { Pipe } from '../../interfaces/pipe.interface';
import { createColumnHelper } from '@tanstack/react-table';
import styled from '@emotion/styled';
import TableHeader from '../../components/table/TableHeader';

type Person = {
  fullName: string;
  email: string;
  company: Company;
  phone: string;
  creationDate: string;
  pipe: Pipe;
  city: string;
};

const StyledPeopleContainer = styled.div`
  padding: 8px;
  width: 100%;

  table {
    margin-top: 8px;
  }
`;

const defaultData: Array<Person> = [
  {
    fullName: 'Alexandre Prot',
    email: 'alexandre@qonto.com',
    company: { id: 1, name: 'Qonto', logo: 'https://qonto.eu/logo.png' },
    phone: '06 12 34 56 78',
    creationDate: 'Feb 23, 2018',
    pipe: { id: 1, name: 'Sales Pipeline', icon: 'faUser' },
    city: 'Paris',
  },
  {
    fullName: 'Alexandre Prot',
    email: 'alexandre@qonto.com',
    company: { id: 1, name: 'Qonto', logo: 'https://qonto.eu/logo.png' },
    phone: '06 12 34 56 78',
    creationDate: 'Feb 23, 2018',
    pipe: { id: 1, name: 'Sales Pipeline', icon: 'faUser' },
    city: 'Paris',
  },
  {
    fullName: 'Alexandre Prot',
    email: 'alexandre@qonto.com',
    company: { id: 1, name: 'Qonto', logo: 'https://qonto.eu/logo.png' },
    phone: '06 12 34 56 78',
    creationDate: 'Feb 23, 2018',
    pipe: { id: 1, name: 'Sales Pipeline', icon: 'faUser' },
    city: 'Paris',
  },
  {
    fullName: 'Alexandre Prot',
    email: 'alexandre@qonto.com',
    company: { id: 1, name: 'Qonto', logo: 'https://qonto.eu/logo.png' },
    phone: '06 12 34 56 78',
    creationDate: 'Feb 23, 2018',
    pipe: { id: 1, name: 'Sales Pipeline', icon: 'faUser' },
    city: 'Paris',
  },
  {
    fullName: 'Alexandre Prot',
    email: 'alexandre@qonto.com',
    company: { id: 1, name: 'Qonto', logo: 'https://qonto.eu/logo.png' },
    phone: '06 12 34 56 78',
    creationDate: 'Feb 23, 2018',
    pipe: { id: 1, name: 'Sales Pipeline', icon: 'faUser' },
    city: 'Paris',
  },
];

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor('fullName', {
    header: () => <TableHeader viewName="People" viewIcon={faUser} />,
  }),
  columnHelper.accessor('email', {
    header: () => <TableHeader viewName="Email" viewIcon={faEnvelope} />,
  }),
  columnHelper.accessor('company', {
    cell: (props) => <span>{props.row.original.company.name}</span>,
    header: () => <TableHeader viewName="Company" viewIcon={faBuilding} />,
  }),
  columnHelper.accessor('phone', {
    header: () => <TableHeader viewName="Phone" viewIcon={faPhone} />,
  }),
  columnHelper.accessor('creationDate', {
    header: () => <TableHeader viewName="Creation" viewIcon={faCalendar} />,
  }),
  columnHelper.accessor('pipe', {
    cell: (props) => <span>{props.row.original.pipe.name}</span>,
    header: () => <TableHeader viewName="Pipe" viewIcon={faRectangleList} />,
  }),
  columnHelper.accessor('city', {
    header: () => <TableHeader viewName="City" viewIcon={faMapPin} />,
  }),
];

function People() {
  return (
    <WithTopBarContainer title="People" icon={faUser}>
      <StyledPeopleContainer>
        <Table
          data={defaultData}
          columns={columns}
          viewName="All People"
          viewIcon={faList}
        />
      </StyledPeopleContainer>
    </WithTopBarContainer>
  );
}

export default People;
