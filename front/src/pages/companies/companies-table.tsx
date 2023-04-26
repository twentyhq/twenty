import { createColumnHelper } from '@tanstack/react-table';
import { SortType } from '../../components/table/table-header/SortAndFilterBar';
import { Company } from '../../interfaces/company.interface';
import { OrderByFields } from '../../services/companies';
import ColumnHead from '../../components/table/ColumnHead';
import HorizontalyAlignedContainer from '../../layout/containers/HorizontalyAlignedContainer';
import Checkbox from '../../components/form/Checkbox';
import CompanyChip from '../../components/chips/CompanyChip';
import EditableCell from '../../components/table/EditableCell';
import PipeChip from '../../components/chips/PipeChip';
import { faCalendar } from '@fortawesome/pro-regular-svg-icons';
import ClickableCell from '../../components/table/ClickableCell';
import PersonChip from '../../components/chips/PersonChip';

export const sortsAvailable = [
  {
    id: 'company_name',
    label: 'Name',
    icon: undefined,
  },
  {
    id: 'company_domain',
    label: 'Domain',
    icon: undefined,
  },
] satisfies Array<SortType<OrderByFields>>;

const columnHelper = createColumnHelper<Company>();
export const companiesColumns = [
  columnHelper.accessor('name', {
    header: () => <ColumnHead viewName="Name" />,
    cell: (props) => (
      <>
        <HorizontalyAlignedContainer>
          <Checkbox
            id={`company-selected-${props.row.original.id}`}
            name={`company-selected-${props.row.original.id}`}
          />
          <CompanyChip
            name={props.row.original.name}
            picture={`https://www.google.com/s2/favicons?domain=${props.row.original.domain}&sz=256`}
          />
        </HorizontalyAlignedContainer>
      </>
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
          // TODO: update company
        }}
      />
    ),
  }),
  columnHelper.accessor('domain', {
    header: () => <ColumnHead viewName="URL" />,
    cell: (props) => (
      <EditableCell
        content={props.row.original.domain}
        changeHandler={(value) => {
          const company = props.row.original;
          company.domain = value;
          // TODO: update company
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
          // TODO: update company
        }}
      />
    ),
  }),
  columnHelper.accessor('opportunities', {
    header: () => <ColumnHead viewName="Opportunities" />,
    cell: (props) => (
      <HorizontalyAlignedContainer>
        {props.row.original.opportunities.map((opportunity) => (
          <PipeChip name={opportunity.name} picture={opportunity.icon} />
        ))}
      </HorizontalyAlignedContainer>
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
      <HorizontalyAlignedContainer>
        <PersonChip
          name={`${props.row.original.accountOwner.first_name} ${props.row.original.accountOwner.last_name}`}
        />
      </HorizontalyAlignedContainer>
    ),
  }),
];
