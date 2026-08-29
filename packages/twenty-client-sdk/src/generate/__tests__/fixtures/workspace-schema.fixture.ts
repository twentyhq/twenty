// Mirrors the shape the workspace schema builder emits for an object with
// composite fields: RAW_JSON sub-fields reach the SDL as the JSON scalar,
// while filter and orderBy inputs expose RawJsonFilter / OrderByDirection.
export const WORKSPACE_SCHEMA_FIXTURE = `
scalar DateTime
scalar JSON
scalar UUID

enum ActorSource {
  API
  EMAIL
  IMPORT
  MANUAL
  SYSTEM
  WEBHOOK
}

enum OrderByDirection {
  AscNullsFirst
  AscNullsLast
  DescNullsFirst
  DescNullsLast
}

enum FilterIs {
  NULL
  NOT_NULL
}

input StringFilter {
  eq: String
  ilike: String
  in: [String!]
  is: FilterIs
}

input RawJsonFilter {
  is: FilterIs
  like: String
}

type Actor {
  source: ActorSource!
  workspaceMemberId: UUID
  name: String!
  context: JSON
}

input ActorCreateInput {
  source: ActorSource!
  workspaceMemberId: UUID
  name: String
  context: JSON
}

input ActorUpdateInput {
  source: ActorSource
  workspaceMemberId: UUID
  name: String
  context: JSON
}

input ActorFilterInput {
  source: StringFilter
  workspaceMemberId: StringFilter
  name: StringFilter
  context: RawJsonFilter
}

input ActorOrderByInput {
  source: OrderByDirection
  workspaceMemberId: OrderByDirection
  name: OrderByDirection
  context: OrderByDirection
}

type Emails {
  primaryEmail: String
  additionalEmails: JSON
}

input EmailsCreateInput {
  primaryEmail: String
  additionalEmails: JSON
}

input EmailsUpdateInput {
  primaryEmail: String
  additionalEmails: JSON
}

input EmailsFilterInput {
  primaryEmail: StringFilter
  additionalEmails: RawJsonFilter
}

input EmailsOrderByInput {
  primaryEmail: OrderByDirection
  additionalEmails: OrderByDirection
}

type Phones {
  primaryPhoneNumber: String
  primaryPhoneCountryCode: String
  primaryPhoneCallingCode: String
  additionalPhones: JSON
}

input PhonesCreateInput {
  primaryPhoneNumber: String
  primaryPhoneCountryCode: String
  primaryPhoneCallingCode: String
  additionalPhones: JSON
}

input PhonesUpdateInput {
  primaryPhoneNumber: String
  primaryPhoneCountryCode: String
  primaryPhoneCallingCode: String
  additionalPhones: JSON
}

type Links {
  primaryLinkLabel: String
  primaryLinkUrl: String
  secondaryLinks: JSON
}

input LinksCreateInput {
  primaryLinkLabel: String
  primaryLinkUrl: String
  secondaryLinks: JSON
}

input LinksUpdateInput {
  primaryLinkLabel: String
  primaryLinkUrl: String
  secondaryLinks: JSON
}

type FullName {
  firstName: String
  lastName: String
}

input FullNameCreateInput {
  firstName: String
  lastName: String
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type Person {
  id: UUID!
  name: FullName
  emails: Emails
  phones: Phones
  linkedinLink: Links
  createdBy: Actor
  jobTitle: String
  customFields: JSON
  createdAt: DateTime!
  company: Company
}

type PersonEdge {
  node: Person!
  cursor: String!
}

type PersonConnection {
  edges: [PersonEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type Company {
  id: UUID!
  name: String
  domainName: Links
  createdBy: Actor
  people: PersonConnection
}

input PersonCreateInput {
  id: UUID
  name: FullNameCreateInput
  emails: EmailsCreateInput
  phones: PhonesCreateInput
  linkedinLink: LinksCreateInput
  createdBy: ActorCreateInput
  jobTitle: String
  customFields: JSON
}

input PersonUpdateInput {
  name: FullNameCreateInput
  emails: EmailsUpdateInput
  phones: PhonesUpdateInput
  linkedinLink: LinksUpdateInput
  createdBy: ActorUpdateInput
  jobTitle: String
  customFields: JSON
}

input PersonFilterInput {
  id: StringFilter
  emails: EmailsFilterInput
  createdBy: ActorFilterInput
  customFields: RawJsonFilter
  and: [PersonFilterInput!]
  or: [PersonFilterInput!]
}

input PersonOrderByInput {
  id: OrderByDirection
  emails: EmailsOrderByInput
  createdBy: ActorOrderByInput
}

type Query {
  person(filter: PersonFilterInput): Person
  people(
    filter: PersonFilterInput
    orderBy: [PersonOrderByInput!]
    first: Int
    after: String
  ): PersonConnection
}

type Mutation {
  createPerson(data: PersonCreateInput!): Person
  updatePerson(id: UUID!, data: PersonUpdateInput!): Person
}

schema {
  query: Query
  mutation: Mutation
}
`;
