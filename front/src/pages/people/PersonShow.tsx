import { useParams } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';

import { Timeline } from '@/activities/timeline/components/Timeline';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { PeopleCompanyEditableField } from '@/people/editable-field/components/PeopleCompanyEditableField';
import { GET_PERSON, usePersonQuery } from '@/people/queries';
import { GenericEditableField } from '@/ui/editable-field/components/GenericEditableField';
import { PropertyBox } from '@/ui/editable-field/property-box/components/PropertyBox';
import { EditableFieldDefinitionContext } from '@/ui/editable-field/states/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '@/ui/editable-field/states/EditableFieldEntityIdContext';
import { EditableFieldMutationContext } from '@/ui/editable-field/states/EditableFieldMutationContext';
import { DateEditableField } from '@/ui/editable-field/variants/components/DateEditableField';
import { PhoneEditableField } from '@/ui/editable-field/variants/components/PhoneEditableField';
import { TextEditableField } from '@/ui/editable-field/variants/components/TextEditableField';
import {
  IconCalendar,
  IconMail,
  IconMap,
  IconPhone,
  IconUser,
} from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import {
  CommentableType,
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
    <WithTopBarContainer
      title={person.firstName ?? ''}
      icon={<IconUser size={theme.icon.size.md} />}
      hasBackButton
      isFavorite={isFavorite}
      onFavoriteButtonClick={handleFavoriteButtonClick}
    >
      <ShowPageContainer>
        <ShowPageLeftContainer>
          <ShowPageSummaryCard
            id={person.id}
            title={person.displayName ?? 'No name'}
            logoOrAvatar={person.avatarUrl ?? undefined}
            date={person.createdAt ?? ''}
            renderTitleEditComponent={() =>
              person ? <PeopleFullNameEditableField people={person} /> : <></>
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
            <TextEditableField
              value={person.email}
              icon={<IconMail />}
              placeholder={'Email'}
              onSubmit={(newEmail) => {
                // updatePerson({
                //   variables: {
                //     where: {
                //       id: person.id,
                //     },
                //     data: {
                //       email: newEmail,
                //     },
                //   },
                // });
              }}
            />
            <PhoneEditableField
              value={person.phone}
              icon={<IconPhone />}
              placeholder={'Phone'}
              onSubmit={(newPhone) => {
                // updatePerson({
                //   variables: {
                //     where: {
                //       id: person.id,
                //     },
                //     data: {
                //       phone: newPhone,
                //     },
                //   },
                // });
              }}
            />
            <DateEditableField
              value={person.createdAt}
              icon={<IconCalendar />}
              onSubmit={(newDate) => {
                // updatePerson({
                //   variables: {
                //     where: {
                //       id: person.id,
                //     },
                //     data: {
                //       createdAt: newDate,
                //     },
                //   },
                // });
              }}
            />
            <PeopleCompanyEditableField people={person} />
            <TextEditableField
              value={person.city}
              icon={<IconMap />}
              placeholder={'City'}
              onSubmit={(newCity) => {
                // updatePerson({
                //   variables: {
                //     where: {
                //       id: person.id,
                //     },
                //     data: {
                //       city: newCity,
                //     },
                //   },
                // });
              }}
            />
          </PropertyBox>
        </ShowPageLeftContainer>
        <ShowPageRightContainer>
          <Timeline
            entity={{ id: person.id ?? '', type: CommentableType.Person }}
          />
        </ShowPageRightContainer>
      </ShowPageContainer>
    </WithTopBarContainer>
  );
}
