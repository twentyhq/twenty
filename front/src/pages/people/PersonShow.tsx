import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';

import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { GET_PERSON } from '@/people/graphql/queries/getPerson';
import { usePersonQuery } from '@/people/hooks/usePersonQuery';
import { AppPath } from '@/types/AppPath';
import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { GenericEditableField } from '@/ui/editable-field/components/GenericEditableField';
import { EditableFieldDefinitionContext } from '@/ui/editable-field/contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '@/ui/editable-field/contexts/EditableFieldEntityIdContext';
import { EditableFieldMutationContext } from '@/ui/editable-field/contexts/EditableFieldMutationContext';
import { PropertyBox } from '@/ui/editable-field/property-box/components/PropertyBox';
import { IconUser } from '@/ui/icon';
import { PageBody } from '@/ui/layout/components/PageBody';
import { PageContainer } from '@/ui/layout/components/PageContainer';
import { PageFavoriteButton } from '@/ui/layout/components/PageFavoriteButton';
import { PageHeader } from '@/ui/layout/components/PageHeader';
import { ShowPageAddButton } from '@/ui/layout/show-page/components/ShowPageAddButton';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import { ShowPageRecoilScopeContext } from '@/ui/layout/states/ShowPageRecoilScopeContext';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import {
  useUpdateOnePersonMutation,
  useUploadPersonPictureMutation,
} from '~/generated/graphql';

import { PeopleFullNameEditableField } from '../../modules/people/editable-field/components/PeopleFullNameEditableField';
import { ShowPageContainer } from '../../modules/ui/layout/components/ShowPageContainer';

import { personShowFieldDefinition } from './constants/personShowFieldDefinition';

export function PersonShow() {
  const personId = useParams().personId ?? '';
  const { insertPersonFavorite, deletePersonFavorite } = useFavorites();
  const navigate = useNavigate();

  const { data, loading } = usePersonQuery(personId);
  const person = data?.findUniquePerson;

  const [uploadPicture] = useUploadPersonPictureMutation();

  useEffect(() => {
    if (!loading && !person) {
      navigate(AppPath.NotFound);
    }
  }, [loading, person, navigate]);

  if (!person) return <></>;

  const isFavorite =
    person.Favorite && person.Favorite?.length > 0 ? true : false;

  async function onUploadPicture(file: File) {
    if (!file || !person?.id) {
      return;
    }
    await uploadPicture({
      variables: {
        file,
        id: person.id,
      },
      refetchQueries: [getOperationName(GET_PERSON) ?? ''],
    });
  }

  async function handleFavoriteButtonClick() {
    if (isFavorite) deletePersonFavorite(personId);
    else insertPersonFavorite(personId);
  }

  return (
    <PageContainer>
      <PageTitle title={person.displayName || 'No Name'} />
      <PageHeader title={person.firstName ?? ''} Icon={IconUser} hasBackButton>
        <RecoilScope CustomRecoilScopeContext={DropdownRecoilScopeContext}>
          <PageFavoriteButton
            isFavorite={isFavorite}
            onClick={handleFavoriteButtonClick}
          />
          <ShowPageAddButton
            key="add"
            entity={{
              id: person.id,
              type: ActivityTargetableEntityType.Person,
              relatedEntities: person.company?.id
                ? [
                    {
                      id: person.company?.id,
                      type: ActivityTargetableEntityType.Company,
                    },
                  ]
                : undefined,
            }}
          />
        </RecoilScope>
      </PageHeader>
      <PageBody>
        <RecoilScope CustomRecoilScopeContext={ShowPageRecoilScopeContext}>
          <ShowPageContainer>
            <ShowPageLeftContainer>
              <ShowPageSummaryCard
                id={person.id}
                title={person.displayName ?? 'No name'}
                logoOrAvatar={person.avatarUrl ?? undefined}
                date={person.createdAt ?? ''}
                renderTitleEditComponent={() =>
                  person ? (
                    <PeopleFullNameEditableField people={person} />
                  ) : (
                    <></>
                  )
                }
                onUploadPicture={onUploadPicture}
              />
              <PropertyBox extraPadding={true}>
                <EditableFieldMutationContext.Provider
                  value={useUpdateOnePersonMutation}
                >
                  <EditableFieldEntityIdContext.Provider value={person.id}>
                    {personShowFieldDefinition.map((fieldDefinition) => {
                      return (
                        <EditableFieldDefinitionContext.Provider
                          value={fieldDefinition}
                          key={fieldDefinition.key}
                        >
                          <GenericEditableField />
                        </EditableFieldDefinitionContext.Provider>
                      );
                    })}
                  </EditableFieldEntityIdContext.Provider>
                </EditableFieldMutationContext.Provider>
              </PropertyBox>
            </ShowPageLeftContainer>
            <ShowPageRightContainer
              entity={{
                id: person.id ?? '',
                type: ActivityTargetableEntityType.Person,
                relatedEntities: person.company?.id
                  ? [
                      {
                        id: person.company?.id,
                        type: ActivityTargetableEntityType.Company,
                      },
                    ]
                  : undefined,
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
}
