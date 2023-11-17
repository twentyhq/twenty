import { useParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import { useRecoilState } from 'recoil';

import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { filterAvailableFieldMetadataItem } from '@/object-record/utils/filterAvailableFieldMetadataItem';
import { IconBuildingSkyscraper } from '@/ui/display/icon';
import { useLazyLoadIcons } from '@/ui/input/hooks/useLazyLoadIcons';
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
import { getLogoUrlFromDomainName } from '~/utils';

import { useFindOneObjectRecord } from '../hooks/useFindOneObjectRecord';
import { useUpdateOneObjectRecord } from '../hooks/useUpdateOneObjectRecord';

export const RecordShowPage = () => {
  const { objectNameSingular, objectMetadataId } = useParams<{
    objectNameSingular: string;
    objectMetadataId: string;
  }>();

  const { icons } = useLazyLoadIcons();

  const { foundObjectMetadataItem } = useFindOneObjectMetadataItem({
    objectNameSingular,
  });

  const { favorites, createFavorite, deleteFavorite } = useFavorites({
    objectNamePlural: foundObjectMetadataItem?.namePlural,
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

  const useUpdateOneObjectMutation: () => [(params: any) => any, any] = () => {
    const { updateOneObject } = useUpdateOneObjectRecord({
      objectNameSingular,
    });

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
        objectNameSingular === 'peopleV2'
          ? {
              labelIdentifier: object.firstName + ' ' + object.lastName,
              avatarUrl: object.avatarUrl,
              avatarType: 'rounded',
              link: `/object/personV2/${object.id}`,
              recordId: object.id,
            }
          : objectNameSingular === 'companyV2'
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

  return (
    <PageContainer>
      <PageTitle title={object.name || 'No Name'} />
      <PageHeader
        title={object.name ?? ''}
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
            type: 'Company',
          }}
        />
      </PageHeader>
      <PageBody>
        <RecoilScope CustomRecoilScopeContext={ShowPageRecoilScopeContext}>
          <ShowPageContainer>
            <ShowPageLeftContainer>
              <ShowPageSummaryCard
                id={object.id}
                logoOrAvatar={''}
                title={object.name ?? 'No name'}
                date={object.createdAt ?? ''}
                renderTitleEditComponent={() => <></>}
                avatarType="squared"
              />
              <PropertyBox extraPadding={true}>
                {foundObjectMetadataItem &&
                  [...foundObjectMetadataItem.fields]
                    .sort((a, b) =>
                      DateTime.fromISO(a.createdAt)
                        .diff(DateTime.fromISO(b.createdAt))
                        .toMillis(),
                    )
                    .filter(filterAvailableFieldMetadataItem)
                    .map((metadataField, index) => {
                      return (
                        <FieldContext.Provider
                          key={object.id + metadataField.id}
                          value={{
                            entityId: object.id,
                            recoilScopeId: object.id + metadataField.id,
                            fieldDefinition:
                              formatFieldMetadataItemAsColumnDefinition({
                                field: metadataField,
                                position: index,
                                objectMetadataItem: foundObjectMetadataItem,
                                icons,
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
            </ShowPageLeftContainer>
            <ShowPageRightContainer
              entity={{
                id: object.id,
                type: 'Company',
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
