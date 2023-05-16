import { CellContext, createColumnHelper } from '@tanstack/react-table';
import {
  Company,
  GraphqlQueryCompany,
} from '../../interfaces/company.interface';
import { updateCompany } from '../../api/companies';
import ColumnHead from '../../components/table/ColumnHead';
import CompanyChip from '../../components/chip/CompanyChip';
import EditableText from '../../components/editable-cell/EditableText';
import {
  FaRegBuilding,
  FaCalendar,
  FaLink,
  FaMapPin,
  FaRegUser,
  FaUsers,
  FaBuilding,
  FaUser,
} from 'react-icons/fa';
import PersonChip, {
  PersonChipPropsType,
} from '../../components/chip/PersonChip';
import EditableChip from '../../components/editable-cell/EditableChip';
import {
  FilterType,
  SortType,
} from '../../components/table/table-header/interface';
import {
  Companies_Bool_Exp,
  Companies_Order_By,
  Users_Bool_Exp,
} from '../../generated/graphql';
import {
  SEARCH_COMPANY_QUERY,
  SEARCH_USER_QUERY,
} from '../../hooks/search/search';
import EditableDate from '../../components/editable-cell/EditableDate';
import EditableRelation from '../../components/editable-cell/EditableRelation';
import { GraphqlQueryUser, User } from '../../interfaces/user.interface';
import { useMemo } from 'react';
import { SelectAllCheckbox } from '../../components/table/SelectAllCheckbox';
import Checkbox from '../../components/form/Checkbox';

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
    whereTemplate: (operand, { companyName }) => {
      if (operand.keyWord === 'equal') {
        return {
          name: { _eq: companyName },
        };
      }

      if (operand.keyWord === 'not_equal') {
        return {
          _not: { name: { _eq: companyName } },
        };
      }
    },
    searchQuery: SEARCH_COMPANY_QUERY,
    searchTemplate: (searchInput: string) => ({
      name: { _ilike: `%${searchInput}%` },
    }),
    searchResultMapper: (company: GraphqlQueryCompany) => ({
      displayValue: company.name,
      value: { companyName: company.name },
    }),
    operands: [
      { label: 'Equal', id: 'equal', keyWord: 'equal' },
      { label: 'Not equal', id: 'not-equal', keyWord: 'not_equal' },
    ],
  },
  {
    key: 'domainName',
    label: 'Url',
    icon: <FaLink />,
    whereTemplate: (operand, { domainName }) => {
      if (operand.keyWord === 'equal') {
        return {
          domain_name: { _eq: domainName },
        };
      }

      if (operand.keyWord === 'not_equal') {
        return {
          _not: { domain_name: { _eq: domainName } },
        };
      }
    },
    searchQuery: SEARCH_COMPANY_QUERY,
    searchTemplate: (searchInput: string) => ({
      domain_name: { _ilike: `%${searchInput}%` },
    }),
    searchResultMapper: (company: GraphqlQueryCompany) => ({
      displayValue: company.domain_name,
      value: { domainName: company.domain_name },
    }),
    operands: [
      { label: 'Equal', id: 'equal', keyWord: 'equal' },
      { label: 'Not equal', id: 'not-equal', keyWord: 'not_equal' },
    ],
  },
] satisfies Array<FilterType<Companies_Bool_Exp>>;

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
            value={props.row.original.name ?? ''}
            placeholder="Name"
            picture={`https://www.google.com/s2/favicons?domain=${props.row.original.domainName}&sz=256`}
            changeHandler={(value: string) => {
              const company = props.row.original;
              company.name = value;
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
            content={props.row.original.employees ?? ''}
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
            content={props.row.original.domainName ?? ''}
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
            content={props.row.original.address ?? ''}
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
            value={props.row.original.creationDate ?? new Date()}
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
                name: accountOwner.displayName ?? '',
              };
            }}
            changeHandler={(relation: User) => {
              const company = props.row.original;
              if (company.accountOwner) {
                company.accountOwner.id = relation.id;
              } else {
                company.accountOwner = {
                  id: relation.id,
                  email: relation.email,
                  displayName: relation.displayName,
                };
              }
              updateCompany(company);
            }}
            searchFilter={
              {
                key: 'account_owner_name',
                label: 'Account Owner',
                icon: <FaUser />,
                whereTemplate: () => {
                  return {};
                },
                searchQuery: SEARCH_USER_QUERY,
                searchTemplate: (searchInput: string) => ({
                  displayName: { _ilike: `%${searchInput}%` },
                }),
                searchResultMapper: (accountOwner: GraphqlQueryUser) => ({
                  displayValue: accountOwner.display_name,
                  value: {
                    id: accountOwner.id,
                    email: accountOwner.email,
                    displayName: accountOwner.display_name,
                  },
                }),
                operands: [],
              } satisfies FilterType<Users_Bool_Exp>
            }
          />
        ),
      }),
    ];
  }, []);
};
