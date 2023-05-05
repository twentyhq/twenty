import {
  FaRegBuilding,
  FaCalendar,
  FaEnvelope,
  FaRegUser,
  FaMapPin,
  FaPhone,
  FaStream,
  FaUser,
  FaBuilding,
} from 'react-icons/fa';
import { createColumnHelper } from '@tanstack/react-table';
import ClickableCell from '../../components/table/ClickableCell';
import ColumnHead from '../../components/table/ColumnHead';
import Checkbox from '../../components/form/Checkbox';
import CompanyChip from '../../components/chips/CompanyChip';
import { GraphqlQueryPerson, Person } from '../../interfaces/person.interface';
import PipeChip from '../../components/chips/PipeChip';
import EditableText from '../../components/table/editable-cell/EditableText';
import { OrderByFields, updatePerson } from '../../services/people';
import {
  FilterType,
  SortType,
} from '../../components/table/table-header/interface';
import { People_Bool_Exp } from '../../generated/graphql';
import {
  SEARCH_COMPANY_QUERY,
  SEARCH_PEOPLE_QUERY,
} from '../../services/search/search';
import { GraphqlQueryCompany } from '../../interfaces/company.interface';
import EditablePhone from '../../components/table/editable-cell/EditablePhone';
import EditableFullName from '../../components/table/editable-cell/EditableFullName';

export const availableSorts = [
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
] satisfies Array<SortType<OrderByFields>>;

const fullnameFilter = {
  key: 'fullname',
  label: 'People',
  icon: <FaUser />,
  whereTemplate: (operand, { firstname, lastname }) => {
    if (operand.keyWord === 'equal') {
      return {
        _and: [
          { firstname: { _eq: `${firstname}` } },
          { lastname: { _eq: `${lastname}` } },
        ],
      };
    }

    if (operand.keyWord === 'not_equal') {
      return {
        _not: {
          _and: [
            { firstname: { _eq: `${firstname}` } },
            { lastname: { _eq: `${lastname}` } },
          ],
        },
      };
    }
    console.error(Error(`Unhandled operand: ${operand.keyWord}`));
    return {};
  },
  searchQuery: SEARCH_PEOPLE_QUERY,
  searchTemplate: (searchInput: string) => ({
    _or: [
      { firstname: { _ilike: `%${searchInput}%` } },
      { lastname: { _ilike: `%${searchInput}%` } },
    ],
  }),
  searchResultMapper: (person: GraphqlQueryPerson) => ({
    displayValue: `${person.firstname} ${person.lastname}`,
    value: { firstname: person.firstname, lastname: person.lastname },
  }),
  operands: [
    { label: 'Equal', id: 'equal', keyWord: 'equal' },
    { label: 'Not equal', id: 'not-equal', keyWord: 'not_equal' },
  ],
} satisfies FilterType<People_Bool_Exp>;

const companyFilter = {
  key: 'company_name',
  label: 'Company',
  icon: <FaBuilding />,
  whereTemplate: (operand, { companyName }) => {
    if (operand.keyWord === 'equal') {
      return {
        company: { name: { _eq: companyName } },
      };
    }

    if (operand.keyWord === 'not_equal') {
      return {
        _not: { company: { name: { _eq: companyName } } },
      };
    }
    console.error(Error(`Unhandled operand: ${operand.keyWord}`));
    return {};
  },
  searchQuery: SEARCH_COMPANY_QUERY,
  searchTemplate: (searchInput: string) => ({
    name: { _ilike: `%${searchInput}%` },
  }),
  searchResultMapper: (company: GraphqlQueryCompany) => ({
    displayValue: company.name,
    value: { companyName: company.name },
  }),
  operands: [
    { label: 'Equal', id: 'equal', keyWord: 'equal' },
    { label: 'Not equal', id: 'not-equal', keyWord: 'not_equal' },
  ],
} satisfies FilterType<People_Bool_Exp>;

const emailFilter = {
  key: 'email',
  label: 'Email',
  icon: <FaEnvelope />,
  whereTemplate: (operand, { email }) => {
    if (operand.keyWord === 'equal') {
      return {
        email: { _eq: email },
      };
    }

    if (operand.keyWord === 'not_equal') {
      return {
        _not: { email: { _eq: email } },
      };
    }
    console.error(Error(`Unhandled operand: ${operand.keyWord}`));
    return {};
  },
  searchQuery: SEARCH_PEOPLE_QUERY,
  searchTemplate: (searchInput: string) => ({
    email: { _ilike: `%${searchInput}%` },
  }),
  searchResultMapper: (person: GraphqlQueryPerson) => ({
    displayValue: person.email,
    value: { email: person.email },
  }),
  operands: [
    { label: 'Equal', id: 'equal', keyWord: 'equal' },
    { label: 'Not equal', id: 'not-equal', keyWord: 'not_equal' },
  ],
} satisfies FilterType<People_Bool_Exp>;

