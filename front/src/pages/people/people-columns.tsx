import { useMemo } from 'react';
import {
  FaRegBuilding,
  FaCalendar,
  FaEnvelope,
  FaRegUser,
  FaMapPin,
  FaPhone,
} from 'react-icons/fa';
import { CellContext, createColumnHelper } from '@tanstack/react-table';

import { SEARCH_COMPANY_QUERY } from '../../services/api/search/search';
import { SearchConfigType } from '../../interfaces/search/interface';

import {
  Company,
  mapToCompany,
} from '../../interfaces/entities/company.interface';
import { Person } from '../../interfaces/entities/person.interface';
import { updatePerson } from '../../services/api/people';

import ColumnHead from '../../components/table/ColumnHead';
import Checkbox from '../../components/form/Checkbox';
import { SelectAllCheckbox } from '../../components/table/SelectAllCheckbox';
import EditablePhone from '../../components/editable-cell/EditablePhone';
import EditableFullName from '../../components/editable-cell/EditableFullName';
import EditableDate from '../../components/editable-cell/EditableDate';
import EditableText from '../../components/editable-cell/EditableText';
import EditableRelation from '../../components/editable-cell/EditableRelation';
import CompanyChip, {
  CompanyChipPropsType,
} from '../../components/chips/CompanyChip';

const columnHelper = createColumnHelper<Person>();

export const usePeopleColumns = () => {
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
        cell: (props: CellContext<Person, string>) => (
          <Checkbox
            id={`person-selected-${props.row.original.id}`}
            name={`person-selected-${props.row.original.id}`}
            checked={props.row.getIsSelected()}
            onChange={props.row.getToggleSelectedHandler()}
          />
        ),
      },
      columnHelper.accessor('firstname', {
        header: () => <ColumnHead viewName="People" viewIcon={<FaRegUser />} />,
        cell: (props) => (
          <EditableFullName
            firstname={props.row.original.firstname || ''}
            lastname={props.row.original.lastname || ''}
            changeHandler={(firstName: string, lastName: string) => {
              const person = props.row.original;
              person.firstname = firstName;
              person.lastname = lastName;
              updatePerson(person);
            }}
          />
        ),
      }),
      columnHelper.accessor('email', {
        header: () => <ColumnHead viewName="Email" viewIcon={<FaEnvelope />} />,
        cell: (props) => (
          <EditableText
            placeholder="Email"
            content={props.row.original.email || ''}
            changeHandler={(value: string) => {
              const person = props.row.original;
              person.email = value;
              updatePerson(person);
            }}
          />
        ),
      }),
      columnHelper.accessor('company', {
        header: () => (
          <ColumnHead viewName="Company" viewIcon={<FaRegBuilding />} />
        ),
        cell: (props) => (
          <EditableRelation<Company, CompanyChipPropsType>
            relation={props.row.original.company}
            searchPlaceholder="Company"
            ChipComponent={CompanyChip}
            chipComponentPropsMapper={(company): CompanyChipPropsType => {
              return {
                name: company.name || '',
                picture: `https://www.google.com/s2/favicons?domain=${company.domainName}&sz=256`,
                clickHandler: (editing) => {
                  if (editing) {
                    const person = props.row.original;
                    person.company = null;
                    updatePerson(person);
                  }
                },
              };
            }}
            changeHandler={(relation) => {
              const person = props.row.original;
              if (!!relation && person.company) {
                person.company.id = relation.id;
              } else {
                person.company = relation;
              }
              updatePerson(person);
            }}
            searchConfig={
              {
                query: SEARCH_COMPANY_QUERY,
                template: (searchInput: string) => ({
                  name: { _ilike: `%${searchInput}%` },
                }),
                resultMapper: (company) => ({
                  render: (company) => company.name,
                  value: mapToCompany(company),
                }),
              } satisfies SearchConfigType<Company>
            }
          />
        ),
      }),
      columnHelper.accessor('phone', {
        header: () => <ColumnHead viewName="Phone" viewIcon={<FaPhone />} />,
        cell: (props) => (
          <EditablePhone
            placeholder="Phone"
            value={props.row.original.phone || ''}
            changeHandler={(value: string) => {
              const person = props.row.original;
              person.phone = value;
              updatePerson(person);
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
              const person = props.row.original;
              person.creationDate = value;
              updatePerson(person);
            }}
          />
        ),
      }),
      columnHelper.accessor('city', {
        header: () => <ColumnHead viewName="City" viewIcon={<FaMapPin />} />,
        cell: (props) => (
          <EditableText
            editModeHorizontalAlign="right"
            placeholder="City"
            content={props.row.original.city || ''}
            changeHandler={(value: string) => {
              const person = props.row.original;
              person.city = value;
              updatePerson(person);
            }}
          />
        ),
      }),
    ];
  }, []);
};
