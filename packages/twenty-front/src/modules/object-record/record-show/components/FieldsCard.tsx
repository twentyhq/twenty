import groupBy from 'lodash.groupby';

import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsRecordReadOnly } from '@/object-record/record-field/hooks/read-only/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/record-field/hooks/read-only/utils/isRecordFieldReadOnly';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { PropertyBoxSkeletonLoader } from '@/object-record/record-inline-cell/property-box/components/PropertyBoxSkeletonLoader';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { RecordDetailDuplicatesSection } from '@/object-record/record-show/record-detail-section/components/RecordDetailDuplicatesSection';
import { RecordDetailRelationSection } from '@/object-record/record-show/record-detail-section/components/RecordDetailRelationSection';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';
import { useIsInRightDrawerOrThrow } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

type FieldsCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
  showDuplicatesSection?: boolean;
};

const INPUT_ID_PREFIX = 'fields-card';

export const FieldsCard = ({
  objectNameSingular,
  objectRecordId,
  showDuplicatesSection = true,
}: FieldsCardProps) => {
  const { recordLoading, labelIdentifierFieldMetadataItem, isPrefetchLoading } =
    useRecordShowContainerData({
      objectNameSingular,
      objectRecordId,
    });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
    objectRecordId,
  });

  const { isInRightDrawer } = useIsInRightDrawerOrThrow();

  const availableFieldMetadataItems = objectMetadataItem.fields
    .filter(
      (fieldMetadataItem) =>
        isFieldCellSupported(fieldMetadataItem, objectMetadataItems) &&
        fieldMetadataItem.id !== labelIdentifierFieldMetadataItem?.id,
    )
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
    );

  const { inlineFieldMetadataItems, relationFieldMetadataItems } = groupBy(
    availableFieldMetadataItems
      .filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.name !== 'createdAt' &&
          fieldMetadataItem.name !== 'deletedAt',
      )
      .filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.type !== FieldMetadataType.RICH_TEXT_V2,
      ),
    (fieldMetadataItem) =>
      fieldMetadataItem.type === FieldMetadataType.RELATION
        ? 'relationFieldMetadataItems'
        : 'inlineFieldMetadataItems',
  );

  const inlineRelationFieldMetadataItems = relationFieldMetadataItems?.filter(
    (fieldMetadataItem) =>
      (objectNameSingular === CoreObjectNameSingular.Note &&
        fieldMetadataItem.name === 'noteTargets') ||
      (objectNameSingular === CoreObjectNameSingular.Task &&
        fieldMetadataItem.name === 'taskTargets'),
  );

  const boxedRelationFieldMetadataItems = relationFieldMetadataItems?.filter(
    (fieldMetadataItem) =>
      !(
        (objectNameSingular === CoreObjectNameSingular.Note &&
          fieldMetadataItem.name === 'noteTargets') ||
        (objectNameSingular === CoreObjectNameSingular.Task &&
          fieldMetadataItem.name === 'taskTargets')
      ) &&
      isDefined(fieldMetadataItem.relation?.targetObjectMetadata.id) &&
      getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        fieldMetadataItem.relation?.targetObjectMetadata.id,
      ).canReadObjectRecords,
  );

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: objectRecordId,
    objectMetadataId: objectMetadataItem.id,
  });

  return (
    <>
      <PropertyBox>
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
                    isRecordFieldReadOnly: isRecordFieldReadOnly({
                      isRecordReadOnly,
                      objectPermissions:
                        objectPermissionsByObjectMetadataId[
                          objectMetadataItem.id
                        ],
                      fieldMetadataId: fieldMetadataItem.id,
                      objectNameSingular,
                      fieldName: fieldMetadataItem.name,
                      fieldType: fieldMetadataItem.type,
                      isCustom: fieldMetadataItem.isCustom ?? false,
                    }),
                  }}
                >
                  <ActivityTargetsInlineCell
                    componentInstanceId={getRecordFieldInputInstanceId({
                      recordId: objectRecordId,
                      fieldName: fieldMetadataItem.name,
                      prefix: isInRightDrawer
                        ? 'right-drawer-fields-card'
                        : 'fields-card',
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
                      objectPermissionsByObjectMetadataId[
                        objectMetadataItem.id
                      ],
                    fieldMetadataId: fieldMetadataItem.id,
                    objectNameSingular,
                    fieldName: fieldMetadataItem.name,
                    fieldType: fieldMetadataItem.type,
                    isCustom: fieldMetadataItem.isCustom ?? false,
                  }),
                }}
              >
                <RecordFieldComponentInstanceContext.Provider
                  value={{
                    instanceId: getRecordFieldInputInstanceId({
                      recordId: objectRecordId,
                      fieldName: fieldMetadataItem.name,
                      prefix: INPUT_ID_PREFIX,
                    }),
                  }}
                >
                  <RecordInlineCell
                    loading={recordLoading}
                    instanceIdPrefix={INPUT_ID_PREFIX}
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
      {boxedRelationFieldMetadataItems?.map((fieldMetadataItem, index) => (
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
                objectPermissionsByObjectMetadataId[objectMetadataItem.id],
              fieldMetadataId: fieldMetadataItem.id,
              objectNameSingular,
              fieldName: fieldMetadataItem.name,
              fieldType: fieldMetadataItem.type,
              isCustom: fieldMetadataItem.isCustom ?? false,
            }),
          }}
        >
          <RecordDetailRelationSection
            loading={isPrefetchLoading || recordLoading}
          />
        </FieldContext.Provider>
      ))}
    </>
  );
};
