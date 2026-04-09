import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { settingsObjectIndexesFamilyState } from '@/settings/data-model/object-details/states/settingsObjectIndexesFamilyState';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { type TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useEffect, useMemo, useState } from 'react';
import { IconSquareKey } from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type SettingsObjectIndexesTableItem } from '~/pages/settings/data-model/types/SettingsObjectIndexesTableItem';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const OBJECT_INDEX_TABLE_ROW_GRID_TEMPLATE_COLUMNS = '350px 70px 80px';

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

export type SettingsObjectIndexTableProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
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

  const settingsObjectIndexes = useAtomFamilyStateValue(
    settingsObjectIndexesFamilyState,
    { objectMetadataItemId: objectMetadataItem.id },
  );
  const setSettingsObjectIndexes = useSetAtomFamilyState(
    settingsObjectIndexesFamilyState,
    { objectMetadataItemId: objectMetadataItem.id },
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
      <StyledSearchInputContainer>
        <SearchInput
          placeholder={t`Search an index...`}
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </StyledSearchInputContainer>
      <Table>
        <TableRow
          gridTemplateColumns={OBJECT_INDEX_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
        >
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
        </TableRow>
        {isNonEmptyArray(filteredActiveItems) &&
          filteredActiveItems.map((objectSettingsIndex) => (
            <TableRow
              gridTemplateColumns={OBJECT_INDEX_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
              key={objectSettingsIndex.name}
            >
              <TableCell>{objectSettingsIndex.indexFields}</TableCell>
              <TableCell>
                {objectSettingsIndex.isUnique ? (
                  <IconSquareKey size={14} />
                ) : (
                  ''
                )}
              </TableCell>
              <TableCell>{objectSettingsIndex.indexType}</TableCell>
            </TableRow>
          ))}
      </Table>
    </>
  );
};
