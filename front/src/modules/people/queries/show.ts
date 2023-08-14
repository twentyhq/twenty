import { gql } from '@apollo/client';
import { useSetRecoilState } from 'recoil';

import { genericEntitiesFamilyState } from '@/ui/editable-field/states/genericEntitiesFamilyState';
import { useGetPersonQuery } from '~/generated/graphql';

export const GET_PERSON = gql`
  query GetPerson($id: String!) {
    findUniquePerson(id: $id) {
      id
      firstName
      lastName
      displayName
      email
      createdAt
      city
      jobTitle
      linkedinUrl
      xUrl
      avatarUrl
      phone
      _activityCount
      company {
        id
        name
        domainName
      }
      Favorite {
        id
        person {
          id
        }
        company {
          id
        }
      }
    }
  }
`;

export function usePersonQuery(id: string) {
  const updatePersonShowPage = useSetRecoilState(
    genericEntitiesFamilyState(id),
  );
  return useGetPersonQuery({
    variables: { id },
    onCompleted: (data) => {
      updatePersonShowPage(data?.findUniquePerson);
    },
  });
}
