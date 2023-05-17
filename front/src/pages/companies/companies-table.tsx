import { CellContext, createColumnHelper } from '@tanstack/react-table';
import {
  Company,
  mapToCompany,
} from '../../interfaces/entities/company.interface';
import { updateCompany } from '../../services/api/companies';
import ColumnHead from '../../components/table/ColumnHead';
import CompanyChip from '../../components/chips/CompanyChip';
import EditableText from '../../components/editable-cell/EditableText';
import {
  FaRegBuilding,
  FaCalendar,
  FaLink,
  FaMapPin,
  FaRegUser,
  FaUsers,
  FaBuilding,
} from 'react-icons/fa';
import PersonChip, {
  PersonChipPropsType,
} from '../../components/chips/PersonChip';
import EditableChip from '../../components/editable-cell/EditableChip';
import { Companies_Order_By } from '../../generated/graphql';
import {
  SEARCH_COMPANY_QUERY,
  SEARCH_USER_QUERY,
} from '../../services/api/search/search';
import EditableDate from '../../components/editable-cell/EditableDate';
import EditableRelation from '../../components/editable-cell/EditableRelation';
import { User, mapToUser } from '../../interfaces/entities/user.interface';
import { useMemo } from 'react';
import { SelectAllCheckbox } from '../../components/table/SelectAllCheckbox';
import Checkbox from '../../components/form/Checkbox';
import { SortType } from '../../interfaces/sorts/interface';
import { FilterConfigType } from '../../interfaces/filters/interface';
import { SearchConfigType } from '../../interfaces/search/interface';

export const availableSorts = [
  {
    key: 'name',
    label: 'Name',
    icon: <FaBuilding />,
    _type: 'default_sort',
  },
  {
    key: 'employees',
    label: 'Employees',
    icon: <FaUsers />,
    _type: 'default_sort',
  },
  {
    key: 'domain_name',
    label: 'Url',
    icon: <FaLink />,
    _type: 'default_sort',
  },
  {
    key: 'address',
    label: 'Address',
    icon: <FaMapPin />,
    _type: 'default_sort',
  },
  {
    key: 'created_at',
    label: 'Creation',
    icon: <FaCalendar />,
    _type: 'default_sort',
  },
] satisfies Array<SortType<Companies_Order_By>>;

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

const columnHelper = createColumnHelper<Company>();

export const useCompaniesColumns = () => {
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
        cell: (props: CellContext<Company, string>) => (
          <Checkbox
            id={`company-selected-${props.row.original.id}`}
            name={`company-selected-${props.row.original.id}`}
            checked={props.row.getIsSelected()}
            onChange={props.row.getToggleSelectedHandler()}
          />
        ),
      },
      columnHelper.accessor('name', {
        header: () => (
          <ColumnHead viewName="Name" viewIcon={<FaRegBuilding />} />
        ),
        cell: (props) => (
          <EditableChip
            value={props.row.original.name || ''}
            placeholder="Name"
            picture={`https://www.google.com/s2/favicons?domain=${props.row.original.domainName}&sz=256`}
            changeHandler={(value: string) => {
              const company = props.row.original;
              company.name = value;
              updateCompany(company);
            }}
            chipClickHandler={(editing) => {
              const company = props.row.original;
              company.name = undefined;
              updateCompany(company);
            }}
            ChipComponent={CompanyChip}
          />
        ),
      }),
      columnHelper.accessor('employees', {
        header: () => (
          <ColumnHead viewName="Employees" viewIcon={<FaUsers />} />
        ),
        cell: (props) => (
          <EditableText
            content={props.row.original.employees || ''}
            changeHandler={(value) => {
              const company = props.row.original;
              company.employees = value;
              updateCompany(company);
            }}
          />
        ),
      }),
      columnHelper.accessor('domainName', {
        header: () => <ColumnHead viewName="URL" viewIcon={<FaLink />} />,
        cell: (props) => (
          <EditableText
            content={props.row.original.domainName || ''}
            changeHandler={(value) => {
              const company = props.row.original;
              company.domainName = value;
              updateCompany(company);
            }}
          />
        ),
      }),
      columnHelper.accessor('address', {
        header: () => <ColumnHead viewName="Address" viewIcon={<FaMapPin />} />,
        cell: (props) => (
          <EditableText
            content={props.row.original.address || ''}
            changeHandler={(value) => {
              const company = props.row.original;
              company.address = value;
              updateCompany(company);
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
              const company = props.row.original;
              company.creationDate = value;
              updateCompany(company);
            }}
          />
        ),
      }),
      columnHelper.accessor('accountOwner', {
        header: () => (
          <ColumnHead viewName="Account Owner" viewIcon={<FaRegUser />} />
        ),
        cell: (props) => (
          <EditableRelation<User, PersonChipPropsType>
            relation={props.row.original.accountOwner}
            searchPlaceholder="Account Owner"
            ChipComponent={PersonChip}
            chipComponentPropsMapper={(
              accountOwner: User,
            ): PersonChipPropsType => {
              return {
                name: accountOwner.displayName || '',
              };
            }}
            changeHandler={(relation: User | null) => {
              const company = props.row.original;
              if (!relation) {
                company.accountOwner = null;
                return;
              }
              if (company.accountOwner) {
                company.accountOwner.id = relation.id;
              } else {
                company.accountOwner = {
                  __typename: 'users',
                  id: relation.id,
                  email: relation.email,
                  displayName: relation.displayName,
                };
              }
              updateCompany(company);
            }}
            searchConfig={
              {
                query: SEARCH_USER_QUERY,
                template: (searchInput: string) => ({
                  displayName: { _ilike: `%${searchInput}%` },
                }),
                resultMapper: (accountOwner) => ({
                  render: (accountOwner) => accountOwner.displayName,
                  value: mapToUser(accountOwner),
                }),
              } satisfies SearchConfigType<User>
            }
          />
        ),
      }),
    ];
  }, []);
};
