import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { CompanyTeam } from '@/companies/components/CompanyTeam';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
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
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
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

  const { objectMetadataItem, labelIdentifierFieldMetadata } =
    useObjectMetadataItem({
      objectNameSingular,
    });

  const { identifiersMapper } = useRelationPicker();

  const { favorites, createFavorite, deleteFavorite } = useFavorites();

  const [, setEntityFields] = useRecoilState(
    entityFieldsFamilyState(objectRecordId ?? ''),
  );

  const { record, loading } = useFindOneRecord({
    objectRecordId,
    objectNameSingular,
    onCompleted: (data) => {
      setEntityFields(data);
    },
  });

  const [uploadImage] = useUploadImageMutation();
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular,
  });

  const objectMetadataType =
    objectMetadataItem?.nameSingular === 'company'
      ? 'Company'
      : objectMetadataItem?.nameSingular === 'person'
        ? 'Person'
        : 'Custom';

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

  const recordIdentifiers = identifiersMapper?.(
    record,
    objectMetadataItem?.nameSingular ?? '',
  );

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

  const fieldMetadataItemsToShow = [...objectMetadataItem.fields]
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
    )
    .filter(isFieldMetadataItemAvailable)
    .filter(
      (fieldMetadataItem) =>
        fieldMetadataItem.id !== labelIdentifierFieldMetadata?.id,
    );

  return (
    <PageContainer>
      <PageTitle title={pageName} />
      <PageHeader
        title={pageName ?? ''}
        hasBackButton
        Icon={IconBuildingSkyscraper}
      >
        {record && objectMetadataType !== 'Custom' && (
          <>
            <PageFavoriteButton
              isFavorite={isFavorite}
              onClick={handleFavoriteButtonClick}
            />
            <ShowPageAddButton
              key="add"
              entity={{
                id: record.id,
                type: objectMetadataType,
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
              {!loading && record ? (
                <>
                  <ShowPageSummaryCard
                    id={record.id}
                    logoOrAvatar={recordIdentifiers?.avatarUrl}
                    avatarPlaceholder={recordIdentifiers?.name ?? ''}
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
                    avatarType={recordIdentifiers?.avatarType ?? 'rounded'}
                    onUploadPicture={
                      objectNameSingular === 'person'
                        ? onUploadPicture
                        : undefined
                    }
                  />
                  <PropertyBox extraPadding={true}>
                    {fieldMetadataItemsToShow.map(
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
                  {objectNameSingular === 'company' ? (
                    <>
                      <CompanyTeam company={record} />
                    </>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <></>
              )}
            </ShowPageLeftContainer>
            <ShowPageRightContainer
              entity={{
                id: record?.id || '',
                // TODO: refacto
                type:
                  objectMetadataItem?.nameSingular === 'company'
                    ? 'Company'
                    : objectMetadataItem?.nameSingular === 'person'
                      ? 'Person'
                      : 'Custom',
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
