import {
  Company,
  mapToCompany,
} from '../../interfaces/entities/company.interface';
import { FaLink, FaBuilding } from 'react-icons/fa';
import { SEARCH_COMPANY_QUERY } from '../../services/api/search/search';
import { FilterConfigType } from '../../interfaces/filters/interface';

export const availableFilters = [
  {
    key: 'company_name',
    label: 'Company',
    icon: <FaBuilding />,
    searchConfig: {
      query: SEARCH_COMPANY_QUERY,
      template: (searchInput) => ({
        name: { _ilike: `%${searchInput}%` },
      }),
      resultMapper: (company) => ({
        render: (company) => company.name,
        value: mapToCompany(company),
      }),
    },
    selectedValueRender: (company) => company.name || '',
    operands: [
      {
        label: 'Equal',
        id: 'equal',
        whereTemplate: (company) => ({
          name: { _eq: company.name },
        }),
      },
      {
        label: 'Not equal',
        id: 'not-equal',
        whereTemplate: (company) => ({
          _not: { name: { _eq: company.name } },
        }),
      },
    ],
  } satisfies FilterConfigType<Company, Company>,
  {
    key: 'company_domain_name',
    label: 'Url',
    icon: <FaLink />,
    searchConfig: {
      query: SEARCH_COMPANY_QUERY,
      template: (searchInput) => ({
        name: { _ilike: `%${searchInput}%` },
      }),
      resultMapper: (company) => ({
        render: (company) => company.domainName,
        value: mapToCompany(company),
      }),
    },
    selectedValueRender: (company) => company.domainName || '',
    operands: [
      {
        label: 'Equal',
        id: 'equal',
        whereTemplate: (company) => ({
          domain_name: { _eq: company.domainName },
        }),
      },
      {
        label: 'Not equal',
        id: 'not-equal',
        whereTemplate: (company) => ({
          _not: { domain_name: { _eq: company.domainName } },
        }),
      },
    ],
  } satisfies FilterConfigType<Company, Company>,
];
