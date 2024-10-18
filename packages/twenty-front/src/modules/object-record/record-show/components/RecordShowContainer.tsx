import groupBy from 'lodash.groupby';

import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { Note } from '@/activities/types/Note';
import { Task } from '@/activities/types/Task';
import { InformationBannerDeletedRecord } from '@/information-banner/components/deleted-record/InformationBannerDeletedRecord';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
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
import { ShowPageContainer } from '@/ui/layout/page/ShowPageContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import { ShowPageSummaryCardSkeletonLoader } from '@/ui/layout/show-page/components/ShowPageSummaryCardSkeletonLoader';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { useRecordShowContainerTabs } from '@/object-record/record-show/hooks/useRecordShowContainerTabs';
import { ShowPageSubContainer } from '@/ui/layout/show-page/components/ShowPageSubContainer';
import { FieldMetadataType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

type RecordShowContainerProps = {
  objectNameSingular: string;
  objectRecordId: string;
  loading: boolean;
  isInRightDrawer?: boolean;
  isNewRightDrawerItemLoading?: boolean;
};

export const RecordShowContainer = ({
  objectNameSingular,
  objectRecordId,
  loading,
  isInRightDrawer = false,
  isNewRightDrawerItemLoading = false,
}: RecordShowContainerProps) => {
  const {
    recordFromStore,
    recordLoading,
    objectMetadataItem,
    labelIdentifierFieldMetadataItem,
    isPrefetchLoading,
    recordIdentifier,
    objectMetadataItems,
  } = useRecordShowContainerData({
    objectNameSingular,
    objectRecordId,
  });

  const { onUploadPicture, useUpdateOneObjectRecordMutation } =
    useRecordShowContainerActions({
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
      objectNameSingular !== CoreObjectNameSingular.Note &&
      fieldMetadataItem.name !== 'noteTargets' &&
      objectNameSingular !== CoreObjectNameSingular.Task &&
      fieldMetadataItem.name !== 'taskTargets',
  );
  const { Icon, IconColor } = useGetStandardObjectIcon(objectNameSingular);
  const isReadOnly = objectMetadataItem.isRemote;
  const isMobile = useIsMobile() || isInRightDrawer;

  const summaryCard =
    !isNewRightDrawerItemLoading && isDefined(recordFromStore) ? (
      <ShowPageSummaryCard
        isMobile={isMobile}
        id={objectRecordId}
        logoOrAvatar={recordIdentifier?.avatarUrl ?? ''}
        icon={Icon}
        iconColor={IconColor}
        avatarPlaceholder={recordIdentifier?.name ?? ''}
        date={recordFromStore.createdAt ?? ''}
        loading={isPrefetchLoading || loading || recordLoading}
        title={
          <FieldContext.Provider
            value={{
              recordId: objectRecordId,
              recoilScopeId:
                objectRecordId + labelIdentifierFieldMetadataItem?.id,
              isLabelIdentifier: false,
              fieldDefinition: {
                type:
                  labelIdentifierFieldMetadataItem?.type ||
                  FieldMetadataType.Text,
                iconName: '',
                fieldMetadataId: labelIdentifierFieldMetadataItem?.id ?? '',
                label: labelIdentifierFieldMetadataItem?.label || '',
                metadata: {
                  fieldName: labelIdentifierFieldMetadataItem?.name || '',
                  objectMetadataNameSingular: objectNameSingular,
                },
                defaultValue: labelIdentifierFieldMetadataItem?.defaultValue,
              },
              useUpdateRecord: useUpdateOneObjectRecordMutation,
              hotkeyScope: InlineCellHotkeyScope.InlineCell,
              isCentered: !isMobile,
            }}
          >
            <RecordInlineCell readonly={isReadOnly} />
          </FieldContext.Provider>
        }
        avatarType={recordIdentifier?.avatarType ?? 'rounded'}
        onUploadPicture={
          objectNameSingular === 'person' ? onUploadPicture : undefined
        }
      />
    ) : (
      <ShowPageSummaryCardSkeletonLoader />
    );

  const fieldsBox = (
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
                    <RecordInlineCell
                      loading={loading || recordLoading}
                      readonly={isReadOnly}
                    />
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
                loading={isPrefetchLoading || loading || recordLoading}
              />
            </FieldContext.Provider>
          ))}
        </>
      )}
    </>
  );

  const tabs = useRecordShowContainerTabs(
    loading,
    objectMetadataItem.nameSingular as CoreObjectNameSingular,
    isInRightDrawer,
  );

  return (
    <>
      {recordFromStore && recordFromStore.deletedAt && (
        <InformationBannerDeletedRecord
          recordId={objectRecordId}
          objectNameSingular={objectNameSingular}
        />
      )}
      <ShowPageContainer>
        <ShowPageSubContainer
          tabs={tabs}
          targetableObject={{
            id: objectRecordId,
            targetObjectNameSingular: objectMetadataItem?.nameSingular,
          }}
          isInRightDrawer={isInRightDrawer}
          summaryCard={summaryCard}
          fieldsBox={fieldsBox}
          loading={isPrefetchLoading || loading || recordLoading}
        />
      </ShowPageContainer>
    </>
  );
};
