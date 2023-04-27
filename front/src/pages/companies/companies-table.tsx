import { createColumnHelper } from '@tanstack/react-table';
import { Company } from '../../interfaces/company.interface';
import { OrderByFields, updateCompany } from '../../services/companies';
import ColumnHead from '../../components/table/ColumnHead';
import HorizontalyAlignedContainer from '../../layout/containers/HorizontalyAlignedContainer';
import Checkbox from '../../components/form/Checkbox';
import CompanyChip from '../../components/chips/CompanyChip';
import EditableCell from '../../components/table/EditableCell';
import PipeChip from '../../components/chips/PipeChip';
import { faCalendar } from '@fortawesome/pro-regular-svg-icons';
import ClickableCell from '../../components/table/ClickableCell';
import PersonChip from '../../components/chips/PersonChip';
import { SortType } from '../../components/table/table-header/interface';

export const sortsAvailable = [
  {
    key: 'name',
    label: 'Name',
    icon: undefined,
  },
  {
    key: 'domain_name',
    label: 'Domain',
    icon: undefined,
  },
] satisfies Array<SortType<OrderByFields>>;

const columnHelper = createColumnHelper<Company>();
export const companiesColumns = [
  columnHelper.accessor('name', {
    header: () => <ColumnHead viewName="Name" />,
    cell: (props) => (
      <HorizontalyAlignedContainer>
        <Checkbox
          id={`company-selected-${props.row.original.id}`}
          name={`company-selected-${props.row.original.id}`}
        />
        <CompanyChip
          name={props.row.original.name}
          picture={`https://www.google.com/s2/favicons?domain=${props.row.original.domain_name}&sz=256`}
        />
      </HorizontalyAlignedContainer>
    ),
  }),
  columnHelper.accessor('employees', {
    header: () => <ColumnHead viewName="Employees" />,
    cell: (props) => (
      <EditableCell
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
    header: () => <ColumnHead viewName="URL" />,
    cell: (props) => (
      <EditableCell
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
    header: () => <ColumnHead viewName="Address" />,
    cell: (props) => (
      <EditableCell
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
    header: () => <ColumnHead viewName="Opportunities" />,
    cell: (props) => (
      <ClickableCell href="#">
        {props.row.original.opportunities.map((opportunity) => (
          <PipeChip name={opportunity.name} picture={opportunity.icon} />
        ))}
      </ClickableCell>
    ),
  }),
  columnHelper.accessor('creationDate', {
    header: () => <ColumnHead viewName="Creation" viewIcon={faCalendar} />,
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
    header: () => <ColumnHead viewName="Account Owner" />,
    cell: (props) => (
      <ClickableCell href="#">
        <>
          {props.row.original.accountOwner && (
            <PersonChip
              name={`${props.row.original.accountOwner?.first_name || ''} ${
                props.row.original.accountOwner?.last_name || ''
              }`}
            />
          )}
        </>
      </ClickableCell>
    ),
  }),
];
