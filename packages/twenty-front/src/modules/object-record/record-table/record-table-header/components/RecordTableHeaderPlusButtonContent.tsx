import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import {
  getTraversableRelationFieldMetadataItems,
  type TraversableRelationFieldMetadataItem,
} from '@/object-record/record-field/utils/relation-traversal/getTraversableRelationFieldMetadataItems';
import { getTraversedFieldCandidates } from '@/object-record/record-field/utils/relation-traversal/getTraversedFieldCandidates';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
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
import { IconSettings, useIcons } from 'twenty-ui/icon';

const RELATION_TARGET_PAGE_ID = 'relation-target';

export const RecordTableHeaderPlusButtonContent = () => {
  const { t } = useLingui();
  const [searchInput, setSearchInput] = useState('');
  const [selectedTraversableRelation, setSelectedTraversableRelation] =
    useState<TraversableRelationFieldMetadataItem | null>(null);

  const { objectMetadataItem, recordTableId, visibleRecordFields } =
    useRecordTableContextOrThrow();

  const { objectMetadataItems } = useObjectMetadataItems();

  const { getIcon } = useIcons();

  const { changeRecordFieldVisibility } =
    useChangeRecordFieldVisibility(recordTableId);

  const handleAddColumn = useCallback(
    async (
      recordField: Pick<
        RecordField,
        'fieldMetadataItemId' | 'relationTargetFieldMetadataItemId'
      >,
    ) => {
      await changeRecordFieldVisibility({
        recordField,
        isVisible: true,
      });
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

  const visibleRecordFieldKeys = new Set(
    visibleRecordFields.map(getRecordFieldKey),
  );

  const isRecordFieldVisible = (
    recordField: Pick<
      RecordField,
      'fieldMetadataItemId' | 'relationTargetFieldMetadataItemId'
    >,
  ) => visibleRecordFieldKeys.has(getRecordFieldKey(recordField));

  const traversableRelations = getTraversableRelationFieldMetadataItems({
    objectMetadataItem,
    objectMetadataItems,
  });

  const traversableRelationByFieldMetadataId = new Map(
    traversableRelations.map((traversableRelation) => [
      traversableRelation.relationFieldMetadataItem.id,
      traversableRelation,
    ]),
  );

  // A relation stays listed while visible so its target fields remain reachable.
  const availableFieldMetadataItemsToShow = activeFieldMetadataItems.filter(
    (fieldMetadataItemToFilter) =>
      traversableRelationByFieldMetadataId.has(fieldMetadataItemToFilter.id) ||
      !isRecordFieldVisible({
        fieldMetadataItemId: fieldMetadataItemToFilter.id,
      }),
  );

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
    await handleAddColumn({ fieldMetadataItemId: fieldMetadataItem.id });
  };

  const hasAvailableFields = isNonEmptyArray(availableFieldMetadataItemsToShow);

  const selectedRelationCandidates = isDefined(selectedTraversableRelation)
    ? getTraversedFieldCandidates(selectedTraversableRelation).filter(
        (candidate) => !isRecordFieldVisible(candidate.recordField),
      )
    : [];

  const isSelectedRelationColumnVisible =
    isDefined(selectedTraversableRelation) &&
    isRecordFieldVisible({
      fieldMetadataItemId:
        selectedTraversableRelation.relationFieldMetadataItem.id,
    });

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
            filteredFieldMetadataItems.map((fieldMetadataItem) => {
              const traversableRelation =
                traversableRelationByFieldMetadataId.get(fieldMetadataItem.id);

              if (isDefined(traversableRelation)) {
                return (
                  <Dropdown.ActionItem
                    key={fieldMetadataItem.id}
                    page={RELATION_TARGET_PAGE_ID}
                    onClick={() =>
                      setSelectedTraversableRelation(traversableRelation)
                    }
                    startIcon={
                      <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
                    }
                  >
                    {fieldMetadataItem.label}
                  </Dropdown.ActionItem>
                );
              }

              return (
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
              );
            })
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
      <Dropdown.Page id={RELATION_TARGET_PAGE_ID} type="picker">
        {isDefined(selectedTraversableRelation) && (
          <>
            <Dropdown.Back
              aria-label={t`${selectedTraversableRelation.relationFieldMetadataItem.label}, back to fields`}
            >
              {selectedTraversableRelation.relationFieldMetadataItem.label}
            </Dropdown.Back>
            <Dropdown.Section scrollable>
              {!isSelectedRelationColumnVisible && (
                <Dropdown.OptionItem
                  onSelect={() =>
                    handleFieldMetadataItemMenuItemClick(
                      selectedTraversableRelation.relationFieldMetadataItem,
                    )
                  }
                  startIcon={
                    <SelectOptionIcon
                      Icon={getIcon(
                        selectedTraversableRelation.relationFieldMetadataItem
                          .icon,
                      )}
                    />
                  }
                >
                  {selectedTraversableRelation.relationFieldMetadataItem.label}
                </Dropdown.OptionItem>
              )}
              {selectedRelationCandidates.map((candidate) => (
                <Dropdown.OptionItem
                  key={candidate.targetFieldMetadataItem.id}
                  onSelect={() => handleAddColumn(candidate.recordField)}
                  startIcon={
                    <SelectOptionIcon
                      Icon={getIcon(candidate.targetFieldMetadataItem.icon)}
                    />
                  }
                >
                  {candidate.targetFieldMetadataItem.label}
                </Dropdown.OptionItem>
              ))}
              {isSelectedRelationColumnVisible &&
                selectedRelationCandidates.length === 0 && (
                  <Dropdown.Empty>{t`All fields are already visible`}</Dropdown.Empty>
                )}
            </Dropdown.Section>
          </>
        )}
      </Dropdown.Page>
    </>
  );
};
