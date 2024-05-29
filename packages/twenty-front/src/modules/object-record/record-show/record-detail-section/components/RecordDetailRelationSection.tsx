import { useCallback, useContext } from 'react';
import styled from '@emotion/styled';
import qs from 'qs';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconForbid, IconPencil, IconPlus } from 'twenty-ui';
import { v4 } from 'uuid';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { RecordDetailRelationRecordsList } from '@/object-record/record-show/record-detail-section/components/RecordDetailRelationRecordsList';
import { RecordDetailRelationRecordsListEmptyState } from '@/object-record/record-show/record-detail-section/components/RecordDetailRelationRecordsListEmptyState';
import { RecordDetailRelationSectionSkeletonLoader } from '@/object-record/record-show/record-detail-section/components/RecordDetailRelationSectionSkeletonLoader';
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
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { FilterQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

type RecordDetailRelationSectionProps = {
  loading: boolean;
};

const StyledAddDropdown = styled(Dropdown)`
  margin-left: auto;
`;

export const RecordDetailRelationSection = ({
  loading,
}: RecordDetailRelationSectionProps) => {
  const { entityId, fieldDefinition } = useContext(FieldContext);
  const {
    fieldName,
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
    relationType,
  } = fieldDefinition.metadata as FieldRelationMetadata;
  const record = useRecoilValue(recordStoreFamilyState(entityId));

  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
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

  const showContent = () => {
    if (loading) {
      return (
        <RecordDetailRelationSectionSkeletonLoader
          numSkeletons={fieldName === 'people' ? 2 : 1}
        />
      );
    }

    return relationRecords.length ? (
      <RecordDetailRelationRecordsList relationRecords={relationRecords} />
    ) : (
      <RecordDetailRelationRecordsListEmptyState
        relationObjectMetadataItem={relationObjectMetadataItem}
      />
    );
  };

  const { openRightDrawer } = useRightDrawer();
  const setViewableRecordId = useSetRecoilState(viewableRecordIdState);
  const setViewableRecordNameSingular = useSetRecoilState(
    viewableRecordNameSingularState,
  );

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const handleOnCreate = async () => {
    const newRecordId = v4();
    await createOneRecord({
      id: newRecordId,
    });
    setViewableRecordId(newRecordId);
    setViewableRecordNameSingular(relationObjectMetadataNameSingular);
    openRightDrawer(RightDrawerPages.ViewRecord);
  };

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
                    onCreate={handleOnCreate}
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
      {showContent()}
    </RecordDetailSection>
  );
};
