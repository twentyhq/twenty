import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import { useRecoilState } from 'recoil';

import { Timeline } from '@/activities/timeline/components/Timeline';
import { GET_FAVORITES } from '@/favorites/queries/show';
import { currentFavorites } from '@/favorites/states/currentFavorites';
import { isFavorited } from '@/favorites/states/isFavorited';
import { PersonPropertyBox } from '@/people/components/PersonPropertyBox';
import { GET_PERSON, usePersonQuery } from '@/people/queries';
import { IconUser } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import {
  CommentableType,
  useDeleteFavoriteMutation,
  useInsertPersonFavoriteMutation,
} from '~/generated/graphql';

import { PeopleFullNameEditableField } from '../../modules/people/editable-field/components/PeopleFullNameEditableField';
import { ShowPageContainer } from '../../modules/ui/layout/components/ShowPageContainer';

export function PersonShow() {
  const personId = useParams().personId ?? '';
  const [insertPersonFavorite] = useInsertPersonFavoriteMutation();
  const [isFavorite, setIsFavorite] = useRecoilState(isFavorited);
  const [deleteFavorite] = useDeleteFavoriteMutation();
  const [_, setFavorites] = useRecoilState(currentFavorites);

  const { data } = usePersonQuery(personId);
  const person = data?.findUniquePerson;

  useEffect(() => {
    if (person) {
      const hasFavorite =
        person?.Favorite && person.Favorite.length > 0 ? true : false;
      setIsFavorite(hasFavorite);
    }
  }, [person, setIsFavorite]);

  const theme = useTheme();

  async function handleFavoriteButtonClick() {
    if (isFavorite) {
      await deleteFavorite({
        variables: {
          where: {
            personId: {
              equals: personId,
            },
          },
        },
        onCompleted: (data) => {
          setFavorites((prevFavorites) =>
            prevFavorites.filter((fav) => fav.id !== data.deleteFavorite.id),
          );
          setIsFavorite(false);
        },
        refetchQueries: [
          getOperationName(GET_FAVORITES) ?? '',
          getOperationName(GET_PERSON) ?? '',
        ],
      });
    } else {
      await insertPersonFavorite({
        variables: {
          data: {
            personId,
          },
        },
        onCompleted: async (data) => {
          setFavorites((prevFavorites) => [
            ...prevFavorites,
            { company: null, ...data.createFavoriteForPerson },
          ]);
          setIsFavorite(true);
        },
        refetchQueries: [
          getOperationName(GET_FAVORITES) ?? '',
          getOperationName(GET_PERSON) ?? '',
        ],
      });
    }
  }

  return (
    <WithTopBarContainer
      title={person?.firstName ?? ''}
      icon={<IconUser size={theme.icon.size.md} />}
      hasBackButton
      onFavouriteButtonClick={handleFavoriteButtonClick}
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
