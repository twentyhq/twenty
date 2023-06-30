import { FilterConfigType } from '@/filters-and-sorts/interfaces/filters/interface';
import { SEARCH_USER_QUERY } from '@/search/services/search';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconLink,
  IconMap,
  IconUser,
  IconUsers,
} from '@/ui/icons/index';
import { icon } from '@/ui/themes/icon';
import { Company, QueryMode, User } from '~/generated/graphql';

type EntityFilter<T> = {
  field: keyof T;
  label: string;
  icon: JSX.Element;
  type: 'text' | 'date' | 'entity' | 'number';
}[];

export const companiesFilters: EntityFilter<Company> = [
  {
    field: 'name',
    label: 'Name',
    icon: (
      <IconBuildingSkyscraper size={icon.size.md} stroke={icon.stroke.sm} />
    ),
    type: 'text',
  },
  {
    field: 'employees',
    label: 'Employees',
    icon: <IconUsers size={icon.size.md} stroke={icon.stroke.sm} />,
    type: 'number',
  },
];

export const nameFilter = {
  key: 'name',
  label: 'Name',
  icon: <IconBuildingSkyscraper size={icon.size.md} stroke={icon.stroke.sm} />,
  type: 'text',
  operands: [
    {
      label: 'Contains',
      id: 'like',
      whereTemplate: (searchString: string) => ({
        name: { contains: `%${searchString}%`, mode: QueryMode.Insensitive },
      }),
    },
    {
      label: "Doesn't contain",
      id: 'not_like',
      whereTemplate: (searchString: string) => ({
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
} satisfies FilterConfigType<string>;

export const employeesFilter = {
  key: 'employees',
  label: 'Employees',
  icon: <IconUsers size={icon.size.md} stroke={icon.stroke.sm} />,
  type: 'text',
  operands: [
    {
      label: 'Greater than',
      id: 'greater_than',
      whereTemplate: (searchString: string) => ({
        employees: {
          gte: isNaN(Number(searchString)) ? undefined : Number(searchString),
        },
      }),
    },
    {
      label: 'Less than',
      id: 'less_than',
      whereTemplate: (searchString: string) => ({
        employees: {
          lte: isNaN(Number(searchString)) ? undefined : Number(searchString),
        },
      }),
    },
  ],
} satisfies FilterConfigType<string>;

export const urlFilter = {
  key: 'domainName',
  label: 'Url',
  icon: <IconLink size={icon.size.md} stroke={icon.stroke.sm} />,
  type: 'text',
  operands: [
    {
      label: 'Contains',
      id: 'like',
      whereTemplate: (searchString: string) => ({
        domainName: {
          contains: `%${searchString}%`,
          mode: QueryMode.Insensitive,
        },
      }),
    },
    {
      label: "Doesn't contain",
      id: 'not_like',
      whereTemplate: (searchString: string) => ({
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
} satisfies FilterConfigType<string>;

export const addressFilter = {
  key: 'address',
  label: 'Address',
  icon: <IconMap size={icon.size.md} stroke={icon.stroke.sm} />,
  type: 'text',
  operands: [
    {
      label: 'Contains',
      id: 'like',
      whereTemplate: (searchString: string) => ({
        address: { contains: `%${searchString}%`, mode: QueryMode.Insensitive },
      }),
    },
    {
      label: "Doesn't contain",
      id: 'not_like',
      whereTemplate: (searchString: string) => ({
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
} satisfies FilterConfigType<string>;

export const ccreatedAtFilter = {
  key: 'createdAt',
  label: 'Created At',
  icon: <IconCalendarEvent size={icon.size.md} stroke={icon.stroke.sm} />,
  type: 'date',
  operands: [
    {
      label: 'Greater than',
      id: 'greater_than',
      whereTemplate: (searchString: string) => ({
        createdAt: {
          gte: searchString,
        },
      }),
    },
    {
      label: 'Less than',
      id: 'less_than',
      whereTemplate: (searchString: string) => ({
        createdAt: {
          lte: searchString,
        },
      }),
    },
  ],
} satisfies FilterConfigType<string>;

export const accountOwnerFilter = {
  key: 'accountOwner',
  label: 'Account Owner',
  icon: <IconUser size={icon.size.md} stroke={icon.stroke.sm} />,
  type: 'relation',
  searchConfig: {
    query: SEARCH_USER_QUERY,
    template: (searchString: string, currentSelectedId?: string) => ({
      OR: [
        {
          displayName: {
            contains: `%${searchString}%`,
            mode: QueryMode.Insensitive,
          },
        },
        {
          id: currentSelectedId ? { equals: currentSelectedId } : undefined,
        },
      ],
    }),
    resultMapper: (data: any) => ({
      value: data,
      render: (owner: any) => owner.displayName,
    }),
  },
  selectedValueRender: (owner: any) => owner.displayName || '',
  operands: [
    {
      label: 'Is',
      id: 'is',
      whereTemplate: (owner: any) => ({
        accountOwner: { is: { displayName: { equals: owner.displayName } } },
      }),
    },
    {
      label: 'Is not',
      id: 'is_not',
      whereTemplate: (owner: any) => ({
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
} satisfies FilterConfigType<User>;

export const availableFilters = [
  nameFilter,
  employeesFilter,
  urlFilter,
  addressFilter,
  ccreatedAtFilter,
  accountOwnerFilter,
];
