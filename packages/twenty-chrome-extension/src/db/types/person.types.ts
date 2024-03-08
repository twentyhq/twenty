import { Person, PersonConnection } from '~/generated/graphql';

export type PersonInput = Pick<
  Person,
  'name' | 'city' | 'avatarUrl' | 'jobTitle' | 'linkedinLink'
>;
export type FindPersonResponse = { people: Pick<PersonConnection, 'edges'> };
export type CreatePersonResponse = { createPerson: { id: string } };
