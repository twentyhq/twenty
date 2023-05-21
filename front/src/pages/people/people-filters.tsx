import { Person } from '../../interfaces/entities/person.interface';
import { SEARCH_COMPANY_QUERY } from '../../services/api/search/search';
import {
  Company,
  mapToCompany,
} from '../../interfaces/entities/company.interface';
import { FilterConfigType } from '../../interfaces/filters/interface';
import { TbBuilding, TbMail, TbMapPin, TbUser } from 'react-icons/tb';

export const fullnameFilter = {
  key: 'fullname',
  label: 'People',
  icon: <TbUser size={16} />,
  type: 'text',
  operands: [
    {
      label: 'Contains',
      id: 'like',
      whereTemplate: (searchString) => ({
        _or: [
          { firstname: { _ilike: `%${searchString}%` } },
          { lastname: { _ilike: `%${searchString}%` } },
        ],
      }),
    },
    {
      label: 'Does not contain',
      id: 'not_like',
      whereTemplate: (searchString) => ({
        _not: {
          _and: [
            { firstname: { _ilike: `%${searchString}%` } },
            { lastname: { _ilike: `%${searchString}%` } },
          ],
        },
      }),
    },
  ],
} satisfies FilterConfigType<Person, string>;

export const companyFilter = {
  key: 'company_name',
  label: 'Company',
  icon: <TbBuilding size={16} />,
  type: 'relation',
  searchConfig: {
    query: SEARCH_COMPANY_QUERY,
    template: (searchString: string) => ({
      name: { _ilike: `%${searchString}%` },
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
  icon: <TbMail size={16} />,
  type: 'text',
  operands: [
    {
      label: 'Contains',
      id: 'like',
      whereTemplate: (searchString) => ({
        email: { _ilike: `%${searchString}%` },
      }),
    },
    {
      label: 'Does not contain',
      id: 'not_like',
      whereTemplate: (searchString) => ({
        _not: { email: { _ilike: `%${searchString}%` } },
      }),
    },
  ],
} satisfies FilterConfigType<Person, string>;

export const cityFilter = {
  key: 'city',
  label: 'City',
  icon: <TbMapPin size={16} />,
  type: 'text',
  operands: [
    {
      label: 'Contains',
      id: 'like',
      whereTemplate: (searchString) => ({
        city: { _ilike: `%${searchString}%` },
      }),
    },
    {
      label: 'Does not contain',
      id: 'not_like',
      whereTemplate: (searchString) => ({
        _not: { city: { _ilike: `%${searchString}%` } },
      }),
    },
  ],
} satisfies FilterConfigType<Person, string>;

export const availableFilters = [
  fullnameFilter,
  companyFilter,
  emailFilter,
  cityFilter,
] satisfies FilterConfigType<Person>[];
