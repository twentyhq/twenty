import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client';
import { Person, mapGqlPerson } from '../../interfaces/person.interface';
import { apiClient } from '../../apollo';

export const UPDATE_PERSON = gql`
  mutation UpdatePeople(
    $id: Int
    $firstname: String
    $lastname: String
    $phone: String
    $city: String
    $company_id: Int
    $email: String
  ) {
    update_people(
      where: { id: { _eq: $id } }
      _set: {
        city: $city
        company_id: $company_id
        email: $email
        firstname: $firstname
        id: $id
        lastname: $lastname
        phone: $phone
      }
    ) {
      returning {
        city
        company {
          company_domain
          company_name
          id
        }
        email
        firstname
        id
        lastname
        phone
      }
    }
  }
`;

export async function updatePerson(
  person: Person,
  client: ApolloClient<NormalizedCacheObject> = apiClient,
) {
  const result = await client.mutate({
    mutation: UPDATE_PERSON,
    variables: mapGqlPerson(person),
  });
  return result;
}
