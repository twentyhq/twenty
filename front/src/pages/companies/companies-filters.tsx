import {
  TbBuilding,
  TbCalendar,
  TbLink,
  TbMapPin,
  TbSum,
} from 'react-icons/tb';
import { Company } from '../../interfaces/entities/company.interface';
import { FilterConfigType } from '../../interfaces/filters/interface';

export const nameFilter = {
  key: 'company_name',
  label: 'Company',
  icon: <TbBuilding size={16} />,
  type: 'text',
  operands: [
    {
      label: 'Contains',
      id: 'like',
      whereTemplate: (searchString) => ({
        name: { _ilike: `%${searchString}%` },
      }),
    },
    {
      label: 'Does not contain',
      id: 'not_like',
      whereTemplate: (searchString) => ({
        _not: { name: { _ilike: `%${searchString}%` } },
      }),
    },
  ],
} satisfies FilterConfigType<Company, string>;

export const urlFilter = {
  key: 'company_domain_name',
  label: 'Url',
  icon: <TbLink size={16} />,
  type: 'text',
  operands: [
    {
      label: 'Contains',
      id: 'like',
      whereTemplate: (searchString) => ({
        domain_name: { _ilike: `%${searchString}%` },
      }),
    },
    {
      label: 'Does not contain',
      id: 'not_like',
      whereTemplate: (searchString) => ({
        _not: { domain_name: { _ilike: `%${searchString}%` } },
      }),
    },
  ],
} satisfies FilterConfigType<Company, string>;

export const addressFilter = {
  key: 'company_address',
  label: 'Address',
  icon: <TbMapPin size={16} />,
  type: 'text',
  operands: [
    {
      label: 'Contains',
      id: 'like',
      whereTemplate: (searchString) => ({
        address: { _ilike: `%${searchString}%` },
      }),
    },
    {
      label: 'Does not contain',
      id: 'not_like',
      whereTemplate: (searchString) => ({
        _not: { address: { _ilike: `%${searchString}%` } },
      }),
    },
  ],
} satisfies FilterConfigType<Company, string>;

export const employeesFilter = {
  key: 'company_employees',
  label: 'Employees',
  icon: <TbSum size={16} />,
  type: 'text',
  operands: [
    {
      label: 'Greater than',
      id: 'greater_than',
      whereTemplate: (searchString) => ({
        employees: {
          _gte: isNaN(Number(searchString)) ? undefined : Number(searchString),
        },
      }),
    },
    {
      label: 'Less than',
      id: 'less_than',
      whereTemplate: (searchString) => ({
        employees: {
          _lte: isNaN(Number(searchString)) ? undefined : Number(searchString),
        },
      }),
    },
  ],
} satisfies FilterConfigType<Company, string>;

export const creationDateFilter = {
  key: 'company_created_at',
  label: 'Created At',
  icon: <TbCalendar size={16} />,
  type: 'date',
  operands: [
    {
      label: 'Greater than',
      id: 'greater_than',
      whereTemplate: (searchString) => ({
        created_at: {
          _gte: searchString,
        },
      }),
    },
    {
      label: 'Less than',
      id: 'less_than',
      whereTemplate: (searchString) => ({
        created_at: {
          _lte: searchString,
        },
      }),
    },
  ],
} satisfies FilterConfigType<Company, string>;

export const availableFilters = [
  nameFilter,
  urlFilter,
  addressFilter,
  employeesFilter,
  creationDateFilter,
];
