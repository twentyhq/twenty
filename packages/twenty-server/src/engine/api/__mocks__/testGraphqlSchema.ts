import { makeExecutableSchema } from '@graphql-tools/schema';

export const testGraphqlSchema = makeExecutableSchema({
  typeDefs: [
    `
schema {
  query: Query
  mutation: Mutation
}`,
    `type RefreshToken {
  id: ID!
  expiresAt: DateTime!
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""A custom scalar that represents a datetime in ISO format"""
scalar DateTime

type FullName {
  firstName: String!
  lastName: String!
  id: ID
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime
}

"""A workspace member"""
type WorkspaceMember {
  id: ID!

  """Workspace member name"""
  name: FullName!

  """Preferred color scheme"""
  colorScheme: String!

  """Workspace member avatar"""
  avatarUrl: String!

  """Preferred language"""
  locale: String!
  createdAt: DateTime!
  updatedAt: DateTime!

  """Related user email address"""
  userEmail: String!

  """Associated User Id"""
  userId: ID!
  deletedAt: DateTime

  """Activities created by the workspace member"""
  authoredActivities(first: Float, last: Float, before: String, after: String, filter: ActivityFilterInput, orderBy: ActivityOrderByInput): ActivityConnection

  """Activities assigned to the workspace member"""
  assignedActivities(first: Float, last: Float, before: String, after: String, filter: ActivityFilterInput, orderBy: ActivityOrderByInput): ActivityConnection

  """Favorites linked to the workspace member"""
  favorites(first: Float, last: Float, before: String, after: String, filter: FavoriteFilterInput, orderBy: FavoriteOrderByInput): FavoriteConnection

  """Account owner for companies"""
  accountOwnerForCompanies(first: Float, last: Float, before: String, after: String, filter: CompanyFilterInput, orderBy: CompanyOrderByInput): CompanyConnection

  """Attachments created by the workspace member"""
  authoredAttachments(first: Float, last: Float, before: String, after: String, filter: AttachmentFilterInput, orderBy: AttachmentOrderByInput): AttachmentConnection

  """Authored comments"""
  authoredComments(first: Float, last: Float, before: String, after: String, filter: CommentFilterInput, orderBy: CommentOrderByInput): CommentConnection

  """Connected accounts"""
  connectedAccounts(first: Float, last: Float, before: String, after: String, filter: ConnectedAccountFilterInput, orderBy: ConnectedAccountOrderByInput): ConnectedAccountConnection

  """Message Participants"""
  messageParticipants(first: Float, last: Float, before: String, after: String, filter: MessageParticipantFilterInput, orderBy: MessageParticipantOrderByInput): MessageParticipantConnection
}

type User {
  id: ID!
  firstName: String!
  lastName: String!
  email: String!
  emailVerified: Boolean!
  disabled: Boolean
  passwordHash: String
  canImpersonate: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  deletedAt: DateTime
  defaultWorkspace: Workspace!
  passwordResetToken: String
  passwordResetTokenExpiresAt: DateTime
  workspaceMember: WorkspaceMember!
  supportUserHash: String
}

type FeatureFlag {
  id: ID!
  key: String!
  workspaceId: String!
  value: Boolean!
}

type Workspace {
  id: ID!
  domainName: String
  displayName: String
  logo: String
  inviteHash: String
  deletedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
  allowImpersonation: Boolean!
  subscriptionStatus: String!
  featureFlags(
    """Specify to filter the records returned."""
    filter: FeatureFlagFilter! = {}

    """Specify to sort results."""
    sorting: [FeatureFlagSort!]! = []
  ): [FeatureFlag!]
}

input FeatureFlagFilter {
  and: [FeatureFlagFilter!]
  or: [FeatureFlagFilter!]
  id: IDFilterComparison
}

input IDFilterComparison {
  is: Boolean
  isNot: Boolean
  eq: ID
  neq: ID
  gt: ID
  gte: ID
  lt: ID
  lte: ID
  like: ID
  notLike: ID
  iLike: ID
  notILike: ID
  in: [ID!]
  notIn: [ID!]
}

input FeatureFlagSort {
  field: FeatureFlagSortFields!
  direction: SortDirection!
  nulls: SortNulls
}

enum FeatureFlagSortFields {
  id
}

"""Sort Directions"""
enum SortDirection {
  ASC
  DESC
}

"""Sort Nulls Options"""
enum SortNulls {
  NULLS_FIRST
  NULLS_LAST
}

type relation {
  id: ID!
  relationType: RelationMetadataType!
  fromObjectMetadataId: String!
  toObjectMetadataId: String!
  fromFieldMetadataId: String!
  toFieldMetadataId: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""Type of the relation"""
enum RelationMetadataType {
  ONE_TO_ONE
  ONE_TO_MANY
  MANY_TO_MANY
}

type field {
  id: ID!
  type: FieldMetadataType!
  name: String!
  label: String!
  description: String
  icon: String
  isCustom: Boolean
  isActive: Boolean
  isSystem: Boolean
  isNullable: Boolean
  defaultValue: JSON
  options: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""Type of the field"""
enum FieldMetadataType {
  UUID
  TEXT
  PHONE
  EMAIL
  DATE_TIME
  BOOLEAN
  NUMBER
  NUMERIC
  PROBABILITY
  LINK
  CURRENCY
  FULL_NAME
  RATING
  SELECT
  MULTI_SELECT
  RELATION
}

"""
The \`JSON\` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
"""
scalar JSON

type object {
  id: ID!
  dataSourceId: String!
  nameSingular: String!
  namePlural: String!
  labelSingular: String!
  labelPlural: String!
  description: String
  icon: String
  isCustom: Boolean!
  isActive: Boolean!
  isSystem: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  labelIdentifierFieldMetadataId: String
  imageIdentifierFieldMetadataId: String
  fields(
    """Limit or page results."""
    paging: CursorPaging! = {first: 10}

    """Specify to filter the records returned."""
    filter: fieldFilter! = {}
  ): ObjectFieldsConnection!
}

input CursorPaging {
  """Paginate before opaque cursor"""
  before: ConnectionCursor

  """Paginate after opaque cursor"""
  after: ConnectionCursor

  """Paginate first"""
  first: Int

  """Paginate last"""
  last: Int
}

"""Cursor for paging through collections"""
scalar ConnectionCursor

input fieldFilter {
  and: [fieldFilter!]
  or: [fieldFilter!]
  id: IDFilterComparison
  isCustom: BooleanFieldComparison
  isActive: BooleanFieldComparison
  isSystem: BooleanFieldComparison
}

input BooleanFieldComparison {
  is: Boolean
  isNot: Boolean
}

type objectEdge {
  """The node containing the object"""
  node: object!

  """Cursor for this node."""
  cursor: ConnectionCursor!
}

type PageInfo {
  """true if paging forward and there are more records."""
  hasNextPage: Boolean!

  """true if paging backwards and there are more records."""
  hasPreviousPage: Boolean!

  """The cursor of the first returned record."""
  startCursor: ConnectionCursor

  """The cursor of the last returned record."""
  endCursor: ConnectionCursor
}

type ObjectConnection {
  """Paging information"""
  pageInfo: PageInfo!

  """Array of edges."""
  edges: [objectEdge!]!

  """Fetch total count of records"""
  totalCount: Int!
}

type fieldEdge {
  """The node containing the field"""
  node: field!

  """Cursor for this node."""
  cursor: ConnectionCursor!
}

type ObjectFieldsConnection {
  """Paging information"""
  pageInfo: PageInfo!

  """Array of edges."""
  edges: [fieldEdge!]!

  """Fetch total count of records"""
  totalCount: Int!
}

type WorkspaceEdge {
  """The node containing the Workspace"""
  node: Workspace!

  """Cursor for this node."""
  cursor: ConnectionCursor!
}

type UserEdge {
  """The node containing the User"""
  node: User!

  """Cursor for this node."""
  cursor: ConnectionCursor!
}

type RefreshTokenEdge {
  """The node containing the RefreshToken"""
  node: RefreshToken!

  """Cursor for this node."""
  cursor: ConnectionCursor!
}

type ValidatePasswordResetToken {
  id: String!
  email: String!
}

type AuthToken {
  token: String!
  expiresAt: DateTime!
}

type ApiKeyToken {
  token: String!
}

type AuthTokenPair {
  accessToken: AuthToken!
  refreshToken: AuthToken!
}

type AuthTokens {
  tokens: AuthTokenPair!
}

type TransientToken {
  transientToken: AuthToken!
}

type EmailPasswordResetLink {
  """Boolean that confirms query was dispatched"""
  success: Boolean!
}

type InvalidatePassword {
  """Boolean that confirms query was dispatched"""
  success: Boolean!
}

type Verify {
  tokens: AuthTokenPair!
  user: User!
}

type LoginToken {
  loginToken: AuthToken!
}

type UserExists {
  exists: Boolean!
}

type WorkspaceInviteHashValid {
  isValid: Boolean!
}

type TimelineThreadParticipant {
  personId: ID
  workspaceMemberId: ID
  firstName: String!
  lastName: String!
  displayName: String!
  avatarUrl: String!
  handle: String!
}

type TimelineThread {
  id: ID!
  read: Boolean!
  firstParticipant: TimelineThreadParticipant!
  lastTwoParticipants: [TimelineThreadParticipant!]!
  lastMessageReceivedAt: DateTime!
  lastMessageBody: String!
  subject: String!
  numberOfMessagesInThread: Float!
  participantCount: Float!
}

type TimelineThreadsWithTotal {
  totalNumberOfThreads: Int!
  timelineThreads: [TimelineThread!]!
}

type Analytics {
  """Boolean that confirms query was dispatched"""
  success: Boolean!
}

type AuthProviders {
  google: Boolean!
  magicLink: Boolean!
  password: Boolean!
}

type Telemetry {
  enabled: Boolean!
  anonymizationEnabled: Boolean!
}

type Billing {
  isBillingEnabled: Boolean!
  billingUrl: String!
}

type Support {
  supportDriver: String!
  supportFrontChatId: String
}

type Sentry {
  dsn: String
}

type ClientConfig {
  authProviders: AuthProviders!
  telemetry: Telemetry!
  billing: Billing!
  signInPrefilled: Boolean!
  signUpDisabled: Boolean!
  debugMode: Boolean!
  support: Support!
  sentry: Sentry!
}

type relationEdge {
  """The node containing the relation"""
  node: relation!

  """Cursor for this node."""
  cursor: ConnectionCursor!
}

type Query {
  currentUser: User!
  object(
    """The id of the record to find."""
    id: ID!
  ): object!
  objects(
    """Limit or page results."""
    paging: CursorPaging! = {first: 10}

    """Specify to filter the records returned."""
    filter: objectFilter! = {}
  ): ObjectConnection!
  getTimelineThreadsFromPersonId(personId: ID!, page: Int!, pageSize: Int!): TimelineThreadsWithTotal!
  getTimelineThreadsFromCompanyId(companyId: ID!, page: Int!, pageSize: Int!): TimelineThreadsWithTotal!
  checkUserExists(email: String!): UserExists!
  checkWorkspaceInviteHashIsValid(inviteHash: String!): WorkspaceInviteHashValid!
  findWorkspaceFromInviteHash(inviteHash: String!): Workspace!
  validatePasswordResetToken(passwordResetToken: String!): ValidatePasswordResetToken!
  clientConfig: ClientConfig!
  currentWorkspace: Workspace!
  activityTargets(first: Float, last: Float, before: String, after: String, filter: ActivityTargetFilterInput, orderBy: ActivityTargetOrderByInput): ActivityTargetConnection!
  activityTarget(filter: ActivityTargetFilterInput!): ActivityTarget!
  activities(first: Float, last: Float, before: String, after: String, filter: ActivityFilterInput, orderBy: ActivityOrderByInput): ActivityConnection!
  activity(filter: ActivityFilterInput!): Activity!
  apiKeys(first: Float, last: Float, before: String, after: String, filter: ApiKeyFilterInput, orderBy: ApiKeyOrderByInput): ApiKeyConnection!
  apiKey(filter: ApiKeyFilterInput!): ApiKey!
  attachments(first: Float, last: Float, before: String, after: String, filter: AttachmentFilterInput, orderBy: AttachmentOrderByInput): AttachmentConnection!
  attachment(filter: AttachmentFilterInput!): Attachment!
  comments(first: Float, last: Float, before: String, after: String, filter: CommentFilterInput, orderBy: CommentOrderByInput): CommentConnection!
  comment(filter: CommentFilterInput!): Comment!
  companies(first: Float, last: Float, before: String, after: String, filter: CompanyFilterInput, orderBy: CompanyOrderByInput): CompanyConnection!
  company(filter: CompanyFilterInput!): Company!
  connectedAccounts(first: Float, last: Float, before: String, after: String, filter: ConnectedAccountFilterInput, orderBy: ConnectedAccountOrderByInput): ConnectedAccountConnection!
  connectedAccount(filter: ConnectedAccountFilterInput!): ConnectedAccount!
  people(first: Float, last: Float, before: String, after: String, filter: PersonFilterInput, orderBy: PersonOrderByInput): PersonConnection!
  person(filter: PersonFilterInput!): Person!
  favorites(first: Float, last: Float, before: String, after: String, filter: FavoriteFilterInput, orderBy: FavoriteOrderByInput): FavoriteConnection!
  favorite(filter: FavoriteFilterInput!): Favorite!
  opportunities(first: Float, last: Float, before: String, after: String, filter: OpportunityFilterInput, orderBy: OpportunityOrderByInput): OpportunityConnection!
  opportunity(filter: OpportunityFilterInput!): Opportunity!
  pipelineSteps(first: Float, last: Float, before: String, after: String, filter: PipelineStepFilterInput, orderBy: PipelineStepOrderByInput): PipelineStepConnection!
  pipelineStep(filter: PipelineStepFilterInput!): PipelineStep!
  viewFields(first: Float, last: Float, before: String, after: String, filter: ViewFieldFilterInput, orderBy: ViewFieldOrderByInput): ViewFieldConnection!
  viewField(filter: ViewFieldFilterInput!): ViewField!
  viewFilters(first: Float, last: Float, before: String, after: String, filter: ViewFilterFilterInput, orderBy: ViewFilterOrderByInput): ViewFilterConnection!
  viewFilter(filter: ViewFilterFilterInput!): ViewFilter!
  viewSorts(first: Float, last: Float, before: String, after: String, filter: ViewSortFilterInput, orderBy: ViewSortOrderByInput): ViewSortConnection!
  viewSort(filter: ViewSortFilterInput!): ViewSort!
  views(first: Float, last: Float, before: String, after: String, filter: ViewFilterInput, orderBy: ViewOrderByInput): ViewConnection!
  view(filter: ViewFilterInput!): View!
  webhooks(first: Float, last: Float, before: String, after: String, filter: WebhookFilterInput, orderBy: WebhookOrderByInput): WebhookConnection!
  webhook(filter: WebhookFilterInput!): Webhook!
  workspaceMembers(first: Float, last: Float, before: String, after: String, filter: WorkspaceMemberFilterInput, orderBy: WorkspaceMemberOrderByInput): WorkspaceMemberConnection!
  workspaceMember(filter: WorkspaceMemberFilterInput!): WorkspaceMember!
  messageThreads(first: Float, last: Float, before: String, after: String, filter: MessageThreadFilterInput, orderBy: MessageThreadOrderByInput): MessageThreadConnection!
  messageThread(filter: MessageThreadFilterInput!): MessageThread!
  messages(first: Float, last: Float, before: String, after: String, filter: MessageFilterInput, orderBy: MessageOrderByInput): MessageConnection!
  message(filter: MessageFilterInput!): Message!
  messageChannels(first: Float, last: Float, before: String, after: String, filter: MessageChannelFilterInput, orderBy: MessageChannelOrderByInput): MessageChannelConnection!
  messageChannel(filter: MessageChannelFilterInput!): MessageChannel!
  messageParticipants(first: Float, last: Float, before: String, after: String, filter: MessageParticipantFilterInput, orderBy: MessageParticipantOrderByInput): MessageParticipantConnection!
  messageParticipant(filter: MessageParticipantFilterInput!): MessageParticipant!
  messageChannelMessageAssociations(first: Float, last: Float, before: String, after: String, filter: MessageChannelMessageAssociationFilterInput, orderBy: MessageChannelMessageAssociationOrderByInput): MessageChannelMessageAssociationConnection!
  messageChannelMessageAssociation(filter: MessageChannelMessageAssociationFilterInput!): MessageChannelMessageAssociation!
}

input objectFilter {
  and: [objectFilter!]
  or: [objectFilter!]
  id: IDFilterComparison
  isCustom: BooleanFieldComparison
  isActive: BooleanFieldComparison
  isSystem: BooleanFieldComparison
}

type Mutation {
  uploadProfilePicture(file: Upload!): String!
  deleteUser: User!
  uploadFile(file: Upload!, fileFolder: FileFolder): String!
  uploadImage(file: Upload!, fileFolder: FileFolder): String!
  deleteOneObject(input: DeleteOneObjectInput!): object!
  createOneObject(input: CreateOneObjectInput!): object!
  updateOneObject(input: UpdateOneObjectInput!): object!
  challenge(email: String!, password: String!): LoginToken!
  signUp(email: String!, password: String!, workspaceInviteHash: String): LoginToken!
  generateTransientToken: TransientToken!
  verify(loginToken: String!): Verify!
  renewToken(refreshToken: String!): AuthTokens!
  impersonate(userId: String!): Verify!
  generateApiKeyToken(apiKeyId: String!, expiresAt: String!): ApiKeyToken!
  emailPasswordResetLink: EmailPasswordResetLink!
  updatePasswordViaResetToken(passwordResetToken: String!, newPassword: String!): InvalidatePassword!
  createEvent(
    """Type of the event"""
    type: String!

    """Event data in JSON format"""
    data: JSON!
  ): Analytics!
  createOneRefreshToken(input: CreateOneRefreshTokenInput!): RefreshToken!
  updateWorkspace(data: UpdateWorkspaceInput!): Workspace!
  uploadWorkspaceLogo(file: Upload!): String!
  deleteCurrentWorkspace: Workspace!
  createActivityTargets(data: [ActivityTargetCreateInput!]!): [ActivityTarget!]!
  createActivityTarget(data: ActivityTargetCreateInput!): ActivityTarget!
  updateActivityTarget(id: ID!, data: ActivityTargetUpdateInput!): ActivityTarget!
  deleteActivityTarget(id: ID!): ActivityTarget!
  executeQuickActionOnActivityTarget(id: ID!): ActivityTarget!
  updateActivityTargets(data: ActivityTargetUpdateInput!, filter: ActivityTargetFilterInput!): [ActivityTarget!]!
  deleteActivityTargets(filter: ActivityTargetFilterInput!): [ActivityTarget!]!
  createActivities(data: [ActivityCreateInput!]!): [Activity!]!
  createActivity(data: ActivityCreateInput!): Activity!
  updateActivity(id: ID!, data: ActivityUpdateInput!): Activity!
  deleteActivity(id: ID!): Activity!
  executeQuickActionOnActivity(id: ID!): Activity!
  updateActivities(data: ActivityUpdateInput!, filter: ActivityFilterInput!): [Activity!]!
  deleteActivities(filter: ActivityFilterInput!): [Activity!]!
  createApiKeys(data: [ApiKeyCreateInput!]!): [ApiKey!]!
  createApiKey(data: ApiKeyCreateInput!): ApiKey!
  updateApiKey(id: ID!, data: ApiKeyUpdateInput!): ApiKey!
  deleteApiKey(id: ID!): ApiKey!
  executeQuickActionOnApiKey(id: ID!): ApiKey!
  updateApiKeys(data: ApiKeyUpdateInput!, filter: ApiKeyFilterInput!): [ApiKey!]!
  deleteApiKeys(filter: ApiKeyFilterInput!): [ApiKey!]!
  createAttachments(data: [AttachmentCreateInput!]!): [Attachment!]!
  createAttachment(data: AttachmentCreateInput!): Attachment!
  updateAttachment(id: ID!, data: AttachmentUpdateInput!): Attachment!
  deleteAttachment(id: ID!): Attachment!
  executeQuickActionOnAttachment(id: ID!): Attachment!
  updateAttachments(data: AttachmentUpdateInput!, filter: AttachmentFilterInput!): [Attachment!]!
  deleteAttachments(filter: AttachmentFilterInput!): [Attachment!]!
  createComments(data: [CommentCreateInput!]!): [Comment!]!
  createComment(data: CommentCreateInput!): Comment!
  updateComment(id: ID!, data: CommentUpdateInput!): Comment!
  deleteComment(id: ID!): Comment!
  executeQuickActionOnComment(id: ID!): Comment!
  updateComments(data: CommentUpdateInput!, filter: CommentFilterInput!): [Comment!]!
  deleteComments(filter: CommentFilterInput!): [Comment!]!
  createCompanies(data: [CompanyCreateInput!]!): [Company!]!
  createCompany(data: CompanyCreateInput!): Company!
  updateCompany(id: ID!, data: CompanyUpdateInput!): Company!
  deleteCompany(id: ID!): Company!
  executeQuickActionOnCompany(id: ID!): Company!
  updateCompanies(data: CompanyUpdateInput!, filter: CompanyFilterInput!): [Company!]!
  deleteCompanies(filter: CompanyFilterInput!): [Company!]!
  createConnectedAccounts(data: [ConnectedAccountCreateInput!]!): [ConnectedAccount!]!
  createConnectedAccount(data: ConnectedAccountCreateInput!): ConnectedAccount!
  updateConnectedAccount(id: ID!, data: ConnectedAccountUpdateInput!): ConnectedAccount!
  deleteConnectedAccount(id: ID!): ConnectedAccount!
  executeQuickActionOnConnectedAccount(id: ID!): ConnectedAccount!
  updateConnectedAccounts(data: ConnectedAccountUpdateInput!, filter: ConnectedAccountFilterInput!): [ConnectedAccount!]!
  deleteConnectedAccounts(filter: ConnectedAccountFilterInput!): [ConnectedAccount!]!
  createPeople(data: [PersonCreateInput!]!): [Person!]!
  createPerson(data: PersonCreateInput!): Person!
  updatePerson(id: ID!, data: PersonUpdateInput!): Person!
  deletePerson(id: ID!): Person!
  executeQuickActionOnPerson(id: ID!): Person!
  updatePeople(data: PersonUpdateInput!, filter: PersonFilterInput!): [Person!]!
  deletePeople(filter: PersonFilterInput!): [Person!]!
  createFavorites(data: [FavoriteCreateInput!]!): [Favorite!]!
  createFavorite(data: FavoriteCreateInput!): Favorite!
  updateFavorite(id: ID!, data: FavoriteUpdateInput!): Favorite!
  deleteFavorite(id: ID!): Favorite!
  executeQuickActionOnFavorite(id: ID!): Favorite!
  updateFavorites(data: FavoriteUpdateInput!, filter: FavoriteFilterInput!): [Favorite!]!
  deleteFavorites(filter: FavoriteFilterInput!): [Favorite!]!
  createOpportunities(data: [OpportunityCreateInput!]!): [Opportunity!]!
  createOpportunity(data: OpportunityCreateInput!): Opportunity!
  updateOpportunity(id: ID!, data: OpportunityUpdateInput!): Opportunity!
  deleteOpportunity(id: ID!): Opportunity!
  executeQuickActionOnOpportunity(id: ID!): Opportunity!
  updateOpportunities(data: OpportunityUpdateInput!, filter: OpportunityFilterInput!): [Opportunity!]!
  deleteOpportunities(filter: OpportunityFilterInput!): [Opportunity!]!
  createPipelineSteps(data: [PipelineStepCreateInput!]!): [PipelineStep!]!
  createPipelineStep(data: PipelineStepCreateInput!): PipelineStep!
  updatePipelineStep(id: ID!, data: PipelineStepUpdateInput!): PipelineStep!
  deletePipelineStep(id: ID!): PipelineStep!
  executeQuickActionOnPipelineStep(id: ID!): PipelineStep!
  updatePipelineSteps(data: PipelineStepUpdateInput!, filter: PipelineStepFilterInput!): [PipelineStep!]!
  deletePipelineSteps(filter: PipelineStepFilterInput!): [PipelineStep!]!
  createViewFields(data: [ViewFieldCreateInput!]!): [ViewField!]!
  createViewField(data: ViewFieldCreateInput!): ViewField!
  updateViewField(id: ID!, data: ViewFieldUpdateInput!): ViewField!
  deleteViewField(id: ID!): ViewField!
  executeQuickActionOnViewField(id: ID!): ViewField!
  updateViewFields(data: ViewFieldUpdateInput!, filter: ViewFieldFilterInput!): [ViewField!]!
  deleteViewFields(filter: ViewFieldFilterInput!): [ViewField!]!
  createViewFilters(data: [ViewFilterCreateInput!]!): [ViewFilter!]!
  createViewFilter(data: ViewFilterCreateInput!): ViewFilter!
  updateViewFilter(id: ID!, data: ViewFilterUpdateInput!): ViewFilter!
  deleteViewFilter(id: ID!): ViewFilter!
  executeQuickActionOnViewFilter(id: ID!): ViewFilter!
  updateViewFilters(data: ViewFilterUpdateInput!, filter: ViewFilterFilterInput!): [ViewFilter!]!
  deleteViewFilters(filter: ViewFilterFilterInput!): [ViewFilter!]!
  createViewSorts(data: [ViewSortCreateInput!]!): [ViewSort!]!
  createViewSort(data: ViewSortCreateInput!): ViewSort!
  updateViewSort(id: ID!, data: ViewSortUpdateInput!): ViewSort!
  deleteViewSort(id: ID!): ViewSort!
  executeQuickActionOnViewSort(id: ID!): ViewSort!
  updateViewSorts(data: ViewSortUpdateInput!, filter: ViewSortFilterInput!): [ViewSort!]!
  deleteViewSorts(filter: ViewSortFilterInput!): [ViewSort!]!
  createViews(data: [ViewCreateInput!]!): [View!]!
  createView(data: ViewCreateInput!): View!
  updateView(id: ID!, data: ViewUpdateInput!): View!
  deleteView(id: ID!): View!
  executeQuickActionOnView(id: ID!): View!
  updateViews(data: ViewUpdateInput!, filter: ViewFilterInput!): [View!]!
  deleteViews(filter: ViewFilterInput!): [View!]!
  createWebhooks(data: [WebhookCreateInput!]!): [Webhook!]!
  createWebhook(data: WebhookCreateInput!): Webhook!
  updateWebhook(id: ID!, data: WebhookUpdateInput!): Webhook!
  deleteWebhook(id: ID!): Webhook!
  executeQuickActionOnWebhook(id: ID!): Webhook!
  updateWebhooks(data: WebhookUpdateInput!, filter: WebhookFilterInput!): [Webhook!]!
  deleteWebhooks(filter: WebhookFilterInput!): [Webhook!]!
  createWorkspaceMembers(data: [WorkspaceMemberCreateInput!]!): [WorkspaceMember!]!
  createWorkspaceMember(data: WorkspaceMemberCreateInput!): WorkspaceMember!
  updateWorkspaceMember(id: ID!, data: WorkspaceMemberUpdateInput!): WorkspaceMember!
  deleteWorkspaceMember(id: ID!): WorkspaceMember!
  executeQuickActionOnWorkspaceMember(id: ID!): WorkspaceMember!
  updateWorkspaceMembers(data: WorkspaceMemberUpdateInput!, filter: WorkspaceMemberFilterInput!): [WorkspaceMember!]!
  deleteWorkspaceMembers(filter: WorkspaceMemberFilterInput!): [WorkspaceMember!]!
  createMessageThreads(data: [MessageThreadCreateInput!]!): [MessageThread!]!
  createMessageThread(data: MessageThreadCreateInput!): MessageThread!
  updateMessageThread(id: ID!, data: MessageThreadUpdateInput!): MessageThread!
  deleteMessageThread(id: ID!): MessageThread!
  executeQuickActionOnMessageThread(id: ID!): MessageThread!
  updateMessageThreads(data: MessageThreadUpdateInput!, filter: MessageThreadFilterInput!): [MessageThread!]!
  deleteMessageThreads(filter: MessageThreadFilterInput!): [MessageThread!]!
  createMessages(data: [MessageCreateInput!]!): [Message!]!
  createMessage(data: MessageCreateInput!): Message!
  updateMessage(id: ID!, data: MessageUpdateInput!): Message!
  deleteMessage(id: ID!): Message!
  executeQuickActionOnMessage(id: ID!): Message!
  updateMessages(data: MessageUpdateInput!, filter: MessageFilterInput!): [Message!]!
  deleteMessages(filter: MessageFilterInput!): [Message!]!
  createMessageChannels(data: [MessageChannelCreateInput!]!): [MessageChannel!]!
  createMessageChannel(data: MessageChannelCreateInput!): MessageChannel!
  updateMessageChannel(id: ID!, data: MessageChannelUpdateInput!): MessageChannel!
  deleteMessageChannel(id: ID!): MessageChannel!
  executeQuickActionOnMessageChannel(id: ID!): MessageChannel!
  updateMessageChannels(data: MessageChannelUpdateInput!, filter: MessageChannelFilterInput!): [MessageChannel!]!
  deleteMessageChannels(filter: MessageChannelFilterInput!): [MessageChannel!]!
  createMessageParticipants(data: [MessageParticipantCreateInput!]!): [MessageParticipant!]!
  createMessageParticipant(data: MessageParticipantCreateInput!): MessageParticipant!
  updateMessageParticipant(id: ID!, data: MessageParticipantUpdateInput!): MessageParticipant!
  deleteMessageParticipant(id: ID!): MessageParticipant!
  executeQuickActionOnMessageParticipant(id: ID!): MessageParticipant!
  updateMessageParticipants(data: MessageParticipantUpdateInput!, filter: MessageParticipantFilterInput!): [MessageParticipant!]!
  deleteMessageParticipants(filter: MessageParticipantFilterInput!): [MessageParticipant!]!
  createMessageChannelMessageAssociations(data: [MessageChannelMessageAssociationCreateInput!]!): [MessageChannelMessageAssociation!]!
  createMessageChannelMessageAssociation(data: MessageChannelMessageAssociationCreateInput!): MessageChannelMessageAssociation!
  updateMessageChannelMessageAssociation(id: ID!, data: MessageChannelMessageAssociationUpdateInput!): MessageChannelMessageAssociation!
  deleteMessageChannelMessageAssociation(id: ID!): MessageChannelMessageAssociation!
  executeQuickActionOnMessageChannelMessageAssociation(id: ID!): MessageChannelMessageAssociation!
  updateMessageChannelMessageAssociations(data: MessageChannelMessageAssociationUpdateInput!, filter: MessageChannelMessageAssociationFilterInput!): [MessageChannelMessageAssociation!]!
  deleteMessageChannelMessageAssociations(filter: MessageChannelMessageAssociationFilterInput!): [MessageChannelMessageAssociation!]!
}

"""The \`Upload\` scalar type represents a file upload."""
scalar Upload

enum FileFolder {
  ProfilePicture
  WorkspaceLogo
  Attachment
  PersonPicture
}

input DeleteOneObjectInput {
  """The id of the record to delete."""
  id: ID!
}

input CreateOneObjectInput {
  """The record to create"""
  object: CreateObjectInput!
}

input CreateObjectInput {
  nameSingular: String!
  namePlural: String!
  labelSingular: String!
  labelPlural: String!
  description: String
  icon: String
  labelIdentifierFieldMetadataId: String
  imageIdentifierFieldMetadataId: String
}

input UpdateOneObjectInput {
  """The id of the record to update"""
  id: ID!

  """The update to apply."""
  update: UpdateObjectInput!
}

input UpdateObjectInput {
  labelSingular: String
  labelPlural: String
  nameSingular: String
  namePlural: String
  description: String
  icon: String
  isActive: Boolean
  labelIdentifierFieldMetadataId: String
  imageIdentifierFieldMetadataId: String
}

input CreateOneRefreshTokenInput {
  """The record to create"""
  refreshToken: CreateRefreshTokenInput!
}

input CreateRefreshTokenInput {
  expiresAt: DateTime!
}

input UpdateWorkspaceInput {
  domainName: String
  displayName: String
  logo: String
  inviteHash: String
  allowImpersonation: Boolean
}

type Currency {
  amountMicros: BigFloat
  currencyCode: String
  id: ID
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime
}

"""A custom scalar type for representing big floating point numbers"""
scalar BigFloat

type Link {
  label: String
  url: String
  id: ID
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime
}

"""An activity target"""
type ActivityTarget {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """ActivityTarget activity id foreign key"""
  activityId: ID

  """ActivityTarget person id foreign key"""
  personId: ID

  """ActivityTarget company id foreign key"""
  companyId: ID

  """ActivityTarget opportunity id foreign key"""
  opportunityId: ID
  deletedAt: DateTime

  """ActivityTarget activity"""
  activity: Activity

  """ActivityTarget person"""
  person: Person

  """ActivityTarget company"""
  company: Company

  """ActivityTarget opportunity"""
  opportunity: Opportunity
}

"""An activity"""
type Activity {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """Activity title"""
  title: String!

  """Activity body"""
  body: String!

  """Activity type"""
  type: String!

  """Activity reminder date"""
  reminderAt: DateTime

  """Activity due date"""
  dueAt: DateTime

  """Activity completion date"""
  completedAt: DateTime

  """Activity author id foreign key"""
  authorId: ID!

  """Acitivity assignee id foreign key"""
  assigneeId: ID
  deletedAt: DateTime

  """Activity targets"""
  activityTargets(first: Float, last: Float, before: String, after: String, filter: ActivityTargetFilterInput, orderBy: ActivityTargetOrderByInput): ActivityTargetConnection

  """Activity attachments"""
  attachments(first: Float, last: Float, before: String, after: String, filter: AttachmentFilterInput, orderBy: AttachmentOrderByInput): AttachmentConnection

  """Activity comments"""
  comments(first: Float, last: Float, before: String, after: String, filter: CommentFilterInput, orderBy: CommentOrderByInput): CommentConnection

  """Activity author"""
  author: WorkspaceMember

  """Acitivity assignee"""
  assignee: WorkspaceMember
}

"""An api key"""
type ApiKey {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """ApiKey name"""
  name: String!

  """ApiKey expiration date"""
  expiresAt: DateTime!

  """ApiKey revocation date"""
  revokedAt: DateTime
  deletedAt: DateTime
}

"""An attachment"""
type Attachment {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """Attachment name"""
  name: String!

  """Attachment full path"""
  fullPath: String!

  """Attachment type"""
  type: String!

  """Attachment author id foreign key"""
  authorId: ID!

  """Attachment activity id foreign key"""
  activityId: ID

  """Attachment person id foreign key"""
  personId: ID

  """Attachment company id foreign key"""
  companyId: ID
  deletedAt: DateTime

  """Attachment author"""
  author: WorkspaceMember

  """Attachment activity"""
  activity: Activity

  """Attachment person"""
  person: Person

  """Attachment company"""
  company: Company
}

"""A comment"""
type Comment {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """Comment body"""
  body: String!

  """Comment author id foreign key"""
  authorId: ID!

  """Comment activity id foreign key"""
  activityId: ID!
  deletedAt: DateTime

  """Comment author"""
  author: WorkspaceMember

  """Comment activity"""
  activity: Activity
}

"""A company"""
type Company {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """The company name"""
  name: String!

  """The company website URL. We use this url to fetch the company icon"""
  domainName: String!

  """The company address"""
  address: String!

  """Number of employees in the company"""
  employees: Float

  """The company Linkedin account"""
  linkedinLink: Link

  """The company Twitter/X account"""
  xLink: Link

  """
  Annual Recurring Revenue: The actual or estimated annual revenue of the company
  """
  annualRecurringRevenue: Currency

  """
  Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you
  """
  idealCustomerProfile: Boolean!

  """Record Position"""
  recordPosition: Float

  """
  Your team member responsible for managing the company account id foreign key
  """
  accountOwnerId: ID
  deletedAt: DateTime

  """People linked to the company."""
  people(first: Float, last: Float, before: String, after: String, filter: PersonFilterInput, orderBy: PersonOrderByInput): PersonConnection

  """Your team member responsible for managing the company account"""
  accountOwner: WorkspaceMember

  """Activities tied to the company"""
  activityTargets(first: Float, last: Float, before: String, after: String, filter: ActivityTargetFilterInput, orderBy: ActivityTargetOrderByInput): ActivityTargetConnection

  """Opportunities linked to the company."""
  opportunities(first: Float, last: Float, before: String, after: String, filter: OpportunityFilterInput, orderBy: OpportunityOrderByInput): OpportunityConnection

  """Favorites linked to the company"""
  favorites(first: Float, last: Float, before: String, after: String, filter: FavoriteFilterInput, orderBy: FavoriteOrderByInput): FavoriteConnection

  """Attachments linked to the company."""
  attachments(first: Float, last: Float, before: String, after: String, filter: AttachmentFilterInput, orderBy: AttachmentOrderByInput): AttachmentConnection
}

"""A connected account"""
type ConnectedAccount {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """The account handle (email, username, phone number, etc.)"""
  handle: String!

  """The account provider"""
  provider: String!

  """Messaging provider access token"""
  accessToken: String!

  """Messaging provider refresh token"""
  refreshToken: String!

  """Account Owner id foreign key"""
  accountOwnerId: ID!

  """Last sync history ID"""
  lastSyncHistoryId: String!
  deletedAt: DateTime

  """Account Owner"""
  accountOwner: WorkspaceMember

  """Message Channel"""
  messageChannels(first: Float, last: Float, before: String, after: String, filter: MessageChannelFilterInput, orderBy: MessageChannelOrderByInput): MessageChannelConnection
}

"""A person"""
type Person {
  updatedAt: DateTime!
  id: ID!
  createdAt: DateTime!

  """Contact’s name"""
  name: FullName

  """Contact’s Email"""
  email: String!

  """Contact’s Linkedin account"""
  linkedinLink: Link

  """Contact’s X/Twitter account"""
  xLink: Link

  """Contact’s job title"""
  jobTitle: String!

  """Contact’s phone number"""
  phone: String!

  """Contact’s city"""
  city: String!

  """Contact’s avatar"""
  avatarUrl: String!

  """Record Position"""
  recordPosition: Float

  """Contact’s company id foreign key"""
  companyId: ID
  deletedAt: DateTime

  """Contact’s company"""
  company: Company

  """Point of Contact for Opportunities"""
  pointOfContactForOpportunities(first: Float, last: Float, before: String, after: String, filter: OpportunityFilterInput, orderBy: OpportunityOrderByInput): OpportunityConnection

  """Activities tied to the contact"""
  activityTargets(first: Float, last: Float, before: String, after: String, filter: ActivityTargetFilterInput, orderBy: ActivityTargetOrderByInput): ActivityTargetConnection

  """Favorites linked to the contact"""
  favorites(first: Float, last: Float, before: String, after: String, filter: FavoriteFilterInput, orderBy: FavoriteOrderByInput): FavoriteConnection

  """Attachments linked to the contact."""
  attachments(first: Float, last: Float, before: String, after: String, filter: AttachmentFilterInput, orderBy: AttachmentOrderByInput): AttachmentConnection

  """Message Participants"""
  messageParticipants(first: Float, last: Float, before: String, after: String, filter: MessageParticipantFilterInput, orderBy: MessageParticipantOrderByInput): MessageParticipantConnection
}

"""A favorite"""
type Favorite {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """Favorite position"""
  position: Float!

  """Favorite workspace member id foreign key"""
  workspaceMemberId: ID!

  """Favorite person id foreign key"""
  personId: ID

  """Favorite company id foreign key"""
  companyId: ID

  """Favorite opportunity id foreign key"""
  opportunityId: ID
  deletedAt: DateTime

  """Favorite workspace member"""
  workspaceMember: WorkspaceMember

  """Favorite person"""
  person: Person

  """Favorite company"""
  company: Company

  """Favorite opportunity"""
  opportunity: Opportunity
}

"""An opportunity"""
type Opportunity {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """The opportunity name"""
  name: String!

  """Opportunity amount"""
  amount: Currency

  """Opportunity close date"""
  closeDate: DateTime

  """Opportunity probability"""
  probability: String!

  """Opportunity stage"""
  stage: OpportunityStageEnum!

  """Record Position"""
  recordPosition: Float

  """Opportunity pipeline step id foreign key"""
  pipelineStepId: ID

  """Opportunity point of contact id foreign key"""
  pointOfContactId: ID

  """Opportunity company id foreign key"""
  companyId: ID
  deletedAt: DateTime

  """Opportunity pipeline step"""
  pipelineStep: PipelineStep

  """Opportunity point of contact"""
  pointOfContact: Person

  """Opportunity company"""
  company: Company

  """Favorites linked to the opportunity"""
  favorites(first: Float, last: Float, before: String, after: String, filter: FavoriteFilterInput, orderBy: FavoriteOrderByInput): FavoriteConnection

  """Activities tied to the opportunity"""
  activityTargets(first: Float, last: Float, before: String, after: String, filter: ActivityTargetFilterInput, orderBy: ActivityTargetOrderByInput): ActivityTargetConnection
}

"""Opportunity stage"""
enum OpportunityStageEnum {
  """New"""
  new

  """Screening"""
  screening

  """Meeting"""
  meeting

  """Proposal"""
  proposal

  """Customer"""
  customer
}

"""A pipeline step"""
type PipelineStep {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """Pipeline Step name"""
  name: String!

  """Pipeline Step color"""
  color: String!

  """Pipeline Step position"""
  position: Float
  deletedAt: DateTime

  """Opportunities linked to the step."""
  opportunities(first: Float, last: Float, before: String, after: String, filter: OpportunityFilterInput, orderBy: OpportunityOrderByInput): OpportunityConnection
}

"""(System) View Fields"""
type ViewField {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """View Field target field"""
  fieldMetadataId: ID!

  """View Field visibility"""
  isVisible: Boolean!

  """View Field size"""
  size: Float!

  """View Field position"""
  position: Float!

  """View Field related view id foreign key"""
  viewId: ID
  deletedAt: DateTime

  """View Field related view"""
  view: View
}

"""(System) View Filters"""
type ViewFilter {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """View Filter target field"""
  fieldMetadataId: ID!

  """View Filter operand"""
  operand: String!

  """View Filter value"""
  value: String!

  """View Filter Display Value"""
  displayValue: String!

  """View Filter related view id foreign key"""
  viewId: ID
  deletedAt: DateTime

  """View Filter related view"""
  view: View
}

"""(System) View Sorts"""
type ViewSort {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """View Sort target field"""
  fieldMetadataId: ID!

  """View Sort direction"""
  direction: String!

  """View Sort related view id foreign key"""
  viewId: ID
  deletedAt: DateTime

  """View Sort related view"""
  view: View
}

"""(System) Views"""
type View {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """View name"""
  name: String!

  """View target object"""
  objectMetadataId: ID!

  """View type"""
  type: String!
  deletedAt: DateTime

  """View Fields"""
  viewFields(first: Float, last: Float, before: String, after: String, filter: ViewFieldFilterInput, orderBy: ViewFieldOrderByInput): ViewFieldConnection

  """View Filters"""
  viewFilters(first: Float, last: Float, before: String, after: String, filter: ViewFilterFilterInput, orderBy: ViewFilterOrderByInput): ViewFilterConnection

  """View Sorts"""
  viewSorts(first: Float, last: Float, before: String, after: String, filter: ViewSortFilterInput, orderBy: ViewSortOrderByInput): ViewSortConnection
}

"""A webhook"""
type Webhook {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """Webhook target url"""
  targetUrl: String!

  """Webhook operation"""
  operation: String!
  deletedAt: DateTime
}

"""Message Thread"""
type MessageThread {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  deletedAt: DateTime

  """Messages from the thread."""
  messages(first: Float, last: Float, before: String, after: String, filter: MessageFilterInput, orderBy: MessageOrderByInput): MessageConnection

  """Messages from the channel."""
  messageChannelMessageAssociations(first: Float, last: Float, before: String, after: String, filter: MessageChannelMessageAssociationFilterInput, orderBy: MessageChannelMessageAssociationOrderByInput): MessageChannelMessageAssociationConnection
}

"""Message"""
type Message {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """Message id from the message header"""
  headerMessageId: String!

  """Message Thread Id id foreign key"""
  messageThreadId: ID

  """Message Direction"""
  direction: MessageDirectionEnum!

  """Subject"""
  subject: String!

  """Text"""
  text: String!

  """Html"""
  html: String!

  """The date the message was received"""
  receivedAt: DateTime
  deletedAt: DateTime

  """Message Thread Id"""
  messageThread: MessageThread

  """Message Participants"""
  messageParticipants(first: Float, last: Float, before: String, after: String, filter: MessageParticipantFilterInput, orderBy: MessageParticipantOrderByInput): MessageParticipantConnection

  """Messages from the channel."""
  messageChannelMessageAssociations(first: Float, last: Float, before: String, after: String, filter: MessageChannelMessageAssociationFilterInput, orderBy: MessageChannelMessageAssociationOrderByInput): MessageChannelMessageAssociationConnection
}

"""Message Direction"""
enum MessageDirectionEnum {
  """Incoming"""
  incoming

  """Outgoing"""
  outgoing
}

"""Message Channels"""
type MessageChannel {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """Visibility"""
  visibility: MessageChannelVisibilityEnum!

  """Handle"""
  handle: String!

  """Connected Account id foreign key"""
  connectedAccountId: ID!

  """Channel Type"""
  type: MessageChannelTypeEnum!
  deletedAt: DateTime

  """Connected Account"""
  connectedAccount: ConnectedAccount

  """Messages from the channel."""
  messageChannelMessageAssociations(first: Float, last: Float, before: String, after: String, filter: MessageChannelMessageAssociationFilterInput, orderBy: MessageChannelMessageAssociationOrderByInput): MessageChannelMessageAssociationConnection
}

"""Visibility"""
enum MessageChannelVisibilityEnum {
  """Metadata"""
  metadata

  """Subject"""
  subject

  """Share Everything"""
  share_everything
}

"""Channel Type"""
enum MessageChannelTypeEnum {
  """Email"""
  email

  """SMS"""
  sms
}

"""Message Participants"""
type MessageParticipant {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """Message id foreign key"""
  messageId: ID!

  """Role"""
  role: MessageParticipantRoleEnum!

  """Handle"""
  handle: String!

  """Display Name"""
  displayName: String!

  """Person id foreign key"""
  personId: ID

  """Workspace member id foreign key"""
  workspaceMemberId: ID
  deletedAt: DateTime

  """Message"""
  message: Message

  """Person"""
  person: Person

  """Workspace member"""
  workspaceMember: WorkspaceMember
}

"""Role"""
enum MessageParticipantRoleEnum {
  """From"""
  from

  """To"""
  to

  """Cc"""
  cc

  """Bcc"""
  bcc
}

"""Message Synced with a Message Channel"""
type MessageChannelMessageAssociation {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!

  """Message Channel Id id foreign key"""
  messageChannelId: ID

  """Message Id id foreign key"""
  messageId: ID

  """Message id from the messaging provider"""
  messageExternalId: String

  """Message Thread Id id foreign key"""
  messageThreadId: ID

  """Thread id from the messaging provider"""
  messageThreadExternalId: String
  deletedAt: DateTime

  """Message Channel Id"""
  messageChannel: MessageChannel

  """Message Id"""
  message: Message

  """Message Thread Id"""
  messageThread: MessageThread
}

"""An activity target"""
type ActivityTargetEdge {
  node: ActivityTarget!
  cursor: Cursor!
}

"""A custom scalar that represents a cursor for pagination"""
scalar Cursor

"""An activity"""
type ActivityEdge {
  node: Activity!
  cursor: Cursor!
}

"""An api key"""
type ApiKeyEdge {
  node: ApiKey!
  cursor: Cursor!
}

"""An attachment"""
type AttachmentEdge {
  node: Attachment!
  cursor: Cursor!
}

"""A comment"""
type CommentEdge {
  node: Comment!
  cursor: Cursor!
}

"""A company"""
type CompanyEdge {
  node: Company!
  cursor: Cursor!
}

"""A connected account"""
type ConnectedAccountEdge {
  node: ConnectedAccount!
  cursor: Cursor!
}

"""A person"""
type PersonEdge {
  node: Person!
  cursor: Cursor!
}

"""A favorite"""
type FavoriteEdge {
  node: Favorite!
  cursor: Cursor!
}

"""An opportunity"""
type OpportunityEdge {
  node: Opportunity!
  cursor: Cursor!
}

"""A pipeline step"""
type PipelineStepEdge {
  node: PipelineStep!
  cursor: Cursor!
}

"""(System) View Fields"""
type ViewFieldEdge {
  node: ViewField!
  cursor: Cursor!
}

"""(System) View Filters"""
type ViewFilterEdge {
  node: ViewFilter!
  cursor: Cursor!
}

"""(System) View Sorts"""
type ViewSortEdge {
  node: ViewSort!
  cursor: Cursor!
}

"""(System) Views"""
type ViewEdge {
  node: View!
  cursor: Cursor!
}

"""A webhook"""
type WebhookEdge {
  node: Webhook!
  cursor: Cursor!
}

"""A workspace member"""
type WorkspaceMemberEdge {
  node: WorkspaceMember!
  cursor: Cursor!
}

"""Message Thread"""
type MessageThreadEdge {
  node: MessageThread!
  cursor: Cursor!
}

"""Message"""
type MessageEdge {
  node: Message!
  cursor: Cursor!
}

"""Message Channels"""
type MessageChannelEdge {
  node: MessageChannel!
  cursor: Cursor!
}

"""Message Participants"""
type MessageParticipantEdge {
  node: MessageParticipant!
  cursor: Cursor!
}

"""Message Synced with a Message Channel"""
type MessageChannelMessageAssociationEdge {
  node: MessageChannelMessageAssociation!
  cursor: Cursor!
}

"""An activity target"""
type ActivityTargetConnection {
  edges: [ActivityTargetEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""An activity"""
type ActivityConnection {
  edges: [ActivityEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""An api key"""
type ApiKeyConnection {
  edges: [ApiKeyEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""An attachment"""
type AttachmentConnection {
  edges: [AttachmentEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""A comment"""
type CommentConnection {
  edges: [CommentEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""A company"""
type CompanyConnection {
  edges: [CompanyEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""A connected account"""
type ConnectedAccountConnection {
  edges: [ConnectedAccountEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""A person"""
type PersonConnection {
  edges: [PersonEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""A favorite"""
type FavoriteConnection {
  edges: [FavoriteEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""An opportunity"""
type OpportunityConnection {
  edges: [OpportunityEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""A pipeline step"""
type PipelineStepConnection {
  edges: [PipelineStepEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""(System) View Fields"""
type ViewFieldConnection {
  edges: [ViewFieldEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""(System) View Filters"""
type ViewFilterConnection {
  edges: [ViewFilterEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""(System) View Sorts"""
type ViewSortConnection {
  edges: [ViewSortEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""(System) Views"""
type ViewConnection {
  edges: [ViewEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""A webhook"""
type WebhookConnection {
  edges: [WebhookEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""A workspace member"""
type WorkspaceMemberConnection {
  edges: [WorkspaceMemberEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""Message Thread"""
type MessageThreadConnection {
  edges: [MessageThreadEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""Message"""
type MessageConnection {
  edges: [MessageEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""Message Channels"""
type MessageChannelConnection {
  edges: [MessageChannelEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""Message Participants"""
type MessageParticipantConnection {
  edges: [MessageParticipantEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

"""Message Synced with a Message Channel"""
type MessageChannelMessageAssociationConnection {
  edges: [MessageChannelMessageAssociationEdge!]!
  pageInfo: PageInfo!

  """Total number of records in the connection"""
  totalCount: Int
}

input CurrencyCreateInput {
  amountMicros: BigFloat
  currencyCode: String
  id: ID
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime
}

input CurrencyUpdateInput {
  amountMicros: BigFloat
  currencyCode: String
  id: ID
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime
}

input CurrencyFilterInput {
  amountMicros: BigFloatFilter
  currencyCode: StringFilter
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter
  deletedAt: DateFilter
  and: [CurrencyFilterInput]
  or: [CurrencyFilterInput]
  not: CurrencyFilterInput
}

input BigFloatFilter {
  eq: BigFloat
  gt: BigFloat
  gte: BigFloat
  in: [BigFloat!]
  lt: BigFloat
  lte: BigFloat
  neq: BigFloat
  is: FilterIs
}

"""This enum to filter by nullability"""
enum FilterIs {
  """Nulish values"""
  NULL

  """Non-nulish values"""
  NOT_NULL
}

input StringFilter {
  eq: String
  gt: String
  gte: String
  in: [String!]
  lt: String
  lte: String
  neq: String
  startsWith: String
  like: String
  ilike: String
  regex: String
  iregex: String
  is: FilterIs
}

input UUIDFilter {
  eq: UUID
  in: [UUID]
  neq: UUID
  is: FilterIs
}

"""A UUID scalar type"""
scalar UUID

input DateFilter {
  eq: Date
  gt: Date
  gte: Date
  in: [Date!]
  lt: Date
  lte: Date
  neq: Date
  is: FilterIs
}

"""Date custom scalar type"""
scalar Date

input CurrencyOrderByInput {
  amountMicros: OrderByDirection
  currencyCode: OrderByDirection
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection
  deletedAt: OrderByDirection
}

"""This enum is used to specify the order of results"""
enum OrderByDirection {
  """Ascending order, nulls first"""
  AscNullsFirst

  """Ascending order, nulls last"""
  AscNullsLast

  """Descending order, nulls first"""
  DescNullsFirst

  """Descending order, nulls last"""
  DescNullsLast
}

input LinkCreateInput {
  label: String
  url: String
  id: ID
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime
}

input LinkUpdateInput {
  label: String
  url: String
  id: ID
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime
}

input LinkFilterInput {
  label: StringFilter
  url: StringFilter
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter
  deletedAt: DateFilter
  and: [LinkFilterInput]
  or: [LinkFilterInput]
  not: LinkFilterInput
}

input LinkOrderByInput {
  label: OrderByDirection
  url: OrderByDirection
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection
  deletedAt: OrderByDirection
}

input FullNameCreateInput {
  firstName: String
  lastName: String
  id: ID
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime
}

input FullNameUpdateInput {
  firstName: String
  lastName: String
  id: ID
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime
}

input FullNameFilterInput {
  firstName: StringFilter
  lastName: StringFilter
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter
  deletedAt: DateFilter
  and: [FullNameFilterInput]
  or: [FullNameFilterInput]
  not: FullNameFilterInput
}

input FullNameOrderByInput {
  firstName: OrderByDirection
  lastName: OrderByDirection
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection
  deletedAt: OrderByDirection
}

"""An activity target"""
input ActivityTargetCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """ActivityTarget activity"""
  activity: ID

  """ActivityTarget activity id foreign key"""
  activityId: ID

  """ActivityTarget person"""
  person: ID

  """ActivityTarget person id foreign key"""
  personId: ID

  """ActivityTarget company"""
  company: ID

  """ActivityTarget company id foreign key"""
  companyId: ID

  """ActivityTarget opportunity"""
  opportunity: ID

  """ActivityTarget opportunity id foreign key"""
  opportunityId: ID
  deletedAt: DateTime
}

"""An activity target"""
input ActivityTargetUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """ActivityTarget activity"""
  activity: ID

  """ActivityTarget activity id foreign key"""
  activityId: ID

  """ActivityTarget person"""
  person: ID

  """ActivityTarget person id foreign key"""
  personId: ID

  """ActivityTarget company"""
  company: ID

  """ActivityTarget company id foreign key"""
  companyId: ID

  """ActivityTarget opportunity"""
  opportunity: ID

  """ActivityTarget opportunity id foreign key"""
  opportunityId: ID
  deletedAt: DateTime
}

"""An activity target"""
input ActivityTargetFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """ActivityTarget activity id foreign key"""
  activityId: UUIDFilter

  """ActivityTarget person id foreign key"""
  personId: UUIDFilter

  """ActivityTarget company id foreign key"""
  companyId: UUIDFilter

  """ActivityTarget opportunity id foreign key"""
  opportunityId: UUIDFilter
  deletedAt: DateFilter
  and: [ActivityTargetFilterInput]
  or: [ActivityTargetFilterInput]
  not: ActivityTargetFilterInput
}

"""An activity target"""
input ActivityTargetOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """ActivityTarget activity id foreign key"""
  activityId: OrderByDirection

  """ActivityTarget person id foreign key"""
  personId: OrderByDirection

  """ActivityTarget company id foreign key"""
  companyId: OrderByDirection

  """ActivityTarget opportunity id foreign key"""
  opportunityId: OrderByDirection
  deletedAt: OrderByDirection
}

"""An activity"""
input ActivityCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Activity title"""
  title: String

  """Activity body"""
  body: String

  """Activity type"""
  type: String

  """Activity reminder date"""
  reminderAt: DateTime

  """Activity due date"""
  dueAt: DateTime

  """Activity completion date"""
  completedAt: DateTime

  """Activity targets"""
  activityTargets: ID

  """Activity attachments"""
  attachments: ID

  """Activity comments"""
  comments: ID

  """Activity author"""
  author: ID

  """Activity author id foreign key"""
  authorId: ID!

  """Acitivity assignee"""
  assignee: ID

  """Acitivity assignee id foreign key"""
  assigneeId: ID
  deletedAt: DateTime
}

"""An activity"""
input ActivityUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Activity title"""
  title: String

  """Activity body"""
  body: String

  """Activity type"""
  type: String

  """Activity reminder date"""
  reminderAt: DateTime

  """Activity due date"""
  dueAt: DateTime

  """Activity completion date"""
  completedAt: DateTime

  """Activity targets"""
  activityTargets: ID

  """Activity attachments"""
  attachments: ID

  """Activity comments"""
  comments: ID

  """Activity author"""
  author: ID

  """Activity author id foreign key"""
  authorId: ID

  """Acitivity assignee"""
  assignee: ID

  """Acitivity assignee id foreign key"""
  assigneeId: ID
  deletedAt: DateTime
}

"""An activity"""
input ActivityFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """Activity title"""
  title: StringFilter

  """Activity body"""
  body: StringFilter

  """Activity type"""
  type: StringFilter

  """Activity reminder date"""
  reminderAt: DateFilter

  """Activity due date"""
  dueAt: DateFilter

  """Activity completion date"""
  completedAt: DateFilter

  """Activity author id foreign key"""
  authorId: UUIDFilter

  """Acitivity assignee id foreign key"""
  assigneeId: UUIDFilter
  deletedAt: DateFilter
  and: [ActivityFilterInput]
  or: [ActivityFilterInput]
  not: ActivityFilterInput
}

"""An activity"""
input ActivityOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """Activity title"""
  title: OrderByDirection

  """Activity body"""
  body: OrderByDirection

  """Activity type"""
  type: OrderByDirection

  """Activity reminder date"""
  reminderAt: OrderByDirection

  """Activity due date"""
  dueAt: OrderByDirection

  """Activity completion date"""
  completedAt: OrderByDirection

  """Activity author id foreign key"""
  authorId: OrderByDirection

  """Acitivity assignee id foreign key"""
  assigneeId: OrderByDirection
  deletedAt: OrderByDirection
}

"""An api key"""
input ApiKeyCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """ApiKey name"""
  name: String

  """ApiKey expiration date"""
  expiresAt: DateTime!

  """ApiKey revocation date"""
  revokedAt: DateTime
  deletedAt: DateTime
}

"""An api key"""
input ApiKeyUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """ApiKey name"""
  name: String

  """ApiKey expiration date"""
  expiresAt: DateTime

  """ApiKey revocation date"""
  revokedAt: DateTime
  deletedAt: DateTime
}

"""An api key"""
input ApiKeyFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """ApiKey name"""
  name: StringFilter

  """ApiKey expiration date"""
  expiresAt: DateFilter

  """ApiKey revocation date"""
  revokedAt: DateFilter
  deletedAt: DateFilter
  and: [ApiKeyFilterInput]
  or: [ApiKeyFilterInput]
  not: ApiKeyFilterInput
}

"""An api key"""
input ApiKeyOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """ApiKey name"""
  name: OrderByDirection

  """ApiKey expiration date"""
  expiresAt: OrderByDirection

  """ApiKey revocation date"""
  revokedAt: OrderByDirection
  deletedAt: OrderByDirection
}

"""An attachment"""
input AttachmentCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Attachment name"""
  name: String

  """Attachment full path"""
  fullPath: String

  """Attachment type"""
  type: String

  """Attachment author"""
  author: ID

  """Attachment author id foreign key"""
  authorId: ID!

  """Attachment activity"""
  activity: ID

  """Attachment activity id foreign key"""
  activityId: ID

  """Attachment person"""
  person: ID

  """Attachment person id foreign key"""
  personId: ID

  """Attachment company"""
  company: ID

  """Attachment company id foreign key"""
  companyId: ID
  deletedAt: DateTime
}

"""An attachment"""
input AttachmentUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Attachment name"""
  name: String

  """Attachment full path"""
  fullPath: String

  """Attachment type"""
  type: String

  """Attachment author"""
  author: ID

  """Attachment author id foreign key"""
  authorId: ID

  """Attachment activity"""
  activity: ID

  """Attachment activity id foreign key"""
  activityId: ID

  """Attachment person"""
  person: ID

  """Attachment person id foreign key"""
  personId: ID

  """Attachment company"""
  company: ID

  """Attachment company id foreign key"""
  companyId: ID
  deletedAt: DateTime
}

"""An attachment"""
input AttachmentFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """Attachment name"""
  name: StringFilter

  """Attachment full path"""
  fullPath: StringFilter

  """Attachment type"""
  type: StringFilter

  """Attachment author id foreign key"""
  authorId: UUIDFilter

  """Attachment activity id foreign key"""
  activityId: UUIDFilter

  """Attachment person id foreign key"""
  personId: UUIDFilter

  """Attachment company id foreign key"""
  companyId: UUIDFilter
  deletedAt: DateFilter
  and: [AttachmentFilterInput]
  or: [AttachmentFilterInput]
  not: AttachmentFilterInput
}

"""An attachment"""
input AttachmentOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """Attachment name"""
  name: OrderByDirection

  """Attachment full path"""
  fullPath: OrderByDirection

  """Attachment type"""
  type: OrderByDirection

  """Attachment author id foreign key"""
  authorId: OrderByDirection

  """Attachment activity id foreign key"""
  activityId: OrderByDirection

  """Attachment person id foreign key"""
  personId: OrderByDirection

  """Attachment company id foreign key"""
  companyId: OrderByDirection
  deletedAt: OrderByDirection
}

"""A comment"""
input CommentCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Comment body"""
  body: String

  """Comment author"""
  author: ID

  """Comment author id foreign key"""
  authorId: ID!

  """Comment activity"""
  activity: ID

  """Comment activity id foreign key"""
  activityId: ID!
  deletedAt: DateTime
}

"""A comment"""
input CommentUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Comment body"""
  body: String

  """Comment author"""
  author: ID

  """Comment author id foreign key"""
  authorId: ID

  """Comment activity"""
  activity: ID

  """Comment activity id foreign key"""
  activityId: ID
  deletedAt: DateTime
}

"""A comment"""
input CommentFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """Comment body"""
  body: StringFilter

  """Comment author id foreign key"""
  authorId: UUIDFilter

  """Comment activity id foreign key"""
  activityId: UUIDFilter
  deletedAt: DateFilter
  and: [CommentFilterInput]
  or: [CommentFilterInput]
  not: CommentFilterInput
}

"""A comment"""
input CommentOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """Comment body"""
  body: OrderByDirection

  """Comment author id foreign key"""
  authorId: OrderByDirection

  """Comment activity id foreign key"""
  activityId: OrderByDirection
  deletedAt: OrderByDirection
}

"""A company"""
input CompanyCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """The company name"""
  name: String

  """The company website URL. We use this url to fetch the company icon"""
  domainName: String

  """The company address"""
  address: String

  """Number of employees in the company"""
  employees: Float

  """The company Linkedin account"""
  linkedinLink: LinkCreateInput

  """The company Twitter/X account"""
  xLink: LinkCreateInput

  """
  Annual Recurring Revenue: The actual or estimated annual revenue of the company
  """
  annualRecurringRevenue: CurrencyCreateInput

  """
  Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you
  """
  idealCustomerProfile: Boolean

  """Record Position"""
  recordPosition: Float

  """People linked to the company."""
  people: ID

  """Your team member responsible for managing the company account"""
  accountOwner: ID

  """
  Your team member responsible for managing the company account id foreign key
  """
  accountOwnerId: ID

  """Activities tied to the company"""
  activityTargets: ID

  """Opportunities linked to the company."""
  opportunities: ID

  """Favorites linked to the company"""
  favorites: ID

  """Attachments linked to the company."""
  attachments: ID
  deletedAt: DateTime
}

"""A company"""
input CompanyUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """The company name"""
  name: String

  """The company website URL. We use this url to fetch the company icon"""
  domainName: String

  """The company address"""
  address: String

  """Number of employees in the company"""
  employees: Float

  """The company Linkedin account"""
  linkedinLink: LinkUpdateInput

  """The company Twitter/X account"""
  xLink: LinkUpdateInput

  """
  Annual Recurring Revenue: The actual or estimated annual revenue of the company
  """
  annualRecurringRevenue: CurrencyUpdateInput

  """
  Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you
  """
  idealCustomerProfile: Boolean

  """Record Position"""
  recordPosition: Float

  """People linked to the company."""
  people: ID

  """Your team member responsible for managing the company account"""
  accountOwner: ID

  """
  Your team member responsible for managing the company account id foreign key
  """
  accountOwnerId: ID

  """Activities tied to the company"""
  activityTargets: ID

  """Opportunities linked to the company."""
  opportunities: ID

  """Favorites linked to the company"""
  favorites: ID

  """Attachments linked to the company."""
  attachments: ID
  deletedAt: DateTime
}

"""A company"""
input CompanyFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """The company name"""
  name: StringFilter

  """The company website URL. We use this url to fetch the company icon"""
  domainName: StringFilter

  """The company address"""
  address: StringFilter

  """Number of employees in the company"""
  employees: FloatFilter

  """The company Linkedin account"""
  linkedinLink: LinkFilterInput

  """The company Twitter/X account"""
  xLink: LinkFilterInput

  """
  Annual Recurring Revenue: The actual or estimated annual revenue of the company
  """
  annualRecurringRevenue: CurrencyFilterInput

  """
  Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you
  """
  idealCustomerProfile: BooleanFilter

  """Record Position"""
  recordPosition: FloatFilter

  """
  Your team member responsible for managing the company account id foreign key
  """
  accountOwnerId: UUIDFilter
  deletedAt: DateFilter
  and: [CompanyFilterInput]
  or: [CompanyFilterInput]
  not: CompanyFilterInput
}

input FloatFilter {
  eq: Float
  gt: Float
  gte: Float
  in: [Float!]
  lt: Float
  lte: Float
  neq: Float
  is: FilterIs
}

input BooleanFilter {
  eq: Boolean
  is: FilterIs
}

"""A company"""
input CompanyOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """The company name"""
  name: OrderByDirection

  """The company website URL. We use this url to fetch the company icon"""
  domainName: OrderByDirection

  """The company address"""
  address: OrderByDirection

  """Number of employees in the company"""
  employees: OrderByDirection

  """The company Linkedin account"""
  linkedinLink: LinkOrderByInput

  """The company Twitter/X account"""
  xLink: LinkOrderByInput

  """
  Annual Recurring Revenue: The actual or estimated annual revenue of the company
  """
  annualRecurringRevenue: CurrencyOrderByInput

  """
  Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you
  """
  idealCustomerProfile: OrderByDirection

  """Record Position"""
  recordPosition: OrderByDirection

  """
  Your team member responsible for managing the company account id foreign key
  """
  accountOwnerId: OrderByDirection
  deletedAt: OrderByDirection
}

"""A connected account"""
input ConnectedAccountCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """The account handle (email, username, phone number, etc.)"""
  handle: String

  """The account provider"""
  provider: String

  """Messaging provider access token"""
  accessToken: String

  """Messaging provider refresh token"""
  refreshToken: String

  """Account Owner"""
  accountOwner: ID

  """Account Owner id foreign key"""
  accountOwnerId: ID!

  """Last sync history ID"""
  lastSyncHistoryId: String

  """Message Channel"""
  messageChannels: ID
  deletedAt: DateTime
}

"""A connected account"""
input ConnectedAccountUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """The account handle (email, username, phone number, etc.)"""
  handle: String

  """The account provider"""
  provider: String

  """Messaging provider access token"""
  accessToken: String

  """Messaging provider refresh token"""
  refreshToken: String

  """Account Owner"""
  accountOwner: ID

  """Account Owner id foreign key"""
  accountOwnerId: ID

  """Last sync history ID"""
  lastSyncHistoryId: String

  """Message Channel"""
  messageChannels: ID
  deletedAt: DateTime
}

"""A connected account"""
input ConnectedAccountFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """The account handle (email, username, phone number, etc.)"""
  handle: StringFilter

  """The account provider"""
  provider: StringFilter

  """Messaging provider access token"""
  accessToken: StringFilter

  """Messaging provider refresh token"""
  refreshToken: StringFilter

  """Account Owner id foreign key"""
  accountOwnerId: UUIDFilter

  """Last sync history ID"""
  lastSyncHistoryId: StringFilter
  deletedAt: DateFilter
  and: [ConnectedAccountFilterInput]
  or: [ConnectedAccountFilterInput]
  not: ConnectedAccountFilterInput
}

"""A connected account"""
input ConnectedAccountOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """The account handle (email, username, phone number, etc.)"""
  handle: OrderByDirection

  """The account provider"""
  provider: OrderByDirection

  """Messaging provider access token"""
  accessToken: OrderByDirection

  """Messaging provider refresh token"""
  refreshToken: OrderByDirection

  """Account Owner id foreign key"""
  accountOwnerId: OrderByDirection

  """Last sync history ID"""
  lastSyncHistoryId: OrderByDirection
  deletedAt: OrderByDirection
}

"""A person"""
input PersonCreateInput {
  updatedAt: DateTime
  id: ID
  createdAt: DateTime

  """Contact’s name"""
  name: FullNameCreateInput

  """Contact’s Email"""
  email: String

  """Contact’s Linkedin account"""
  linkedinLink: LinkCreateInput

  """Contact’s X/Twitter account"""
  xLink: LinkCreateInput

  """Contact’s job title"""
  jobTitle: String

  """Contact’s phone number"""
  phone: String

  """Contact’s city"""
  city: String

  """Contact’s avatar"""
  avatarUrl: String

  """Record Position"""
  recordPosition: Float

  """Contact’s company"""
  company: ID

  """Contact’s company id foreign key"""
  companyId: ID

  """Point of Contact for Opportunities"""
  pointOfContactForOpportunities: ID

  """Activities tied to the contact"""
  activityTargets: ID

  """Favorites linked to the contact"""
  favorites: ID

  """Attachments linked to the contact."""
  attachments: ID

  """Message Participants"""
  messageParticipants: ID
  deletedAt: DateTime
}

"""A person"""
input PersonUpdateInput {
  updatedAt: DateTime
  id: ID
  createdAt: DateTime

  """Contact’s name"""
  name: FullNameUpdateInput

  """Contact’s Email"""
  email: String

  """Contact’s Linkedin account"""
  linkedinLink: LinkUpdateInput

  """Contact’s X/Twitter account"""
  xLink: LinkUpdateInput

  """Contact’s job title"""
  jobTitle: String

  """Contact’s phone number"""
  phone: String

  """Contact’s city"""
  city: String

  """Contact’s avatar"""
  avatarUrl: String

  """Record Position"""
  recordPosition: Float

  """Contact’s company"""
  company: ID

  """Contact’s company id foreign key"""
  companyId: ID

  """Point of Contact for Opportunities"""
  pointOfContactForOpportunities: ID

  """Activities tied to the contact"""
  activityTargets: ID

  """Favorites linked to the contact"""
  favorites: ID

  """Attachments linked to the contact."""
  attachments: ID

  """Message Participants"""
  messageParticipants: ID
  deletedAt: DateTime
}

"""A person"""
input PersonFilterInput {
  updatedAt: DateFilter
  id: UUIDFilter
  createdAt: DateFilter

  """Contact’s name"""
  name: FullNameFilterInput

  """Contact’s Email"""
  email: StringFilter

  """Contact’s Linkedin account"""
  linkedinLink: LinkFilterInput

  """Contact’s X/Twitter account"""
  xLink: LinkFilterInput

  """Contact’s job title"""
  jobTitle: StringFilter

  """Contact’s phone number"""
  phone: StringFilter

  """Contact’s city"""
  city: StringFilter

  """Contact’s avatar"""
  avatarUrl: StringFilter

  """Record Position"""
  recordPosition: FloatFilter

  """Contact’s company id foreign key"""
  companyId: UUIDFilter
  deletedAt: DateFilter
  and: [PersonFilterInput]
  or: [PersonFilterInput]
  not: PersonFilterInput
}

"""A person"""
input PersonOrderByInput {
  updatedAt: OrderByDirection
  id: OrderByDirection
  createdAt: OrderByDirection

  """Contact’s name"""
  name: FullNameOrderByInput

  """Contact’s Email"""
  email: OrderByDirection

  """Contact’s Linkedin account"""
  linkedinLink: LinkOrderByInput

  """Contact’s X/Twitter account"""
  xLink: LinkOrderByInput

  """Contact’s job title"""
  jobTitle: OrderByDirection

  """Contact’s phone number"""
  phone: OrderByDirection

  """Contact’s city"""
  city: OrderByDirection

  """Contact’s avatar"""
  avatarUrl: OrderByDirection

  """Record Position"""
  recordPosition: OrderByDirection

  """Contact’s company id foreign key"""
  companyId: OrderByDirection
  deletedAt: OrderByDirection
}

"""A favorite"""
input FavoriteCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Favorite position"""
  position: Float

  """Favorite workspace member"""
  workspaceMember: ID

  """Favorite workspace member id foreign key"""
  workspaceMemberId: ID!

  """Favorite person"""
  person: ID

  """Favorite person id foreign key"""
  personId: ID

  """Favorite company"""
  company: ID

  """Favorite company id foreign key"""
  companyId: ID

  """Favorite opportunity"""
  opportunity: ID

  """Favorite opportunity id foreign key"""
  opportunityId: ID
  deletedAt: DateTime
}

"""A favorite"""
input FavoriteUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Favorite position"""
  position: Float

  """Favorite workspace member"""
  workspaceMember: ID

  """Favorite workspace member id foreign key"""
  workspaceMemberId: ID

  """Favorite person"""
  person: ID

  """Favorite person id foreign key"""
  personId: ID

  """Favorite company"""
  company: ID

  """Favorite company id foreign key"""
  companyId: ID

  """Favorite opportunity"""
  opportunity: ID

  """Favorite opportunity id foreign key"""
  opportunityId: ID
  deletedAt: DateTime
}

"""A favorite"""
input FavoriteFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """Favorite position"""
  position: FloatFilter

  """Favorite workspace member id foreign key"""
  workspaceMemberId: UUIDFilter

  """Favorite person id foreign key"""
  personId: UUIDFilter

  """Favorite company id foreign key"""
  companyId: UUIDFilter

  """Favorite opportunity id foreign key"""
  opportunityId: UUIDFilter
  deletedAt: DateFilter
  and: [FavoriteFilterInput]
  or: [FavoriteFilterInput]
  not: FavoriteFilterInput
}

"""A favorite"""
input FavoriteOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """Favorite position"""
  position: OrderByDirection

  """Favorite workspace member id foreign key"""
  workspaceMemberId: OrderByDirection

  """Favorite person id foreign key"""
  personId: OrderByDirection

  """Favorite company id foreign key"""
  companyId: OrderByDirection

  """Favorite opportunity id foreign key"""
  opportunityId: OrderByDirection
  deletedAt: OrderByDirection
}

"""An opportunity"""
input OpportunityCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """The opportunity name"""
  name: String

  """Opportunity amount"""
  amount: CurrencyCreateInput

  """Opportunity close date"""
  closeDate: DateTime

  """Opportunity probability"""
  probability: String

  """Opportunity stage"""
  stage: OpportunityStageEnum

  """Record Position"""
  recordPosition: Float

  """Opportunity pipeline step"""
  pipelineStep: ID

  """Opportunity pipeline step id foreign key"""
  pipelineStepId: ID

  """Opportunity point of contact"""
  pointOfContact: ID

  """Opportunity point of contact id foreign key"""
  pointOfContactId: ID

  """Opportunity company"""
  company: ID

  """Opportunity company id foreign key"""
  companyId: ID

  """Favorites linked to the opportunity"""
  favorites: ID

  """Activities tied to the opportunity"""
  activityTargets: ID
  deletedAt: DateTime
}

"""An opportunity"""
input OpportunityUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """The opportunity name"""
  name: String

  """Opportunity amount"""
  amount: CurrencyUpdateInput

  """Opportunity close date"""
  closeDate: DateTime

  """Opportunity probability"""
  probability: String

  """Opportunity stage"""
  stage: OpportunityStageEnum

  """Record Position"""
  recordPosition: Float

  """Opportunity pipeline step"""
  pipelineStep: ID

  """Opportunity pipeline step id foreign key"""
  pipelineStepId: ID

  """Opportunity point of contact"""
  pointOfContact: ID

  """Opportunity point of contact id foreign key"""
  pointOfContactId: ID

  """Opportunity company"""
  company: ID

  """Opportunity company id foreign key"""
  companyId: ID

  """Favorites linked to the opportunity"""
  favorites: ID

  """Activities tied to the opportunity"""
  activityTargets: ID
  deletedAt: DateTime
}

"""An opportunity"""
input OpportunityFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """The opportunity name"""
  name: StringFilter

  """Opportunity amount"""
  amount: CurrencyFilterInput

  """Opportunity close date"""
  closeDate: DateFilter

  """Opportunity probability"""
  probability: StringFilter

  """Opportunity stage"""
  stage: OpportunityStageEnumFilter

  """Record Position"""
  recordPosition: FloatFilter

  """Opportunity pipeline step id foreign key"""
  pipelineStepId: UUIDFilter

  """Opportunity point of contact id foreign key"""
  pointOfContactId: UUIDFilter

  """Opportunity company id foreign key"""
  companyId: UUIDFilter
  deletedAt: DateFilter
  and: [OpportunityFilterInput]
  or: [OpportunityFilterInput]
  not: OpportunityFilterInput
}

input OpportunityStageEnumFilter {
  eq: OpportunityStageEnum
  neq: OpportunityStageEnum
  in: [OpportunityStageEnum]
  is: FilterIs
}

"""An opportunity"""
input OpportunityOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """The opportunity name"""
  name: OrderByDirection

  """Opportunity amount"""
  amount: CurrencyOrderByInput

  """Opportunity close date"""
  closeDate: OrderByDirection

  """Opportunity probability"""
  probability: OrderByDirection

  """Opportunity stage"""
  stage: OrderByDirection

  """Record Position"""
  recordPosition: OrderByDirection

  """Opportunity pipeline step id foreign key"""
  pipelineStepId: OrderByDirection

  """Opportunity point of contact id foreign key"""
  pointOfContactId: OrderByDirection

  """Opportunity company id foreign key"""
  companyId: OrderByDirection
  deletedAt: OrderByDirection
}

"""A pipeline step"""
input PipelineStepCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Pipeline Step name"""
  name: String

  """Pipeline Step color"""
  color: String

  """Pipeline Step position"""
  position: Float

  """Opportunities linked to the step."""
  opportunities: ID
  deletedAt: DateTime
}

"""A pipeline step"""
input PipelineStepUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Pipeline Step name"""
  name: String

  """Pipeline Step color"""
  color: String

  """Pipeline Step position"""
  position: Float

  """Opportunities linked to the step."""
  opportunities: ID
  deletedAt: DateTime
}

"""A pipeline step"""
input PipelineStepFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """Pipeline Step name"""
  name: StringFilter

  """Pipeline Step color"""
  color: StringFilter

  """Pipeline Step position"""
  position: FloatFilter
  deletedAt: DateFilter
  and: [PipelineStepFilterInput]
  or: [PipelineStepFilterInput]
  not: PipelineStepFilterInput
}

"""A pipeline step"""
input PipelineStepOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """Pipeline Step name"""
  name: OrderByDirection

  """Pipeline Step color"""
  color: OrderByDirection

  """Pipeline Step position"""
  position: OrderByDirection
  deletedAt: OrderByDirection
}

"""(System) View Fields"""
input ViewFieldCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """View Field target field"""
  fieldMetadataId: ID!

  """View Field visibility"""
  isVisible: Boolean

  """View Field size"""
  size: Float

  """View Field position"""
  position: Float

  """View Field related view"""
  view: ID

  """View Field related view id foreign key"""
  viewId: ID
  deletedAt: DateTime
}

"""(System) View Fields"""
input ViewFieldUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """View Field target field"""
  fieldMetadataId: ID

  """View Field visibility"""
  isVisible: Boolean

  """View Field size"""
  size: Float

  """View Field position"""
  position: Float

  """View Field related view"""
  view: ID

  """View Field related view id foreign key"""
  viewId: ID
  deletedAt: DateTime
}

"""(System) View Fields"""
input ViewFieldFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """View Field target field"""
  fieldMetadataId: UUIDFilter

  """View Field visibility"""
  isVisible: BooleanFilter

  """View Field size"""
  size: FloatFilter

  """View Field position"""
  position: FloatFilter

  """View Field related view id foreign key"""
  viewId: UUIDFilter
  deletedAt: DateFilter
  and: [ViewFieldFilterInput]
  or: [ViewFieldFilterInput]
  not: ViewFieldFilterInput
}

"""(System) View Fields"""
input ViewFieldOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """View Field target field"""
  fieldMetadataId: OrderByDirection

  """View Field visibility"""
  isVisible: OrderByDirection

  """View Field size"""
  size: OrderByDirection

  """View Field position"""
  position: OrderByDirection

  """View Field related view id foreign key"""
  viewId: OrderByDirection
  deletedAt: OrderByDirection
}

"""(System) View Filters"""
input ViewFilterCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """View Filter target field"""
  fieldMetadataId: ID!

  """View Filter operand"""
  operand: String

  """View Filter value"""
  value: String

  """View Filter Display Value"""
  displayValue: String

  """View Filter related view"""
  view: ID

  """View Filter related view id foreign key"""
  viewId: ID
  deletedAt: DateTime
}

"""(System) View Filters"""
input ViewFilterUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """View Filter target field"""
  fieldMetadataId: ID

  """View Filter operand"""
  operand: String

  """View Filter value"""
  value: String

  """View Filter Display Value"""
  displayValue: String

  """View Filter related view"""
  view: ID

  """View Filter related view id foreign key"""
  viewId: ID
  deletedAt: DateTime
}

"""(System) View Filters"""
input ViewFilterFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """View Filter target field"""
  fieldMetadataId: UUIDFilter

  """View Filter operand"""
  operand: StringFilter

  """View Filter value"""
  value: StringFilter

  """View Filter Display Value"""
  displayValue: StringFilter

  """View Filter related view id foreign key"""
  viewId: UUIDFilter
  deletedAt: DateFilter
  and: [ViewFilterFilterInput]
  or: [ViewFilterFilterInput]
  not: ViewFilterFilterInput
}

"""(System) View Filters"""
input ViewFilterOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """View Filter target field"""
  fieldMetadataId: OrderByDirection

  """View Filter operand"""
  operand: OrderByDirection

  """View Filter value"""
  value: OrderByDirection

  """View Filter Display Value"""
  displayValue: OrderByDirection

  """View Filter related view id foreign key"""
  viewId: OrderByDirection
  deletedAt: OrderByDirection
}

"""(System) View Sorts"""
input ViewSortCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """View Sort target field"""
  fieldMetadataId: ID!

  """View Sort direction"""
  direction: String

  """View Sort related view"""
  view: ID

  """View Sort related view id foreign key"""
  viewId: ID
  deletedAt: DateTime
}

"""(System) View Sorts"""
input ViewSortUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """View Sort target field"""
  fieldMetadataId: ID

  """View Sort direction"""
  direction: String

  """View Sort related view"""
  view: ID

  """View Sort related view id foreign key"""
  viewId: ID
  deletedAt: DateTime
}

"""(System) View Sorts"""
input ViewSortFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """View Sort target field"""
  fieldMetadataId: UUIDFilter

  """View Sort direction"""
  direction: StringFilter

  """View Sort related view id foreign key"""
  viewId: UUIDFilter
  deletedAt: DateFilter
  and: [ViewSortFilterInput]
  or: [ViewSortFilterInput]
  not: ViewSortFilterInput
}

"""(System) View Sorts"""
input ViewSortOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """View Sort target field"""
  fieldMetadataId: OrderByDirection

  """View Sort direction"""
  direction: OrderByDirection

  """View Sort related view id foreign key"""
  viewId: OrderByDirection
  deletedAt: OrderByDirection
}

"""(System) Views"""
input ViewCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """View name"""
  name: String

  """View target object"""
  objectMetadataId: ID!

  """View type"""
  type: String

  """View Fields"""
  viewFields: ID

  """View Filters"""
  viewFilters: ID

  """View Sorts"""
  viewSorts: ID
  deletedAt: DateTime
}

"""(System) Views"""
input ViewUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """View name"""
  name: String

  """View target object"""
  objectMetadataId: ID

  """View type"""
  type: String

  """View Fields"""
  viewFields: ID

  """View Filters"""
  viewFilters: ID

  """View Sorts"""
  viewSorts: ID
  deletedAt: DateTime
}

"""(System) Views"""
input ViewFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """View name"""
  name: StringFilter

  """View target object"""
  objectMetadataId: UUIDFilter

  """View type"""
  type: StringFilter
  deletedAt: DateFilter
  and: [ViewFilterInput]
  or: [ViewFilterInput]
  not: ViewFilterInput
}

"""(System) Views"""
input ViewOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """View name"""
  name: OrderByDirection

  """View target object"""
  objectMetadataId: OrderByDirection

  """View type"""
  type: OrderByDirection
  deletedAt: OrderByDirection
}

"""A webhook"""
input WebhookCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Webhook target url"""
  targetUrl: String

  """Webhook operation"""
  operation: String
  deletedAt: DateTime
}

"""A webhook"""
input WebhookUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Webhook target url"""
  targetUrl: String

  """Webhook operation"""
  operation: String
  deletedAt: DateTime
}

"""A webhook"""
input WebhookFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """Webhook target url"""
  targetUrl: StringFilter

  """Webhook operation"""
  operation: StringFilter
  deletedAt: DateFilter
  and: [WebhookFilterInput]
  or: [WebhookFilterInput]
  not: WebhookFilterInput
}

"""A webhook"""
input WebhookOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """Webhook target url"""
  targetUrl: OrderByDirection

  """Webhook operation"""
  operation: OrderByDirection
  deletedAt: OrderByDirection
}

"""A workspace member"""
input WorkspaceMemberCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Workspace member name"""
  name: FullNameCreateInput

  """Preferred color scheme"""
  colorScheme: String

  """Preferred language"""
  locale: String

  """Workspace member avatar"""
  avatarUrl: String

  """Related user email address"""
  userEmail: String

  """Associated User Id"""
  userId: ID!

  """Activities created by the workspace member"""
  authoredActivities: ID

  """Activities assigned to the workspace member"""
  assignedActivities: ID

  """Favorites linked to the workspace member"""
  favorites: ID

  """Account owner for companies"""
  accountOwnerForCompanies: ID

  """Attachments created by the workspace member"""
  authoredAttachments: ID

  """Authored comments"""
  authoredComments: ID

  """Connected accounts"""
  connectedAccounts: ID

  """Message Participants"""
  messageParticipants: ID
  deletedAt: DateTime
}

"""A workspace member"""
input WorkspaceMemberUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Workspace member name"""
  name: FullNameUpdateInput

  """Preferred color scheme"""
  colorScheme: String

  """Preferred language"""
  locale: String

  """Workspace member avatar"""
  avatarUrl: String

  """Related user email address"""
  userEmail: String

  """Associated User Id"""
  userId: ID

  """Activities created by the workspace member"""
  authoredActivities: ID

  """Activities assigned to the workspace member"""
  assignedActivities: ID

  """Favorites linked to the workspace member"""
  favorites: ID

  """Account owner for companies"""
  accountOwnerForCompanies: ID

  """Attachments created by the workspace member"""
  authoredAttachments: ID

  """Authored comments"""
  authoredComments: ID

  """Connected accounts"""
  connectedAccounts: ID

  """Message Participants"""
  messageParticipants: ID
  deletedAt: DateTime
}

"""A workspace member"""
input WorkspaceMemberFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """Workspace member name"""
  name: FullNameFilterInput

  """Preferred color scheme"""
  colorScheme: StringFilter

  """Preferred language"""
  locale: StringFilter

  """Workspace member avatar"""
  avatarUrl: StringFilter

  """Related user email address"""
  userEmail: StringFilter

  """Associated User Id"""
  userId: UUIDFilter
  deletedAt: DateFilter
  and: [WorkspaceMemberFilterInput]
  or: [WorkspaceMemberFilterInput]
  not: WorkspaceMemberFilterInput
}

"""A workspace member"""
input WorkspaceMemberOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """Workspace member name"""
  name: FullNameOrderByInput

  """Preferred color scheme"""
  colorScheme: OrderByDirection

  """Preferred language"""
  locale: OrderByDirection

  """Workspace member avatar"""
  avatarUrl: OrderByDirection

  """Related user email address"""
  userEmail: OrderByDirection

  """Associated User Id"""
  userId: OrderByDirection
  deletedAt: OrderByDirection
}

"""Message Thread"""
input MessageThreadCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Messages from the thread."""
  messages: ID

  """Messages from the channel."""
  messageChannelMessageAssociations: ID
  deletedAt: DateTime
}

"""Message Thread"""
input MessageThreadUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Messages from the thread."""
  messages: ID

  """Messages from the channel."""
  messageChannelMessageAssociations: ID
  deletedAt: DateTime
}

"""Message Thread"""
input MessageThreadFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter
  deletedAt: DateFilter
  and: [MessageThreadFilterInput]
  or: [MessageThreadFilterInput]
  not: MessageThreadFilterInput
}

"""Message Thread"""
input MessageThreadOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection
  deletedAt: OrderByDirection
}

"""Message"""
input MessageCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Message id from the message header"""
  headerMessageId: String

  """Message Thread Id"""
  messageThread: ID

  """Message Thread Id id foreign key"""
  messageThreadId: ID

  """Message Direction"""
  direction: MessageDirectionEnum

  """Subject"""
  subject: String

  """Text"""
  text: String

  """Html"""
  html: String

  """The date the message was received"""
  receivedAt: DateTime

  """Message Participants"""
  messageParticipants: ID

  """Messages from the channel."""
  messageChannelMessageAssociations: ID
  deletedAt: DateTime
}

"""Message"""
input MessageUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Message id from the message header"""
  headerMessageId: String

  """Message Thread Id"""
  messageThread: ID

  """Message Thread Id id foreign key"""
  messageThreadId: ID

  """Message Direction"""
  direction: MessageDirectionEnum

  """Subject"""
  subject: String

  """Text"""
  text: String

  """Html"""
  html: String

  """The date the message was received"""
  receivedAt: DateTime

  """Message Participants"""
  messageParticipants: ID

  """Messages from the channel."""
  messageChannelMessageAssociations: ID
  deletedAt: DateTime
}

"""Message"""
input MessageFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """Message id from the message header"""
  headerMessageId: StringFilter

  """Message Thread Id id foreign key"""
  messageThreadId: UUIDFilter

  """Message Direction"""
  direction: MessageDirectionEnumFilter

  """Subject"""
  subject: StringFilter

  """Text"""
  text: StringFilter

  """Html"""
  html: StringFilter

  """The date the message was received"""
  receivedAt: DateFilter
  deletedAt: DateFilter
  and: [MessageFilterInput]
  or: [MessageFilterInput]
  not: MessageFilterInput
}

input MessageDirectionEnumFilter {
  eq: MessageDirectionEnum
  neq: MessageDirectionEnum
  in: [MessageDirectionEnum]
  is: FilterIs
}

"""Message"""
input MessageOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """Message id from the message header"""
  headerMessageId: OrderByDirection

  """Message Thread Id id foreign key"""
  messageThreadId: OrderByDirection

  """Message Direction"""
  direction: OrderByDirection

  """Subject"""
  subject: OrderByDirection

  """Text"""
  text: OrderByDirection

  """Html"""
  html: OrderByDirection

  """The date the message was received"""
  receivedAt: OrderByDirection
  deletedAt: OrderByDirection
}

"""Message Channels"""
input MessageChannelCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Visibility"""
  visibility: MessageChannelVisibilityEnum

  """Handle"""
  handle: String

  """Connected Account"""
  connectedAccount: ID

  """Connected Account id foreign key"""
  connectedAccountId: ID!

  """Channel Type"""
  type: MessageChannelTypeEnum

  """Messages from the channel."""
  messageChannelMessageAssociations: ID
  deletedAt: DateTime
}

"""Message Channels"""
input MessageChannelUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Visibility"""
  visibility: MessageChannelVisibilityEnum

  """Handle"""
  handle: String

  """Connected Account"""
  connectedAccount: ID

  """Connected Account id foreign key"""
  connectedAccountId: ID

  """Channel Type"""
  type: MessageChannelTypeEnum

  """Messages from the channel."""
  messageChannelMessageAssociations: ID
  deletedAt: DateTime
}

"""Message Channels"""
input MessageChannelFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """Visibility"""
  visibility: MessageChannelVisibilityEnumFilter

  """Handle"""
  handle: StringFilter

  """Connected Account id foreign key"""
  connectedAccountId: UUIDFilter

  """Channel Type"""
  type: MessageChannelTypeEnumFilter
  deletedAt: DateFilter
  and: [MessageChannelFilterInput]
  or: [MessageChannelFilterInput]
  not: MessageChannelFilterInput
}

input MessageChannelVisibilityEnumFilter {
  eq: MessageChannelVisibilityEnum
  neq: MessageChannelVisibilityEnum
  in: [MessageChannelVisibilityEnum]
  is: FilterIs
}

input MessageChannelTypeEnumFilter {
  eq: MessageChannelTypeEnum
  neq: MessageChannelTypeEnum
  in: [MessageChannelTypeEnum]
  is: FilterIs
}

"""Message Channels"""
input MessageChannelOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """Visibility"""
  visibility: OrderByDirection

  """Handle"""
  handle: OrderByDirection

  """Connected Account id foreign key"""
  connectedAccountId: OrderByDirection

  """Channel Type"""
  type: OrderByDirection
  deletedAt: OrderByDirection
}

"""Message Participants"""
input MessageParticipantCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Message"""
  message: ID

  """Message id foreign key"""
  messageId: ID!

  """Role"""
  role: MessageParticipantRoleEnum

  """Handle"""
  handle: String

  """Display Name"""
  displayName: String

  """Person"""
  person: ID

  """Person id foreign key"""
  personId: ID

  """Workspace member"""
  workspaceMember: ID

  """Workspace member id foreign key"""
  workspaceMemberId: ID
  deletedAt: DateTime
}

"""Message Participants"""
input MessageParticipantUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Message"""
  message: ID

  """Message id foreign key"""
  messageId: ID

  """Role"""
  role: MessageParticipantRoleEnum

  """Handle"""
  handle: String

  """Display Name"""
  displayName: String

  """Person"""
  person: ID

  """Person id foreign key"""
  personId: ID

  """Workspace member"""
  workspaceMember: ID

  """Workspace member id foreign key"""
  workspaceMemberId: ID
  deletedAt: DateTime
}

"""Message Participants"""
input MessageParticipantFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """Message id foreign key"""
  messageId: UUIDFilter

  """Role"""
  role: MessageParticipantRoleEnumFilter

  """Handle"""
  handle: StringFilter

  """Display Name"""
  displayName: StringFilter

  """Person id foreign key"""
  personId: UUIDFilter

  """Workspace member id foreign key"""
  workspaceMemberId: UUIDFilter
  deletedAt: DateFilter
  and: [MessageParticipantFilterInput]
  or: [MessageParticipantFilterInput]
  not: MessageParticipantFilterInput
}

input MessageParticipantRoleEnumFilter {
  eq: MessageParticipantRoleEnum
  neq: MessageParticipantRoleEnum
  in: [MessageParticipantRoleEnum]
  is: FilterIs
}

"""Message Participants"""
input MessageParticipantOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """Message id foreign key"""
  messageId: OrderByDirection

  """Role"""
  role: OrderByDirection

  """Handle"""
  handle: OrderByDirection

  """Display Name"""
  displayName: OrderByDirection

  """Person id foreign key"""
  personId: OrderByDirection

  """Workspace member id foreign key"""
  workspaceMemberId: OrderByDirection
  deletedAt: OrderByDirection
}

"""Message Synced with a Message Channel"""
input MessageChannelMessageAssociationCreateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Message Channel Id"""
  messageChannel: ID

  """Message Channel Id id foreign key"""
  messageChannelId: ID

  """Message Id"""
  message: ID

  """Message Id id foreign key"""
  messageId: ID

  """Message id from the messaging provider"""
  messageExternalId: String

  """Message Thread Id"""
  messageThread: ID

  """Message Thread Id id foreign key"""
  messageThreadId: ID

  """Thread id from the messaging provider"""
  messageThreadExternalId: String
  deletedAt: DateTime
}

"""Message Synced with a Message Channel"""
input MessageChannelMessageAssociationUpdateInput {
  id: ID
  createdAt: DateTime
  updatedAt: DateTime

  """Message Channel Id"""
  messageChannel: ID

  """Message Channel Id id foreign key"""
  messageChannelId: ID

  """Message Id"""
  message: ID

  """Message Id id foreign key"""
  messageId: ID

  """Message id from the messaging provider"""
  messageExternalId: String

  """Message Thread Id"""
  messageThread: ID

  """Message Thread Id id foreign key"""
  messageThreadId: ID

  """Thread id from the messaging provider"""
  messageThreadExternalId: String
  deletedAt: DateTime
}

"""Message Synced with a Message Channel"""
input MessageChannelMessageAssociationFilterInput {
  id: UUIDFilter
  createdAt: DateFilter
  updatedAt: DateFilter

  """Message Channel Id id foreign key"""
  messageChannelId: UUIDFilter

  """Message Id id foreign key"""
  messageId: UUIDFilter

  """Message id from the messaging provider"""
  messageExternalId: StringFilter

  """Message Thread Id id foreign key"""
  messageThreadId: UUIDFilter

  """Thread id from the messaging provider"""
  messageThreadExternalId: StringFilter
  deletedAt: DateFilter
  and: [MessageChannelMessageAssociationFilterInput]
  or: [MessageChannelMessageAssociationFilterInput]
  not: MessageChannelMessageAssociationFilterInput
}

"""Message Synced with a Message Channel"""
input MessageChannelMessageAssociationOrderByInput {
  id: OrderByDirection
  createdAt: OrderByDirection
  updatedAt: OrderByDirection

  """Message Channel Id id foreign key"""
  messageChannelId: OrderByDirection

  """Message Id id foreign key"""
  messageId: OrderByDirection

  """Message id from the messaging provider"""
  messageExternalId: OrderByDirection

  """Message Thread Id id foreign key"""
  messageThreadId: OrderByDirection

  """Thread id from the messaging provider"""
  messageThreadExternalId: OrderByDirection
  deletedAt: OrderByDirection
}`,
  ],
});
