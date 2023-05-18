import { Company } from '../../interfaces/entities/company.interface';
import { FaLink, FaBuilding } from 'react-icons/fa';
import { FilterConfigType } from '../../interfaces/filters/interface';

export const availableFilters = [
  {
    key: 'company_name',
    label: 'Company',
    icon: <FaBuilding />,
    operands: [
      {
        label: 'Contains',
        id: 'like',
        whereTemplate: (searchString) => ({
          name: { _eq: searchString },
        }),
      },
      {
        label: 'Does not contain',
        id: 'not_like',
        whereTemplate: (searchString) => ({
          _not: { name: { _eq: searchString } },
        }),
      },
    ],
  } satisfies FilterConfigType<Company, string>,
  {
    key: 'company_domain_name',
    label: 'Url',
    icon: <FaLink />,
    operands: [
      {
        label: 'Contains',
        id: 'like',
        whereTemplate: (searchString) => ({
          domain_name: { _eq: searchString },
        }),
      },
      {
        label: 'Does not contain',
        id: 'not_like',
        whereTemplate: (searchString) => ({
          _not: { domain_name: { _eq: searchString } },
        }),
      },
    ],
  } satisfies FilterConfigType<Company, string>,
];
