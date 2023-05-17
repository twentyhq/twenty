import {
  FaRegBuilding,
  FaCalendar,
  FaEnvelope,
  FaRegUser,
  FaMapPin,
  FaPhone,
  FaUser,
  FaBuilding,
} from 'react-icons/fa';
import { CellContext, createColumnHelper } from '@tanstack/react-table';
import ColumnHead from '../../components/table/ColumnHead';
import Checkbox from '../../components/form/Checkbox';
import CompanyChip, {
  CompanyChipPropsType,
} from '../../components/chips/CompanyChip';
import { Person, mapToPerson } from '../../interfaces/person.interface';
import EditableText from '../../components/table/editable-cell/EditableText';
import {
  FilterConfigType,
  SearchConfigType,
  SortType,
} from '../../components/table/table-header/interface';
import { Order_By, People_Order_By } from '../../generated/graphql';
import {
  SEARCH_COMPANY_QUERY,
  SEARCH_PEOPLE_QUERY,
} from '../../services/search/search';
import { Company, mapToCompany } from '../../interfaces/company.interface';
import EditablePhone from '../../components/table/editable-cell/EditablePhone';
import EditableFullName from '../../components/table/editable-cell/EditableFullName';
import EditableDate from '../../components/table/editable-cell/EditableDate';
import EditableRelation from '../../components/table/editable-cell/EditableRelation';
import { updatePerson } from '../../services/people';
import { useMemo } from 'react';
import { SelectAllCheckbox } from '../../components/table/SelectAllCheckbox';

export const availableSorts = [
  {
    key: 'fullname',
    label: 'People',
    icon: <FaRegUser />,
    _type: 'custom_sort',
    orderByTemplate: (order: Order_By) => ({
      firstname: order,
      lastname: order,
    }),
  },
  {
    key: 'company_name',
    label: 'Company',
    icon: <FaRegBuilding />,
    _type: 'custom_sort',
    orderByTemplate: (order: Order_By) => ({ company: { name: order } }),
  },
  {
    key: 'email',
    label: 'Email',
    icon: <FaEnvelope />,
    _type: 'default_sort',
  },
  {
    key: 'phone',
    label: 'Phone',
    icon: <FaPhone />,
    _type: 'default_sort',
  },
  {
    key: 'created_at',
    label: 'Created at',
    icon: <FaCalendar />,
    _type: 'default_sort',
  },
  {
    key: 'city',
    label: 'City',
    icon: <FaMapPin />,
    _type: 'default_sort',
  },
] satisfies Array<SortType<People_Order_By>>;

export const fullnameFilter = {
  key: 'fullname',
  label: 'People',
  icon: <FaUser />,
  searchConfig: {
    query: SEARCH_PEOPLE_QUERY,
    template: (searchInput: string) => ({
      _or: [
        { firstname: { _ilike: `%${searchInput}%` } },
        { lastname: { _ilike: `%${searchInput}%` } },
      ],
    }),
    resultMapper: (person) => ({
      render: (person) => `${person.firstname} ${person.lastname}`,
      value: mapToPerson(person),
    }),
  },
  selectedValueRender: (person) => `${person.firstname} ${person.lastname}`,
  operands: [
    {
      label: 'Equal',
      id: 'equal',
      whereTemplate: (person) => ({
        _and: [
          { firstname: { _eq: `${person.firstname}` } },
          { lastname: { _eq: `${person.lastname}` } },
        ],
      }),
    },
    {
      label: 'Not equal',
      id: 'not-equal',
      whereTemplate: (person) => ({
        _not: {
          _and: [
            { firstname: { _eq: `${person.firstname}` } },
            { lastname: { _eq: `${person.lastname}` } },
          ],
        },
      }),
    },
  ],
} satisfies FilterConfigType<Person, Person>;

export const companyFilter = {
  key: 'company_name',
  label: 'Company',
  icon: <FaBuilding />,
  searchConfig: {
    query: SEARCH_COMPANY_QUERY,
    template: (searchInput: string) => ({
      name: { _ilike: `%${searchInput}%` },
    }),
    resultMapper: (data) => ({
      value: mapToCompany(data),
      render: (company) => company.name,
    }),
  },
  selectedValueRender: (company) => company.name || '',
  operands: [
    {
      label: 'Equal',
      id: 'equal',
      whereTemplate: (company) => ({
        company: { name: { _eq: company.name } },
      }),
    },
    {
      label: 'Not equal',
      id: 'not-equal',
      whereTemplate: (company) => ({
        _not: { company: { name: { _eq: company.name } } },
      }),
    },
  ],
} satisfies FilterConfigType<Person, Company>;

export const emailFilter = {
  key: 'email',
  label: 'Email',
  icon: <FaEnvelope />,
  searchConfig: {
    query: SEARCH_PEOPLE_QUERY,
    template: (searchInput: string) => ({
      email: { _ilike: `%${searchInput}%` },
    }),
    resultMapper: (person) => ({
      render: (person) => person.email,
      value: mapToPerson(person),
    }),
  },
  operands: [
    {
      label: 'Equal',
      id: 'equal',
      whereTemplate: (person) => ({
        email: { _eq: person.email },
      }),
    },
    {
      label: 'Not equal',
      id: 'not-equal',
      whereTemplate: (person) => ({
        _not: { email: { _eq: person.email } },
      }),
    },
  ],
  selectedValueRender: (person) => person.email || '',
} satisfies FilterConfigType<Person, Person>;

