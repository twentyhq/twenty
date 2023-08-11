import { useParams } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';

import { Timeline } from '@/activities/timeline/components/Timeline';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { PersonPropertyBox } from '@/people/components/PersonPropertyBox';
import { GET_PERSON, usePersonQuery } from '@/people/queries';
import { IconUser } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import {
  CommentableType,
  useUploadPersonPictureMutation,
} from '~/generated/graphql';

import { PeopleFullNameEditableField } from '../../modules/people/editable-field/components/PeopleFullNameEditableField';
import { ShowPageContainer } from '../../modules/ui/layout/components/ShowPageContainer';

export function PersonShow() {
  const personId = useParams().personId ?? '';

  const { insertPersonFavorite, deletePersonFavorite } = useFavorites();

  const { data } = usePersonQuery(personId);
  const person = data?.findUniquePerson;
  const isFavorite =
    person?.Favorite && person?.Favorite?.length > 0 ? true : false;

  const theme = useTheme();
  const [uploadPicture] = useUploadPersonPictureMutation();

  async function onUploadPicture(file: File) {
    if (!file || !person?.id) {
      return;
    }
    await uploadPicture({
      variables: {
        file,
        id: person?.id,
      },
      refetchQueries: [getOperationName(GET_PERSON) ?? ''],
    });
  }

  async function handleFavoriteButtonClick() {
    if (isFavorite) deletePersonFavorite(personId);
    else insertPersonFavorite(personId);
  }

  return (
    <WithTopBarContainer
      title={person?.firstName ?? ''}
      icon={<IconUser size={theme.icon.size.md} />}
      hasBackButton
      isFavorite={isFavorite}
      onFavoriteButtonClick={handleFavoriteButtonClick}
    >
      <ShowPageContainer>
        <ShowPageLeftContainer>
          <ShowPageSummaryCard
            id={person?.id}
            title={person?.displayName ?? 'No name'}
            logoOrAvatar={person?.avatarUrl ?? undefined}
            date={person?.createdAt ?? ''}
            renderTitleEditComponent={() =>
              person ? <PeopleFullNameEditableField people={person} /> : <></>
            }
            onUploadPicture={onUploadPicture}
          />
          {person && <PersonPropertyBox person={person} />}
        </ShowPageLeftContainer>
        <ShowPageRightContainer>
          <Timeline
            entity={{ id: person?.id ?? '', type: CommentableType.Person }}
          />
        </ShowPageRightContainer>
      </ShowPageContainer>
    </WithTopBarContainer>
  );
}
