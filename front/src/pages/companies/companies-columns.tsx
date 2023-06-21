import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';

import { CompanyEditableNameChipCell } from '@/companies/components/CompanyEditableNameCell';
import {
  PersonChip,
  PersonChipPropsType,
} from '@/people/components/PersonChip';
import { SearchConfigType } from '@/search/interfaces/interface';
import { SEARCH_USER_QUERY } from '@/search/services/search';
import { EditableDate } from '@/ui/components/editable-cell/types/EditableDate';
import { EditableRelation } from '@/ui/components/editable-cell/types/EditableRelation';
import { EditableText } from '@/ui/components/editable-cell/types/EditableText';
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
  QueryMode,
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
          <EditableText
            content={props.row.original.domainName || ''}
            placeholder="Domain name"
            changeHandler={(value) => {
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
          <EditableText
            content={props.row.original.employees?.toString() || ''}
            placeholder="Employees"
            changeHandler={(value) => {
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
          <EditableText
            content={props.row.original.address || ''}
            placeholder="Address"
            changeHandler={(value) => {
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
            viewName="Account Owner"
            viewIcon={<IconUser size={16} />}
          />
        ),
        cell: (props) => (
          <EditableRelation<any, PersonChipPropsType>
            relation={props.row.original.accountOwner}
            searchPlaceholder="Account Owner"
            ChipComponent={PersonChip}
            chipComponentPropsMapper={(
              accountOwner: any,
            ): PersonChipPropsType => {
              return {
                name: accountOwner.displayName || '',
              };
            }}
            onChange={(relation: any) => {
              updateCompany({
                variables: {
                  ...props.row.original,
                  accountOwnerId: relation.id,
                },
              });
            }}
            searchConfig={
              {
                query: SEARCH_USER_QUERY,
                template: (searchInput: string) => ({
                  displayName: {
                    contains: `%${searchInput}%`,
                    mode: QueryMode.Insensitive,
                  },
                }),
                resultMapper: (accountOwner: any) => ({
                  render: (accountOwner: any) => accountOwner.displayName,
                  value: accountOwner,
                }),
              } satisfies SearchConfigType
            }
          />
        ),
      }),
    ];
  }, [updateCompany]);
};
