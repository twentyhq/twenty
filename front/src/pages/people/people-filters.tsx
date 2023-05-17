import { FaEnvelope, FaMapPin, FaUser, FaBuilding } from 'react-icons/fa';
import {
  Person,
  mapToPerson,
} from '../../interfaces/entities/person.interface';
import {
  SEARCH_COMPANY_QUERY,
  SEARCH_PEOPLE_QUERY,
} from '../../services/api/search/search';
import {
  Company,
  mapToCompany,
} from '../../interfaces/entities/company.interface';
import { FilterConfigType } from '../../interfaces/filters/interface';

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
