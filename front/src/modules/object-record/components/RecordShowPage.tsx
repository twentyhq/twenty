import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { CompanyTeam } from '@/companies/components/CompanyTeam';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { filterAvailableFieldMetadataItem } from '@/object-record/utils/filterAvailableFieldMetadataItem';
import { IconBuildingSkyscraper } from '@/ui/display/icon';
import { useRelationPicker } from '@/ui/input/components/internal/relation-picker/hooks/useRelationPicker';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageFavoriteButton } from '@/ui/layout/page/PageFavoriteButton';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { ShowPageContainer } from '@/ui/layout/page/ShowPageContainer';
import { ShowPageAddButton } from '@/ui/layout/show-page/components/ShowPageAddButton';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import { ShowPageRecoilScopeContext } from '@/ui/layout/states/ShowPageRecoilScopeContext';
import { FieldContext } from '@/ui/object/field/contexts/FieldContext';
import { entityFieldsFamilyState } from '@/ui/object/field/states/entityFieldsFamilyState';
import { RecordInlineCell } from '@/ui/object/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/ui/object/record-inline-cell/property-box/components/PropertyBox';
import { InlineCellHotkeyScope } from '@/ui/object/record-inline-cell/types/InlineCellHotkeyScope';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { FileFolder, useUploadImageMutation } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { useFindOneObjectRecord } from '../hooks/useFindOneObjectRecord';
import { useUpdateOneObjectRecord } from '../hooks/useUpdateOneObjectRecord';

export const RecordShowPage = () => {
  const { objectNameSingular, objectMetadataId } = useParams<{
    objectNameSingular: string;
    objectMetadataId: string;
  }>();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { identifiersMapper } = useRelationPicker();

  const { favorites, createFavorite, deleteFavorite } = useFavorites({
    objectNamePlural: objectMetadataItem?.namePlural,
  });

  const [, setEntityFields] = useRecoilState(
    entityFieldsFamilyState(objectMetadataId ?? ''),
  );

  const { object } = useFindOneObjectRecord({
    objectRecordId: objectMetadataId,
    objectNameSingular,
    onCompleted: (data) => {
      setEntityFields(data);
    },
  });

  const [uploadImage] = useUploadImageMutation();
  const { updateOneObject } = useUpdateOneObjectRecord({
    objectNameSingular,
  });

  const useUpdateOneObjectMutation: () => [(params: any) => any, any] = () => {
    const updateEntity = ({
      variables,
    }: {
      variables: {
        where: { id: string };
        data: {
          [fieldName: string]: any;
        };
      };
    }) => {
      updateOneObject?.({
        idToUpdate: variables.where.id,
        input: variables.data,
      });
    };

    return [updateEntity, { loading: false }];
  };

  const isFavorite = objectNameSingular
    ? favorites.some((favorite) => favorite.recordId === object?.id)
    : false;

  const handleFavoriteButtonClick = async () => {
    if (!objectNameSingular || !object) return;
    if (isFavorite) deleteFavorite(object?.id);
    else {
      const additionalData =
        objectNameSingular === 'person'
          ? {
              labelIdentifier:
                object.name.firstName + ' ' + object.name.lastName,
              avatarUrl: object.avatarUrl,
              avatarType: 'rounded',
              link: `/object/personV2/${object.id}`,
              recordId: object.id,
            }
          : objectNameSingular === 'company'
          ? {
              labelIdentifier: object.name,
              avatarUrl: getLogoUrlFromDomainName(object.domainName ?? ''),
              avatarType: 'squared',
              link: `/object/companyV2/${object.id}`,
              recordId: object.id,
            }
          : {};
      createFavorite(object.id, additionalData);
    }
  };

  if (!object) return <></>;

  const pageName =
    objectNameSingular === 'person'
      ? object.name.firstName + ' ' + object.name.lastName
      : object.name;

  const recordIdentifiers = identifiersMapper?.(
    object,
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
    if (!updateOneObject) {
      return;
    }

    await updateOneObject({
      idToUpdate: object?.id,
      input: {
        avatarUrl,
      },
    });
  };

  return (
    <PageContainer>
      <PageTitle title={pageName} />
      <PageHeader
        title={pageName ?? ''}
        hasBackButton
        Icon={IconBuildingSkyscraper}
      >
        <PageFavoriteButton
          isFavorite={isFavorite}
          onClick={handleFavoriteButtonClick}
        />
        <ShowPageAddButton
          key="add"
          entity={{
            id: object.id,
            type:
              objectMetadataItem?.nameSingular === 'company'
                ? 'Company'
                : objectMetadataItem?.nameSingular === 'person'
                ? 'Person'
                : 'Custom',
          }}
        />
      </PageHeader>
      <PageBody>
        <RecoilScope CustomRecoilScopeContext={ShowPageRecoilScopeContext}>
          <ShowPageContainer>
            <ShowPageLeftContainer>
              <ShowPageSummaryCard
                id={object.id}
                logoOrAvatar={recordIdentifiers?.avatarUrl}
                title={recordIdentifiers?.name ?? 'No name'}
                date={object.createdAt ?? ''}
                renderTitleEditComponent={() => <></>}
                avatarType={recordIdentifiers?.avatarType ?? 'rounded'}
                onUploadPicture={
                  objectNameSingular === 'person' ? onUploadPicture : undefined
                }
              />
              <PropertyBox extraPadding={true}>
                {objectMetadataItem &&
                  [...objectMetadataItem.fields]
                    .sort((a, b) =>
                      a.name === 'name' ? -1 : a.name.localeCompare(b.name),
                    )
                    .filter(filterAvailableFieldMetadataItem)
                    .map((metadataField, index) => {
                      return (
                        <FieldContext.Provider
                          key={object.id + metadataField.id}
                          value={{
                            entityId: object.id,
                            recoilScopeId: object.id + metadataField.id,
                            isLabelIdentifier: false,
                            fieldDefinition:
                              formatFieldMetadataItemAsColumnDefinition({
                                field: metadataField,
                                position: index,
                                objectMetadataItem,
                              }),
                            useUpdateEntityMutation: useUpdateOneObjectMutation,
                            hotkeyScope: InlineCellHotkeyScope.InlineCell,
                          }}
                        >
                          <RecordInlineCell />
                        </FieldContext.Provider>
                      );
                    })}
              </PropertyBox>
              {objectNameSingular === 'company' ? (
                <>
                  <CompanyTeam company={object} />
                </>
              ) : (
                <></>
              )}
            </ShowPageLeftContainer>
            <ShowPageRightContainer
              entity={{
                id: object.id,
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
