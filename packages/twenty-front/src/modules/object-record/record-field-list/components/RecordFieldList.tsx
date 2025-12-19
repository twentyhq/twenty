import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { RecordFieldListCellEditModePortal } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellEditModePortal';
import { RecordFieldListCellHoveredPortal } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellHoveredPortal';
import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { RecordDetailDuplicatesSection } from '@/object-record/record-field-list/record-detail-section/duplicate/components/RecordDetailDuplicatesSection';
import { RecordDetailMorphRelationSection } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailMorphRelationSection';
import { RecordDetailRelationSection } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationSection';
import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { PropertyBoxSkeletonLoader } from '@/object-record/record-inline-cell/property-box/components/PropertyBoxSkeletonLoader';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { FieldMetadataType } from 'twenty-shared/types';

type RecordFieldListProps = {
  instanceId: string;
  objectNameSingular: string;
  objectRecordId: string;
  showDuplicatesSection?: boolean;
  showRelationSections?: boolean;
  excludeFieldMetadataIds?: string[];
  excludeCreatedAtAndUpdatedAt?: boolean;
};

export const RecordFieldList = ({
  instanceId,
  objectNameSingular,
  objectRecordId,
  showDuplicatesSection = true,
  showRelationSections = true,
  excludeFieldMetadataIds = [],
  excludeCreatedAtAndUpdatedAt = true,
}: RecordFieldListProps) => {
  const { recordLoading, isPrefetchLoading } = useRecordShowContainerData({
    objectRecordId,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
    objectRecordId,
  });

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: objectRecordId,
    objectMetadataId: objectMetadataItem.id,
  });

  const setRecordFieldListHoverPosition = useSetRecoilComponentState(
    recordFieldListHoverPositionComponentState,
    instanceId,
  );

  const handleMouseEnter = (index: number) => {
    setRecordFieldListHoverPosition(index);
  };

  const {
    inlineFieldMetadataItems,
    inlineRelationFieldMetadataItems,
    boxedRelationFieldMetadataItems,
  } = useFieldListFieldMetadataItems({
    objectNameSingular,
    excludeFieldMetadataIds,
    showRelationSections,
    excludeCreatedAtAndUpdatedAt,
  });

  return (
    <RecordFieldListComponentInstanceContext.Provider
      value={{
        instanceId,
      }}
    >
      <PropertyBox dataTestId="record-fields-list-container">
        {isPrefetchLoading ? (
          <PropertyBoxSkeletonLoader />
        ) : (
          <>
            {inlineRelationFieldMetadataItems?.map(
              (fieldMetadataItem, index) => (
                <FieldContext.Provider
                  key={objectRecordId + fieldMetadataItem.id}
                  value={{
                    recordId: objectRecordId,
                    maxWidth: 200,
                    isLabelIdentifier: false,
                    fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
                      field: fieldMetadataItem,
                      position: index,
                      objectMetadataItem,
                      showLabel: true,
                      labelWidth: 90,
                    }),
                    useUpdateRecord: useUpdateOneObjectRecordMutation,
                    isDisplayModeFixHeight: true,
                    onMouseEnter: () => handleMouseEnter(index),
                    anchorId: `${getRecordFieldInputInstanceId({
                      recordId: objectRecordId,
                      fieldName: fieldMetadataItem.name,
                      prefix: instanceId,
                    })}`,
                    isRecordFieldReadOnly: isRecordFieldReadOnly({
                      isRecordReadOnly,
                      objectPermissions:
                        getObjectPermissionsFromMapByObjectMetadataId({
                          objectPermissionsByObjectMetadataId,
                          objectMetadataId: objectMetadataItem.id,
                        }),
                      fieldMetadataItem: {
                        id: fieldMetadataItem.id,
                        isUIReadOnly: fieldMetadataItem.isUIReadOnly ?? false,
                      },
                    }),
                  }}
                >
                  <ActivityTargetsInlineCell
                    componentInstanceId={getRecordFieldInputInstanceId({
                      recordId: objectRecordId,
                      fieldName: fieldMetadataItem.name,
                      prefix: instanceId,
                    })}
                    activityObjectNameSingular={
                      objectNameSingular as
                        | CoreObjectNameSingular.Note
                        | CoreObjectNameSingular.Task
                    }
                    activityRecordId={objectRecordId}
                    showLabel={true}
                    maxWidth={200}
                  />
                </FieldContext.Provider>
              ),
            )}
            {inlineFieldMetadataItems?.map((fieldMetadataItem, index) => (
              <FieldContext.Provider
                key={objectRecordId + fieldMetadataItem.id}
                value={{
                  recordId: objectRecordId,
                  maxWidth: 200,
                  isLabelIdentifier: false,
                  fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
                    field: fieldMetadataItem,
                    position: index,
                    objectMetadataItem,
                    showLabel: true,
                    labelWidth: 90,
                  }),
                  useUpdateRecord: useUpdateOneObjectRecordMutation,
                  isDisplayModeFixHeight: true,
                  isRecordFieldReadOnly: isRecordFieldReadOnly({
                    isRecordReadOnly,
                    objectPermissions:
                      getObjectPermissionsFromMapByObjectMetadataId({
                        objectPermissionsByObjectMetadataId,
                        objectMetadataId: objectMetadataItem.id,
                      }),
                    fieldMetadataItem: {
                      id: fieldMetadataItem.id,
                      isUIReadOnly: fieldMetadataItem.isUIReadOnly ?? false,
                    },
                  }),
                  onMouseEnter: () =>
                    handleMouseEnter(
                      index + (inlineRelationFieldMetadataItems?.length ?? 0),
                    ),
                  anchorId: `${getRecordFieldInputInstanceId({
                    recordId: objectRecordId,
                    fieldName: fieldMetadataItem.name,
                    prefix: instanceId,
                  })}`,
                }}
              >
                <RecordFieldComponentInstanceContext.Provider
                  value={{
                    instanceId: getRecordFieldInputInstanceId({
                      recordId: objectRecordId,
                      fieldName: fieldMetadataItem.name,
                      prefix: instanceId,
                    }),
                  }}
                >
                  <RecordInlineCell
                    loading={recordLoading}
                    instanceIdPrefix={instanceId}
                  />
                </RecordFieldComponentInstanceContext.Provider>
              </FieldContext.Provider>
            ))}
          </>
        )}
      </PropertyBox>
      {showDuplicatesSection && (
        <RecordDetailDuplicatesSection
          objectRecordId={objectRecordId}
          objectNameSingular={objectNameSingular}
        />
      )}
      {boxedRelationFieldMetadataItems
        .filter(
          (fieldMetadataItem) =>
            fieldMetadataItem.type === FieldMetadataType.RELATION ||
            fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION,
        )
        .map((fieldMetadataItem, index) => (
          <FieldContext.Provider
            key={objectRecordId + fieldMetadataItem.id}
            value={{
              recordId: objectRecordId,
              isLabelIdentifier: false,
              fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
                field: fieldMetadataItem,
                position: index,
                objectMetadataItem,
              }),
              useUpdateRecord: useUpdateOneObjectRecordMutation,
              isDisplayModeFixHeight: true,
              isRecordFieldReadOnly: isRecordFieldReadOnly({
                isRecordReadOnly,
                objectPermissions:
                  getObjectPermissionsFromMapByObjectMetadataId({
                    objectPermissionsByObjectMetadataId,
                    objectMetadataId: objectMetadataItem.id,
                  }),
                fieldMetadataItem: {
                  id: fieldMetadataItem.id,
                  isUIReadOnly: fieldMetadataItem.isUIReadOnly ?? false,
                },
              }),
            }}
          >
            {fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION ? (
              <RecordDetailMorphRelationSection
                loading={isPrefetchLoading || recordLoading}
              />
            ) : (
              <RecordDetailRelationSection
                loading={isPrefetchLoading || recordLoading}
              />
            )}
          </FieldContext.Provider>
        ))}

      <RecordFieldListCellHoveredPortal
        objectMetadataItem={objectMetadataItem}
        recordId={objectRecordId}
      />
      <RecordFieldListCellEditModePortal
        objectMetadataItem={objectMetadataItem}
        recordId={objectRecordId}
      />
    </RecordFieldListComponentInstanceContext.Provider>
  );
};
