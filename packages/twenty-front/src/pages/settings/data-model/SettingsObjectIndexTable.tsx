import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { settingsObjectIndexesFamilyState } from '@/settings/data-model/object-details/states/settingsObjectIndexesFamilyState';
import { TextInput } from '@/ui/input/components/TextInput';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import { IconSearch, IconSquareKey } from 'twenty-ui';
import { SettingsObjectIndexesTableItem } from '~/pages/settings/data-model/types/SettingsObjectIndexesTableItem';

export const StyledObjectIndexTableRow = styled(TableRow)`
  grid-template-columns: 350px 70px 80px;
`;

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
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');

  const tableMetadata: TableMetadata<SettingsObjectIndexesTableItem> = {
    tableId: 'settingsObjectIndexs',
    fields: [
      {
        fieldLabel: t`Fields`,
        fieldName: 'indexFields',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: '',
        FieldIcon: IconSquareKey,
        fieldName: 'isUnique',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: t`Type`,
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

  const [settingsObjectIndexes, setSettingsObjectIndexes] = useRecoilState(
    settingsObjectIndexesFamilyState({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  useEffect(() => {
    setSettingsObjectIndexes(objectMetadataItem.indexMetadatas);
  }, [objectMetadataItem, setSettingsObjectIndexes]);

  const objectSettingsDetailItems = useMemo(() => {
    return (
      settingsObjectIndexes?.map((indexMetadataItem) => {
        return {
          name: indexMetadataItem.name,
          isUnique: indexMetadataItem.isUnique,
          indexType: indexMetadataItem.indexType,
          indexFields: indexMetadataItem.indexFieldMetadatas
            ?.map((indexField) => {
              const fieldMetadataItem = objectMetadataItem.fields.find(
                (field) => field.id === indexField.fieldMetadataId,
              );
              return fieldMetadataItem?.label;
            })
            .join(', '),
        };
      }) ?? []
    );
  }, [settingsObjectIndexes, objectMetadataItem]);

  const sortedActiveObjectSettingsDetailItems = useSortedArray(
    objectSettingsDetailItems,
    tableMetadata,
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
        placeholder={t`Search an index...`}
        value={searchTerm}
        onChange={setSearchTerm}
      />
      <Table>
        <StyledObjectIndexTableRow>
          {tableMetadata.fields.map((item) => (
            <SortableTableHeader
              key={item.fieldName}
              fieldName={item.fieldName}
              label={item.fieldLabel}
              Icon={item.FieldIcon}
              tableId={tableMetadata.tableId}
              initialSort={tableMetadata.initialSort}
            />
          ))}
          <TableHeader></TableHeader>
        </StyledObjectIndexTableRow>
        {isNonEmptyArray(filteredActiveItems) &&
          filteredActiveItems.map((objectSettingsIndex) => (
            <StyledObjectIndexTableRow key={objectSettingsIndex.name}>
              <TableCell>{objectSettingsIndex.indexFields}</TableCell>
              <TableCell>
                {objectSettingsIndex.isUnique ? (
                  <IconSquareKey size={14} />
                ) : (
                  ''
                )}
              </TableCell>
              <TableCell>{objectSettingsIndex.indexType}</TableCell>
            </StyledObjectIndexTableRow>
          ))}
      </Table>
    </>
  );
};
