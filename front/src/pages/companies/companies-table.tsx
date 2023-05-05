import { createColumnHelper } from '@tanstack/react-table';
import { Company } from '../../interfaces/company.interface';
import { OrderByFields, updateCompany } from '../../services/companies';
import ColumnHead from '../../components/table/ColumnHead';
import HorizontalyAlignedContainer from '../../layout/containers/HorizontalyAlignedContainer';
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
} from 'react-icons/fa';
import ClickableCell from '../../components/table/ClickableCell';
import PersonChip from '../../components/chips/PersonChip';
import { SortType } from '../../components/table/table-header/interface';
import EditableChip from '../../components/table/editable-cell/EditableChip';

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
