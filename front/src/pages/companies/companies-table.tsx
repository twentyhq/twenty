import { createColumnHelper } from '@tanstack/react-table';
import {
  Company,
  GraphqlQueryCompany,
} from '../../interfaces/company.interface';
import { updateCompany } from '../../services/companies';
import ColumnHead from '../../components/table/ColumnHead';
import Checkbox from '../../components/form/Checkbox';
import CompanyChip from '../../components/chips/CompanyChip';
import EditableText from '../../components/table/editable-cell/EditableText';
import PipeChip from '../../components/chips/PipeChip';
import {
  FaRegBuilding,
  FaCalendar,
  FaLink,
  FaMapPin,
  FaStream,
  FaRegUser,
  FaUsers,
  FaBuilding,
} from 'react-icons/fa';
import ClickableCell from '../../components/table/ClickableCell';
import PersonChip from '../../components/chips/PersonChip';
import EditableChip from '../../components/table/editable-cell/EditableChip';
import {
  FilterType,
  SortType,
} from '../../components/table/table-header/interface';
import {
  Companies_Bool_Exp,
  Companies_Order_By,
} from '../../generated/graphql';
import { SEARCH_COMPANY_QUERY } from '../../services/search/search';

export const sortsAvailable = [
  {
    key: 'name',
    label: 'Name',
    icon: undefined,
    _type: 'default_sort',
  },
  {
    key: 'domain_name',
    label: 'Domain',
    icon: undefined,
    _type: 'default_sort',
  },
] satisfies Array<SortType<Companies_Order_By>>;

export const filtersAvailable = [
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
export const companiesColumns = [
  columnHelper.accessor('id', {
    header: () => (
      <Checkbox id="company-select-all" name="company-select-all" />
    ),
    cell: (props) => (
      <Checkbox
        id={`company-selected-${props.row.original.id}`}
        name={`company-selected-${props.row.original.id}`}
      />
    ),
  }),
  columnHelper.accessor('name', {
    header: () => <ColumnHead viewName="Name" viewIcon={<FaRegBuilding />} />,
    cell: (props) => (
      <EditableChip
        value={props.row.original.name}
        placeholder="Name"
        picture={`https://www.google.com/s2/favicons?domain=${props.row.original.domain_name}&sz=256`}
        changeHandler={(value: string) => {
          const company = props.row.original;
          company.name = value;
          updateCompany(company).catch((error) => console.error(error));
        }}
        ChipComponent={CompanyChip}
      />
    ),
  }),
  columnHelper.accessor('employees', {
    header: () => <ColumnHead viewName="Employees" viewIcon={<FaUsers />} />,
    cell: (props) => (
      <EditableText
        content={props.row.original.employees.toFixed(0)}
        changeHandler={(value) => {
          const company = props.row.original;
          company.employees = parseInt(value);
          updateCompany(company).catch((error) => console.error(error));
        }}
      />
    ),
  }),
  columnHelper.accessor('domain_name', {
    header: () => <ColumnHead viewName="URL" viewIcon={<FaLink />} />,
    cell: (props) => (
      <EditableText
        content={props.row.original.domain_name}
        changeHandler={(value) => {
          const company = props.row.original;
          company.domain_name = value;
          updateCompany(company).catch((error) => console.error(error));
        }}
      />
    ),
  }),
  columnHelper.accessor('address', {
    header: () => <ColumnHead viewName="Address" viewIcon={<FaMapPin />} />,
    cell: (props) => (
      <EditableText
        content={props.row.original.address}
        changeHandler={(value) => {
          const company = props.row.original;
          company.address = value;
          updateCompany(company).catch((error) => console.error(error));
        }}
      />
    ),
  }),
  columnHelper.accessor('opportunities', {
    header: () => (
      <ColumnHead viewName="Opportunities" viewIcon={<FaStream />} />
    ),
    cell: (props) => (
      <ClickableCell href="#">
        {props.row.original.opportunities.map((opportunity) => (
          <PipeChip opportunity={opportunity} />
        ))}
      </ClickableCell>
    ),
  }),
  columnHelper.accessor('creationDate', {
    header: () => <ColumnHead viewName="Creation" viewIcon={<FaCalendar />} />,
    cell: (props) => (
      <ClickableCell href="#">
        {new Intl.DateTimeFormat(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(props.row.original.creationDate)}
      </ClickableCell>
    ),
  }),
  columnHelper.accessor('accountOwner', {
    header: () => (
      <ColumnHead viewName="Account Owner" viewIcon={<FaRegUser />} />
    ),
    cell: (props) => (
      <ClickableCell href="#">
        <>
          {props.row.original.accountOwner && (
            <PersonChip name={props.row.original.accountOwner?.displayName} />
          )}
        </>
      </ClickableCell>
    ),
  }),
];
