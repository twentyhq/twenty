import groupBy from 'lodash.groupby';

import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { Note } from '@/activities/types/Note';
import { Task } from '@/activities/types/Task';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { PropertyBoxSkeletonLoader } from '@/object-record/record-inline-cell/property-box/components/PropertyBoxSkeletonLoader';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { RecordDetailDuplicatesSection } from '@/object-record/record-show/record-detail-section/components/RecordDetailDuplicatesSection';
import { RecordDetailRelationSection } from '@/object-record/record-show/record-detail-section/components/RecordDetailRelationSection';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';
import { FieldMetadataType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

type FieldsCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

export const FieldsCard = ({
  objectNameSingular,
  objectRecordId,
}: FieldsCardProps) => {
  const {
    recordFromStore,
    recordLoading,
    objectMetadataItem,
    labelIdentifierFieldMetadataItem,
    isPrefetchLoading,
    objectMetadataItems,
  } = useRecordShowContainerData({
    objectNameSingular,
    objectRecordId,
  });

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
    objectRecordId,
    recordFromStore,
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
    availableFieldMetadataItems.filter(
      (fieldMetadataItem) =>
        fieldMetadataItem.name !== 'createdAt' &&
        fieldMetadataItem.name !== 'deletedAt',
    ),
    (fieldMetadataItem) =>
      fieldMetadataItem.type === FieldMetadataType.Relation
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

  return (
    <>
      {isDefined(recordFromStore) && (
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
                        recoilScopeId: objectRecordId + fieldMetadataItem.id,
                        isLabelIdentifier: false,
                        fieldDefinition:
                          formatFieldMetadataItemAsColumnDefinition({
                            field: fieldMetadataItem,
                            position: index,
                            objectMetadataItem,
                            showLabel: true,
                            labelWidth: 90,
                          }),
                        useUpdateRecord: useUpdateOneObjectRecordMutation,
                        hotkeyScope: InlineCellHotkeyScope.InlineCell,
                      }}
                    >
                      <ActivityTargetsInlineCell
                        activityObjectNameSingular={
                          objectNameSingular as
                            | CoreObjectNameSingular.Note
                            | CoreObjectNameSingular.Task
                        }
                        activity={recordFromStore as Task | Note}
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
                      recoilScopeId: objectRecordId + fieldMetadataItem.id,
                      isLabelIdentifier: false,
                      fieldDefinition:
                        formatFieldMetadataItemAsColumnDefinition({
                          field: fieldMetadataItem,
                          position: index,
                          objectMetadataItem,
                          showLabel: true,
                          labelWidth: 90,
                        }),
                      useUpdateRecord: useUpdateOneObjectRecordMutation,
                      hotkeyScope: InlineCellHotkeyScope.InlineCell,
                    }}
                  >
                    <RecordInlineCell loading={recordLoading} />
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
                recoilScopeId: objectRecordId + fieldMetadataItem.id,
                isLabelIdentifier: false,
                fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
                  field: fieldMetadataItem,
                  position: index,
                  objectMetadataItem,
                }),
                useUpdateRecord: useUpdateOneObjectRecordMutation,
                hotkeyScope: InlineCellHotkeyScope.InlineCell,
              }}
            >
              <RecordDetailRelationSection
                loading={isPrefetchLoading || recordLoading}
              />
            </FieldContext.Provider>
          ))}
        </>
      )}
    </>
  );
};
