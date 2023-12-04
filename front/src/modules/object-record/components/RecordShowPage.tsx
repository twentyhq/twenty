import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { CompanyTeam } from '@/companies/components/CompanyTeam';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { FieldContext } from '@/object-record/field/contexts/FieldContext';
import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { filterAvailableFieldMetadataItem } from '@/object-record/utils/filterAvailableFieldMetadataItem';
import { IconBuildingSkyscraper } from '@/ui/display/icon';
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
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { FileFolder, useUploadImageMutation } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

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

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { identifiersMapper } = useRelationPicker();

  const { favorites, createFavorite, deleteFavorite } = useFavorites({
    objectNamePlural: objectMetadataItem.namePlural,
  });

  const [, setEntityFields] = useRecoilState(
    entityFieldsFamilyState(objectRecordId ?? ''),
  );

  const { record } = useFindOneRecord({
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

  const useUpdateOneObjectRecordMutation: () => [
    (params: any) => any,
    any,
  ] = () => {
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
      updateOneRecord?.({
        idToUpdate: variables.where.id,
        input: variables.data,
      });
    };

    return [updateEntity, { loading: false }];
  };

  const isFavorite = objectNameSingular
    ? favorites.some((favorite) => favorite.recordId === record?.id)
    : false;

  const handleFavoriteButtonClick = async () => {
    if (!objectNameSingular || !record) return;
    if (isFavorite) deleteFavorite(record?.id);
    else {
      const additionalData =
        objectNameSingular === 'person'
          ? {
              labelIdentifier:
                record.name.firstName + ' ' + record.name.lastName,
              avatarUrl: record.avatarUrl,
              avatarType: 'rounded',
              link: `/object/personV2/${record.id}`,
              recordId: record.id,
            }
          : objectNameSingular === 'company'
            ? {
                labelIdentifier: record.name,
                avatarUrl: getLogoUrlFromDomainName(record.domainName ?? ''),
                avatarType: 'squared',
                link: `/object/companyV2/${record.id}`,
                recordId: record.id,
              }
            : {};
      createFavorite(record.id, additionalData);
    }
  };

  if (!record) return <></>;

  const pageName =
    objectNameSingular === 'person'
      ? record.name.firstName + ' ' + record.name.lastName
      : record.name;

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

    await updateOneRecord({
      idToUpdate: record?.id,
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
        {objectMetadataType !== 'Custom' && (
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
          </>
        )}
      </PageHeader>
      <PageBody>
        <RecoilScope CustomRecoilScopeContext={ShowPageRecoilScopeContext}>
          <ShowPageContainer>
            <ShowPageLeftContainer>
              <ShowPageSummaryCard
                id={record.id}
                logoOrAvatar={recordIdentifiers?.avatarUrl}
                title={recordIdentifiers?.name ?? 'No name'}
                date={record.createdAt ?? ''}
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
                          key={record.id + metadataField.id}
                          value={{
                            entityId: record.id,
                            recoilScopeId: record.id + metadataField.id,
                            isLabelIdentifier: false,
                            fieldDefinition:
                              formatFieldMetadataItemAsColumnDefinition({
                                field: metadataField,
                                position: index,
                                objectMetadataItem,
                              }),
                            useUpdateEntityMutation:
                              useUpdateOneObjectRecordMutation,
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
                  <CompanyTeam company={record} />
                </>
              ) : (
                <></>
              )}
            </ShowPageLeftContainer>
            <ShowPageRightContainer
              entity={{
                id: record.id,
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
