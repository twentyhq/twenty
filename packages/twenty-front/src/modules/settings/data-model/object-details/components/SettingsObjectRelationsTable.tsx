import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { type TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { StyledSettingsDataModelTableBodyContainer } from '@/settings/data-model/components/SettingsDataModelTableBodyContainer';
import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { IconArchive, IconFilter, IconSearch } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { MenuItemToggle } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { isDefined } from 'twenty-shared/utils';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import {
  OBJECT_RELATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
  SettingsObjectRelationItemTableRow,
} from './SettingsObjectRelationItemTableRow';

const StyledSearchAndFilterContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding-bottom: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledSearchInputContainer = styled.div`
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
        fieldName: 'applicationId',
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
  objectMetadataItem: EnrichedObjectMetadataItem;
};

const getRelationTargetObjectMetadataIds = (field: FieldMetadataItem) => {
  if (field.type === FieldMetadataType.MORPH_RELATION) {
    return (
      field.morphRelations?.map(
        (relation) => relation.targetObjectMetadata.id,
      ) ?? []
    );
  }

  return isDefined(field.relation?.targetObjectMetadata.id)
    ? [field.relation.targetObjectMetadata.id]
    : [];
};

const getMorphRelationTargetLabel = (field: FieldMetadataItem) => {
  const morphRelationCount = field.morphRelations?.length ?? 0;

  return morphRelationCount === 1
    ? '1 Object'
    : `${morphRelationCount} Objects`;
};

const getMorphRelationFieldLabel = (field: FieldMetadataItem) => {
  return field.label;
};

export const SettingsObjectRelationsTable = ({
  objectMetadataItem,
}: SettingsObjectRelationsTableProps) => {
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(true);

  const isAdvancedModeEnabled = useAtomStateValue(isAdvancedModeEnabledState);

  const tableMetadata = SETTINGS_OBJECT_RELATION_TABLE_METADATA;

  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const relationFields = useMemo(() => {
    return objectMetadataItem.fields.filter((field) => {
      const isRelationField =
        field.type === FieldMetadataType.RELATION ||
        field.type === FieldMetadataType.MORPH_RELATION;

      if (!isRelationField) {
        return false;
      }

      const relationTargetObjectMetadataIds =
        getRelationTargetObjectMetadataIds(field);

      const isRelationToSystemObject = relationTargetObjectMetadataIds.some(
        (objectMetadataId) =>
          objectMetadataItems.some(
            (objectMetadataItem) =>
              objectMetadataItem.id === objectMetadataId &&
              objectMetadataItem.isSystem,
          ),
      );

      return (
        isAdvancedModeEnabled ||
        (!isHiddenSystemField(field) && !isRelationToSystemObject)
      );
    });
  }, [
    objectMetadataItem.fields,
    isAdvancedModeEnabled,
    objectMetadataItems,
  ]);

  const sortedRelationFields = useSortedArray(relationFields, tableMetadata);

  const filteredRelationFields = useMemo(() => {
    const searchNormalized = normalizeSearchText(searchTerm);

    return sortedRelationFields.filter((field) => {
      const matchesActiveFilter = showInactive || field.isActive;
      const relationTargetObjectLabels = getRelationTargetObjectMetadataIds(
        field,
      ).flatMap((objectMetadataId) => {
        const relationObjectMetadataItem = objectMetadataItems.find(
          (objectMetadataItem) => objectMetadataItem.id === objectMetadataId,
        );

        return isDefined(relationObjectMetadataItem)
          ? [
              relationObjectMetadataItem.labelSingular,
              relationObjectMetadataItem.labelPlural,
            ]
          : [];
      });

      const morphRelationLabels =
        field.type === FieldMetadataType.MORPH_RELATION
          ? [
              getMorphRelationTargetLabel(field),
              getMorphRelationFieldLabel(field),
            ]
          : [];

      const searchableText = [
        field.label,
        ...relationTargetObjectLabels,
        ...morphRelationLabels,
      ]
        .map(normalizeSearchText)
        .join(' ');

      const matchesSearch = searchableText.includes(searchNormalized);

      return matchesActiveFilter && matchesSearch;
    });
  }, [objectMetadataItems, sortedRelationFields, searchTerm, showInactive]);

  return (
    <>
      <StyledSearchAndFilterContainer>
        <StyledSearchInputContainer>
          <SettingsTextInput
            instanceId="object-relation-table-search"
            LeftIcon={IconSearch}
            placeholder={t`Search a field...`}
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </StyledSearchInputContainer>
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
        <TableRow
          gridTemplateColumns={OBJECT_RELATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
        >
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
        </TableRow>
        <StyledSettingsDataModelTableBodyContainer>
          <TableBody>
            {filteredRelationFields.length > 0 ? (
              filteredRelationFields.map((fieldMetadataItem) => (
                <SettingsObjectRelationItemTableRow
                  key={fieldMetadataItem.id}
                  fieldMetadataItem={fieldMetadataItem}
                  objectMetadataItem={objectMetadataItem}
                />
              ))
            ) : (
              <TableCell color={themeCssVariables.font.color.tertiary}>
                {t`No relations found`}
              </TableCell>
            )}
          </TableBody>
        </StyledSettingsDataModelTableBodyContainer>
      </Table>
    </>
  );
};
