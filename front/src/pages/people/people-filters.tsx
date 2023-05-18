import { FaEnvelope, FaMapPin, FaUser, FaBuilding } from 'react-icons/fa';
import { Person } from '../../interfaces/entities/person.interface';
import { SEARCH_COMPANY_QUERY } from '../../services/api/search/search';
import {
  Company,
  mapToCompany,
} from '../../interfaces/entities/company.interface';
import { FilterConfigType } from '../../interfaces/filters/interface';

export const fullnameFilter = {
  key: 'fullname',
  label: 'People',
  icon: <FaUser />,
  operands: [
    {
      label: 'Contains',
      id: 'like',
      whereTemplate: (searchString) => ({
        _or: [
          { firstname: { _eq: `${searchString}` } },
          { lastname: { _eq: `${searchString}` } },
        ],
      }),
    },
    {
      label: 'Does not contain',
      id: 'not_like',
      whereTemplate: (searchString) => ({
        _not: {
          _and: [
            { firstname: { _eq: `${searchString}` } },
            { lastname: { _eq: `${searchString}` } },
          ],
        },
      }),
    },
  ],
} satisfies FilterConfigType<Person, string>;

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
      label: 'Is',
      id: 'is',
      whereTemplate: (company) => ({
        company: { name: { _eq: company.name } },
      }),
    },
    {
      label: 'Is not',
      id: 'is_not',
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
  operands: [
    {
      label: 'Contains',
      id: 'like',
      whereTemplate: (searchString) => ({
        email: { _eq: searchString },
      }),
    },
    {
      label: 'Does not contain',
      id: 'not_like',
      whereTemplate: (searchString) => ({
        _not: { email: { _eq: searchString } },
      }),
    },
  ],
} satisfies FilterConfigType<Person, string>;

export const cityFilter = {
  key: 'city',
  label: 'City',
  icon: <FaMapPin />,
  operands: [
    {
      label: 'Contains',
      id: 'like',
      whereTemplate: (searchString) => ({
        city: { _eq: searchString },
      }),
    },
    {
      label: 'Does not contain',
      id: 'not_like',
      whereTemplate: (searchString) => ({
        _not: { city: { _eq: searchString } },
      }),
    },
  ],
} satisfies FilterConfigType<Person, string>;

export const availableFilters = [
  fullnameFilter,
  companyFilter,
  emailFilter,
  cityFilter,
] satisfies FilterConfigType<Person, any>[];
