import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { parseFieldRelationType } from '@/object-metadata/utils/parseFieldRelationType';
import { parseFieldType } from '@/object-metadata/utils/parseFieldType';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/field/contexts/FieldContext';
import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { RecordRelationFieldCardSection } from '@/object-record/record-relation-card/components/RecordRelationFieldCardSection';
import { isFieldMetadataItemAvailable } from '@/object-record/utils/isFieldMetadataItemAvailable';
import { IconBuildingSkyscraper } from '@/ui/display/icon';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageFavoriteButton } from '@/ui/layout/page/PageFavoriteButton';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { ShowPageContainer } from '@/ui/layout/page/ShowPageContainer';
import { ShowPageAddButton } from '@/ui/layout/show-page/components/ShowPageAddButton';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { ShowPageMoreButton } from '@/ui/layout/show-page/components/ShowPageMoreButton';
import { ShowPageRightContainer } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import { ShowPageRecoilScopeContext } from '@/ui/layout/states/ShowPageRecoilScopeContext';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FieldMetadataType,
  FileFolder,
  useUploadImageMutation,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

import { useFindOneRecord } from '../hooks/useFindOneRecord';
import { useUpdateOneRecord } from '../hooks/useUpdateOneRecord';

export const RecordShowPage = () => {
  const { objectNameSingular, objectRecordId } = useParams<{
    objectNameSingular: string;
    objectRecordId: string;
  }>();

  if (!objectNameSingular) {
    throw new Error(`Object name is not defined`);
  }

  const {
    objectMetadataItem,
    labelIdentifierFieldMetadata,
    mapToObjectRecordIdentifier,
  } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { favorites, createFavorite, deleteFavorite } = useFavorites();

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

  const correspondingFavorite = favorites.find(
    (favorite) => favorite.recordId === objectRecordId,
  );

  const isFavorite = isDefined(correspondingFavorite);

  const handleFavoriteButtonClick = async () => {
    if (!objectNameSingular || !record) return;

    if (isFavorite && record) {
      deleteFavorite(correspondingFavorite.id);
    } else {
      createFavorite(record, objectNameSingular);
    }
  };

  const pageName =
    objectNameSingular === 'person'
      ? record?.name.firstName + ' ' + record?.name.lastName
      : record?.name;

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

  const isRelationFieldCardEnabled = useIsFeatureEnabled(
    'IS_RELATION_FIELD_CARD_ENABLED',
  );

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
      fieldMetadataItem.type !== FieldMetadataType.Relation ||
      (!isRelationFieldCardEnabled &&
        parseFieldRelationType(fieldMetadataItem) === 'TO_ONE_OBJECT'),
  );

  const relationFieldMetadataItems = availableFieldMetadataItems.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.type === FieldMetadataType.Relation,
  );

  return (
    <PageContainer>
      <PageTitle title={pageName} />
      <PageHeader
        title={pageName ?? ''}
        hasBackButton
        Icon={IconBuildingSkyscraper}
      >
        {record && (
          <>
            <PageFavoriteButton
              isFavorite={isFavorite}
              onClick={handleFavoriteButtonClick}
            />
            <ShowPageAddButton
              key="add"
              entity={{
                id: record.id,
                targetObjectNameSingular: objectMetadataItem?.nameSingular,
              }}
            />
            <ShowPageMoreButton
              key="more"
              recordId={record.id}
              objectNameSingular={objectNameSingular}
            />
          </>
        )}
      </PageHeader>
      <PageBody>
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
                            fieldMetadataId:
                              labelIdentifierFieldMetadata?.id ?? '',
                            label: labelIdentifierFieldMetadata?.label || '',
                            metadata: {
                              fieldName:
                                labelIdentifierFieldMetadata?.name || '',
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
                      mapToObjectRecordIdentifier(record).avatarType ??
                      'rounded'
                    }
                    onUploadPicture={
                      objectNameSingular === 'person'
                        ? onUploadPicture
                        : undefined
                    }
                  />
                  <PropertyBox extraPadding={true}>
                    {inlineFieldMetadataItems.map(
                      (fieldMetadataItem, index) => (
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
                          <RecordInlineCell />
                        </FieldContext.Provider>
                      ),
                    )}
                  </PropertyBox>
                  {isRelationFieldCardEnabled &&
                    relationFieldMetadataItems
                      .filter((item) => {
                        const relationObjectMetadataItem =
                          item.toRelationMetadata
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
      </PageBody>
    </PageContainer>
  );
};
