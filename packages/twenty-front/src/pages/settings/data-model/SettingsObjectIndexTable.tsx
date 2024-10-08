import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { StyledObjectFieldTableRow } from '@/settings/data-model/object-details/components/SettingsObjectFieldItemTableRow';
import { settingsObjectIndexesFamilyState } from '@/settings/data-model/object-details/states/settingsObjectIndexesFamilyState';
import { EllipsisDisplay } from '@/ui/field/display/components/EllipsisDisplay';
import { TextInput } from '@/ui/input/components/TextInput';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import styled from '@emotion/styled';
import { isNonEmptyArray } from '@sniptt/guards';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import { IconSearch } from 'twenty-ui';
import { SettingsObjectIndexesTableItem } from '~/pages/settings/data-model/types/SettingsObjectIndexesTableItem';

const SETTINGS_OBJECT_DETAIL_TABLE_METADATA_STANDARD: TableMetadata<SettingsObjectIndexesTableItem> =
  {
    tableId: 'settingsObjectIndexs',
    fields: [
      {
        fieldLabel: 'Name',
        fieldName: 'name',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: 'Where clause',
        fieldName: 'indexWhereClause',
        fieldType: 'string',
        align: 'right',
      },
      {
        fieldLabel: 'Is Unique',
        fieldName: 'isUnique',
        fieldType: 'string',
        align: 'right',
      },
      {
        fieldLabel: 'Type',
        fieldName: 'indexType',
        fieldType: 'string',
        align: 'right',
      },
    ],
    initialSort: {
      fieldName: 'name',
      orderBy: 'AscNullsLast',
    },
  };

const StyledSearchInput = styled(TextInput)`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;
export type SettingsObjectIndexTableProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const SettingsObjectIndexTable = ({
  objectMetadataItem,
}: SettingsObjectIndexTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const [settingsObjectIndexes, setSettingsObjectIndexes] = useRecoilState(
    settingsObjectIndexesFamilyState({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  useEffect(() => {
    setSettingsObjectIndexes(objectMetadataItem.indexes);
  }, [objectMetadataItem, setSettingsObjectIndexes]);

  const objectSettingsDetailItems = useMemo(() => {
    return (
      settingsObjectIndexes?.map((indexMetadataItem) => {
        return {
          name: indexMetadataItem.name,
          indexWhereClause: indexMetadataItem.indexWhereClause,
          isUnique: indexMetadataItem.isUnique,
          indexType: indexMetadataItem.indexType,
        };
      }) ?? []
    );
  }, [settingsObjectIndexes]);

  const sortedActiveObjectSettingsDetailItems = useSortedArray(
    objectSettingsDetailItems,
    SETTINGS_OBJECT_DETAIL_TABLE_METADATA_STANDARD,
  );

  const filteredActiveItems = useMemo(
    () =>
      sortedActiveObjectSettingsDetailItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.indexType.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [sortedActiveObjectSettingsDetailItems, searchTerm],
  );

  return (
    <>
      <StyledSearchInput
        LeftIcon={IconSearch}
        placeholder="Search an index..."
        value={searchTerm}
        onChange={setSearchTerm}
      />
      <Table>
        <StyledObjectFieldTableRow>
          {SETTINGS_OBJECT_DETAIL_TABLE_METADATA_STANDARD.fields.map((item) => (
            <SortableTableHeader
              key={item.fieldName}
              fieldName={item.fieldName}
              label={item.fieldLabel}
              tableId={SETTINGS_OBJECT_DETAIL_TABLE_METADATA_STANDARD.tableId}
              initialSort={
                SETTINGS_OBJECT_DETAIL_TABLE_METADATA_STANDARD.initialSort
              }
            />
          ))}
          <TableHeader></TableHeader>
        </StyledObjectFieldTableRow>
        {isNonEmptyArray(filteredActiveItems) &&
          filteredActiveItems.map((objectSettingsIndex) => (
            <TableRow key={objectSettingsIndex.name}>
              <TableCell>
                <EllipsisDisplay maxWidth={100}>
                  {objectSettingsIndex.name}
                </EllipsisDisplay>
              </TableCell>
              <TableCell>
                <EllipsisDisplay maxWidth={100}>
                  {objectSettingsIndex.indexWhereClause}
                </EllipsisDisplay>
              </TableCell>
              <TableCell>{objectSettingsIndex.isUnique}</TableCell>
              <TableCell>{objectSettingsIndex.indexType}</TableCell>
            </TableRow>
          ))}
      </Table>
    </>
  );
};
