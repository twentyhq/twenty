import groupBy from 'lodash.groupby';

import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsRecordReadOnly } from '@/object-record/record-field/hooks/useIsRecordReadOnly';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { PropertyBoxSkeletonLoader } from '@/object-record/record-inline-cell/property-box/components/PropertyBoxSkeletonLoader';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { RecordDetailDuplicatesSection } from '@/object-record/record-show/record-detail-section/components/RecordDetailDuplicatesSection';
import { RecordDetailRelationSection } from '@/object-record/record-show/record-detail-section/components/RecordDetailRelationSection';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';
import { FieldMetadataType } from '~/generated/graphql';

type FieldsCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

export const FieldsCard = ({
  objectNameSingular,
  objectRecordId,
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

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
    objectRecordId,
  });

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
      ),
  );

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: objectRecordId,
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
                    isReadOnly: isRecordReadOnly,
                  }}
                >
                  <ActivityTargetsInlineCell
                    componentInstanceId={getRecordFieldInputId(
                      objectRecordId,
                      fieldMetadataItem.name,
                      'fields-card',
                    )}
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
                  isReadOnly: isRecordReadOnly,
                }}
              >
                <RecordFieldComponentInstanceContext.Provider
                  value={{
                    instanceId: getRecordFieldInputId(
                      objectRecordId,
                      fieldMetadataItem.name,
                      'fields-card',
                    ),
                  }}
                >
                  <RecordInlineCell loading={recordLoading} />
                </RecordFieldComponentInstanceContext.Provider>
              </FieldContext.Provider>
            ))}
          </>
        )}
      </PropertyBox>
      <RecordDetailDuplicatesSection
        objectRecordId={objectRecordId}
        objectNameSingular={objectNameSingular}
      />
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
            isReadOnly: isRecordReadOnly,
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