export const cityFilter = {
  key: 'city',
  label: 'City',
  icon: <FaMapPin />,
  searchConfig: {
    query: SEARCH_PEOPLE_QUERY,
    template: (searchInput: string) => ({
      city: { _ilike: `%${searchInput}%` },
    }),
    resultMapper: (person) => ({
      render: (person) => person.city,
      value: mapToPerson(person),
    }),
  },
  operands: [
    {
      label: 'Equal',
      id: 'equal',
      whereTemplate: (person) => ({
        city: { _eq: person.city },
      }),
    },
    {
      label: 'Not equal',
      id: 'not-equal',
      whereTemplate: (person) => ({
        _not: { city: { _eq: person.city } },
      }),
    },
  ],
  selectedValueRender: (person) => person.email || '',
} satisfies FilterConfigType<Person, Person>;

export const availableFilters = [
  fullnameFilter,
  companyFilter,
  emailFilter,
  cityFilter,
] satisfies FilterConfigType<Person, any>[];

const columnHelper = createColumnHelper<Person>();

export const usePeopleColumns = () => {
  return useMemo(() => {
    return [
      {
        id: 'select',
        header: ({ table }: any) => (
          <SelectAllCheckbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: (props: CellContext<Person, string>) => (
          <Checkbox
            id={`person-selected-${props.row.original.id}`}
            name={`person-selected-${props.row.original.id}`}
            checked={props.row.getIsSelected()}
            onChange={props.row.getToggleSelectedHandler()}
          />
        ),
      },
      columnHelper.accessor('firstname', {
        header: () => <ColumnHead viewName="People" viewIcon={<FaRegUser />} />,
        cell: (props) => (
          <EditableFullName
            firstname={props.row.original.firstname || ''}
            lastname={props.row.original.lastname || ''}
            changeHandler={(firstName: string, lastName: string) => {
              const person = props.row.original;
              person.firstname = firstName;
              person.lastname = lastName;
              updatePerson(person);
            }}
          />
        ),
      }),
      columnHelper.accessor('email', {
        header: () => <ColumnHead viewName="Email" viewIcon={<FaEnvelope />} />,
        cell: (props) => (
          <EditableText
            placeholder="Email"
            content={props.row.original.email || ''}
            changeHandler={(value: string) => {
              const person = props.row.original;
              person.email = value;
              updatePerson(person);
            }}
          />
        ),
      }),
      columnHelper.accessor('company', {
        header: () => (
          <ColumnHead viewName="Company" viewIcon={<FaRegBuilding />} />
        ),
        cell: (props) => (
          <EditableRelation<Company, CompanyChipPropsType>
            relation={props.row.original.company}
            searchPlaceholder="Company"
            ChipComponent={CompanyChip}
            chipComponentPropsMapper={(company): CompanyChipPropsType => {
              return {
                name: company.name || '',
                picture: `https://www.google.com/s2/favicons?domain=${company.domainName}&sz=256`,
              };
            }}
            changeHandler={(relation) => {
              const person = props.row.original;
              if (person.company) {
                person.company.id = relation.id;
              } else {
                person.company = relation;
              }
              updatePerson(person);
            }}
            searchConfig={
              {
                query: SEARCH_COMPANY_QUERY,
                template: (searchInput: string) => ({
                  name: { _ilike: `%${searchInput}%` },
                }),
                resultMapper: (company) => ({
                  render: (company) => company.name,
                  value: mapToCompany(company),
                }),
              } satisfies SearchConfigType<Company>
            }
          />
        ),
      }),
      columnHelper.accessor('phone', {
        header: () => <ColumnHead viewName="Phone" viewIcon={<FaPhone />} />,
        cell: (props) => (
          <EditablePhone
            placeholder="Phone"
            value={props.row.original.phone || ''}
            changeHandler={(value: string) => {
              const person = props.row.original;
              person.phone = value;
              updatePerson(person);
            }}
          />
        ),
      }),
      columnHelper.accessor('creationDate', {
        header: () => (
          <ColumnHead viewName="Creation" viewIcon={<FaCalendar />} />
        ),
        cell: (props) => (
          <EditableDate
            value={props.row.original.creationDate || new Date()}
            changeHandler={(value: Date) => {
              const person = props.row.original;
              person.creationDate = value;
              updatePerson(person);
            }}
          />
        ),
      }),
      columnHelper.accessor('city', {
        header: () => <ColumnHead viewName="City" viewIcon={<FaMapPin />} />,
        cell: (props) => (
          <EditableText
            editModeHorizontalAlign="right"
            placeholder="City"
            content={props.row.original.city || ''}
            changeHandler={(value: string) => {
              const person = props.row.original;
              person.city = value;
              updatePerson(person);
            }}
          />
        ),
      }),
    ];
  }, []);
};
