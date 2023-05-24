import { Person } from '../../interfaces/entities/person.interface';
import { SEARCH_COMPANY_QUERY } from '../../services/api/search/search';
import {
  Company,
  mapToCompany,
} from '../../interfaces/entities/company.interface';
import { FilterConfigType } from '../../interfaces/filters/interface';
import {
  TbBuilding,
  TbCalendar,
  TbMail,
  TbMapPin,
  TbPhone,
  TbUser,
} from 'react-icons/tb';

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
        OR: [
          { firstname: { contains: `%${searchString}%` } },
          { lastname: { contains: `%${searchString}%` } },
        ],
      }),
    },
    {
      label: 'Does not contain',
      id: 'not_like',
      whereTemplate: (searchString) => ({
        NOT: [
          {
            AND: [
              { firstname: { contains: `%${searchString}%` } },
              { lastname: { contains: `%${searchString}%` } },
            ],
          },
        ],
      }),
    },
  ],
} satisfies FilterConfigType<Person, string>;

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
        email: { contains: `%${searchString}%` },
      }),
    },
    {
      label: 'Does not contain',
      id: 'not_like',
      whereTemplate: (searchString) => ({
        NOT: [{ email: { contains: `%${searchString}%` } }],
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
      name: { contains: `%${searchString}%` },
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
        company: { is: { name: { equals: company.name } } },
      }),
    },
    {
      label: 'Is not',
      id: 'is_not',
      whereTemplate: (company) => ({
        NOT: [{ company: { is: { name: { equals: company.name } } } }],
      }),
    },
  ],
} satisfies FilterConfigType<Person, Company>;

export const phoneFilter = {
  key: 'phone',
  label: 'Phone',
  icon: <TbPhone size={16} />,
  type: 'text',
  operands: [
    {
      label: 'Contains',
      id: 'like',
      whereTemplate: (searchString) => ({
        phone: { contains: `%${searchString}%` },
      }),
    },
    {
      label: 'Does not contain',
      id: 'not_like',
      whereTemplate: (searchString) => ({
        NOT: [{ phone: { contains: `%${searchString}%` } }],
      }),
    },
  ],
} satisfies FilterConfigType<Person, string>;

export const creationDateFilter = {
  key: 'person_created_at',
  label: 'Created At',
  icon: <TbCalendar size={16} />,
  type: 'date',
  operands: [
    {
      label: 'Greater than',
      id: 'greater_than',
      whereTemplate: (searchString) => ({
        createdAt: {
          gte: searchString,
        },
      }),
    },
    {
      label: 'Less than',
      id: 'less_than',
      whereTemplate: (searchString) => ({
        createdAt: {
          lte: searchString,
        },
      }),
    },
  ],
} satisfies FilterConfigType<Company, string>;

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
        city: { contains: `%${searchString}%` },
      }),
    },
    {
      label: 'Does not contain',
      id: 'not_like',
      whereTemplate: (searchString) => ({
        NOT: [{ city: { contains: `%${searchString}%` } }],
      }),
    },
  ],
} satisfies FilterConfigType<Person, string>;

export const availableFilters = [
  fullnameFilter,
  emailFilter,
  companyFilter,
  phoneFilter,
  creationDateFilter,
  cityFilter,
] satisfies FilterConfigType<Person>[];
