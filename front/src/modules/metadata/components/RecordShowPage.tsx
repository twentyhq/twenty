import { useParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import { useRecoilState } from 'recoil';

import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
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
import { InlineCell } from '@/ui/object/record-inline-cell/components/InlineCell';
import { PropertyBox } from '@/ui/object/record-inline-cell/property-box/components/PropertyBox';
import { InlineCellHotkeyScope } from '@/ui/object/record-inline-cell/types/InlineCellHotkeyScope';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { useFindOneMetadataObject } from '../hooks/useFindOneMetadataObject';
import { useFindOneObject } from '../hooks/useFindOneObject';
import { useUpdateOneObject } from '../hooks/useUpdateOneObject';
import { formatMetadataFieldAsColumnDefinition } from '../utils/formatMetadataFieldAsColumnDefinition';

export const RecordShowPage = () => {
  const { objectNameSingular, objectId } = useParams<{
    objectNameSingular: string;
    objectId: string;
  }>();

  const { icons } = useLazyLoadIcons();

  const { foundMetadataObject } = useFindOneMetadataObject({
    objectNameSingular,
  });

  const [, setEntityFields] = useRecoilState(
    entityFieldsFamilyState(objectId ?? ''),
  );

  const { object } = useFindOneObject({
    objectId: objectId,
    objectNameSingular,
    onCompleted: (data) => {
      setEntityFields(data);
    },
  });

  const useUpdateOneObjectMutation: () => [(params: any) => any, any] = () => {
    const { updateOneObject } = useUpdateOneObject({
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

  const handleFavoriteButtonClick = async () => {
    //
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
          isFavorite={false}
          onClick={handleFavoriteButtonClick}
        />
        <ShowPageAddButton
          key="add"
          entity={{
            id: object.id,
            type: ActivityTargetableEntityType.Company,
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
                {foundMetadataObject?.fields
                  .toSorted((a, b) =>
                    DateTime.fromISO(a.createdAt)
                      .diff(DateTime.fromISO(b.createdAt))
                      .toMillis(),
                  )
                  .map((metadataField, index) => {
                    return (
                      <FieldContext.Provider
                        key={object.id + metadataField.id}
                        value={{
                          entityId: object.id,
                          recoilScopeId: object.id + metadataField.id,
                          fieldDefinition:
                            formatMetadataFieldAsColumnDefinition({
                              field: metadataField,
                              position: index,
                              metadataObject: foundMetadataObject,
                              icons,
                            }),
                          useUpdateEntityMutation: useUpdateOneObjectMutation,
                          hotkeyScope: InlineCellHotkeyScope.InlineCell,
                        }}
                      >
                        <InlineCell />
                      </FieldContext.Provider>
                    );
                  })}
              </PropertyBox>
            </ShowPageLeftContainer>
            <ShowPageRightContainer
              entity={{
                id: object.id,
                type: ActivityTargetableEntityType.Company,
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
