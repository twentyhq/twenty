import {
  TbBuilding,
  TbCalendar,
  TbLink,
  TbMapPin,
  TbSum,
  TbUser,
} from 'react-icons/tb';
import { Company } from '../../interfaces/entities/company.interface';
import { FilterConfigType } from '../../interfaces/filters/interface';
import { SEARCH_USER_QUERY } from '../../services/api/search/search';
import { User, mapToUser } from '../../interfaces/entities/user.interface';
import { QueryMode } from '../../generated/graphql';

export const nameFilter = {
  key: 'name',
  label: 'Company',
  icon: <TbBuilding size={16} />,
  type: 'text',
  operands: [
    {
      label: 'Contains',
      id: 'like',
      whereTemplate: (searchString) => ({
        name: { contains: `%${searchString}%`, mode: QueryMode.Insensitive },
      }),
    },
    {
      label: 'Does not contain',
      id: 'not_like',
      whereTemplate: (searchString) => ({
        NOT: [
          {
            name: {
              contains: `%${searchString}%`,
              mode: QueryMode.Insensitive,
            },
          },
        ],
      }),
    },
  ],
} satisfies FilterConfigType<Company, string>;

export const employeesFilter = {
  key: 'employees',
  label: 'Employees',
  icon: <TbSum size={16} />,
  type: 'text',
  operands: [
    {
      label: 'Greater than',
      id: 'greater_than',
      whereTemplate: (searchString) => ({
        employees: {
          gte: isNaN(Number(searchString)) ? undefined : Number(searchString),
        },
      }),
    },
    {
      label: 'Less than',
      id: 'less_than',
      whereTemplate: (searchString) => ({
        employees: {
          lte: isNaN(Number(searchString)) ? undefined : Number(searchString),
        },
      }),
    },
  ],
} satisfies FilterConfigType<Company, string>;

export const urlFilter = {
  key: 'domainName',
  label: 'Url',
  icon: <TbLink size={16} />,
  type: 'text',
  operands: [
    {
      label: 'Contains',
      id: 'like',
      whereTemplate: (searchString) => ({
        domainName: {
          contains: `%${searchString}%`,
          mode: QueryMode.Insensitive,
        },
      }),
    },
    {
      label: 'Does not contain',
      id: 'not_like',
      whereTemplate: (searchString) => ({
        NOT: [
          {
            domainName: {
              contains: `%${searchString}%`,
              mode: QueryMode.Insensitive,
            },
          },
        ],
      }),
    },
  ],
} satisfies FilterConfigType<Company, string>;

export const addressFilter = {
  key: 'address',
  label: 'Address',
  icon: <TbMapPin size={16} />,
  type: 'text',
  operands: [
    {
      label: 'Contains',
      id: 'like',
      whereTemplate: (searchString) => ({
        address: { contains: `%${searchString}%`, mode: QueryMode.Insensitive },
      }),
    },
    {
      label: 'Does not contain',
      id: 'not_like',
      whereTemplate: (searchString) => ({
        NOT: [
          {
            address: {
              contains: `%${searchString}%`,
              mode: QueryMode.Insensitive,
            },
          },
        ],
      }),
    },
  ],
} satisfies FilterConfigType<Company, string>;

export const ccreatedAtFilter = {
  key: 'createdAt',
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

export const accountOwnerFilter = {
  key: 'accountOwner',
  label: 'Account Owner',
  icon: <TbUser size={16} />,
  type: 'relation',
  searchConfig: {
    query: SEARCH_USER_QUERY,
    template: (searchString: string) => ({
      displayName: {
        contains: `%${searchString}%`,
        mode: QueryMode.Insensitive,
      },
    }),
    resultMapper: (data) => ({
      value: mapToUser(data),
      render: (owner) => owner.displayName,
    }),
  },
  selectedValueRender: (owner) => owner.displayName || '',
  operands: [
    {
      label: 'Is',
      id: 'is',
      whereTemplate: (owner) => ({
        accountOwner: { is: { displayName: { equals: owner.displayName } } },
      }),
    },
    {
      label: 'Is not',
      id: 'is_not',
      whereTemplate: (owner) => ({
        NOT: [
          {
            accountOwner: {
              is: { displayName: { equals: owner.displayName } },
            },
          },
        ],
      }),
    },
  ],
} satisfies FilterConfigType<Company, User>;

export const availableFilters = [
  nameFilter,
  employeesFilter,
  urlFilter,
  addressFilter,
  ccreatedAtFilter,
  accountOwnerFilter,
];
