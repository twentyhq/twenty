import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';

import { EditablePeopleFullName } from '@/people/components/EditablePeopleFullName';
import { PeopleCompanyCell } from '@/people/components/PeopleCompanyCell';
import { EditableDate } from '@/ui/components/editable-cell/types/EditableDate';
import { EditablePhone } from '@/ui/components/editable-cell/types/EditablePhone';
import { EditableText } from '@/ui/components/editable-cell/types/EditableText';
import { ColumnHead } from '@/ui/components/table/ColumnHead';
import { RecoilScope } from '@/ui/hooks/RecoilScope';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconMail,
  IconMap,
  IconPhone,
  IconUser,
} from '@/ui/icons/index';
import { getCheckBoxColumn } from '@/ui/tables/utils/getCheckBoxColumn';
import { GetPeopleQuery, useUpdatePeopleMutation } from '~/generated/graphql';

const columnHelper = createColumnHelper<GetPeopleQuery['people'][0]>();

export const usePeopleColumns = () => {
  const [updatePerson] = useUpdatePeopleMutation();

  return useMemo(() => {
    return [
      getCheckBoxColumn(),
      columnHelper.accessor('firstname', {
        header: () => (
          <ColumnHead viewName="People" viewIcon={<IconUser size={16} />} />
        ),
        cell: (props) => (
          <>
            <EditablePeopleFullName
              person={props.row.original}
              onChange={async (firstName: string, lastName: string) => {
                const person = { ...props.row.original };
                await updatePerson({
                  variables: {
                    ...person,
                    firstname: firstName,
                    lastname: lastName,
                    companyId: person.company?.id,
                  },
                });
              }}
            />
          </>
        ),
        size: 210,
      }),
      columnHelper.accessor('email', {
        header: () => (
          <ColumnHead viewName="Email" viewIcon={<IconMail size={16} />} />
        ),
        cell: (props) => (
          <EditableText
            placeholder="Email"
            content={props.row.original.email || ''}
            changeHandler={async (value: string) => {
              const person = props.row.original;
              await updatePerson({
                variables: {
                  ...person,
                  email: value,
                  companyId: person.company?.id,
                },
              });
            }}
          />
        ),
        size: 200,
      }),
      columnHelper.accessor('company', {
        header: () => (
          <ColumnHead
            viewName="Company"
            viewIcon={<IconBuildingSkyscraper size={16} />}
          />
        ),
        cell: (props) => (
          <RecoilScope>
            <PeopleCompanyCell people={props.row.original} />
          </RecoilScope>
        ),
        size: 150,
      }),
      columnHelper.accessor('phone', {
        header: () => (
          <ColumnHead viewName="Phone" viewIcon={<IconPhone size={16} />} />
        ),
        cell: (props) => (
          <EditablePhone
            placeholder="Phone"
            value={props.row.original.phone || ''}
            changeHandler={async (value: string) => {
              const person = { ...props.row.original };
              await updatePerson({
                variables: {
                  ...person,
                  phone: value,
                  companyId: person.company?.id,
                },
              });
            }}
          />
        ),
        size: 130,
      }),
      columnHelper.accessor('createdAt', {
        header: () => (
          <ColumnHead
            viewName="Creation"
            viewIcon={<IconCalendarEvent size={16} />}
          />
        ),
        cell: (props) => (
          <EditableDate
            value={
              props.row.original.createdAt
                ? new Date(props.row.original.createdAt)
                : new Date()
            }
            changeHandler={async (value: Date) => {
              const person = { ...props.row.original };
              await updatePerson({
                variables: {
                  ...person,
                  createdAt: value.toISOString(),
                  companyId: person.company?.id,
                },
              });
            }}
          />
        ),
        size: 100,
      }),
      columnHelper.accessor('city', {
        header: () => (
          <ColumnHead viewName="City" viewIcon={<IconMap size={16} />} />
        ),
        cell: (props) => (
          <EditableText
            editModeHorizontalAlign="right"
            placeholder="City"
            content={props.row.original.city || ''}
            changeHandler={async (value: string) => {
              const person = { ...props.row.original };
              await updatePerson({
                variables: {
                  ...person,
                  city: value,
                  companyId: person.company?.id,
                },
              });
            }}
          />
        ),
      }),
    ];
  }, [updatePerson]);
};
