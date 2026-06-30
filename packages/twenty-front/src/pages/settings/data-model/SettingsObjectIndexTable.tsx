import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { type TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { IconSquareKey, IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type SettingsObjectIndexesTableItem } from '~/pages/settings/data-model/types/SettingsObjectIndexesTableItem';

const OBJECT_INDEX_TABLE_GRID_TEMPLATE_COLUMNS = '1fr 70px 80px 32px';

const StyledTableContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledActionCell = styled(TableCell)`
  justify-content: flex-end;
  padding-right: 0;
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[3]};
  text-align: center;
`;

const TABLE_FIELDS: TableMetadata<SettingsObjectIndexesTableItem>['fields'] = [
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
];

const TABLE_METADATA: TableMetadata<SettingsObjectIndexesTableItem> = {
  tableId: 'settingsObjectIndexes',
  fields: TABLE_FIELDS,
  initialSort: {
    fieldName: 'indexFields',
    orderBy: 'AscNullsLast',
  },
};

export type SettingsObjectIndexTableProps = {
  items: SettingsObjectIndexesTableItem[];
  isReadOnly: boolean;
  onDeleteIndex: (item: SettingsObjectIndexesTableItem) => void;
};

export const SettingsObjectIndexTable = ({
  items,
  isReadOnly,
  onDeleteIndex,
}: SettingsObjectIndexTableProps) => {
  const { t } = useLingui();
  const sortedItems = useSortedArray(items, TABLE_METADATA);

  return (
    <StyledTableContainer>
      <Table>
        <TableRow
          gridTemplateColumns={OBJECT_INDEX_TABLE_GRID_TEMPLATE_COLUMNS}
        >
          {TABLE_METADATA.fields.map((tableField) => (
            <SortableTableHeader
              key={tableField.fieldName}
              fieldName={tableField.fieldName}
              label={t(tableField.fieldLabel)}
              Icon={tableField.FieldIcon}
              tableId={TABLE_METADATA.tableId}
              initialSort={TABLE_METADATA.initialSort}
            />
          ))}
          <TableHeader></TableHeader>
        </TableRow>
        <TableBody>
          {sortedItems.length === 0 ? (
            <StyledEmpty>{t`No indexes match your filters.`}</StyledEmpty>
          ) : (
            sortedItems.map((item) => (
              <TableRow
                gridTemplateColumns={OBJECT_INDEX_TABLE_GRID_TEMPLATE_COLUMNS}
                key={item.id}
              >
                <TableCell>{item.indexFields}</TableCell>
                <TableCell>
                  {item.isUnique ? <IconSquareKey size={14} /> : ''}
                </TableCell>
                <TableCell>{item.indexType}</TableCell>
                <StyledActionCell>
                  {item.isCustom && !isReadOnly && (
                    <LightIconButton
                      Icon={IconTrash}
                      accent="tertiary"
                      onClick={() => onDeleteIndex(item)}
                    />
                  )}
                </StyledActionCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};
