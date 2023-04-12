import { faUser } from '@fortawesome/free-regular-svg-icons';
import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
import Table from '../../components/table/Table';
import { Company } from '../../interfaces/company.interface';
import { Pipe } from '../../interfaces/pipe.interface';
import { createColumnHelper } from '@tanstack/react-table';

type People = {
  fullName: string;
  email: string;
  company: Company;
  phone: string;
  creationDate: string;
  pipe: Pipe;
  city: string;
};

const defaultData: Array<People> = [
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

const columnHelper = createColumnHelper<People>();

const columns = [
  columnHelper.accessor('fullName', {
    header: () => 'People',
  }),
  columnHelper.accessor('email', {
    header: () => <span>Email</span>,
  }),
  columnHelper.accessor('company', {
    header: () => <span>Company</span>,
    cell: (props) => <span>{props.row.original.company.name}</span>,
  }),
  columnHelper.accessor('phone', {
    header: () => <span>Phone</span>,
  }),
  columnHelper.accessor('creationDate', {
    header: () => <span>Creation</span>,
  }),
  columnHelper.accessor('pipe', {
    header: () => <span>Pipe</span>,
    cell: (props) => <span>{props.row.original.pipe.name}</span>,
  }),
  columnHelper.accessor('city', {
    header: () => <span>City</span>,
  }),
];

function People() {
  return (
    <WithTopBarContainer title="People" icon={faUser}>
      <Table data={defaultData} columns={columns} viewName="All People" />
    </WithTopBarContainer>
  );
}

export default People;
