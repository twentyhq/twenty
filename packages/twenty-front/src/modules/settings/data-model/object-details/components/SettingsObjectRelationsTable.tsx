import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { type TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import styled from '@emotion/styled';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { IconArchive, IconFilter, IconSearch } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { MenuItemToggle } from 'twenty-ui/navigation';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import {
  SettingsObjectRelationItemTableRow,
  StyledObjectRelationTableRow,
} from './SettingsObjectRelationItemTableRow';

const StyledSearchAndFilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledSearchInput = styled(SettingsTextInput)`
  flex: 1;
`;

const SETTINGS_OBJECT_RELATION_TABLE_METADATA: TableMetadata<FieldMetadataItem> =
  {
    tableId: 'settingsObjectRelations',
    fields: [
      {
        fieldLabel: msg`Name`,
        fieldName: 'label',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: msg`App`,
        fieldName: 'isCustom',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: msg`Type`,
        fieldName: 'type',
        fieldType: 'string',
        align: 'left',
      },
    ],
    initialSort: {
      fieldName: 'label',
      orderBy: 'AscNullsLast',
    },
  };

type SettingsObjectRelationsTableProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const SettingsObjectRelationsTable = ({
  objectMetadataItem,
}: SettingsObjectRelationsTableProps) => {
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(true);

  const tableMetadata = SETTINGS_OBJECT_RELATION_TABLE_METADATA;

  const relationFields = useMemo(() => {
    return objectMetadataItem.fields.filter(
      (field) =>
        !field.isSystem &&
        (field.type === FieldMetadataType.RELATION ||
          field.type === FieldMetadataType.MORPH_RELATION),
    );
  }, [objectMetadataItem.fields]);

  const sortedRelationFields = useSortedArray(relationFields, tableMetadata);

  const filteredRelationFields = useMemo(() => {
    const searchNormalized = normalizeSearchText(searchTerm);

    return sortedRelationFields.filter((field) => {
      const matchesActiveFilter = showInactive || field.isActive;
      const matchesSearch = normalizeSearchText(field.label).includes(
        searchNormalized,
      );
      return matchesActiveFilter && matchesSearch;
    });
  }, [sortedRelationFields, searchTerm, showInactive]);

  if (relationFields.length === 0) {
    return null;
  }

  return (
    <>
      <StyledSearchAndFilterContainer>
        <StyledSearchInput
          instanceId="object-relation-table-search"
          LeftIcon={IconSearch}
          placeholder={t`Search a field...`}
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <Dropdown
          dropdownId="settings-relations-filter-dropdown"
          dropdownPlacement="bottom-end"
          dropdownOffset={{ x: 0, y: 8 }}
          clickableComponent={
            <Button
              Icon={IconFilter}
              size="medium"
              variant="secondary"
              accent="default"
              ariaLabel={t`Filter`}
            />
          }
          dropdownComponents={
            <DropdownContent>
              <DropdownMenuItemsContainer>
                <MenuItemToggle
                  LeftIcon={IconArchive}
                  onToggleChange={() => setShowInactive(!showInactive)}
                  toggled={showInactive}
                  text={t`Inactive`}
                  toggleSize="small"
                />
              </DropdownMenuItemsContainer>
            </DropdownContent>
          }
        />
      </StyledSearchAndFilterContainer>
      <Table>
        <StyledObjectRelationTableRow>
          {tableMetadata.fields.map((item) => (
            <SortableTableHeader
              key={item.fieldName}
              fieldName={item.fieldName}
              label={t(item.fieldLabel)}
              tableId={tableMetadata.tableId}
              initialSort={tableMetadata.initialSort}
            />
          ))}
          <TableHeader></TableHeader>
        </StyledObjectRelationTableRow>
        {filteredRelationFields.map((fieldMetadataItem) => (
          <SettingsObjectRelationItemTableRow
            key={fieldMetadataItem.id}
            fieldMetadataItem={fieldMetadataItem}
            objectMetadataItem={objectMetadataItem}
          />
        ))}
      </Table>
    </>
  );
};
