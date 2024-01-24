import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { parseFieldType } from '@/object-metadata/utils/parseFieldType';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/field/contexts/FieldContext';
import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { RecordRelationFieldCardSection } from '@/object-record/record-relation-card/components/RecordRelationFieldCardSection';
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

type RecordShowContainerProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

export const RecordShowContainer = ({
  objectNameSingular,
  objectRecordId,
}: RecordShowContainerProps) => {
  const {
    objectMetadataItem,
    labelIdentifierFieldMetadata,
    mapToObjectRecordIdentifier,
  } = useObjectMetadataItem({
    objectNameSingular,
  });

  const setEntityFields = useSetRecoilState(
    entityFieldsFamilyState(objectRecordId ?? ''),
  );

  const { record, loading } = useFindOneRecord({
    objectRecordId,
    objectNameSingular,
  });

  useEffect(() => {
    if (!record) return;
    setEntityFields(record);
  }, [record, setEntityFields]);

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
    if (!updateOneRecord) {
      return;
    }
    if (!record) {
      return;
    }

    await updateOneRecord({
      idToUpdate: record.id,
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
          {!loading && !!record && (
            <>
              <ShowPageSummaryCard
                id={record.id}
                logoOrAvatar={
                  mapToObjectRecordIdentifier(record).avatarUrl ?? ''
                }
                avatarPlaceholder={
                  mapToObjectRecordIdentifier(record).name ?? ''
                }
                date={record.createdAt ?? ''}
                title={
                  <FieldContext.Provider
                    value={{
                      entityId: record.id,
                      recoilScopeId:
                        record.id + labelIdentifierFieldMetadata?.id,
                      isLabelIdentifier: false,
                      fieldDefinition: {
                        type: parseFieldType(
                          labelIdentifierFieldMetadata?.type ||
                            FieldMetadataType.Text,
                        ),
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
                avatarType={
                  mapToObjectRecordIdentifier(record).avatarType ?? 'rounded'
                }
                onUploadPicture={
                  objectNameSingular === 'person' ? onUploadPicture : undefined
                }
              />
              <PropertyBox extraPadding={true}>
                {inlineFieldMetadataItems.map((fieldMetadataItem, index) => (
                  <FieldContext.Provider
                    key={record.id + fieldMetadataItem.id}
                    value={{
                      entityId: record.id,
                      maxWidth: 200,
                      recoilScopeId: record.id + fieldMetadataItem.id,
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
                    key={record.id + fieldMetadataItem.id}
                    value={{
                      entityId: record.id,
                      recoilScopeId: record.id + fieldMetadataItem.id,
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
                    <RecordRelationFieldCardSection />
                  </FieldContext.Provider>
                ))}
            </>
          )}
        </ShowPageLeftContainer>
        <ShowPageRightContainer
          targetableObject={{
            id: record?.id ?? '',
            targetObjectNameSingular: objectMetadataItem?.nameSingular,
          }}
          timeline
          tasks
          notes
          emails
        />
      </ShowPageContainer>
    </RecoilScope>
  );
};
