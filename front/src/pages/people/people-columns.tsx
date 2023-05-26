import { useMemo } from 'react';
import { CellContext, createColumnHelper } from '@tanstack/react-table';
import { Person } from '../../interfaces/entities/person.interface';
import { updatePerson } from '../../services/api/people';

import ColumnHead from '../../components/table/ColumnHead';
import Checkbox from '../../components/form/Checkbox';
import { SelectAllCheckbox } from '../../components/table/SelectAllCheckbox';
import EditablePhone from '../../components/editable-cell/EditablePhone';
import { EditablePeopleFullName } from '../../components/people/EditablePeopleFullName';
import EditableDate from '../../components/editable-cell/EditableDate';
import EditableText from '../../components/editable-cell/EditableText';
import {
  TbBuilding,
  TbCalendar,
  TbMail,
  TbMapPin,
  TbPhone,
  TbUser,
} from 'react-icons/tb';
import { PeopleCompanyCell } from '../../components/people/PeopleCompanyCell';

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
        size: 25,
      },
      columnHelper.accessor('firstname', {
        header: () => (
          <ColumnHead viewName="People" viewIcon={<TbUser size={16} />} />
        ),
        cell: (props) => (
          <EditablePeopleFullName
            firstname={props.row.original.firstname || ''}
            lastname={props.row.original.lastname || ''}
            onChange={async (firstName: string, lastName: string) => {
              const person = props.row.original;
              person.firstname = firstName;
              person.lastname = lastName;
              await updatePerson(person);
            }}
          />
        ),
        size: 200,
      }),
      columnHelper.accessor('email', {
        header: () => (
          <ColumnHead viewName="Email" viewIcon={<TbMail size={16} />} />
        ),
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
        size: 200,
      }),
      columnHelper.accessor('company', {
        header: () => (
          <ColumnHead viewName="Company" viewIcon={<TbBuilding size={16} />} />
        ),
        cell: (props) => <PeopleCompanyCell people={props.row.original} />,
        size: 150,
      }),
      columnHelper.accessor('phone', {
        header: () => (
          <ColumnHead viewName="Phone" viewIcon={<TbPhone size={16} />} />
        ),
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
        size: 130,
      }),
      columnHelper.accessor('creationDate', {
        header: () => (
          <ColumnHead viewName="Creation" viewIcon={<TbCalendar size={16} />} />
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
        size: 100,
      }),
      columnHelper.accessor('city', {
        header: () => (
          <ColumnHead viewName="City" viewIcon={<TbMapPin size={16} />} />
        ),
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
