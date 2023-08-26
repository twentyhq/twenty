import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';

import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { GET_PERSON } from '@/people/graphql/queries/getPerson';
import { usePersonQuery } from '@/people/hooks/usePersonQuery';
import { GenericEditableField } from '@/ui/editable-field/components/GenericEditableField';
import { EditableFieldDefinitionContext } from '@/ui/editable-field/contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '@/ui/editable-field/contexts/EditableFieldEntityIdContext';
import { EditableFieldMutationContext } from '@/ui/editable-field/contexts/EditableFieldMutationContext';
import { PropertyBox } from '@/ui/editable-field/property-box/components/PropertyBox';
import { IconUser } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { ShowPageAddButton } from '@/ui/layout/show-page/components/ShowPageAddButton';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import { ShowPageRecoilScopeContext } from '@/ui/layout/states/ShowPageRecoilScopeContext';
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

  const theme = useTheme();
  const { data } = usePersonQuery(personId);
  const person = data?.findUniquePerson;

  const [uploadPicture] = useUploadPersonPictureMutation();

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
    <>
      <Helmet>
        <title>{person.displayName || 'No Name'}</title>
      </Helmet>
      <WithTopBarContainer
        title={person.firstName ?? ''}
        icon={<IconUser size={theme.icon.size.md} />}
        hasBackButton
        isFavorite={isFavorite}
        onFavoriteButtonClick={handleFavoriteButtonClick}
        extraButtons={[
          <ShowPageAddButton
            key="add"
            entity={{
              id: person.id,
              type: ActivityTargetableEntityType.Person,
            }}
          />,
        ]}
      >
        <RecoilScope SpecificContext={ShowPageRecoilScopeContext}>
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
                          key={fieldDefinition.id}
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
              }}
              timeline
              tasks
              notes
              emails
            />
          </ShowPageContainer>
        </RecoilScope>
      </WithTopBarContainer>
    </>
  );
}
