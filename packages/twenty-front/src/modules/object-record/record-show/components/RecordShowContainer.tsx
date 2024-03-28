import { useRecoilState, useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { RecordDetailDuplicatesSection } from '@/object-record/record-show/record-detail-section/components/RecordDetailDuplicatesSection';
import { RecordDetailRelationSection } from '@/object-record/record-show/record-detail-section/components/RecordDetailRelationSection';
import { recordLoadingFamilyState } from '@/object-record/record-store/states/recordLoadingFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreIdentifierFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifierSelector';
import { isFieldMetadataItemAvailable } from '@/object-record/utils/isFieldMetadataItemAvailable';
import { ShowPageContainer } from '@/ui/layout/page/ShowPageContainer';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import { ShowPageRecoilScopeContext } from '@/ui/layout/states/ShowPageRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import {
  FieldMetadataType,
  FileFolder,
  useUploadImageMutation,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type RecordShowContainerProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

export const RecordShowContainer = ({
  objectNameSingular,
  objectRecordId,
}: RecordShowContainerProps) => {
  const { objectMetadataItem, labelIdentifierFieldMetadata } =
    useObjectMetadataItem({
      objectNameSingular,
    });

  const [recordLoading] = useRecoilState(
    recordLoadingFamilyState(objectRecordId),
  );

  const [recordFromStore] = useRecoilState(
    recordStoreFamilyState(objectRecordId),
  );

  const recordIdentifier = useRecoilValue(
    recordStoreIdentifierFamilySelector({
      objectNameSingular,
      recordId: objectRecordId,
    }),
  );

  const [uploadImage] = useUploadImageMutation();
  const { updateOneRecord } = useUpdateOneRecord({ objectNameSingular });

  const useUpdateOneObjectRecordMutation: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  const onUploadPicture = async (file: File) => {
    if (objectNameSingular !== 'person') {
      return;
    }

    const result = await uploadImage({
      variables: {
        file,
        fileFolder: FileFolder.PersonPicture,
      },
    });

    const avatarUrl = result?.data?.uploadImage;

    if (!avatarUrl) {
      return;
    }
    if (isUndefinedOrNull(updateOneRecord)) {
      return;
    }
    if (!recordFromStore) {
      return;
    }

    await updateOneRecord({
      idToUpdate: objectRecordId,
      updateOneRecordInput: {
        avatarUrl,
      },
    });
  };

  const availableFieldMetadataItems = objectMetadataItem.fields
    .filter(
      (fieldMetadataItem) =>
        isFieldMetadataItemAvailable(fieldMetadataItem) &&
        fieldMetadataItem.id !== labelIdentifierFieldMetadata?.id,
    )
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
    );

  const inlineFieldMetadataItems = availableFieldMetadataItems.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.type !== FieldMetadataType.Relation,
  );

  const relationFieldMetadataItems = availableFieldMetadataItems.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.type === FieldMetadataType.Relation,
  );

  return (
    <RecoilScope CustomRecoilScopeContext={ShowPageRecoilScopeContext}>
      <ShowPageContainer>
        <ShowPageLeftContainer>
          {!recordLoading && isDefined(recordFromStore) && (
            <>
              <ShowPageSummaryCard
                id={objectRecordId}
                logoOrAvatar={recordIdentifier?.avatarUrl ?? ''}
                avatarPlaceholder={recordIdentifier?.name ?? ''}
                date={recordFromStore.createdAt ?? ''}
                title={
                  <FieldContext.Provider
                    value={{
                      entityId: objectRecordId,
                      recoilScopeId:
                        objectRecordId + labelIdentifierFieldMetadata?.id,
                      isLabelIdentifier: false,
                      fieldDefinition: {
                        type:
                          labelIdentifierFieldMetadata?.type ||
                          FieldMetadataType.Text,
                        iconName: '',
                        fieldMetadataId: labelIdentifierFieldMetadata?.id ?? '',
                        label: labelIdentifierFieldMetadata?.label || '',
                        metadata: {
                          fieldName: labelIdentifierFieldMetadata?.name || '',
                        },
                      },
                      useUpdateRecord: useUpdateOneObjectRecordMutation,
                      hotkeyScope: InlineCellHotkeyScope.InlineCell,
                    }}
                  >
                    <RecordInlineCell />
                  </FieldContext.Provider>
                }
                avatarType={recordIdentifier?.avatarType ?? 'rounded'}
                onUploadPicture={
                  objectNameSingular === 'person' ? onUploadPicture : undefined
                }
              />
              <PropertyBox>
                {inlineFieldMetadataItems.map((fieldMetadataItem, index) => (
                  <FieldContext.Provider
                    key={objectRecordId + fieldMetadataItem.id}
                    value={{
                      entityId: objectRecordId,
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
                    <RecordInlineCell />
                  </FieldContext.Provider>
                ))}
              </PropertyBox>
              <RecordDetailDuplicatesSection
                objectRecordId={objectRecordId}
                objectNameSingular={objectNameSingular}
              />
              {relationFieldMetadataItems
                .filter((item) => {
                  const relationObjectMetadataItem = item.toRelationMetadata
                    ? item.toRelationMetadata.fromObjectMetadata
                    : item.fromRelationMetadata?.toObjectMetadata;

                  if (!relationObjectMetadataItem) {
                    return false;
                  }

                  return isObjectMetadataAvailableForRelation(
                    relationObjectMetadataItem,
                  );
                })
                .map((fieldMetadataItem, index) => (
                  <FieldContext.Provider
                    key={objectRecordId + fieldMetadataItem.id}
                    value={{
                      entityId: objectRecordId,
                      recoilScopeId: objectRecordId + fieldMetadataItem.id,
                      isLabelIdentifier: false,
                      fieldDefinition:
                        formatFieldMetadataItemAsColumnDefinition({
                          field: fieldMetadataItem,
                          position: index,
                          objectMetadataItem,
                        }),
                      useUpdateRecord: useUpdateOneObjectRecordMutation,
                      hotkeyScope: InlineCellHotkeyScope.InlineCell,
                    }}
                  >
                    <RecordDetailRelationSection />
                  </FieldContext.Provider>
                ))}
            </>
          )}
        </ShowPageLeftContainer>
        {recordFromStore ? (
          <ShowPageRightContainer
            targetableObject={{
              id: objectRecordId,
              targetObjectNameSingular: objectMetadataItem?.nameSingular,
            }}
            timeline
            tasks
            notes
            emails
          />
        ) : (
          <></>
        )}
      </ShowPageContainer>
    </RecoilScope>
  );
};
