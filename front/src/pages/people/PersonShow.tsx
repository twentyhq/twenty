import { useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { Timeline } from '@/activities/timeline/components/Timeline';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { PersonPropertyBox } from '@/people/components/PersonPropertyBox';
import { usePersonQuery } from '@/people/queries';
import { IconUser } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import { CommentableType } from '~/generated/graphql';

import { PeopleFullNameEditableField } from '../../modules/people/editable-field/components/PeopleFullNameEditableField';
import { ShowPageContainer } from '../../modules/ui/layout/components/ShowPageContainer';

export function PersonShow() {
  const personId = useParams().personId ?? '';
  const { InsertPersonFavorite, DeletePersonFavorite } = useFavorites();

  const { data } = usePersonQuery(personId);
  const person = data?.findUniquePerson;
  const isFavorite =
    person?.Favorite && person?.Favorite?.length > 0 ? true : false;

  const theme = useTheme();

  async function handleFavoriteButtonClick() {
    if (isFavorite) DeletePersonFavorite(personId);
    else InsertPersonFavorite(personId);
  }

  return (
    <WithTopBarContainer
      title={person?.firstName ?? ''}
      icon={<IconUser size={theme.icon.size.md} />}
      hasBackButton
      isFavorite={isFavorite}
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
