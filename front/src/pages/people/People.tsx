import {
  faBuildings,
  faCalendar,
  faEnvelope,
  faRectangleList,
  faUser,
} from '@fortawesome/pro-regular-svg-icons';
import { faList, faMapPin, faPhone } from '@fortawesome/pro-solid-svg-icons';
import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
import Table from '../../components/table/Table';
import { Company } from '../../interfaces/company.interface';
import { Pipe } from '../../interfaces/pipe.interface';
import { createColumnHelper } from '@tanstack/react-table';
import styled from '@emotion/styled';
import ClickableCell from '../../components/table/ClickableCell';
import ColumnHead from '../../components/table/ColumnHead';
import personPlaceholder from './placeholder.png';
import { parsePhoneNumber, CountryCode } from 'libphonenumber-js';
import Checkbox from '../../components/form/Checkbox';
import HorizontalyAlignedContainer from '../../layout/containers/HorizontalyAlignedContainer';
import CompanyChip from '../../components/chips/CompanyChip';

type Person = {
  fullName: string;
  picture?: string;
  email: string;
  company: Company;
  phone: string;
  creationDate: Date;
  pipe: Pipe;
  city: string;
  countryCode: string;
};

const StyledPeopleContainer = styled.div`
  display: flex;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};
  width: 100%;

  a {
    color: inherit;
    text-decoration: none;
  }
`;

const defaultData: Array<Person> = [
  {
    fullName: 'Alexandre Prot',
    picture: personPlaceholder,
    email: 'alexandre@qonto.com',
    company: { id: 1, name: 'Qonto', domain: 'qonto.com' },
    phone: '06 12 34 56 78',
    creationDate: new Date('Feb 23, 2018'),
    pipe: { id: 1, name: 'Sales Pipeline', icon: 'faUser' },
    city: 'Paris',
    countryCode: 'FR',
  },
  {
    fullName: 'Alexandre Prot',
    picture: personPlaceholder,
    email: 'alexandre@qonto.com',
    company: { id: 2, name: 'LinkedIn', domain: 'linkedin.com' },
    phone: '06 12 34 56 78',
    creationDate: new Date('Feb 23, 2018'),
    pipe: { id: 1, name: 'Sales Pipeline', icon: 'faUser' },
    city: 'Paris',
    countryCode: 'FR',
  },
  {
    fullName: 'Alexandre Prot',
    picture: personPlaceholder,
    email: 'alexandre@qonto.com',
    company: { id: 1, name: 'Qonto', domain: 'qonto.com' },
    phone: '06 12 34 56 78',
    creationDate: new Date('Feb 23, 2018'),
    pipe: { id: 1, name: 'Sales Pipeline', icon: 'faUser' },
    city: 'Paris',
    countryCode: 'FR',
  },
  {
    fullName: 'Alexandre Prot',
    picture: personPlaceholder,
    email: 'alexandre@qonto.com',
    company: { id: 1, name: 'Slack', domain: 'slack.com' },
    phone: '06 12 34 56 78',
    creationDate: new Date('Feb 23, 2018'),
    pipe: { id: 1, name: 'Sales Pipeline', icon: 'faUser' },
    city: 'Paris',
    countryCode: 'FR',
  },
  {
    fullName: 'Alexandre Prot',
    picture: personPlaceholder,
    email: 'alexandre@qonto.com',
    company: { id: 2, name: 'Facebook', domain: 'facebook.com' },
    phone: '06 12 34 56 78',
    creationDate: new Date('Feb 23, 2018'),
    pipe: { id: 1, name: 'Sales Pipeline', icon: 'faUser' },
    city: 'Paris',
    countryCode: 'FR',
  },
];

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor('fullName', {
    header: () => <ColumnHead viewName="People" viewIcon={faUser} />,
    cell: (props) => (
      <HorizontalyAlignedContainer>
        <Checkbox
          id={`person-selected-${props.row.original.email}`}
          name={`person-selected${props.row.original.email}`}
        />
        <ClickableCell href="#">
          <CompanyChip
            name={props.row.original.fullName}
            picture={props.row.original.picture}
          />
        </ClickableCell>
      </HorizontalyAlignedContainer>
    ),
  }),
  columnHelper.accessor('email', {
    header: () => <ColumnHead viewName="Email" viewIcon={faEnvelope} />,
    cell: (props) => (
      <a href={`mailto:${props.row.original.email}`}>
        {props.row.original.email}
      </a>
    ),
  }),
  columnHelper.accessor('company', {
    header: () => <ColumnHead viewName="Company" viewIcon={faBuildings} />,
    cell: (props) => (
      <ClickableCell href="#">
        <CompanyChip
          name={props.row.original.company.name}
          picture={`https://www.google.com/s2/favicons?domain=${props.row.original.company.domain}&sz=256`}
        />
      </ClickableCell>
    ),
  }),
  columnHelper.accessor('phone', {
    header: () => <ColumnHead viewName="Phone" viewIcon={faPhone} />,
    cell: (props) => (
      <a
        href={parsePhoneNumber(
          props.row.original.phone,
          props.row.original.countryCode as CountryCode,
        )?.getURI()}
      >
        {parsePhoneNumber(
          props.row.original.phone,
          props.row.original.countryCode as CountryCode,
        )?.formatInternational() || props.row.original.phone}
      </a>
    ),
  }),
  columnHelper.accessor('creationDate', {
    header: () => <ColumnHead viewName="Creation" viewIcon={faCalendar} />,
    cell: (props) =>
      new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(props.row.original.creationDate),
  }),
  columnHelper.accessor('pipe', {
    header: () => <ColumnHead viewName="Pipe" viewIcon={faRectangleList} />,
    cell: (props) => (
      <ClickableCell href="#">
        <CompanyChip
          name={props.row.original.pipe.name}
          picture={props.row.original.pipe.icon}
        />
      </ClickableCell>
    ),
  }),
  columnHelper.accessor('city', {
    header: () => <ColumnHead viewName="City" viewIcon={faMapPin} />,
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
