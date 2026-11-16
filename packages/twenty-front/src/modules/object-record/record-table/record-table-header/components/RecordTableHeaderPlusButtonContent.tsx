import { findCanonicalRecordField } from '@/object-record/record-field/utils/findCanonicalRecordField';
import { RecordTableLookupColumnPage } from '@/object-record/record-column-lookup/components/RecordTableLookupColumnPage';
import { RecordTableAggregateColumnPages } from '@/object-record/record-column-aggregate/components/RecordTableAggregateColumnPages';
import { useAddRecordTableRelationColumn } from '@/object-record/record-table/hooks/useAddRecordTableRelationColumn';
import { useCanConfigureRecordTableColumns } from '@/object-record/record-table/hooks/useCanConfigureRecordTableColumns';
import { isPlainManyToOneRelationField } from '@/object-record/utils/isPlainManyToOneRelationField';
import { isPlainOneToManyRelationField } from '@/object-record/utils/isPlainOneToManyRelationField';
import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconSettings } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';

export const RecordTableHeaderPlusButtonContent = () => {
  const { t } = useLingui();
  const [searchInput, setSearchInput] = useState('');

  const { objectMetadataItem, recordTableId, visibleRecordFields } =
    useRecordTableContextOrThrow();

  const { getIcon } = useIcons();

  const { changeRecordFieldVisibility } =
    useChangeRecordFieldVisibility(recordTableId);

  const handleAddColumn = useCallback(
    async (
      column: Pick<ColumnDefinition<FieldMetadata>, 'fieldMetadataId'>,
    ) => {
      await changeRecordFieldVisibility({ ...column, isVisible: true });
    },
    [changeRecordFieldVisibility],
  );

  const location = useLocation();
  const setNavigationMemorizedUrl = useSetAtomState(
    navigationMemorizedUrlState,
  );

  const { activeFieldMetadataItems } = useActiveFieldMetadataItems({
    objectMetadataItem,
  });

  const canConfigureColumns = useCanConfigureRecordTableColumns();
  const { addRecordTableRelationColumn } =
    useAddRecordTableRelationColumn(recordTableId);

  const isFieldVisible = (fieldMetadataItem: FieldMetadataItem) =>
    isDefined(
      findCanonicalRecordField({
        recordFields: visibleRecordFields,
        fieldMetadataItemId: fieldMetadataItem.id,
      }),
    );

  // A relation stays listed once shown, to reach its lookup or aggregate columns
  const canAddRelationColumns = (fieldMetadataItem: FieldMetadataItem) =>
    canConfigureColumns &&
    (isPlainManyToOneRelationField(fieldMetadataItem) ||
      isPlainOneToManyRelationField(fieldMetadataItem));

  const availableFieldMetadataItemsToShow = activeFieldMetadataItems.filter(
    (fieldMetadataItem) =>
      !isFieldVisible(fieldMetadataItem) ||
      canAddRelationColumns(fieldMetadataItem),
  );

  const relationColumnFieldMetadataItems =
    availableFieldMetadataItemsToShow.filter(canAddRelationColumns);

  const filteredFieldMetadataItems = availableFieldMetadataItemsToShow.filter(
    (fieldMetadataItem) => {
      return fieldMetadataItem.label
        .toLowerCase()
        .includes(searchInput.toLowerCase());
    },
  );

  const handleFieldMetadataItemMenuItemClick = async (
    fieldMetadataItem: FieldMetadataItem,
  ) => {
    await handleAddColumn({
      fieldMetadataId: fieldMetadataItem.id,
    });
  };

  const hasAvailableFields = isNonEmptyArray(availableFieldMetadataItemsToShow);

  return (
    <>
      <Dropdown.Page id="root">
        {hasAvailableFields && (
          <>
            <Dropdown.Search
              value={searchInput}
              placeholder={t`Search fields`}
              aria-label={t`Search fields`}
              onValueChange={setSearchInput}
            />
            <Dropdown.Separator />
          </>
        )}
        <Dropdown.Section scrollable>
          {isNonEmptyArray(filteredFieldMetadataItems) ? (
            filteredFieldMetadataItems.map((fieldMetadataItem) =>
              canAddRelationColumns(fieldMetadataItem) ? (
                <Dropdown.ActionItem
                  key={fieldMetadataItem.id}
                  page={fieldMetadataItem.id}
                  startIcon={
                    <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
                  }
                >
                  {fieldMetadataItem.label}
                </Dropdown.ActionItem>
              ) : (
                <Dropdown.OptionItem
                  key={fieldMetadataItem.id}
                  onSelect={() =>
                    handleFieldMetadataItemMenuItemClick(fieldMetadataItem)
                  }
                  startIcon={
                    <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
                  }
                >
                  {fieldMetadataItem.label}
                </Dropdown.OptionItem>
              ),
            )
          ) : (
            <Dropdown.Empty>
              {hasAvailableFields
                ? t`No results`
                : t`All fields are already visible`}
            </Dropdown.Empty>
          )}
        </Dropdown.Section>
        <Dropdown.Separator />
        <Dropdown.Section scrollable={false}>
          <Dropdown.ActionItem
            render={
              <Link
                to={getSettingsPath(SettingsPath.ObjectDetail, {
                  objectNamePlural: objectMetadataItem.namePlural,
                })}
              />
            }
            onClick={() => {
              setNavigationMemorizedUrl(location.pathname + location.search);
            }}
            startIcon={<IconSettings />}
          >{t`Customize fields`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </Dropdown.Page>
      {relationColumnFieldMetadataItems.map((relationFieldMetadataItem) => {
        const showRelationItem = !isFieldVisible(relationFieldMetadataItem) && (
          <>
            <Dropdown.Section scrollable={false}>
              <Dropdown.ActionItem
                onClick={() =>
                  handleFieldMetadataItemMenuItemClick(
                    relationFieldMetadataItem,
                  )
                }
                startIcon={
                  <SelectOptionIcon
                    Icon={getIcon(relationFieldMetadataItem.icon)}
                  />
                }
              >
                {relationFieldMetadataItem.label}
              </Dropdown.ActionItem>
            </Dropdown.Section>
            <Dropdown.Separator />
          </>
        );

        const RelationColumnPages = isPlainOneToManyRelationField(
          relationFieldMetadataItem,
        )
          ? RecordTableAggregateColumnPages
          : RecordTableLookupColumnPage;

        return (
          <RelationColumnPages
            key={relationFieldMetadataItem.id}
            pageId={relationFieldMetadataItem.id}
            relationFieldMetadataItem={relationFieldMetadataItem}
            onSelect={(relationColumnTarget) =>
              addRecordTableRelationColumn({
                relationFieldMetadataItemId: relationFieldMetadataItem.id,
                ...relationColumnTarget,
              })
            }
          >
            {showRelationItem}
          </RelationColumnPages>
        );
      })}
    </>
  );
};
