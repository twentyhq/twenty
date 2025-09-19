import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { settingsObjectIndexesFamilyState } from '@/settings/data-model/object-details/states/settingsObjectIndexesFamilyState';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { type TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import styled from '@emotion/styled';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import { IconSearch, IconSquareKey } from 'twenty-ui/display';
import { type SettingsObjectIndexesTableItem } from '~/pages/settings/data-model/types/SettingsObjectIndexesTableItem';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

export const StyledObjectIndexTableRow = styled(TableRow)`
  grid-template-columns: 350px 70px 80px;
`;

const StyledSearchInput = styled(SettingsTextInput)`
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
        fieldLabel: msg`Fields`,
        fieldName: 'indexFields',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: msg`Unique`,
        FieldIcon: IconSquareKey,
        fieldName: 'isUnique',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: msg`Type`,
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
      sortedActiveObjectSettingsDetailItems.filter((item) => {
        const searchNormalized = normalizeSearchText(searchTerm);
        return (
          normalizeSearchText(item.name).includes(searchNormalized) ||
          normalizeSearchText(item.indexType).includes(searchNormalized)
        );
      }),
    [sortedActiveObjectSettingsDetailItems, searchTerm],
  );

  return (
    <>
      <StyledSearchInput
        instanceId="object-index-table-search"
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
              label={t(item.fieldLabel)}
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
