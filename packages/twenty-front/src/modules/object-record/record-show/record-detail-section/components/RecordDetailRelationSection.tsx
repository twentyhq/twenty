import { useCallback, useContext } from 'react';
import styled from '@emotion/styled';
import qs from 'qs';
import { useRecoilValue } from 'recoil';
import { IconForbid, IconPencil, IconPlus } from 'twenty-ui';

import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordDetailRelationRecordsList } from '@/object-record/record-show/record-detail-section/components/RecordDetailRelationRecordsList';
import { RecordDetailRelationRecordsListEmptyState } from '@/object-record/record-show/record-detail-section/components/RecordDetailRelationRecordsListEmptyState';
import { RecordDetailSection } from '@/object-record/record-show/record-detail-section/components/RecordDetailSection';
import { RecordDetailSectionHeader } from '@/object-record/record-show/record-detail-section/components/RecordDetailSectionHeader';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { SingleEntitySelectMenuItemsWithSearch } from '@/object-record/relation-picker/components/SingleEntitySelectMenuItemsWithSearch';
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { FilterQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

const StyledAddDropdown = styled(Dropdown)`
  margin-left: auto;
`;

export const RecordDetailRelationSection = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);
  const {
    fieldName,
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
    relationType,
  } = fieldDefinition.metadata as FieldRelationMetadata;
  const record = useRecoilValue(recordStoreFamilyState(entityId));

  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItemOnly({
      objectNameSingular: relationObjectMetadataNameSingular,
    });

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === relationFieldMetadataId,
  );

  const fieldValue = useRecoilValue<
    ({ id: string } & Record<string, any>) | ObjectRecord[] | null
  >(recordStoreFamilySelector({ recordId: entityId, fieldName }));

  // TODO: use new relation type
  const isToOneObject = relationType === 'TO_ONE_OBJECT';
  const isFromManyObjects = relationType === 'FROM_MANY_OBJECTS';

  const relationRecords: ObjectRecord[] =
    fieldValue && isToOneObject
      ? [fieldValue as ObjectRecord]
      : (fieldValue as ObjectRecord[]) ?? [];
  const relationRecordIds = relationRecords.map(({ id }) => id);

  const dropdownId = `record-field-card-relation-picker-${fieldDefinition.label}`;

  const { closeDropdown, isDropdownOpen } = useDropdown(dropdownId);

  const { setRelationPickerSearchFilter } = useRelationPicker({
    relationPickerScopeId: dropdownId,
  });

  const handleCloseRelationPickerDropdown = useCallback(() => {
    setRelationPickerSearchFilter('');
  }, [setRelationPickerSearchFilter]);

  const persistField = usePersistField();
  const { updateOneRecord: updateOneRelationRecord } = useUpdateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const handleRelationPickerEntitySelected = (
    selectedRelationEntity?: EntityForSelect,
  ) => {
    closeDropdown();

    if (!selectedRelationEntity?.id || !relationFieldMetadataItem?.name) return;

    if (isToOneObject) {
      persistField(selectedRelationEntity.record);
      return;
    }

    updateOneRelationRecord({
      idToUpdate: selectedRelationEntity.id,
      updateOneRecordInput: {
        [relationFieldMetadataItem.name]: record,
      },
    });
  };

  const filterQueryParams: FilterQueryParams = {
    filter: {
      [relationFieldMetadataItem?.name || '']: {
        [ViewFilterOperand.Is]: [entityId],
      },
    },
  };
  const filterLinkHref = `/objects/${
    relationObjectMetadataItem.namePlural
  }?${qs.stringify(filterQueryParams)}`;

  return (
    <RecordDetailSection>
      <RecordDetailSectionHeader
        title={fieldDefinition.label}
        link={
          isFromManyObjects
            ? {
                to: filterLinkHref,
                label: `All (${relationRecords.length})`,
              }
            : undefined
        }
        hideRightAdornmentOnMouseLeave={!isDropdownOpen}
        rightAdornment={
          <DropdownScope dropdownScopeId={dropdownId}>
            <StyledAddDropdown
              dropdownId={dropdownId}
              dropdownPlacement="right-start"
              onClose={handleCloseRelationPickerDropdown}
              clickableComponent={
                <LightIconButton
                  className="displayOnHover"
                  Icon={isToOneObject ? IconPencil : IconPlus}
                  accent="tertiary"
                />
              }
              dropdownComponents={
                <RelationPickerScope relationPickerScopeId={dropdownId}>
                  <SingleEntitySelectMenuItemsWithSearch
                    EmptyIcon={IconForbid}
                    onEntitySelected={handleRelationPickerEntitySelected}
                    selectedRelationRecordIds={relationRecordIds}
                    relationObjectNameSingular={
                      relationObjectMetadataNameSingular
                    }
                    relationPickerScopeId={dropdownId}
                  />
                </RelationPickerScope>
              }
              dropdownHotkeyScope={{
                scope: dropdownId,
              }}
            />
          </DropdownScope>
        }
      />
      {relationRecords.length ? (
        <RecordDetailRelationRecordsList relationRecords={relationRecords} />
      ) : (
        <RecordDetailRelationRecordsListEmptyState
          relationObjectMetadataItem={relationObjectMetadataItem}
        />
      )}
    </RecordDetailSection>
  );
};
