import styled from '@emotion/styled';
import { useCallback, useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { IconForbid, IconPencil, IconPlus, LightIconButton } from 'twenty-ui';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { RelationFromManyFieldInputMultiRecordsEffect } from '@/object-record/record-field/meta-types/input/components/RelationFromManyFieldInputMultiRecordsEffect';
import { useUpdateRelationFromManyFieldInput } from '@/object-record/record-field/meta-types/input/hooks/useUpdateRelationFromManyFieldInput';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordDetailRelationRecordsList } from '@/object-record/record-show/record-detail-section/components/RecordDetailRelationRecordsList';
import { RecordDetailSection } from '@/object-record/record-show/record-detail-section/components/RecordDetailSection';
import { RecordDetailSectionHeader } from '@/object-record/record-show/record-detail-section/components/RecordDetailSectionHeader';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { MultiRecordSelect } from '@/object-record/relation-picker/components/MultiRecordSelect';
import { SingleRecordSelectMenuItemsWithSearch } from '@/object-record/relation-picker/components/SingleRecordSelectMenuItemsWithSearch';
import { useAddNewRecordAndOpenRightDrawer } from '@/object-record/relation-picker/hooks/useAddNewRecordAndOpenRightDrawer';
import { useRecordPicker } from '@/object-record/relation-picker/hooks/useRecordPicker';
import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { RecordForSelect } from '@/object-record/relation-picker/types/RecordForSelect';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { AppPath } from '@/types/AppPath';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { View } from '@/views/types/View';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { RelationDefinitionType } from '~/generated-metadata/graphql';
import { getAppPath } from '~/utils/navigation/getAppPath';
type RecordDetailRelationSectionProps = {
  loading: boolean;
};

const StyledAddDropdown = styled(Dropdown)`
  margin-left: auto;
`;

export const RecordDetailRelationSection = ({
  loading,
}: RecordDetailRelationSectionProps) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);
  const {
    fieldName,
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
    relationType,
  } = fieldDefinition.metadata as FieldRelationMetadata;
  const record = useRecoilValue(recordStoreFamilyState(recordId));

  const isMobile = useIsMobile();
  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relationObjectMetadataNameSingular,
    });

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === relationFieldMetadataId,
  );

  const fieldValue = useRecoilValue<
    ({ id: string } & Record<string, any>) | ObjectRecord[] | null
  >(recordStoreFamilySelector({ recordId, fieldName }));

  // TODO: use new relation type
  const isToOneObject = relationType === RelationDefinitionType.ManyToOne;
  const isToManyObjects = relationType === RelationDefinitionType.OneToMany;

  const relationRecords: ObjectRecord[] =
    fieldValue && isToOneObject
      ? [fieldValue as ObjectRecord]
      : ((fieldValue as ObjectRecord[]) ?? []);

  const relationRecordIds = relationRecords.map(({ id }) => id);

  const dropdownId = `record-field-card-relation-picker-${fieldDefinition.fieldMetadataId}-${recordId}`;

  const { closeDropdown, isDropdownOpen, dropdownPlacement } =
    useDropdown(dropdownId);

  const { setRecordPickerSearchFilter } = useRecordPicker({
    recordPickerInstanceId: dropdownId,
  });

  const handleCloseRelationPickerDropdown = useCallback(() => {
    setRecordPickerSearchFilter('');
  }, [setRecordPickerSearchFilter]);

  const persistField = usePersistField();
  const { updateOneRecord: updateOneRelationRecord } = useUpdateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const handleRelationPickerEntitySelected = (
    selectedRelationEntity?: RecordForSelect,
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

  const { updateRelation } = useUpdateRelationFromManyFieldInput({
    scopeId: dropdownId,
  });

  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);

  const indexView = views.find(
    (view) =>
      view.key === 'INDEX' &&
      view.objectMetadataId === relationObjectMetadataItem.id,
  );

  const filterQueryParams = {
    filter: {
      [relationFieldMetadataItem?.name || '']: {
        [ViewFilterOperand.Is]: {
          selectedRecordIds: [recordId],
        },
      },
    },
    view: indexView?.id,
  };

  const filterLinkHref = getAppPath(
    AppPath.RecordIndexPage,
    {
      objectNamePlural: relationObjectMetadataItem.namePlural,
    },
    filterQueryParams,
  );

  const showContent = () => {
    return (
      relationRecords.length > 0 && (
        <RecordDetailRelationRecordsList relationRecords={relationRecords} />
      )
    );
  };

  const { createNewRecordAndOpenRightDrawer } =
    useAddNewRecordAndOpenRightDrawer({
      relationObjectMetadataNameSingular,
      relationObjectMetadataItem,
      relationFieldMetadataItem,
      recordId,
    });

  const isReadOnly = useIsFieldValueReadOnly();

  if (loading) return null;

  return (
    <RecordDetailSection>
      <RecordDetailSectionHeader
        title={fieldDefinition.label}
        link={
          isToManyObjects
            ? {
                to: filterLinkHref,
                label:
                  relationRecords.length > 0
                    ? `All (${relationRecords.length})`
                    : '',
              }
            : undefined
        }
        hideRightAdornmentOnMouseLeave={!isDropdownOpen && !isMobile}
        areRecordsAvailable={relationRecords.length > 0}
        rightAdornment={
          !isReadOnly && (
            <DropdownScope dropdownScopeId={dropdownId}>
              <StyledAddDropdown
                dropdownId={dropdownId}
                dropdownPlacement="left-start"
                onClose={handleCloseRelationPickerDropdown}
                clickableComponent={
                  <LightIconButton
                    className="displayOnHover"
                    Icon={isToOneObject ? IconPencil : IconPlus}
                    accent="tertiary"
                  />
                }
                dropdownComponents={
                  <RecordPickerComponentInstanceContext.Provider
                    value={{ instanceId: dropdownId }}
                  >
                    {isToOneObject ? (
                      <SingleRecordSelectMenuItemsWithSearch
                        EmptyIcon={IconForbid}
                        onRecordSelected={handleRelationPickerEntitySelected}
                        selectedRecordIds={relationRecordIds}
                        objectNameSingular={relationObjectMetadataNameSingular}
                        recordPickerInstanceId={dropdownId}
                        onCreate={createNewRecordAndOpenRightDrawer}
                        dropdownPlacement={dropdownPlacement}
                      />
                    ) : (
                      <>
                        <RelationFromManyFieldInputMultiRecordsEffect />
                        <MultiRecordSelect
                          onCreate={() => {
                            closeDropdown();
                            createNewRecordAndOpenRightDrawer?.();
                          }}
                          onChange={updateRelation}
                          onSubmit={closeDropdown}
                          dropdownPlacement={dropdownPlacement}
                        />
                      </>
                    )}
                  </RecordPickerComponentInstanceContext.Provider>
                }
                dropdownHotkeyScope={{ scope: dropdownId }}
              />
            </DropdownScope>
          )
        }
      />
      {showContent()}
    </RecordDetailSection>
  );
};
