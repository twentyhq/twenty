import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';

import { CompanyAccountOwnerCell } from '@/companies/components/CompanyAccountOwnerCell';
import { CompanyEditableNameChipCell } from '@/companies/components/CompanyEditableNameCell';
import { EditableDate } from '@/ui/components/editable-cell/types/EditableDate';
import { EditableTextCell } from '@/ui/components/editable-cell/types/EditableTextCell';
import { ColumnHead } from '@/ui/components/table/ColumnHead';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconLink,
  IconMap,
  IconUser,
  IconUsers,
} from '@/ui/icons/index';
import { getCheckBoxColumn } from '@/ui/tables/utils/getCheckBoxColumn';
import {
  GetCompaniesQuery,
  useUpdateCompanyMutation,
} from '~/generated/graphql';

const columnHelper = createColumnHelper<GetCompaniesQuery['companies'][0]>();

export const useCompaniesColumns = () => {
  const [updateCompany] = useUpdateCompanyMutation();
  return useMemo(() => {
    return [
      getCheckBoxColumn(),
      columnHelper.accessor('name', {
        header: () => (
          <ColumnHead
            viewName="Name"
            viewIcon={<IconBuildingSkyscraper size={16} />}
          />
        ),
        cell: (props) => (
          <CompanyEditableNameChipCell company={props.row.original} />
        ),
        size: 180,
      }),
      columnHelper.accessor('domainName', {
        header: () => (
          <ColumnHead viewName="URL" viewIcon={<IconLink size={16} />} />
        ),
        cell: (props) => (
          <EditableTextCell
            value={props.row.original.domainName || ''}
            placeholder="Domain name"
            onChange={(value) => {
              const company = { ...props.row.original };
              company.domainName = value;
              updateCompany({
                variables: {
                  ...company,
                  accountOwnerId: company.accountOwner?.id,
                },
              });
            }}
          />
        ),
        size: 100,
      }),
      columnHelper.accessor('employees', {
        header: () => (
          <ColumnHead viewName="Employees" viewIcon={<IconUsers size={16} />} />
        ),
        cell: (props) => (
          <EditableTextCell
            value={props.row.original.employees?.toString() || ''}
            placeholder="Employees"
            onChange={(value) => {
              const company = { ...props.row.original };

              updateCompany({
                variables: {
                  ...company,
                  employees: value === '' ? null : Number(value),
                  accountOwnerId: company.accountOwner?.id,
                },
              });
            }}
          />
        ),
        size: 150,
      }),
      columnHelper.accessor('address', {
        header: () => (
          <ColumnHead viewName="Address" viewIcon={<IconMap size={16} />} />
        ),
        cell: (props) => (
          <EditableTextCell
            value={props.row.original.address || ''}
            placeholder="Address"
            onChange={(value) => {
              const company = { ...props.row.original };
              company.address = value;
              updateCompany({
                variables: {
                  ...company,
                  accountOwnerId: company.accountOwner?.id,
                },
              });
            }}
          />
        ),
        size: 170,
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
            changeHandler={(value: Date) => {
              const company = { ...props.row.original };
              company.createdAt = value.toISOString();
              updateCompany({
                variables: {
                  ...company,
                  accountOwnerId: company.accountOwner?.id,
                },
              });
            }}
          />
        ),
        size: 150,
      }),
      columnHelper.accessor('accountOwner', {
        header: () => (
          <ColumnHead
            viewName="Account owner"
            viewIcon={<IconUser size={16} />}
          />
        ),
        cell: (props) => (
          <CompanyAccountOwnerCell company={props.row.original} />
        ),
      }),
    ];
  }, [updateCompany]);
};