const cityFilter = {
  key: 'city',
  label: 'City',
  icon: <FaMapPin />,
  whereTemplate: (operand, { city }) => {
    if (operand.keyWord === 'equal') {
      return {
        city: { _eq: city },
      };
    }

    if (operand.keyWord === 'not_equal') {
      return {
        _not: { city: { _eq: city } },
      };
    }
    console.error(Error(`Unhandled operand: ${operand.keyWord}`));
    return {};
  },
  searchQuery: SEARCH_PEOPLE_QUERY,
  searchTemplate: (searchInput: string) => ({
    city: { _ilike: `%${searchInput}%` },
  }),
  searchResultMapper: (person: GraphqlQueryPerson) => ({
    displayValue: person.city,
    value: { city: person.city },
  }),
  operands: [
    { label: 'Equal', id: 'equal', keyWord: 'equal' },
    { label: 'Not equal', id: 'not-equal', keyWord: 'not_equal' },
  ],
} satisfies FilterType<People_Bool_Exp>;

export const availableFilters = [
  fullnameFilter,
  companyFilter,
  emailFilter,
  cityFilter,
  // {
  //   key: 'phone',
  //   label: 'Phone',
  //   icon: faPhone,
  //   whereTemplate: () => ({ phone: { _ilike: '%value%' } }),
  //   searchQuery: GET_PEOPLE,
  //   searchTemplate: { phone: { _ilike: '%value%' } },
  // },
  // {
  //   key: 'created_at',
  //   label: 'Created at',
  //   icon: faCalendar,
  //   whereTemplate: () => ({ created_at: { _eq: '%value%' } }),
  //   searchQuery: GET_PEOPLE,
  //   searchTemplate: { created_at: { _eq: '%value%' } },
  // },
] satisfies FilterType<People_Bool_Exp>[];

const columnHelper = createColumnHelper<Person>();
export const peopleColumns = [
  columnHelper.accessor('id', {
    header: () => (
      <Checkbox id={`person-select-all`} name={`person-select-all`} />
    ),
    cell: (props) => (
      <Checkbox
        id={`person-selected-${props.row.original.email}`}
        name={`person-selected-${props.row.original.email}`}
      />
    ),
  }),
  columnHelper.accessor('firstname', {
    header: () => <ColumnHead viewName="People" viewIcon={<FaRegUser />} />,
    cell: (props) => (
      <EditableFullName
        firstname={props.row.original.firstname}
        lastname={props.row.original.lastname}
        changeHandler={(firstName: string, lastName: string) => {
          const person = props.row.original;
          person.firstname = firstName;
          person.lastname = lastName;
          updatePerson(person).catch((error) => console.error(error)); // TODO: handle error
        }}
      />
    ),
  }),
  columnHelper.accessor('email', {
    header: () => <ColumnHead viewName="Email" viewIcon={<FaEnvelope />} />,
    cell: (props) => (
      <EditableText
        placeholder="Email"
        content={props.row.original.email}
        changeHandler={(value: string) => {
          const person = props.row.original;
          person.email = value;
          updatePerson(person).catch((error) => console.error(error)); // TODO: handle error
        }}
      />
    ),
  }),
  columnHelper.accessor('company', {
    header: () => (
      <ColumnHead viewName="Company" viewIcon={<FaRegBuilding />} />
    ),
    cell: (props) => (
      <ClickableCell href="#">
        <CompanyChip
          name={props.row.original.company.name}
          picture={`https://www.google.com/s2/favicons?domain=${props.row.original.company.domain_name}&sz=256`}
        />
      </ClickableCell>
    ),
  }),
  columnHelper.accessor('phone', {
    header: () => <ColumnHead viewName="Phone" viewIcon={<FaPhone />} />,
    cell: (props) => (
      <EditablePhone
        placeholder="Phone"
        value={props.row.original.phone}
        changeHandler={(value: string) => {
          const person = props.row.original;
          person.phone = value;
          updatePerson(person).catch((error) => console.error(error)); // TODO: handle error
        }}
      />
    ),
  }),
  columnHelper.accessor('creationDate', {
    header: () => <ColumnHead viewName="Creation" viewIcon={<FaCalendar />} />,
    cell: (props) => (
      <ClickableCell href="#">
        {new Intl.DateTimeFormat(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(props.row.original.creationDate)}
      </ClickableCell>
    ),
  }),
  columnHelper.accessor('pipe', {
    header: () => <ColumnHead viewName="Pipe" viewIcon={<FaStream />} />,
    cell: (props) => (
      <ClickableCell href="#">
        <PipeChip opportunity={props.row.original.pipe} />
      </ClickableCell>
    ),
  }),
  columnHelper.accessor('city', {
    header: () => <ColumnHead viewName="City" viewIcon={<FaMapPin />} />,
    cell: (props) => (
      <EditableText
        shouldAlignRight={true}
        placeholder="City"
        content={props.row.original.city}
        changeHandler={(value: string) => {
          const person = props.row.original;
          person.city = value;
          updatePerson(person).catch((error) => console.error(error)); // TODO: handle error
        }}
      />
    ),
  }),
];
