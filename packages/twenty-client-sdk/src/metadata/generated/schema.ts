// @ts-nocheck
export type Scalars = {
    String: string,
    UUID: string,
    DateTime: string,
    Boolean: boolean,
    Float: number,
    JSON: Record<string, unknown>,
    Int: number,
    ConnectionCursor: any,
    JSONObject: any,
    ID: string,
    Upload: File,
}

export type BillingProductDTO = (BillingLicensedProduct | BillingMeteredProduct) & { __isUnion?: true }

export interface ApiKey {
    id: Scalars['UUID']
    name: Scalars['String']
    expiresAt: Scalars['DateTime']
    revokedAt?: Scalars['DateTime']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    role: Role
    __typename: 'ApiKey'
}

export interface ApplicationRegistrationVariable {
    id: Scalars['UUID']
    key: Scalars['String']
    description: Scalars['String']
    isSecret: Scalars['Boolean']
    isRequired: Scalars['Boolean']
    isFilled: Scalars['Boolean']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'ApplicationRegistrationVariable'
}

export interface ApplicationRegistration {
    id: Scalars['UUID']
    universalIdentifier: Scalars['String']
    name: Scalars['String']
    oAuthClientId: Scalars['String']
    oAuthRedirectUris: Scalars['String'][]
    oAuthScopes: Scalars['String'][]
    ownerWorkspaceId?: Scalars['UUID']
    sourceType: ApplicationRegistrationSourceType
    sourcePackage?: Scalars['String']
    latestAvailableVersion?: Scalars['String']
    isListed: Scalars['Boolean']
    isFeatured: Scalars['Boolean']
    logoUrl?: Scalars['String']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'ApplicationRegistration'
}

export type ApplicationRegistrationSourceType = 'NPM' | 'TARBALL' | 'LOCAL' | 'OAUTH_ONLY'

export interface TwoFactorAuthenticationMethodSummary {
    twoFactorAuthenticationMethodId: Scalars['UUID']
    status: Scalars['String']
    strategy: Scalars['String']
    __typename: 'TwoFactorAuthenticationMethodSummary'
}

export interface RowLevelPermissionPredicateGroup {
    id: Scalars['String']
    parentRowLevelPermissionPredicateGroupId?: Scalars['String']
    logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator
    positionInRowLevelPermissionPredicateGroup?: Scalars['Float']
    roleId: Scalars['String']
    objectMetadataId: Scalars['String']
    __typename: 'RowLevelPermissionPredicateGroup'
}

export type RowLevelPermissionPredicateGroupLogicalOperator = 'AND' | 'OR'

export interface RowLevelPermissionPredicate {
    id: Scalars['String']
    fieldMetadataId: Scalars['String']
    objectMetadataId: Scalars['String']
    operand: RowLevelPermissionPredicateOperand
    subFieldName?: Scalars['String']
    workspaceMemberFieldMetadataId?: Scalars['String']
    workspaceMemberSubFieldName?: Scalars['String']
    rowLevelPermissionPredicateGroupId?: Scalars['String']
    positionInRowLevelPermissionPredicateGroup?: Scalars['Float']
    roleId: Scalars['String']
    value?: Scalars['JSON']
    __typename: 'RowLevelPermissionPredicate'
}

export type RowLevelPermissionPredicateOperand = 'IS' | 'IS_NOT_NULL' | 'IS_NOT' | 'LESS_THAN_OR_EQUAL' | 'GREATER_THAN_OR_EQUAL' | 'IS_BEFORE' | 'IS_AFTER' | 'CONTAINS' | 'DOES_NOT_CONTAIN' | 'IS_EMPTY' | 'IS_NOT_EMPTY' | 'IS_RELATIVE' | 'IS_IN_PAST' | 'IS_IN_FUTURE' | 'IS_TODAY' | 'VECTOR_SEARCH'

export interface ObjectPermission {
    objectMetadataId: Scalars['UUID']
    canReadObjectRecords?: Scalars['Boolean']
    canUpdateObjectRecords?: Scalars['Boolean']
    canSoftDeleteObjectRecords?: Scalars['Boolean']
    canDestroyObjectRecords?: Scalars['Boolean']
    restrictedFields?: Scalars['JSON']
    rowLevelPermissionPredicates?: RowLevelPermissionPredicate[]
    rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroup[]
    __typename: 'ObjectPermission'
}

export interface UserWorkspace {
    id: Scalars['UUID']
    user: User
    userId: Scalars['UUID']
    locale: Scalars['String']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    permissionFlags?: PermissionFlagType[]
    objectPermissions?: ObjectPermission[]
    objectsPermissions?: ObjectPermission[]
    twoFactorAuthenticationMethodSummary?: TwoFactorAuthenticationMethodSummary[]
    __typename: 'UserWorkspace'
}

export type PermissionFlagType = 'API_KEYS_AND_WEBHOOKS' | 'WORKSPACE' | 'WORKSPACE_MEMBERS' | 'ROLES' | 'DATA_MODEL' | 'SECURITY' | 'WORKFLOWS' | 'IMPERSONATE' | 'SSO_BYPASS' | 'APPLICATIONS' | 'MARKETPLACE_APPS' | 'LAYOUTS' | 'BILLING' | 'AI_SETTINGS' | 'AI' | 'VIEWS' | 'UPLOAD_FILE' | 'DOWNLOAD_FILE' | 'SEND_EMAIL_TOOL' | 'HTTP_REQUEST_TOOL' | 'CODE_INTERPRETER_TOOL' | 'IMPORT_CSV' | 'EXPORT_CSV' | 'CONNECTED_ACCOUNTS' | 'PROFILE_INFORMATION'

export interface FullName {
    firstName: Scalars['String']
    lastName: Scalars['String']
    __typename: 'FullName'
}

export interface WorkspaceMember {
    id: Scalars['UUID']
    name: FullName
    userEmail: Scalars['String']
    colorScheme: Scalars['String']
    avatarUrl?: Scalars['String']
    locale?: Scalars['String']
    calendarStartDay?: Scalars['Int']
    timeZone?: Scalars['String']
    dateFormat?: WorkspaceMemberDateFormatEnum
    timeFormat?: WorkspaceMemberTimeFormatEnum
    roles?: Role[]
    userWorkspaceId?: Scalars['UUID']
    numberFormat?: WorkspaceMemberNumberFormatEnum
    __typename: 'WorkspaceMember'
}


/** Date format as Month first, Day first, Year first or system as default */
export type WorkspaceMemberDateFormatEnum = 'SYSTEM' | 'MONTH_FIRST' | 'DAY_FIRST' | 'YEAR_FIRST'


/** Time time as Military, Standard or system as default */
export type WorkspaceMemberTimeFormatEnum = 'SYSTEM' | 'HOUR_12' | 'HOUR_24'


/** Number format for displaying numbers */
export type WorkspaceMemberNumberFormatEnum = 'SYSTEM' | 'COMMAS_AND_DOT' | 'SPACES_AND_COMMA' | 'DOTS_AND_COMMA' | 'APOSTROPHE_AND_DOT'

export interface Agent {
    id: Scalars['UUID']
    name: Scalars['String']
    label: Scalars['String']
    icon?: Scalars['String']
    description?: Scalars['String']
    prompt: Scalars['String']
    modelId: Scalars['String']
    responseFormat?: Scalars['JSON']
    roleId?: Scalars['UUID']
    isCustom: Scalars['Boolean']
    applicationId?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    modelConfiguration?: Scalars['JSON']
    evaluationInputs: Scalars['String'][]
    __typename: 'Agent'
}

export interface FieldPermission {
    id: Scalars['UUID']
    objectMetadataId: Scalars['UUID']
    fieldMetadataId: Scalars['UUID']
    roleId: Scalars['UUID']
    canReadFieldValue?: Scalars['Boolean']
    canUpdateFieldValue?: Scalars['Boolean']
    __typename: 'FieldPermission'
}

export interface PermissionFlag {
    id: Scalars['UUID']
    roleId: Scalars['UUID']
    flag: PermissionFlagType
    __typename: 'PermissionFlag'
}

export interface ApiKeyForRole {
    id: Scalars['UUID']
    name: Scalars['String']
    expiresAt: Scalars['DateTime']
    revokedAt?: Scalars['DateTime']
    __typename: 'ApiKeyForRole'
}

export interface Role {
    id: Scalars['UUID']
    universalIdentifier?: Scalars['UUID']
    label: Scalars['String']
    description?: Scalars['String']
    icon?: Scalars['String']
    isEditable: Scalars['Boolean']
    canBeAssignedToUsers: Scalars['Boolean']
    canBeAssignedToAgents: Scalars['Boolean']
    canBeAssignedToApiKeys: Scalars['Boolean']
    workspaceMembers: WorkspaceMember[]
    agents: Agent[]
    apiKeys: ApiKeyForRole[]
    canUpdateAllSettings: Scalars['Boolean']
    canAccessAllTools: Scalars['Boolean']
    canReadAllObjectRecords: Scalars['Boolean']
    canUpdateAllObjectRecords: Scalars['Boolean']
    canSoftDeleteAllObjectRecords: Scalars['Boolean']
    canDestroyAllObjectRecords: Scalars['Boolean']
    permissionFlags?: PermissionFlag[]
    objectPermissions?: ObjectPermission[]
    fieldPermissions?: FieldPermission[]
    rowLevelPermissionPredicates?: RowLevelPermissionPredicate[]
    rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroup[]
    __typename: 'Role'
}

export interface ApplicationRegistrationSummary {
    id: Scalars['UUID']
    latestAvailableVersion?: Scalars['String']
    sourceType: ApplicationRegistrationSourceType
    logoUrl?: Scalars['String']
    __typename: 'ApplicationRegistrationSummary'
}

export interface ApplicationVariable {
    id: Scalars['UUID']
    key: Scalars['String']
    value: Scalars['String']
    description: Scalars['String']
    isSecret: Scalars['Boolean']
    __typename: 'ApplicationVariable'
}

export interface LogicFunction {
    id: Scalars['UUID']
    name: Scalars['String']
    description?: Scalars['String']
    runtime: Scalars['String']
    timeoutSeconds: Scalars['Float']
    sourceHandlerPath: Scalars['String']
    handlerName: Scalars['String']
    toolInputSchema?: Scalars['JSON']
    isTool: Scalars['Boolean']
    cronTriggerSettings?: Scalars['JSON']
    databaseEventTriggerSettings?: Scalars['JSON']
    httpRouteTriggerSettings?: Scalars['JSON']
    applicationId?: Scalars['UUID']
    universalIdentifier?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'LogicFunction'
}

export interface StandardOverrides {
    label?: Scalars['String']
    description?: Scalars['String']
    icon?: Scalars['String']
    translations?: Scalars['JSON']
    __typename: 'StandardOverrides'
}

export interface Field {
    id: Scalars['UUID']
    universalIdentifier: Scalars['String']
    type: FieldMetadataType
    name: Scalars['String']
    label: Scalars['String']
    description?: Scalars['String']
    icon?: Scalars['String']
    standardOverrides?: StandardOverrides
    isCustom?: Scalars['Boolean']
    isActive?: Scalars['Boolean']
    isSystem?: Scalars['Boolean']
    isUIReadOnly?: Scalars['Boolean']
    isNullable?: Scalars['Boolean']
    isUnique?: Scalars['Boolean']
    defaultValue?: Scalars['JSON']
    options?: Scalars['JSON']
    settings?: Scalars['JSON']
    objectMetadataId: Scalars['UUID']
    isLabelSyncedWithName?: Scalars['Boolean']
    morphId?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    applicationId: Scalars['UUID']
    relation?: Relation
    morphRelations?: Relation[]
    object?: Object
    __typename: 'Field'
}


/** Type of the field */
export type FieldMetadataType = 'ACTOR' | 'ADDRESS' | 'ARRAY' | 'BOOLEAN' | 'CURRENCY' | 'DATE' | 'DATE_TIME' | 'EMAILS' | 'FILES' | 'FULL_NAME' | 'LINKS' | 'MORPH_RELATION' | 'MULTI_SELECT' | 'NUMBER' | 'NUMERIC' | 'PHONES' | 'POSITION' | 'RATING' | 'RAW_JSON' | 'RELATION' | 'RICH_TEXT' | 'SELECT' | 'TEXT' | 'TS_VECTOR' | 'UUID'

export interface IndexField {
    id: Scalars['UUID']
    fieldMetadataId: Scalars['UUID']
    order: Scalars['Float']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'IndexField'
}

export interface Index {
    id: Scalars['UUID']
    name: Scalars['String']
    isCustom?: Scalars['Boolean']
    isUnique: Scalars['Boolean']
    indexWhereClause?: Scalars['String']
    indexType: IndexType
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    indexFieldMetadataList: IndexField[]
    objectMetadata: IndexObjectMetadataConnection
    indexFieldMetadatas: IndexIndexFieldMetadatasConnection
    __typename: 'Index'
}


/** Type of the index */
export type IndexType = 'BTREE' | 'GIN'

export interface ObjectStandardOverrides {
    labelSingular?: Scalars['String']
    labelPlural?: Scalars['String']
    description?: Scalars['String']
    icon?: Scalars['String']
    color?: Scalars['String']
    translations?: Scalars['JSON']
    __typename: 'ObjectStandardOverrides'
}

export interface Object {
    id: Scalars['UUID']
    universalIdentifier: Scalars['String']
    nameSingular: Scalars['String']
    namePlural: Scalars['String']
    labelSingular: Scalars['String']
    labelPlural: Scalars['String']
    description?: Scalars['String']
    icon?: Scalars['String']
    standardOverrides?: ObjectStandardOverrides
    shortcut?: Scalars['String']
    color?: Scalars['String']
    isCustom: Scalars['Boolean']
    isRemote: Scalars['Boolean']
    isActive: Scalars['Boolean']
    isSystem: Scalars['Boolean']
    isUIReadOnly: Scalars['Boolean']
    isSearchable: Scalars['Boolean']
    applicationId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    labelIdentifierFieldMetadataId?: Scalars['UUID']
    imageIdentifierFieldMetadataId?: Scalars['UUID']
    isLabelSyncedWithName: Scalars['Boolean']
    duplicateCriteria?: Scalars['String'][][]
    fieldsList: Field[]
    indexMetadataList: Index[]
    fields: ObjectFieldsConnection
    indexMetadatas: ObjectIndexMetadatasConnection
    __typename: 'Object'
}

export interface Application {
    id: Scalars['UUID']
    name: Scalars['String']
    description?: Scalars['String']
    version?: Scalars['String']
    universalIdentifier: Scalars['String']
    packageJsonChecksum?: Scalars['String']
    packageJsonFileId?: Scalars['UUID']
    yarnLockChecksum?: Scalars['String']
    yarnLockFileId?: Scalars['UUID']
    availablePackages: Scalars['JSON']
    applicationRegistrationId?: Scalars['UUID']
    canBeUninstalled: Scalars['Boolean']
    defaultRoleId?: Scalars['String']
    settingsCustomTabFrontComponentId?: Scalars['UUID']
    defaultLogicFunctionRole?: Role
    agents: Agent[]
    logicFunctions: LogicFunction[]
    objects: Object[]
    applicationVariables: ApplicationVariable[]
    applicationRegistration?: ApplicationRegistrationSummary
    __typename: 'Application'
}

export interface ViewField {
    id: Scalars['UUID']
    fieldMetadataId: Scalars['UUID']
    isVisible: Scalars['Boolean']
    size: Scalars['Float']
    position: Scalars['Float']
    aggregateOperation?: AggregateOperations
    viewId: Scalars['UUID']
    viewFieldGroupId?: Scalars['UUID']
    workspaceId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    isOverridden: Scalars['Boolean']
    __typename: 'ViewField'
}

export type AggregateOperations = 'MIN' | 'MAX' | 'AVG' | 'SUM' | 'COUNT' | 'COUNT_UNIQUE_VALUES' | 'COUNT_EMPTY' | 'COUNT_NOT_EMPTY' | 'COUNT_TRUE' | 'COUNT_FALSE' | 'PERCENTAGE_EMPTY' | 'PERCENTAGE_NOT_EMPTY'

export interface ViewFilterGroup {
    id: Scalars['UUID']
    parentViewFilterGroupId?: Scalars['UUID']
    logicalOperator: ViewFilterGroupLogicalOperator
    positionInViewFilterGroup?: Scalars['Float']
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    __typename: 'ViewFilterGroup'
}

export type ViewFilterGroupLogicalOperator = 'AND' | 'OR' | 'NOT'

export interface ViewFilter {
    id: Scalars['UUID']
    fieldMetadataId: Scalars['UUID']
    operand: ViewFilterOperand
    value: Scalars['JSON']
    viewFilterGroupId?: Scalars['UUID']
    positionInViewFilterGroup?: Scalars['Float']
    subFieldName?: Scalars['String']
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    __typename: 'ViewFilter'
}

export type ViewFilterOperand = 'IS' | 'IS_NOT_NULL' | 'IS_NOT' | 'LESS_THAN_OR_EQUAL' | 'GREATER_THAN_OR_EQUAL' | 'IS_BEFORE' | 'IS_AFTER' | 'CONTAINS' | 'DOES_NOT_CONTAIN' | 'IS_EMPTY' | 'IS_NOT_EMPTY' | 'IS_RELATIVE' | 'IS_IN_PAST' | 'IS_IN_FUTURE' | 'IS_TODAY' | 'VECTOR_SEARCH'

export interface ViewGroup {
    id: Scalars['UUID']
    isVisible: Scalars['Boolean']
    fieldValue: Scalars['String']
    position: Scalars['Float']
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    __typename: 'ViewGroup'
}

export interface ViewSort {
    id: Scalars['UUID']
    fieldMetadataId: Scalars['UUID']
    direction: ViewSortDirection
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    __typename: 'ViewSort'
}

export type ViewSortDirection = 'ASC' | 'DESC'

export interface ViewFieldGroup {
    id: Scalars['UUID']
    name: Scalars['String']
    position: Scalars['Float']
    isVisible: Scalars['Boolean']
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    viewFields: ViewField[]
    isOverridden: Scalars['Boolean']
    __typename: 'ViewFieldGroup'
}

export interface View {
    id: Scalars['UUID']
    name: Scalars['String']
    objectMetadataId: Scalars['UUID']
    type: ViewType
    key?: ViewKey
    icon: Scalars['String']
    position: Scalars['Float']
    isCompact: Scalars['Boolean']
    isCustom: Scalars['Boolean']
    openRecordIn: ViewOpenRecordIn
    kanbanAggregateOperation?: AggregateOperations
    kanbanAggregateOperationFieldMetadataId?: Scalars['UUID']
    mainGroupByFieldMetadataId?: Scalars['UUID']
    shouldHideEmptyGroups: Scalars['Boolean']
    calendarFieldMetadataId?: Scalars['UUID']
    workspaceId: Scalars['UUID']
    anyFieldFilterValue?: Scalars['String']
    calendarLayout?: ViewCalendarLayout
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    viewFields: ViewField[]
    viewFilters: ViewFilter[]
    viewFilterGroups: ViewFilterGroup[]
    viewSorts: ViewSort[]
    viewGroups: ViewGroup[]
    viewFieldGroups: ViewFieldGroup[]
    visibility: ViewVisibility
    createdByUserWorkspaceId?: Scalars['UUID']
    __typename: 'View'
}

export type ViewType = 'TABLE' | 'KANBAN' | 'CALENDAR' | 'FIELDS_WIDGET'

export type ViewKey = 'INDEX'

export type ViewOpenRecordIn = 'SIDE_PANEL' | 'RECORD_PAGE'

export type ViewCalendarLayout = 'DAY' | 'WEEK' | 'MONTH'

export type ViewVisibility = 'WORKSPACE' | 'UNLISTED'

export interface Workspace {
    id: Scalars['UUID']
    displayName?: Scalars['String']
    logo?: Scalars['String']
    logoFileId?: Scalars['UUID']
    inviteHash?: Scalars['String']
    deletedAt?: Scalars['DateTime']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    allowImpersonation: Scalars['Boolean']
    isPublicInviteLinkEnabled: Scalars['Boolean']
    trashRetentionDays: Scalars['Float']
    eventLogRetentionDays: Scalars['Float']
    workspaceMembersCount?: Scalars['Float']
    activationStatus: WorkspaceActivationStatus
    views?: View[]
    viewFields?: ViewField[]
    viewFilters?: ViewFilter[]
    viewFilterGroups?: ViewFilterGroup[]
    viewGroups?: ViewGroup[]
    viewSorts?: ViewSort[]
    metadataVersion: Scalars['Float']
    databaseSchema?: Scalars['String']
    subdomain: Scalars['String']
    customDomain?: Scalars['String']
    isGoogleAuthEnabled: Scalars['Boolean']
    isGoogleAuthBypassEnabled: Scalars['Boolean']
    isTwoFactorAuthenticationEnforced: Scalars['Boolean']
    isPasswordAuthEnabled: Scalars['Boolean']
    isPasswordAuthBypassEnabled: Scalars['Boolean']
    isMicrosoftAuthEnabled: Scalars['Boolean']
    isMicrosoftAuthBypassEnabled: Scalars['Boolean']
    isCustomDomainEnabled: Scalars['Boolean']
    editableProfileFields?: Scalars['String'][]
    defaultRole?: Role
    version?: Scalars['String']
    fastModel: Scalars['String']
    smartModel: Scalars['String']
    aiAdditionalInstructions?: Scalars['String']
    enabledAiModelIds?: Scalars['String'][]
    useRecommendedModels: Scalars['Boolean']
    routerModel: Scalars['String']
    workspaceCustomApplication?: Application
    featureFlags?: FeatureFlag[]
    billingSubscriptions: BillingSubscription[]
    currentBillingSubscription?: BillingSubscription
    billingEntitlements: BillingEntitlement[]
    hasValidEnterpriseKey: Scalars['Boolean']
    hasValidSignedEnterpriseKey: Scalars['Boolean']
    hasValidEnterpriseValidityToken: Scalars['Boolean']
    workspaceUrls: WorkspaceUrls
    workspaceCustomApplicationId: Scalars['String']
    __typename: 'Workspace'
}

export type WorkspaceActivationStatus = 'ONGOING_CREATION' | 'PENDING_CREATION' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export interface AppToken {
    id: Scalars['UUID']
    type: Scalars['String']
    expiresAt: Scalars['DateTime']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'AppToken'
}

export interface User {
    id: Scalars['UUID']
    firstName: Scalars['String']
    lastName: Scalars['String']
    email: Scalars['String']
    defaultAvatarUrl?: Scalars['String']
    isEmailVerified: Scalars['Boolean']
    disabled?: Scalars['Boolean']
    canImpersonate: Scalars['Boolean']
    canAccessFullAdminPanel: Scalars['Boolean']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    locale: Scalars['String']
    workspaceMember?: WorkspaceMember
    userWorkspaces: UserWorkspace[]
    onboardingStatus?: OnboardingStatus
    currentWorkspace?: Workspace
    currentUserWorkspace?: UserWorkspace
    userVars?: Scalars['JSONObject']
    workspaceMembers?: WorkspaceMember[]
    deletedWorkspaceMembers?: DeletedWorkspaceMember[]
    hasPassword: Scalars['Boolean']
    supportUserHash?: Scalars['String']
    workspaces: UserWorkspace[]
    availableWorkspaces: AvailableWorkspaces
    __typename: 'User'
}


/** Onboarding status */
export type OnboardingStatus = 'PLAN_REQUIRED' | 'WORKSPACE_ACTIVATION' | 'PROFILE_CREATION' | 'SYNC_EMAIL' | 'INVITE_TEAM' | 'BOOK_ONBOARDING' | 'COMPLETED'

export interface RatioAggregateConfig {
    fieldMetadataId: Scalars['UUID']
    optionValue: Scalars['String']
    __typename: 'RatioAggregateConfig'
}

export interface RichTextBody {
    blocknote?: Scalars['String']
    markdown?: Scalars['String']
    __typename: 'RichTextBody'
}

export interface GridPosition {
    row: Scalars['Float']
    column: Scalars['Float']
    rowSpan: Scalars['Float']
    columnSpan: Scalars['Float']
    __typename: 'GridPosition'
}

export interface PageLayoutWidget {
    id: Scalars['UUID']
    pageLayoutTabId: Scalars['UUID']
    title: Scalars['String']
    type: WidgetType
    objectMetadataId?: Scalars['UUID']
    gridPosition: GridPosition
    position?: PageLayoutWidgetPosition
    configuration: WidgetConfiguration
    conditionalDisplay?: Scalars['JSON']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    isOverridden: Scalars['Boolean']
    __typename: 'PageLayoutWidget'
}

export type WidgetType = 'VIEW' | 'IFRAME' | 'FIELD' | 'FIELDS' | 'GRAPH' | 'STANDALONE_RICH_TEXT' | 'TIMELINE' | 'TASKS' | 'NOTES' | 'FILES' | 'EMAILS' | 'CALENDAR' | 'FIELD_RICH_TEXT' | 'WORKFLOW' | 'WORKFLOW_VERSION' | 'WORKFLOW_RUN' | 'FRONT_COMPONENT' | 'RECORD_TABLE' | 'EMAIL_THREAD'

export type PageLayoutWidgetPosition = (PageLayoutWidgetGridPosition | PageLayoutWidgetVerticalListPosition | PageLayoutWidgetCanvasPosition) & { __isUnion?: true }

export interface PageLayoutWidgetGridPosition {
    layoutMode: PageLayoutTabLayoutMode
    row: Scalars['Int']
    column: Scalars['Int']
    rowSpan: Scalars['Int']
    columnSpan: Scalars['Int']
    __typename: 'PageLayoutWidgetGridPosition'
}

export type PageLayoutTabLayoutMode = 'GRID' | 'VERTICAL_LIST' | 'CANVAS'

export interface PageLayoutWidgetVerticalListPosition {
    layoutMode: PageLayoutTabLayoutMode
    index: Scalars['Int']
    __typename: 'PageLayoutWidgetVerticalListPosition'
}

export interface PageLayoutWidgetCanvasPosition {
    layoutMode: PageLayoutTabLayoutMode
    __typename: 'PageLayoutWidgetCanvasPosition'
}

export type WidgetConfiguration = (AggregateChartConfiguration | StandaloneRichTextConfiguration | PieChartConfiguration | LineChartConfiguration | IframeConfiguration | GaugeChartConfiguration | BarChartConfiguration | CalendarConfiguration | FrontComponentConfiguration | EmailsConfiguration | EmailThreadConfiguration | FieldConfiguration | FieldRichTextConfiguration | FieldsConfiguration | FilesConfiguration | NotesConfiguration | TasksConfiguration | TimelineConfiguration | ViewConfiguration | RecordTableConfiguration | WorkflowConfiguration | WorkflowRunConfiguration | WorkflowVersionConfiguration) & { __isUnion?: true }

export interface AggregateChartConfiguration {
    configurationType: WidgetConfigurationType
    aggregateFieldMetadataId: Scalars['UUID']
    aggregateOperation: AggregateOperations
    label?: Scalars['String']
    displayDataLabel?: Scalars['Boolean']
    format?: Scalars['String']
    description?: Scalars['String']
    filter?: Scalars['JSON']
    timezone?: Scalars['String']
    firstDayOfTheWeek?: Scalars['Int']
    prefix?: Scalars['String']
    suffix?: Scalars['String']
    ratioAggregateConfig?: RatioAggregateConfig
    __typename: 'AggregateChartConfiguration'
}

export type WidgetConfigurationType = 'AGGREGATE_CHART' | 'GAUGE_CHART' | 'PIE_CHART' | 'BAR_CHART' | 'LINE_CHART' | 'IFRAME' | 'STANDALONE_RICH_TEXT' | 'VIEW' | 'FIELD' | 'FIELDS' | 'TIMELINE' | 'TASKS' | 'NOTES' | 'FILES' | 'EMAILS' | 'CALENDAR' | 'FIELD_RICH_TEXT' | 'WORKFLOW' | 'WORKFLOW_VERSION' | 'WORKFLOW_RUN' | 'FRONT_COMPONENT' | 'RECORD_TABLE' | 'EMAIL_THREAD'

export interface StandaloneRichTextConfiguration {
    configurationType: WidgetConfigurationType
    body: RichTextBody
    __typename: 'StandaloneRichTextConfiguration'
}

export interface PieChartConfiguration {
    configurationType: WidgetConfigurationType
    aggregateFieldMetadataId: Scalars['UUID']
    aggregateOperation: AggregateOperations
    groupByFieldMetadataId: Scalars['UUID']
    groupBySubFieldName?: Scalars['String']
    dateGranularity?: ObjectRecordGroupByDateGranularity
    orderBy?: GraphOrderBy
    manualSortOrder?: Scalars['String'][]
    displayDataLabel?: Scalars['Boolean']
    showCenterMetric?: Scalars['Boolean']
    displayLegend?: Scalars['Boolean']
    hideEmptyCategory?: Scalars['Boolean']
    splitMultiValueFields?: Scalars['Boolean']
    description?: Scalars['String']
    color?: Scalars['String']
    filter?: Scalars['JSON']
    timezone?: Scalars['String']
    firstDayOfTheWeek?: Scalars['Int']
    __typename: 'PieChartConfiguration'
}


/** Date granularity options (e.g. DAY, MONTH, QUARTER, YEAR, WEEK, DAY_OF_THE_WEEK, MONTH_OF_THE_YEAR, QUARTER_OF_THE_YEAR) */
export type ObjectRecordGroupByDateGranularity = 'DAY' | 'MONTH' | 'QUARTER' | 'YEAR' | 'WEEK' | 'DAY_OF_THE_WEEK' | 'MONTH_OF_THE_YEAR' | 'QUARTER_OF_THE_YEAR' | 'NONE'


/** Order by options for graph widgets */
export type GraphOrderBy = 'FIELD_ASC' | 'FIELD_DESC' | 'FIELD_POSITION_ASC' | 'FIELD_POSITION_DESC' | 'VALUE_ASC' | 'VALUE_DESC' | 'MANUAL'

export interface LineChartConfiguration {
    configurationType: WidgetConfigurationType
    aggregateFieldMetadataId: Scalars['UUID']
    aggregateOperation: AggregateOperations
    primaryAxisGroupByFieldMetadataId: Scalars['UUID']
    primaryAxisGroupBySubFieldName?: Scalars['String']
    primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity
    primaryAxisOrderBy?: GraphOrderBy
    primaryAxisManualSortOrder?: Scalars['String'][]
    secondaryAxisGroupByFieldMetadataId?: Scalars['UUID']
    secondaryAxisGroupBySubFieldName?: Scalars['String']
    secondaryAxisGroupByDateGranularity?: ObjectRecordGroupByDateGranularity
    secondaryAxisOrderBy?: GraphOrderBy
    secondaryAxisManualSortOrder?: Scalars['String'][]
    omitNullValues?: Scalars['Boolean']
    splitMultiValueFields?: Scalars['Boolean']
    axisNameDisplay?: AxisNameDisplay
    displayDataLabel?: Scalars['Boolean']
    displayLegend?: Scalars['Boolean']
    rangeMin?: Scalars['Float']
    rangeMax?: Scalars['Float']
    description?: Scalars['String']
    color?: Scalars['String']
    filter?: Scalars['JSON']
    isStacked?: Scalars['Boolean']
    isCumulative?: Scalars['Boolean']
    timezone?: Scalars['String']
    firstDayOfTheWeek?: Scalars['Int']
    __typename: 'LineChartConfiguration'
}


/** Which axes should display labels */
export type AxisNameDisplay = 'NONE' | 'X' | 'Y' | 'BOTH'

export interface IframeConfiguration {
    configurationType: WidgetConfigurationType
    url?: Scalars['String']
    __typename: 'IframeConfiguration'
}

export interface GaugeChartConfiguration {
    configurationType: WidgetConfigurationType
    aggregateFieldMetadataId: Scalars['UUID']
    aggregateOperation: AggregateOperations
    displayDataLabel?: Scalars['Boolean']
    color?: Scalars['String']
    description?: Scalars['String']
    filter?: Scalars['JSON']
    timezone?: Scalars['String']
    firstDayOfTheWeek?: Scalars['Int']
    __typename: 'GaugeChartConfiguration'
}

export interface BarChartConfiguration {
    configurationType: WidgetConfigurationType
    aggregateFieldMetadataId: Scalars['UUID']
    aggregateOperation: AggregateOperations
    primaryAxisGroupByFieldMetadataId: Scalars['UUID']
    primaryAxisGroupBySubFieldName?: Scalars['String']
    primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity
    primaryAxisOrderBy?: GraphOrderBy
    primaryAxisManualSortOrder?: Scalars['String'][]
    secondaryAxisGroupByFieldMetadataId?: Scalars['UUID']
    secondaryAxisGroupBySubFieldName?: Scalars['String']
    secondaryAxisGroupByDateGranularity?: ObjectRecordGroupByDateGranularity
    secondaryAxisOrderBy?: GraphOrderBy
    secondaryAxisManualSortOrder?: Scalars['String'][]
    omitNullValues?: Scalars['Boolean']
    splitMultiValueFields?: Scalars['Boolean']
    axisNameDisplay?: AxisNameDisplay
    displayDataLabel?: Scalars['Boolean']
    displayLegend?: Scalars['Boolean']
    rangeMin?: Scalars['Float']
    rangeMax?: Scalars['Float']
    description?: Scalars['String']
    color?: Scalars['String']
    filter?: Scalars['JSON']
    groupMode?: BarChartGroupMode
    layout: BarChartLayout
    isCumulative?: Scalars['Boolean']
    timezone?: Scalars['String']
    firstDayOfTheWeek?: Scalars['Int']
    __typename: 'BarChartConfiguration'
}


/** Display mode for bar charts with secondary grouping */
export type BarChartGroupMode = 'STACKED' | 'GROUPED'


/** Layout orientation for bar charts */
export type BarChartLayout = 'VERTICAL' | 'HORIZONTAL'

export interface CalendarConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'CalendarConfiguration'
}

export interface FrontComponentConfiguration {
    configurationType: WidgetConfigurationType
    frontComponentId: Scalars['UUID']
    __typename: 'FrontComponentConfiguration'
}

export interface EmailsConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'EmailsConfiguration'
}

export interface EmailThreadConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'EmailThreadConfiguration'
}

export interface FieldConfiguration {
    configurationType: WidgetConfigurationType
    fieldMetadataId: Scalars['String']
    fieldDisplayMode: FieldDisplayMode
    __typename: 'FieldConfiguration'
}


/** Display mode for field configuration widgets */
export type FieldDisplayMode = 'CARD' | 'FIELD' | 'VIEW'

export interface FieldRichTextConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'FieldRichTextConfiguration'
}

export interface FieldsConfiguration {
    configurationType: WidgetConfigurationType
    viewId?: Scalars['String']
    newFieldDefaultVisibility?: Scalars['Boolean']
    shouldAllowUserToSeeHiddenFields?: Scalars['Boolean']
    __typename: 'FieldsConfiguration'
}

export interface FilesConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'FilesConfiguration'
}

export interface NotesConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'NotesConfiguration'
}

export interface TasksConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'TasksConfiguration'
}

export interface TimelineConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'TimelineConfiguration'
}

export interface ViewConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'ViewConfiguration'
}

export interface RecordTableConfiguration {
    configurationType: WidgetConfigurationType
    viewId?: Scalars['String']
    __typename: 'RecordTableConfiguration'
}

export interface WorkflowConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'WorkflowConfiguration'
}

export interface WorkflowRunConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'WorkflowRunConfiguration'
}

export interface WorkflowVersionConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'WorkflowVersionConfiguration'
}

export interface PageLayoutTab {
    id: Scalars['UUID']
    applicationId: Scalars['UUID']
    title: Scalars['String']
    position: Scalars['Float']
    pageLayoutId: Scalars['UUID']
    widgets?: PageLayoutWidget[]
    icon?: Scalars['String']
    layoutMode?: PageLayoutTabLayoutMode
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    isOverridden: Scalars['Boolean']
    __typename: 'PageLayoutTab'
}

export interface PageLayout {
    id: Scalars['UUID']
    name: Scalars['String']
    type: PageLayoutType
    objectMetadataId?: Scalars['UUID']
    tabs?: PageLayoutTab[]
    defaultTabToFocusOnMobileAndSidePanelId?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    __typename: 'PageLayout'
}

export type PageLayoutType = 'RECORD_INDEX' | 'RECORD_PAGE' | 'DASHBOARD'

export interface Analytics {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'Analytics'
}

export interface BillingSubscriptionSchedulePhaseItem {
    price: Scalars['String']
    quantity?: Scalars['Float']
    __typename: 'BillingSubscriptionSchedulePhaseItem'
}

export interface BillingSubscriptionSchedulePhase {
    start_date: Scalars['Float']
    end_date: Scalars['Float']
    items: BillingSubscriptionSchedulePhaseItem[]
    __typename: 'BillingSubscriptionSchedulePhase'
}

export interface BillingProductMetadata {
    planKey: BillingPlanKey
    priceUsageBased: BillingUsageType
    productKey: BillingProductKey
    __typename: 'BillingProductMetadata'
}


/** The different billing plans available */
export type BillingPlanKey = 'PRO' | 'ENTERPRISE'

export type BillingUsageType = 'METERED' | 'LICENSED'


/** The different billing products available */
export type BillingProductKey = 'BASE_PRODUCT' | 'WORKFLOW_NODE_EXECUTION'

export interface BillingPriceLicensed {
    recurringInterval: SubscriptionInterval
    unitAmount: Scalars['Float']
    stripePriceId: Scalars['String']
    priceUsageType: BillingUsageType
    __typename: 'BillingPriceLicensed'
}

export type SubscriptionInterval = 'Month' | 'Year'

export interface BillingPriceTier {
    upTo?: Scalars['Float']
    flatAmount?: Scalars['Float']
    unitAmount?: Scalars['Float']
    __typename: 'BillingPriceTier'
}

export interface BillingPriceMetered {
    tiers: BillingPriceTier[]
    recurringInterval: SubscriptionInterval
    stripePriceId: Scalars['String']
    priceUsageType: BillingUsageType
    __typename: 'BillingPriceMetered'
}

export interface BillingProduct {
    name: Scalars['String']
    description: Scalars['String']
    images?: Scalars['String'][]
    metadata: BillingProductMetadata
    __typename: 'BillingProduct'
}

export interface BillingLicensedProduct {
    name: Scalars['String']
    description: Scalars['String']
    images?: Scalars['String'][]
    metadata: BillingProductMetadata
    prices?: BillingPriceLicensed[]
    __typename: 'BillingLicensedProduct'
}

export interface BillingMeteredProduct {
    name: Scalars['String']
    description: Scalars['String']
    images?: Scalars['String'][]
    metadata: BillingProductMetadata
    prices?: BillingPriceMetered[]
    __typename: 'BillingMeteredProduct'
}

export interface BillingSubscriptionItem {
    id: Scalars['UUID']
    hasReachedCurrentPeriodCap: Scalars['Boolean']
    quantity?: Scalars['Float']
    stripePriceId: Scalars['String']
    billingProduct: BillingProductDTO
    __typename: 'BillingSubscriptionItem'
}

export interface BillingSubscription {
    id: Scalars['UUID']
    status: SubscriptionStatus
    interval?: SubscriptionInterval
    billingSubscriptionItems?: BillingSubscriptionItem[]
    currentPeriodEnd?: Scalars['DateTime']
    metadata: Scalars['JSON']
    phases: BillingSubscriptionSchedulePhase[]
    __typename: 'BillingSubscription'
}

export type SubscriptionStatus = 'Active' | 'Canceled' | 'Incomplete' | 'IncompleteExpired' | 'PastDue' | 'Paused' | 'Trialing' | 'Unpaid'

export interface BillingEndTrialPeriod {
    /** Updated subscription status */
    status?: SubscriptionStatus
    /** Boolean that confirms if a payment method was found */
    hasPaymentMethod: Scalars['Boolean']
    /** Billing portal URL for payment method update (returned when no payment method exists) */
    billingPortalUrl?: Scalars['String']
    __typename: 'BillingEndTrialPeriod'
}

export interface BillingMeteredProductUsage {
    productKey: BillingProductKey
    periodStart: Scalars['DateTime']
    periodEnd: Scalars['DateTime']
    usedCredits: Scalars['Float']
    grantedCredits: Scalars['Float']
    rolloverCredits: Scalars['Float']
    totalGrantedCredits: Scalars['Float']
    unitPriceCents: Scalars['Float']
    __typename: 'BillingMeteredProductUsage'
}

export interface BillingPlan {
    planKey: BillingPlanKey
    licensedProducts: BillingLicensedProduct[]
    meteredProducts: BillingMeteredProduct[]
    __typename: 'BillingPlan'
}

export interface BillingSession {
    url?: Scalars['String']
    __typename: 'BillingSession'
}

export interface BillingUpdate {
    /** Current billing subscription */
    currentBillingSubscription: BillingSubscription
    /** All billing subscriptions */
    billingSubscriptions: BillingSubscription[]
    __typename: 'BillingUpdate'
}

export interface EnterpriseLicenseInfoDTO {
    isValid: Scalars['Boolean']
    licensee?: Scalars['String']
    expiresAt?: Scalars['DateTime']
    subscriptionId?: Scalars['String']
    __typename: 'EnterpriseLicenseInfoDTO'
}

export interface EnterpriseSubscriptionStatusDTO {
    status: Scalars['String']
    licensee?: Scalars['String']
    expiresAt?: Scalars['DateTime']
    cancelAt?: Scalars['DateTime']
    currentPeriodEnd?: Scalars['DateTime']
    isCancellationScheduled: Scalars['Boolean']
    __typename: 'EnterpriseSubscriptionStatusDTO'
}

export interface OnboardingStepSuccess {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'OnboardingStepSuccess'
}

export interface ApprovedAccessDomain {
    id: Scalars['UUID']
    domain: Scalars['String']
    isValidated: Scalars['Boolean']
    createdAt: Scalars['DateTime']
    __typename: 'ApprovedAccessDomain'
}

export interface FileWithSignedUrl {
    id: Scalars['UUID']
    path: Scalars['String']
    size: Scalars['Float']
    createdAt: Scalars['DateTime']
    url: Scalars['String']
    __typename: 'FileWithSignedUrl'
}

export interface WorkspaceInvitation {
    id: Scalars['UUID']
    email: Scalars['String']
    roleId?: Scalars['UUID']
    expiresAt: Scalars['DateTime']
    __typename: 'WorkspaceInvitation'
}

export interface SendInvitations {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    errors: Scalars['String'][]
    result: WorkspaceInvitation[]
    __typename: 'SendInvitations'
}

export interface RecordIdentifier {
    id: Scalars['UUID']
    labelIdentifier: Scalars['String']
    imageIdentifier?: Scalars['String']
    __typename: 'RecordIdentifier'
}

export interface NavigationMenuItem {
    id: Scalars['UUID']
    userWorkspaceId?: Scalars['UUID']
    targetRecordId?: Scalars['UUID']
    targetObjectMetadataId?: Scalars['UUID']
    viewId?: Scalars['UUID']
    type: NavigationMenuItemType
    name?: Scalars['String']
    link?: Scalars['String']
    icon?: Scalars['String']
    color?: Scalars['String']
    folderId?: Scalars['UUID']
    position: Scalars['Float']
    applicationId?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    targetRecordIdentifier?: RecordIdentifier
    __typename: 'NavigationMenuItem'
}

export type NavigationMenuItemType = 'VIEW' | 'FOLDER' | 'LINK' | 'OBJECT' | 'RECORD'

export interface ObjectRecordEventProperties {
    updatedFields?: Scalars['String'][]
    before?: Scalars['JSON']
    after?: Scalars['JSON']
    diff?: Scalars['JSON']
    __typename: 'ObjectRecordEventProperties'
}

export interface MetadataEvent {
    type: MetadataEventAction
    metadataName: Scalars['String']
    recordId: Scalars['String']
    properties: ObjectRecordEventProperties
    updatedCollectionHash?: Scalars['String']
    __typename: 'MetadataEvent'
}


/** Metadata Event Action */
export type MetadataEventAction = 'CREATED' | 'UPDATED' | 'DELETED'

export interface ObjectRecordEvent {
    action: DatabaseEventAction
    objectNameSingular: Scalars['String']
    recordId: Scalars['String']
    userId?: Scalars['String']
    workspaceMemberId?: Scalars['String']
    properties: ObjectRecordEventProperties
    __typename: 'ObjectRecordEvent'
}


/** Database Event Action */
export type DatabaseEventAction = 'CREATED' | 'UPDATED' | 'DELETED' | 'DESTROYED' | 'RESTORED' | 'UPSERTED'

export interface ObjectRecordEventWithQueryIds {
    queryIds: Scalars['String'][]
    objectRecordEvent: ObjectRecordEvent
    __typename: 'ObjectRecordEventWithQueryIds'
}

export interface EventSubscription {
    eventStreamId: Scalars['String']
    objectRecordEventsWithQueryIds: ObjectRecordEventWithQueryIds[]
    metadataEvents: MetadataEvent[]
    __typename: 'EventSubscription'
}

export interface LogicFunctionExecutionResult {
    /** Execution result in JSON format */
    data?: Scalars['JSON']
    /** Execution Logs */
    logs: Scalars['String']
    /** Execution duration in milliseconds */
    duration: Scalars['Float']
    /** Execution status */
    status: LogicFunctionExecutionStatus
    /** Execution error in JSON format */
    error?: Scalars['JSON']
    __typename: 'LogicFunctionExecutionResult'
}


/** Status of the logic function execution */
export type LogicFunctionExecutionStatus = 'IDLE' | 'SUCCESS' | 'ERROR'

export interface BillingTrialPeriod {
    duration: Scalars['Float']
    isCreditCardRequired: Scalars['Boolean']
    __typename: 'BillingTrialPeriod'
}

export interface WorkspaceUrls {
    customUrl?: Scalars['String']
    subdomainUrl: Scalars['String']
    __typename: 'WorkspaceUrls'
}

export interface SSOIdentityProvider {
    id: Scalars['UUID']
    name: Scalars['String']
    type: IdentityProviderType
    status: SSOIdentityProviderStatus
    issuer: Scalars['String']
    __typename: 'SSOIdentityProvider'
}

export type IdentityProviderType = 'OIDC' | 'SAML'

export type SSOIdentityProviderStatus = 'Active' | 'Inactive' | 'Error'

export interface AuthProviders {
    sso: SSOIdentityProvider[]
    google: Scalars['Boolean']
    magicLink: Scalars['Boolean']
    password: Scalars['Boolean']
    microsoft: Scalars['Boolean']
    __typename: 'AuthProviders'
}

export interface AuthBypassProviders {
    google: Scalars['Boolean']
    password: Scalars['Boolean']
    microsoft: Scalars['Boolean']
    __typename: 'AuthBypassProviders'
}

export interface PublicWorkspaceData {
    id: Scalars['UUID']
    authProviders: AuthProviders
    authBypassProviders?: AuthBypassProviders
    logo?: Scalars['String']
    displayName?: Scalars['String']
    workspaceUrls: WorkspaceUrls
    __typename: 'PublicWorkspaceData'
}

export interface NativeModelCapabilities {
    webSearch?: Scalars['Boolean']
    twitterSearch?: Scalars['Boolean']
    __typename: 'NativeModelCapabilities'
}

export interface ClientAIModelConfig {
    modelId: Scalars['String']
    label: Scalars['String']
    modelFamily?: ModelFamily
    modelFamilyLabel?: Scalars['String']
    sdkPackage?: Scalars['String']
    inputCostPerMillionTokensInCredits: Scalars['Float']
    outputCostPerMillionTokensInCredits: Scalars['Float']
    nativeCapabilities?: NativeModelCapabilities
    isDeprecated?: Scalars['Boolean']
    isRecommended?: Scalars['Boolean']
    providerName?: Scalars['String']
    dataResidency?: Scalars['String']
    __typename: 'ClientAIModelConfig'
}

export type ModelFamily = 'GPT' | 'CLAUDE' | 'GEMINI' | 'MISTRAL' | 'GROK'

export interface AdminAIModelConfig {
    modelId: Scalars['String']
    label: Scalars['String']
    modelFamily?: ModelFamily
    modelFamilyLabel?: Scalars['String']
    sdkPackage?: Scalars['String']
    isAvailable: Scalars['Boolean']
    isAdminEnabled: Scalars['Boolean']
    isDeprecated?: Scalars['Boolean']
    isRecommended?: Scalars['Boolean']
    contextWindowTokens?: Scalars['Float']
    maxOutputTokens?: Scalars['Float']
    inputCostPerMillionTokens?: Scalars['Float']
    outputCostPerMillionTokens?: Scalars['Float']
    providerName?: Scalars['String']
    providerLabel?: Scalars['String']
    name?: Scalars['String']
    dataResidency?: Scalars['String']
    __typename: 'AdminAIModelConfig'
}

export interface AdminAIModels {
    models: AdminAIModelConfig[]
    defaultSmartModelId?: Scalars['String']
    defaultFastModelId?: Scalars['String']
    __typename: 'AdminAIModels'
}

export interface Billing {
    isBillingEnabled: Scalars['Boolean']
    billingUrl?: Scalars['String']
    trialPeriods: BillingTrialPeriod[]
    __typename: 'Billing'
}

export interface Support {
    supportDriver: SupportDriver
    supportFrontChatId?: Scalars['String']
    __typename: 'Support'
}

export type SupportDriver = 'NONE' | 'FRONT'

export interface Sentry {
    environment?: Scalars['String']
    release?: Scalars['String']
    dsn?: Scalars['String']
    __typename: 'Sentry'
}

export interface Captcha {
    provider?: CaptchaDriverType
    siteKey?: Scalars['String']
    __typename: 'Captcha'
}

export type CaptchaDriverType = 'GOOGLE_RECAPTCHA' | 'TURNSTILE'

export interface ApiConfig {
    mutationMaximumAffectedRecords: Scalars['Float']
    __typename: 'ApiConfig'
}

export interface PublicFeatureFlagMetadata {
    label: Scalars['String']
    description: Scalars['String']
    imagePath?: Scalars['String']
    __typename: 'PublicFeatureFlagMetadata'
}

export interface PublicFeatureFlag {
    key: FeatureFlagKey
    metadata: PublicFeatureFlagMetadata
    __typename: 'PublicFeatureFlag'
}

export type FeatureFlagKey = 'IS_UNIQUE_INDEXES_ENABLED' | 'IS_JSON_FILTER_ENABLED' | 'IS_AI_ENABLED' | 'IS_COMMAND_MENU_ITEM_ENABLED' | 'IS_MARKETPLACE_SETTING_TAB_VISIBLE' | 'IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED' | 'IS_PUBLIC_DOMAIN_ENABLED' | 'IS_EMAILING_DOMAIN_ENABLED' | 'IS_JUNCTION_RELATIONS_ENABLED' | 'IS_DRAFT_EMAIL_ENABLED' | 'IS_CONNECTED_ACCOUNT_MIGRATED' | 'IS_USAGE_ANALYTICS_ENABLED' | 'IS_RICH_TEXT_V1_MIGRATED' | 'IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED' | 'IS_RECORD_TABLE_WIDGET_ENABLED' | 'IS_DATASOURCE_MIGRATED'

export interface ClientConfigMaintenanceMode {
    startAt: Scalars['DateTime']
    endAt: Scalars['DateTime']
    link?: Scalars['String']
    __typename: 'ClientConfigMaintenanceMode'
}

export interface ClientConfig {
    appVersion?: Scalars['String']
    authProviders: AuthProviders
    billing: Billing
    aiModels: ClientAIModelConfig[]
    signInPrefilled: Scalars['Boolean']
    isMultiWorkspaceEnabled: Scalars['Boolean']
    isEmailVerificationRequired: Scalars['Boolean']
    defaultSubdomain?: Scalars['String']
    frontDomain: Scalars['String']
    analyticsEnabled: Scalars['Boolean']
    support: Support
    isAttachmentPreviewEnabled: Scalars['Boolean']
    sentry: Sentry
    captcha: Captcha
    api: ApiConfig
    canManageFeatureFlags: Scalars['Boolean']
    publicFeatureFlags: PublicFeatureFlag[]
    isMicrosoftMessagingEnabled: Scalars['Boolean']
    isMicrosoftCalendarEnabled: Scalars['Boolean']
    isGoogleMessagingEnabled: Scalars['Boolean']
    isGoogleCalendarEnabled: Scalars['Boolean']
    isConfigVariablesInDbEnabled: Scalars['Boolean']
    isImapSmtpCaldavEnabled: Scalars['Boolean']
    allowRequestsToTwentyIcons: Scalars['Boolean']
    calendarBookingPageId?: Scalars['String']
    isCloudflareIntegrationEnabled: Scalars['Boolean']
    isClickHouseConfigured: Scalars['Boolean']
    isWorkspaceSchemaDDLLocked: Scalars['Boolean']
    maintenance?: ClientConfigMaintenanceMode
    __typename: 'ClientConfig'
}

export interface UsageBreakdownItem {
    key: Scalars['String']
    label?: Scalars['String']
    creditsUsed: Scalars['Float']
    __typename: 'UsageBreakdownItem'
}

export interface ConfigVariable {
    name: Scalars['String']
    description: Scalars['String']
    value?: Scalars['JSON']
    isSensitive: Scalars['Boolean']
    source: ConfigSource
    isEnvOnly: Scalars['Boolean']
    type: ConfigVariableType
    options?: Scalars['JSON']
    __typename: 'ConfigVariable'
}

export type ConfigSource = 'ENVIRONMENT' | 'DATABASE' | 'DEFAULT'

export type ConfigVariableType = 'BOOLEAN' | 'NUMBER' | 'ARRAY' | 'STRING' | 'ENUM' | 'JSON'

export interface ConfigVariablesGroupData {
    variables: ConfigVariable[]
    name: ConfigVariablesGroup
    description: Scalars['String']
    isHiddenOnLoad: Scalars['Boolean']
    __typename: 'ConfigVariablesGroupData'
}

export type ConfigVariablesGroup = 'SERVER_CONFIG' | 'RATE_LIMITING' | 'STORAGE_CONFIG' | 'GOOGLE_AUTH' | 'MICROSOFT_AUTH' | 'EMAIL_SETTINGS' | 'LOGGING' | 'ADVANCED_SETTINGS' | 'BILLING_CONFIG' | 'CAPTCHA_CONFIG' | 'CLOUDFLARE_CONFIG' | 'LLM' | 'LOGIC_FUNCTION_CONFIG' | 'CODE_INTERPRETER_CONFIG' | 'SSL' | 'SUPPORT_CHAT_CONFIG' | 'ANALYTICS_CONFIG' | 'TOKENS_DURATION' | 'AWS_SES_SETTINGS'

export interface ConfigVariables {
    groups: ConfigVariablesGroupData[]
    __typename: 'ConfigVariables'
}

export interface JobOperationResult {
    jobId: Scalars['String']
    success: Scalars['Boolean']
    error?: Scalars['String']
    __typename: 'JobOperationResult'
}

export interface DeleteJobsResponse {
    deletedCount: Scalars['Int']
    results: JobOperationResult[]
    __typename: 'DeleteJobsResponse'
}

export interface QueueJob {
    id: Scalars['String']
    name: Scalars['String']
    data?: Scalars['JSON']
    state: JobState
    timestamp?: Scalars['Float']
    failedReason?: Scalars['String']
    processedOn?: Scalars['Float']
    finishedOn?: Scalars['Float']
    attemptsMade: Scalars['Float']
    returnValue?: Scalars['JSON']
    logs?: Scalars['String'][]
    stackTrace?: Scalars['String'][]
    __typename: 'QueueJob'
}


/** Job state in the queue */
export type JobState = 'COMPLETED' | 'FAILED' | 'ACTIVE' | 'WAITING' | 'DELAYED' | 'PRIORITIZED' | 'WAITING_CHILDREN'

export interface QueueRetentionConfig {
    completedMaxAge: Scalars['Float']
    completedMaxCount: Scalars['Float']
    failedMaxAge: Scalars['Float']
    failedMaxCount: Scalars['Float']
    __typename: 'QueueRetentionConfig'
}

export interface QueueJobsResponse {
    jobs: QueueJob[]
    count: Scalars['Float']
    totalCount: Scalars['Float']
    hasMore: Scalars['Boolean']
    retentionConfig: QueueRetentionConfig
    __typename: 'QueueJobsResponse'
}

export interface RetryJobsResponse {
    retriedCount: Scalars['Int']
    results: JobOperationResult[]
    __typename: 'RetryJobsResponse'
}

export interface SystemHealthService {
    id: HealthIndicatorId
    label: Scalars['String']
    status: AdminPanelHealthServiceStatus
    __typename: 'SystemHealthService'
}

export type HealthIndicatorId = 'database' | 'redis' | 'worker' | 'connectedAccount' | 'app'

export type AdminPanelHealthServiceStatus = 'OPERATIONAL' | 'OUTAGE'

export interface SystemHealth {
    services: SystemHealthService[]
    __typename: 'SystemHealth'
}

export interface FeatureFlag {
    key: FeatureFlagKey
    value: Scalars['Boolean']
    __typename: 'FeatureFlag'
}

export interface UserInfo {
    id: Scalars['UUID']
    email: Scalars['String']
    firstName?: Scalars['String']
    lastName?: Scalars['String']
    __typename: 'UserInfo'
}

export interface WorkspaceInfo {
    id: Scalars['UUID']
    name: Scalars['String']
    allowImpersonation: Scalars['Boolean']
    logo?: Scalars['String']
    totalUsers: Scalars['Float']
    workspaceUrls: WorkspaceUrls
    users: UserInfo[]
    featureFlags: FeatureFlag[]
    __typename: 'WorkspaceInfo'
}

export interface UserLookup {
    user: UserInfo
    workspaces: WorkspaceInfo[]
    __typename: 'UserLookup'
}

export interface VersionInfo {
    currentVersion?: Scalars['String']
    latestVersion: Scalars['String']
    __typename: 'VersionInfo'
}

export interface AdminPanelWorkerQueueHealth {
    id: Scalars['String']
    queueName: Scalars['String']
    status: AdminPanelHealthServiceStatus
    __typename: 'AdminPanelWorkerQueueHealth'
}

export interface AdminPanelHealthServiceData {
    id: HealthIndicatorId
    label: Scalars['String']
    description: Scalars['String']
    status: AdminPanelHealthServiceStatus
    errorMessage?: Scalars['String']
    details?: Scalars['String']
    queues?: AdminPanelWorkerQueueHealth[]
    __typename: 'AdminPanelHealthServiceData'
}

export interface MaintenanceMode {
    startAt: Scalars['DateTime']
    endAt: Scalars['DateTime']
    link?: Scalars['String']
    __typename: 'MaintenanceMode'
}

export interface ModelsDevModelSuggestion {
    modelId: Scalars['String']
    name: Scalars['String']
    inputCostPerMillionTokens: Scalars['Float']
    outputCostPerMillionTokens: Scalars['Float']
    cachedInputCostPerMillionTokens?: Scalars['Float']
    cacheCreationCostPerMillionTokens?: Scalars['Float']
    contextWindowTokens: Scalars['Float']
    maxOutputTokens: Scalars['Float']
    modalities: Scalars['String'][]
    supportsReasoning: Scalars['Boolean']
    __typename: 'ModelsDevModelSuggestion'
}

export interface ModelsDevProviderSuggestion {
    id: Scalars['String']
    modelCount: Scalars['Float']
    npm: Scalars['String']
    __typename: 'ModelsDevProviderSuggestion'
}

export interface QueueMetricsDataPoint {
    x: Scalars['Float']
    y: Scalars['Float']
    __typename: 'QueueMetricsDataPoint'
}

export interface QueueMetricsSeries {
    id: Scalars['String']
    data: QueueMetricsDataPoint[]
    __typename: 'QueueMetricsSeries'
}

export interface WorkerQueueMetrics {
    failed: Scalars['Float']
    completed: Scalars['Float']
    waiting: Scalars['Float']
    active: Scalars['Float']
    delayed: Scalars['Float']
    failureRate: Scalars['Float']
    failedData?: Scalars['Float'][]
    completedData?: Scalars['Float'][]
    __typename: 'WorkerQueueMetrics'
}

export interface QueueMetricsData {
    queueName: Scalars['String']
    workers: Scalars['Float']
    timeRange: QueueMetricsTimeRange
    details?: WorkerQueueMetrics
    data: QueueMetricsSeries[]
    __typename: 'QueueMetricsData'
}

export type QueueMetricsTimeRange = 'SevenDays' | 'OneDay' | 'TwelveHours' | 'FourHours' | 'OneHour'

export interface VersionDistributionEntry {
    version: Scalars['String']
    count: Scalars['Int']
    __typename: 'VersionDistributionEntry'
}

export interface ApplicationRegistrationStats {
    activeInstalls: Scalars['Int']
    mostInstalledVersion?: Scalars['String']
    versionDistribution: VersionDistributionEntry[]
    __typename: 'ApplicationRegistrationStats'
}

export interface CreateApplicationRegistration {
    applicationRegistration: ApplicationRegistration
    clientSecret: Scalars['String']
    __typename: 'CreateApplicationRegistration'
}

export interface PublicApplicationRegistration {
    id: Scalars['UUID']
    name: Scalars['String']
    logoUrl?: Scalars['String']
    websiteUrl?: Scalars['String']
    oAuthScopes: Scalars['String'][]
    __typename: 'PublicApplicationRegistration'
}

export interface RotateClientSecret {
    clientSecret: Scalars['String']
    __typename: 'RotateClientSecret'
}

export interface ResendEmailVerificationToken {
    success: Scalars['Boolean']
    __typename: 'ResendEmailVerificationToken'
}

export interface DeleteSso {
    identityProviderId: Scalars['UUID']
    __typename: 'DeleteSso'
}

export interface EditSso {
    id: Scalars['UUID']
    type: IdentityProviderType
    issuer: Scalars['String']
    name: Scalars['String']
    status: SSOIdentityProviderStatus
    __typename: 'EditSso'
}

export interface WorkspaceNameAndId {
    displayName?: Scalars['String']
    id: Scalars['UUID']
    __typename: 'WorkspaceNameAndId'
}

export interface FindAvailableSSOIDP {
    type: IdentityProviderType
    id: Scalars['UUID']
    issuer: Scalars['String']
    name: Scalars['String']
    status: SSOIdentityProviderStatus
    workspace: WorkspaceNameAndId
    __typename: 'FindAvailableSSOIDP'
}

export interface SetupSso {
    id: Scalars['UUID']
    type: IdentityProviderType
    issuer: Scalars['String']
    name: Scalars['String']
    status: SSOIdentityProviderStatus
    __typename: 'SetupSso'
}

export interface SSOConnection {
    type: IdentityProviderType
    id: Scalars['UUID']
    issuer: Scalars['String']
    name: Scalars['String']
    status: SSOIdentityProviderStatus
    __typename: 'SSOConnection'
}

export interface AvailableWorkspace {
    id: Scalars['UUID']
    displayName?: Scalars['String']
    loginToken?: Scalars['String']
    personalInviteToken?: Scalars['String']
    inviteHash?: Scalars['String']
    workspaceUrls: WorkspaceUrls
    logo?: Scalars['String']
    sso: SSOConnection[]
    __typename: 'AvailableWorkspace'
}

export interface AvailableWorkspaces {
    availableWorkspacesForSignIn: AvailableWorkspace[]
    availableWorkspacesForSignUp: AvailableWorkspace[]
    __typename: 'AvailableWorkspaces'
}

export interface DeletedWorkspaceMember {
    id: Scalars['UUID']
    name: FullName
    userEmail: Scalars['String']
    avatarUrl?: Scalars['String']
    userWorkspaceId?: Scalars['UUID']
    __typename: 'DeletedWorkspaceMember'
}

export interface BillingEntitlement {
    key: BillingEntitlementKey
    value: Scalars['Boolean']
    __typename: 'BillingEntitlement'
}

export type BillingEntitlementKey = 'SSO' | 'CUSTOM_DOMAIN' | 'RLS' | 'AUDIT_LOGS'

export interface DomainRecord {
    validationType: Scalars['String']
    type: Scalars['String']
    status: Scalars['String']
    key: Scalars['String']
    value: Scalars['String']
    __typename: 'DomainRecord'
}

export interface DomainValidRecords {
    id: Scalars['UUID']
    domain: Scalars['String']
    records: DomainRecord[]
    __typename: 'DomainValidRecords'
}

export interface IndexEdge {
    /** The node containing the Index */
    node: Index
    /** Cursor for this node. */
    cursor: Scalars['ConnectionCursor']
    __typename: 'IndexEdge'
}

export interface PageInfo {
    /** true if paging forward and there are more records. */
    hasNextPage?: Scalars['Boolean']
    /** true if paging backwards and there are more records. */
    hasPreviousPage?: Scalars['Boolean']
    /** The cursor of the first returned record. */
    startCursor?: Scalars['ConnectionCursor']
    /** The cursor of the last returned record. */
    endCursor?: Scalars['ConnectionCursor']
    __typename: 'PageInfo'
}

export interface IndexConnection {
    /** Paging information */
    pageInfo: PageInfo
    /** Array of edges. */
    edges: IndexEdge[]
    __typename: 'IndexConnection'
}

export interface IndexFieldEdge {
    /** The node containing the IndexField */
    node: IndexField
    /** Cursor for this node. */
    cursor: Scalars['ConnectionCursor']
    __typename: 'IndexFieldEdge'
}

export interface IndexIndexFieldMetadatasConnection {
    /** Paging information */
    pageInfo: PageInfo
    /** Array of edges. */
    edges: IndexFieldEdge[]
    __typename: 'IndexIndexFieldMetadatasConnection'
}

export interface ObjectEdge {
    /** The node containing the Object */
    node: Object
    /** Cursor for this node. */
    cursor: Scalars['ConnectionCursor']
    __typename: 'ObjectEdge'
}

export interface IndexObjectMetadataConnection {
    /** Paging information */
    pageInfo: PageInfo
    /** Array of edges. */
    edges: ObjectEdge[]
    __typename: 'IndexObjectMetadataConnection'
}

export interface ObjectRecordCount {
    objectNamePlural: Scalars['String']
    totalCount: Scalars['Int']
    __typename: 'ObjectRecordCount'
}

export interface ObjectConnection {
    /** Paging information */
    pageInfo: PageInfo
    /** Array of edges. */
    edges: ObjectEdge[]
    __typename: 'ObjectConnection'
}

export interface ObjectIndexMetadatasConnection {
    /** Paging information */
    pageInfo: PageInfo
    /** Array of edges. */
    edges: IndexEdge[]
    __typename: 'ObjectIndexMetadatasConnection'
}

export interface FieldEdge {
    /** The node containing the Field */
    node: Field
    /** Cursor for this node. */
    cursor: Scalars['ConnectionCursor']
    __typename: 'FieldEdge'
}

export interface ObjectFieldsConnection {
    /** Paging information */
    pageInfo: PageInfo
    /** Array of edges. */
    edges: FieldEdge[]
    __typename: 'ObjectFieldsConnection'
}

export interface UpsertRowLevelPermissionPredicatesResult {
    predicates: RowLevelPermissionPredicate[]
    predicateGroups: RowLevelPermissionPredicateGroup[]
    __typename: 'UpsertRowLevelPermissionPredicatesResult'
}

export interface Relation {
    type: RelationType
    sourceObjectMetadata: Object
    targetObjectMetadata: Object
    sourceFieldMetadata: Field
    targetFieldMetadata: Field
    __typename: 'Relation'
}


/** Relation type */
export type RelationType = 'ONE_TO_MANY' | 'MANY_TO_ONE'

export interface FieldConnection {
    /** Paging information */
    pageInfo: PageInfo
    /** Array of edges. */
    edges: FieldEdge[]
    __typename: 'FieldConnection'
}

export interface AuthToken {
    token: Scalars['String']
    expiresAt: Scalars['DateTime']
    __typename: 'AuthToken'
}

export interface ApplicationTokenPair {
    applicationAccessToken: AuthToken
    applicationRefreshToken: AuthToken
    __typename: 'ApplicationTokenPair'
}

export interface FrontComponent {
    id: Scalars['UUID']
    name: Scalars['String']
    description?: Scalars['String']
    sourceComponentPath: Scalars['String']
    builtComponentPath: Scalars['String']
    componentName: Scalars['String']
    builtComponentChecksum: Scalars['String']
    universalIdentifier?: Scalars['UUID']
    applicationId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    isHeadless: Scalars['Boolean']
    usesSdkClient: Scalars['Boolean']
    applicationTokenPair?: ApplicationTokenPair
    __typename: 'FrontComponent'
}

export interface LogicFunctionLogs {
    /** Execution Logs */
    logs: Scalars['String']
    __typename: 'LogicFunctionLogs'
}

export interface DeleteTwoFactorAuthenticationMethod {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'DeleteTwoFactorAuthenticationMethod'
}

export interface InitiateTwoFactorAuthenticationProvisioning {
    uri: Scalars['String']
    __typename: 'InitiateTwoFactorAuthenticationProvisioning'
}

export interface VerifyTwoFactorAuthenticationMethod {
    success: Scalars['Boolean']
    __typename: 'VerifyTwoFactorAuthenticationMethod'
}

export interface AuthorizeApp {
    redirectUrl: Scalars['String']
    __typename: 'AuthorizeApp'
}

export interface AuthTokenPair {
    accessOrWorkspaceAgnosticToken: AuthToken
    refreshToken: AuthToken
    __typename: 'AuthTokenPair'
}

export interface AvailableWorkspacesAndAccessTokens {
    tokens: AuthTokenPair
    availableWorkspaces: AvailableWorkspaces
    __typename: 'AvailableWorkspacesAndAccessTokens'
}

export interface EmailPasswordResetLink {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'EmailPasswordResetLink'
}

export interface GetAuthorizationUrlForSSO {
    authorizationURL: Scalars['String']
    type: Scalars['String']
    id: Scalars['UUID']
    __typename: 'GetAuthorizationUrlForSSO'
}

export interface InvalidatePassword {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'InvalidatePassword'
}

export interface WorkspaceUrlsAndId {
    workspaceUrls: WorkspaceUrls
    id: Scalars['UUID']
    __typename: 'WorkspaceUrlsAndId'
}

export interface SignUp {
    loginToken: AuthToken
    workspace: WorkspaceUrlsAndId
    __typename: 'SignUp'
}

export interface TransientToken {
    transientToken: AuthToken
    __typename: 'TransientToken'
}

export interface ValidatePasswordResetToken {
    id: Scalars['UUID']
    email: Scalars['String']
    hasPassword: Scalars['Boolean']
    __typename: 'ValidatePasswordResetToken'
}

export interface VerifyEmailAndGetLoginToken {
    loginToken: AuthToken
    workspaceUrls: WorkspaceUrls
    __typename: 'VerifyEmailAndGetLoginToken'
}

export interface ApiKeyToken {
    token: Scalars['String']
    __typename: 'ApiKeyToken'
}

export interface AuthTokens {
    tokens: AuthTokenPair
    __typename: 'AuthTokens'
}

export interface LoginToken {
    loginToken: AuthToken
    __typename: 'LoginToken'
}

export interface CheckUserExist {
    exists: Scalars['Boolean']
    availableWorkspacesCount: Scalars['Float']
    isEmailVerified: Scalars['Boolean']
    __typename: 'CheckUserExist'
}

export interface WorkspaceInviteHashValid {
    isValid: Scalars['Boolean']
    __typename: 'WorkspaceInviteHashValid'
}

export interface Impersonate {
    loginToken: AuthToken
    workspace: WorkspaceUrlsAndId
    __typename: 'Impersonate'
}

export interface UsageTimeSeries {
    date: Scalars['String']
    creditsUsed: Scalars['Float']
    __typename: 'UsageTimeSeries'
}

export interface UsageUserDaily {
    userWorkspaceId: Scalars['String']
    dailyUsage: UsageTimeSeries[]
    __typename: 'UsageUserDaily'
}

export interface UsageAnalytics {
    usageByUser: UsageBreakdownItem[]
    usageByOperationType: UsageBreakdownItem[]
    usageByModel: UsageBreakdownItem[]
    timeSeries: UsageTimeSeries[]
    periodStart: Scalars['DateTime']
    periodEnd: Scalars['DateTime']
    userDailyUsage?: UsageUserDaily
    __typename: 'UsageAnalytics'
}

export interface DevelopmentApplication {
    id: Scalars['String']
    universalIdentifier: Scalars['String']
    __typename: 'DevelopmentApplication'
}

export interface WorkspaceMigration {
    applicationUniversalIdentifier: Scalars['String']
    actions: Scalars['JSON']
    __typename: 'WorkspaceMigration'
}

export interface File {
    id: Scalars['UUID']
    path: Scalars['String']
    size: Scalars['Float']
    createdAt: Scalars['DateTime']
    __typename: 'File'
}

export interface MarketplaceApp {
    id: Scalars['String']
    name: Scalars['String']
    description: Scalars['String']
    icon: Scalars['String']
    author: Scalars['String']
    category: Scalars['String']
    logo?: Scalars['String']
    sourcePackage?: Scalars['String']
    isFeatured: Scalars['Boolean']
    __typename: 'MarketplaceApp'
}

export interface MarketplaceAppDetail {
    universalIdentifier: Scalars['String']
    id: Scalars['String']
    name: Scalars['String']
    sourceType: ApplicationRegistrationSourceType
    sourcePackage?: Scalars['String']
    latestAvailableVersion?: Scalars['String']
    isListed: Scalars['Boolean']
    isFeatured: Scalars['Boolean']
    manifest?: Scalars['JSON']
    __typename: 'MarketplaceAppDetail'
}

export interface PublicDomain {
    id: Scalars['UUID']
    domain: Scalars['String']
    isValidated: Scalars['Boolean']
    createdAt: Scalars['DateTime']
    __typename: 'PublicDomain'
}

export interface VerificationRecord {
    type: Scalars['String']
    key: Scalars['String']
    value: Scalars['String']
    priority?: Scalars['Float']
    __typename: 'VerificationRecord'
}

export interface EmailingDomain {
    id: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    domain: Scalars['String']
    driver: EmailingDomainDriver
    status: EmailingDomainStatus
    verificationRecords?: VerificationRecord[]
    verifiedAt?: Scalars['DateTime']
    __typename: 'EmailingDomain'
}

export type EmailingDomainDriver = 'AWS_SES'

export type EmailingDomainStatus = 'PENDING' | 'VERIFIED' | 'FAILED' | 'TEMPORARY_FAILURE'

export interface AutocompleteResult {
    text: Scalars['String']
    placeId: Scalars['String']
    __typename: 'AutocompleteResult'
}

export interface Location {
    lat?: Scalars['Float']
    lng?: Scalars['Float']
    __typename: 'Location'
}

export interface PlaceDetailsResult {
    state?: Scalars['String']
    postcode?: Scalars['String']
    city?: Scalars['String']
    country?: Scalars['String']
    location?: Location
    __typename: 'PlaceDetailsResult'
}

export interface ConnectionParametersOutput {
    host: Scalars['String']
    port: Scalars['Float']
    username?: Scalars['String']
    password: Scalars['String']
    secure?: Scalars['Boolean']
    __typename: 'ConnectionParametersOutput'
}

export interface ImapSmtpCaldavConnectionParameters {
    IMAP?: ConnectionParametersOutput
    SMTP?: ConnectionParametersOutput
    CALDAV?: ConnectionParametersOutput
    __typename: 'ImapSmtpCaldavConnectionParameters'
}

export interface ConnectedImapSmtpCaldavAccount {
    id: Scalars['UUID']
    handle: Scalars['String']
    provider: Scalars['String']
    userWorkspaceId: Scalars['UUID']
    connectionParameters?: ImapSmtpCaldavConnectionParameters
    __typename: 'ConnectedImapSmtpCaldavAccount'
}

export interface ImapSmtpCaldavConnectionSuccess {
    success: Scalars['Boolean']
    connectedAccountId: Scalars['String']
    __typename: 'ImapSmtpCaldavConnectionSuccess'
}

export interface PostgresCredentials {
    id: Scalars['UUID']
    user: Scalars['String']
    password: Scalars['String']
    workspaceId: Scalars['UUID']
    __typename: 'PostgresCredentials'
}

export interface CommandMenuItem {
    id: Scalars['UUID']
    workflowVersionId?: Scalars['UUID']
    frontComponentId?: Scalars['UUID']
    frontComponent?: FrontComponent
    engineComponentKey: EngineComponentKey
    label: Scalars['String']
    icon?: Scalars['String']
    shortLabel?: Scalars['String']
    position: Scalars['Float']
    isPinned: Scalars['Boolean']
    availabilityType: CommandMenuItemAvailabilityType
    payload?: Scalars['JSON']
    hotKeys?: Scalars['String'][]
    conditionalAvailabilityExpression?: Scalars['String']
    availabilityObjectMetadataId?: Scalars['UUID']
    applicationId?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'CommandMenuItem'
}

export type EngineComponentKey = 'NAVIGATE_TO_NEXT_RECORD' | 'NAVIGATE_TO_PREVIOUS_RECORD' | 'CREATE_NEW_RECORD' | 'DELETE_RECORDS' | 'RESTORE_RECORDS' | 'DESTROY_RECORDS' | 'ADD_TO_FAVORITES' | 'REMOVE_FROM_FAVORITES' | 'EXPORT_NOTE_TO_PDF' | 'EXPORT_RECORDS' | 'UPDATE_MULTIPLE_RECORDS' | 'MERGE_MULTIPLE_RECORDS' | 'IMPORT_RECORDS' | 'EXPORT_VIEW' | 'SEE_DELETED_RECORDS' | 'CREATE_NEW_VIEW' | 'HIDE_DELETED_RECORDS' | 'EDIT_RECORD_PAGE_LAYOUT' | 'EDIT_DASHBOARD_LAYOUT' | 'SAVE_DASHBOARD_LAYOUT' | 'CANCEL_DASHBOARD_LAYOUT' | 'DUPLICATE_DASHBOARD' | 'ACTIVATE_WORKFLOW' | 'DEACTIVATE_WORKFLOW' | 'DISCARD_DRAFT_WORKFLOW' | 'TEST_WORKFLOW' | 'SEE_ACTIVE_VERSION_WORKFLOW' | 'SEE_RUNS_WORKFLOW' | 'SEE_VERSIONS_WORKFLOW' | 'ADD_NODE_WORKFLOW' | 'TIDY_UP_WORKFLOW' | 'DUPLICATE_WORKFLOW' | 'SEE_VERSION_WORKFLOW_RUN' | 'SEE_WORKFLOW_WORKFLOW_RUN' | 'STOP_WORKFLOW_RUN' | 'SEE_RUNS_WORKFLOW_VERSION' | 'SEE_WORKFLOW_WORKFLOW_VERSION' | 'USE_AS_DRAFT_WORKFLOW_VERSION' | 'SEE_VERSIONS_WORKFLOW_VERSION' | 'SEARCH_RECORDS' | 'SEARCH_RECORDS_FALLBACK' | 'ASK_AI' | 'VIEW_PREVIOUS_AI_CHATS' | 'NAVIGATION' | 'TRIGGER_WORKFLOW_VERSION' | 'FRONT_COMPONENT_RENDERER' | 'REPLY_TO_EMAIL_THREAD' | 'COMPOSE_EMAIL' | 'GO_TO_PEOPLE' | 'GO_TO_COMPANIES' | 'GO_TO_DASHBOARDS' | 'GO_TO_OPPORTUNITIES' | 'GO_TO_SETTINGS' | 'GO_TO_TASKS' | 'GO_TO_NOTES' | 'GO_TO_WORKFLOWS' | 'GO_TO_RUNS' | 'DELETE_SINGLE_RECORD' | 'DELETE_MULTIPLE_RECORDS' | 'RESTORE_SINGLE_RECORD' | 'RESTORE_MULTIPLE_RECORDS' | 'DESTROY_SINGLE_RECORD' | 'DESTROY_MULTIPLE_RECORDS' | 'EXPORT_FROM_RECORD_INDEX' | 'EXPORT_FROM_RECORD_SHOW' | 'EXPORT_MULTIPLE_RECORDS'

export type CommandMenuItemAvailabilityType = 'GLOBAL' | 'RECORD_SELECTION' | 'FALLBACK'

export interface ToolIndexEntry {
    name: Scalars['String']
    description: Scalars['String']
    category: Scalars['String']
    objectName?: Scalars['String']
    icon?: Scalars['String']
    inputSchema?: Scalars['JSON']
    __typename: 'ToolIndexEntry'
}

export interface AgentMessagePart {
    id: Scalars['UUID']
    messageId: Scalars['UUID']
    orderIndex: Scalars['Int']
    type: Scalars['String']
    textContent?: Scalars['String']
    reasoningContent?: Scalars['String']
    toolName?: Scalars['String']
    toolCallId?: Scalars['String']
    toolInput?: Scalars['JSON']
    toolOutput?: Scalars['JSON']
    state?: Scalars['String']
    errorMessage?: Scalars['String']
    errorDetails?: Scalars['JSON']
    sourceUrlSourceId?: Scalars['String']
    sourceUrlUrl?: Scalars['String']
    sourceUrlTitle?: Scalars['String']
    sourceDocumentSourceId?: Scalars['String']
    sourceDocumentMediaType?: Scalars['String']
    sourceDocumentTitle?: Scalars['String']
    sourceDocumentFilename?: Scalars['String']
    fileMediaType?: Scalars['String']
    fileFilename?: Scalars['String']
    fileId?: Scalars['UUID']
    fileUrl?: Scalars['String']
    providerMetadata?: Scalars['JSON']
    createdAt: Scalars['DateTime']
    __typename: 'AgentMessagePart'
}

export interface ChannelSyncSuccess {
    success: Scalars['Boolean']
    __typename: 'ChannelSyncSuccess'
}

export interface BarChartSeries {
    key: Scalars['String']
    label: Scalars['String']
    __typename: 'BarChartSeries'
}

export interface BarChartData {
    data: Scalars['JSON'][]
    indexBy: Scalars['String']
    keys: Scalars['String'][]
    series: BarChartSeries[]
    xAxisLabel: Scalars['String']
    yAxisLabel: Scalars['String']
    showLegend: Scalars['Boolean']
    showDataLabels: Scalars['Boolean']
    layout: BarChartLayout
    groupMode: BarChartGroupMode
    hasTooManyGroups: Scalars['Boolean']
    formattedToRawLookup: Scalars['JSON']
    __typename: 'BarChartData'
}

export interface LineChartDataPoint {
    x: Scalars['String']
    y: Scalars['Float']
    __typename: 'LineChartDataPoint'
}

export interface LineChartSeries {
    id: Scalars['String']
    label: Scalars['String']
    data: LineChartDataPoint[]
    __typename: 'LineChartSeries'
}

export interface LineChartData {
    series: LineChartSeries[]
    xAxisLabel: Scalars['String']
    yAxisLabel: Scalars['String']
    showLegend: Scalars['Boolean']
    showDataLabels: Scalars['Boolean']
    hasTooManyGroups: Scalars['Boolean']
    formattedToRawLookup: Scalars['JSON']
    __typename: 'LineChartData'
}

export interface PieChartDataItem {
    id: Scalars['String']
    value: Scalars['Float']
    __typename: 'PieChartDataItem'
}

export interface PieChartData {
    data: PieChartDataItem[]
    showLegend: Scalars['Boolean']
    showDataLabels: Scalars['Boolean']
    showCenterMetric: Scalars['Boolean']
    hasTooManyGroups: Scalars['Boolean']
    formattedToRawLookup: Scalars['JSON']
    __typename: 'PieChartData'
}

export interface DuplicatedDashboard {
    id: Scalars['UUID']
    title?: Scalars['String']
    pageLayoutId?: Scalars['UUID']
    position: Scalars['Float']
    createdAt: Scalars['String']
    updatedAt: Scalars['String']
    __typename: 'DuplicatedDashboard'
}

export interface ConnectedAccountDTO {
    id: Scalars['UUID']
    handle: Scalars['String']
    provider: Scalars['String']
    lastCredentialsRefreshedAt?: Scalars['DateTime']
    authFailedAt?: Scalars['DateTime']
    handleAliases?: Scalars['String'][]
    scopes?: Scalars['String'][]
    connectionParameters?: ImapSmtpCaldavConnectionParameters
    lastSignedInAt?: Scalars['DateTime']
    userWorkspaceId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'ConnectedAccountDTO'
}

export interface SendEmailOutput {
    success: Scalars['Boolean']
    error?: Scalars['String']
    __typename: 'SendEmailOutput'
}

export interface EventLogRecord {
    event: Scalars['String']
    timestamp: Scalars['DateTime']
    userId?: Scalars['String']
    properties?: Scalars['JSON']
    recordId?: Scalars['String']
    objectMetadataId?: Scalars['String']
    isCustom?: Scalars['Boolean']
    __typename: 'EventLogRecord'
}

export interface EventLogPageInfo {
    endCursor?: Scalars['String']
    hasNextPage: Scalars['Boolean']
    __typename: 'EventLogPageInfo'
}

export interface EventLogQueryResult {
    records: EventLogRecord[]
    totalCount: Scalars['Int']
    pageInfo: EventLogPageInfo
    __typename: 'EventLogQueryResult'
}

export interface Skill {
    id: Scalars['UUID']
    name: Scalars['String']
    label: Scalars['String']
    icon?: Scalars['String']
    description?: Scalars['String']
    content: Scalars['String']
    isCustom: Scalars['Boolean']
    isActive: Scalars['Boolean']
    applicationId?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'Skill'
}

export interface AgentChatThread {
    id: Scalars['UUID']
    title?: Scalars['String']
    totalInputTokens: Scalars['Int']
    totalOutputTokens: Scalars['Int']
    contextWindowTokens?: Scalars['Int']
    conversationSize: Scalars['Int']
    totalInputCredits: Scalars['Float']
    totalOutputCredits: Scalars['Float']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'AgentChatThread'
}

export interface AgentMessage {
    id: Scalars['UUID']
    threadId: Scalars['UUID']
    turnId?: Scalars['UUID']
    agentId?: Scalars['UUID']
    role: Scalars['String']
    status: Scalars['String']
    parts: AgentMessagePart[]
    processedAt?: Scalars['DateTime']
    createdAt: Scalars['DateTime']
    __typename: 'AgentMessage'
}

export interface AISystemPromptSection {
    title: Scalars['String']
    content: Scalars['String']
    estimatedTokenCount: Scalars['Int']
    __typename: 'AISystemPromptSection'
}

export interface AISystemPromptPreview {
    sections: AISystemPromptSection[]
    estimatedTokenCount: Scalars['Int']
    __typename: 'AISystemPromptPreview'
}

export interface ChatStreamCatchupChunks {
    chunks: Scalars['JSON'][]
    maxSeq: Scalars['Int']
    __typename: 'ChatStreamCatchupChunks'
}

export interface SendChatMessageResult {
    messageId: Scalars['String']
    queued: Scalars['Boolean']
    streamId?: Scalars['String']
    __typename: 'SendChatMessageResult'
}

export interface AgentChatEvent {
    threadId: Scalars['String']
    event: Scalars['JSON']
    __typename: 'AgentChatEvent'
}

export interface AgentChatThreadEdge {
    /** The node containing the AgentChatThread */
    node: AgentChatThread
    /** Cursor for this node. */
    cursor: Scalars['ConnectionCursor']
    __typename: 'AgentChatThreadEdge'
}

export interface AgentChatThreadConnection {
    /** Paging information */
    pageInfo: PageInfo
    /** Array of edges. */
    edges: AgentChatThreadEdge[]
    __typename: 'AgentChatThreadConnection'
}

export interface AgentTurnEvaluation {
    id: Scalars['UUID']
    turnId: Scalars['UUID']
    score: Scalars['Int']
    comment?: Scalars['String']
    createdAt: Scalars['DateTime']
    __typename: 'AgentTurnEvaluation'
}

export interface AgentTurn {
    id: Scalars['UUID']
    threadId: Scalars['UUID']
    agentId?: Scalars['UUID']
    evaluations: AgentTurnEvaluation[]
    messages: AgentMessage[]
    createdAt: Scalars['DateTime']
    __typename: 'AgentTurn'
}

export interface CalendarChannel {
    id: Scalars['UUID']
    handle: Scalars['String']
    syncStatus: CalendarChannelSyncStatus
    syncStage: CalendarChannelSyncStage
    visibility: CalendarChannelVisibility
    isContactAutoCreationEnabled: Scalars['Boolean']
    contactAutoCreationPolicy: CalendarChannelContactAutoCreationPolicy
    isSyncEnabled: Scalars['Boolean']
    syncedAt?: Scalars['DateTime']
    syncStageStartedAt?: Scalars['DateTime']
    throttleFailureCount: Scalars['Float']
    connectedAccountId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'CalendarChannel'
}

export type CalendarChannelSyncStatus = 'NOT_SYNCED' | 'ONGOING' | 'ACTIVE' | 'FAILED_INSUFFICIENT_PERMISSIONS' | 'FAILED_UNKNOWN'

export type CalendarChannelSyncStage = 'PENDING_CONFIGURATION' | 'CALENDAR_EVENT_LIST_FETCH_PENDING' | 'CALENDAR_EVENT_LIST_FETCH_SCHEDULED' | 'CALENDAR_EVENT_LIST_FETCH_ONGOING' | 'CALENDAR_EVENTS_IMPORT_PENDING' | 'CALENDAR_EVENTS_IMPORT_SCHEDULED' | 'CALENDAR_EVENTS_IMPORT_ONGOING' | 'FAILED'

export type CalendarChannelVisibility = 'METADATA' | 'SHARE_EVERYTHING'

export type CalendarChannelContactAutoCreationPolicy = 'AS_PARTICIPANT_AND_ORGANIZER' | 'AS_PARTICIPANT' | 'AS_ORGANIZER' | 'NONE'

export interface MessageChannel {
    id: Scalars['UUID']
    visibility: MessageChannelVisibility
    handle: Scalars['String']
    type: MessageChannelType
    isContactAutoCreationEnabled: Scalars['Boolean']
    contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy
    messageFolderImportPolicy: MessageFolderImportPolicy
    excludeNonProfessionalEmails: Scalars['Boolean']
    excludeGroupEmails: Scalars['Boolean']
    pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction
    isSyncEnabled: Scalars['Boolean']
    syncedAt?: Scalars['DateTime']
    syncStatus: MessageChannelSyncStatus
    syncStage: MessageChannelSyncStage
    syncStageStartedAt?: Scalars['DateTime']
    throttleFailureCount: Scalars['Float']
    throttleRetryAfter?: Scalars['DateTime']
    connectedAccountId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'MessageChannel'
}

export type MessageChannelVisibility = 'METADATA' | 'SUBJECT' | 'SHARE_EVERYTHING'

export type MessageChannelType = 'EMAIL' | 'SMS'

export type MessageChannelContactAutoCreationPolicy = 'SENT_AND_RECEIVED' | 'SENT' | 'NONE'

export type MessageFolderImportPolicy = 'ALL_FOLDERS' | 'SELECTED_FOLDERS'

export type MessageChannelPendingGroupEmailsAction = 'GROUP_EMAILS_DELETION' | 'GROUP_EMAILS_IMPORT' | 'NONE'

export type MessageChannelSyncStatus = 'NOT_SYNCED' | 'ONGOING' | 'ACTIVE' | 'FAILED_INSUFFICIENT_PERMISSIONS' | 'FAILED_UNKNOWN'

export type MessageChannelSyncStage = 'PENDING_CONFIGURATION' | 'MESSAGE_LIST_FETCH_PENDING' | 'MESSAGE_LIST_FETCH_SCHEDULED' | 'MESSAGE_LIST_FETCH_ONGOING' | 'MESSAGES_IMPORT_PENDING' | 'MESSAGES_IMPORT_SCHEDULED' | 'MESSAGES_IMPORT_ONGOING' | 'FAILED'

export interface MessageFolder {
    id: Scalars['UUID']
    name?: Scalars['String']
    isSentFolder: Scalars['Boolean']
    isSynced: Scalars['Boolean']
    parentFolderId?: Scalars['String']
    externalId?: Scalars['String']
    pendingSyncAction: MessageFolderPendingSyncAction
    messageChannelId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'MessageFolder'
}

export type MessageFolderPendingSyncAction = 'FOLDER_DELETION' | 'NONE'

export interface CollectionHash {
    collectionName: AllMetadataName
    hash: Scalars['String']
    __typename: 'CollectionHash'
}

export type AllMetadataName = 'fieldMetadata' | 'objectMetadata' | 'view' | 'viewField' | 'viewFieldGroup' | 'viewGroup' | 'viewSort' | 'rowLevelPermissionPredicate' | 'rowLevelPermissionPredicateGroup' | 'viewFilterGroup' | 'index' | 'logicFunction' | 'viewFilter' | 'role' | 'roleTarget' | 'agent' | 'skill' | 'pageLayout' | 'pageLayoutWidget' | 'pageLayoutTab' | 'commandMenuItem' | 'navigationMenuItem' | 'permissionFlag' | 'objectPermission' | 'fieldPermission' | 'frontComponent' | 'webhook'

export interface MinimalObjectMetadata {
    id: Scalars['UUID']
    nameSingular: Scalars['String']
    namePlural: Scalars['String']
    labelSingular: Scalars['String']
    labelPlural: Scalars['String']
    icon?: Scalars['String']
    color?: Scalars['String']
    isCustom: Scalars['Boolean']
    isActive: Scalars['Boolean']
    isSystem: Scalars['Boolean']
    isRemote: Scalars['Boolean']
    __typename: 'MinimalObjectMetadata'
}

export interface MinimalView {
    id: Scalars['UUID']
    type: ViewType
    key?: ViewKey
    objectMetadataId: Scalars['UUID']
    __typename: 'MinimalView'
}

export interface MinimalMetadata {
    objectMetadataItems: MinimalObjectMetadata[]
    views: MinimalView[]
    collectionHashes: CollectionHash[]
    __typename: 'MinimalMetadata'
}

export interface Webhook {
    id: Scalars['UUID']
    targetUrl: Scalars['String']
    operations: Scalars['String'][]
    description?: Scalars['String']
    secret: Scalars['String']
    applicationId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    __typename: 'Webhook'
}

export interface Query {
    navigationMenuItems: NavigationMenuItem[]
    navigationMenuItem?: NavigationMenuItem
    getViewFilterGroups: ViewFilterGroup[]
    getViewFilterGroup?: ViewFilterGroup
    getViewFilters: ViewFilter[]
    getViewFilter?: ViewFilter
    getViews: View[]
    getView?: View
    getViewSorts: ViewSort[]
    getViewSort?: ViewSort
    getViewFields: ViewField[]
    getViewField?: ViewField
    getViewFieldGroups: ViewFieldGroup[]
    getViewFieldGroup?: ViewFieldGroup
    apiKeys: ApiKey[]
    apiKey?: ApiKey
    enterprisePortalSession?: Scalars['String']
    enterpriseCheckoutSession?: Scalars['String']
    enterpriseSubscriptionStatus?: EnterpriseSubscriptionStatusDTO
    billingPortalSession: BillingSession
    listPlans: BillingPlan[]
    getMeteredProductsUsage: BillingMeteredProductUsage[]
    findWorkspaceInvitations: WorkspaceInvitation[]
    getApprovedAccessDomains: ApprovedAccessDomain[]
    getPageLayoutTabs: PageLayoutTab[]
    getPageLayoutTab: PageLayoutTab
    getPageLayouts: PageLayout[]
    getPageLayout?: PageLayout
    getPageLayoutWidgets: PageLayoutWidget[]
    getPageLayoutWidget: PageLayoutWidget
    findOneLogicFunction: LogicFunction
    findManyLogicFunctions: LogicFunction[]
    getAvailablePackages: Scalars['JSON']
    getLogicFunctionSourceCode?: Scalars['String']
    commandMenuItems: CommandMenuItem[]
    commandMenuItem?: CommandMenuItem
    frontComponents: FrontComponent[]
    frontComponent?: FrontComponent
    objectRecordCounts: ObjectRecordCount[]
    object: Object
    objects: ObjectConnection
    index: Index
    indexMetadatas: IndexConnection
    findManyAgents: Agent[]
    findOneAgent: Agent
    getRoles: Role[]
    getToolIndex: ToolIndexEntry[]
    getToolInputSchema?: Scalars['JSON']
    field: Field
    fields: FieldConnection
    getViewGroups: ViewGroup[]
    getViewGroup?: ViewGroup
    myMessageFolders: MessageFolder[]
    myMessageChannels: MessageChannel[]
    myConnectedAccounts: ConnectedAccountDTO[]
    connectedAccounts: ConnectedAccountDTO[]
    myCalendarChannels: CalendarChannel[]
    webhooks: Webhook[]
    webhook?: Webhook
    minimalMetadata: MinimalMetadata
    chatThread: AgentChatThread
    chatMessages: AgentMessage[]
    chatStreamCatchupChunks: ChatStreamCatchupChunks
    getAISystemPromptPreview: AISystemPromptPreview
    skills: Skill[]
    skill?: Skill
    chatThreads: AgentChatThreadConnection
    agentTurns: AgentTurn[]
    eventLogs: EventLogQueryResult
    pieChartData: PieChartData
    lineChartData: LineChartData
    barChartData: BarChartData
    checkUserExists: CheckUserExist
    checkWorkspaceInviteHashIsValid: WorkspaceInviteHashValid
    findWorkspaceFromInviteHash: Workspace
    validatePasswordResetToken: ValidatePasswordResetToken
    findApplicationRegistrationByClientId?: PublicApplicationRegistration
    findApplicationRegistrationByUniversalIdentifier?: ApplicationRegistration
    findManyApplicationRegistrations: ApplicationRegistration[]
    findOneApplicationRegistration: ApplicationRegistration
    findApplicationRegistrationStats: ApplicationRegistrationStats
    findApplicationRegistrationVariables: ApplicationRegistrationVariable[]
    applicationRegistrationTarballUrl?: Scalars['String']
    currentUser: User
    currentWorkspace: Workspace
    getPublicWorkspaceDataByDomain: PublicWorkspaceData
    getSSOIdentityProviders: FindAvailableSSOIDP[]
    getConnectedImapSmtpCaldavAccount: ConnectedImapSmtpCaldavAccount
    getAutoCompleteAddress: AutocompleteResult[]
    getAddressDetails: PlaceDetailsResult
    getConfigVariablesGrouped: ConfigVariables
    getSystemHealthStatus: SystemHealth
    getIndicatorHealthStatus: AdminPanelHealthServiceData
    getQueueMetrics: QueueMetricsData
    versionInfo: VersionInfo
    getAdminAiModels: AdminAIModels
    getDatabaseConfigVariable: ConfigVariable
    getQueueJobs: QueueJobsResponse
    findAllApplicationRegistrations: ApplicationRegistration[]
    getAiProviders: Scalars['JSON']
    getModelsDevProviders: ModelsDevProviderSuggestion[]
    getModelsDevSuggestions: ModelsDevModelSuggestion[]
    getAdminAiUsageByWorkspace: UsageBreakdownItem[]
    getMaintenanceMode?: MaintenanceMode
    getUsageAnalytics: UsageAnalytics
    getPostgresCredentials?: PostgresCredentials
    findManyPublicDomains: PublicDomain[]
    getEmailingDomains: EmailingDomain[]
    findManyMarketplaceApps: MarketplaceApp[]
    findMarketplaceAppDetail: MarketplaceAppDetail
    findManyApplications: Application[]
    findOneApplication: Application
    __typename: 'Query'
}

export type AgentChatThreadSortFields = 'id' | 'updatedAt'


/** Sort Directions */
export type SortDirection = 'ASC' | 'DESC'


/** Sort Nulls Options */
export type SortNulls = 'NULLS_FIRST' | 'NULLS_LAST'

export type EventLogTable = 'WORKSPACE_EVENT' | 'PAGEVIEW' | 'OBJECT_EVENT' | 'USAGE_EVENT'

export type UsageOperationType = 'AI_CHAT_TOKEN' | 'AI_WORKFLOW_TOKEN' | 'WORKFLOW_EXECUTION' | 'CODE_EXECUTION' | 'WEB_SEARCH'

export interface Mutation {
    addQueryToEventStream: Scalars['Boolean']
    removeQueryFromEventStream: Scalars['Boolean']
    createManyNavigationMenuItems: NavigationMenuItem[]
    createNavigationMenuItem: NavigationMenuItem
    updateManyNavigationMenuItems: NavigationMenuItem[]
    updateNavigationMenuItem: NavigationMenuItem
    deleteManyNavigationMenuItems: NavigationMenuItem[]
    deleteNavigationMenuItem: NavigationMenuItem
    uploadAIChatFile: FileWithSignedUrl
    uploadWorkflowFile: FileWithSignedUrl
    uploadWorkspaceLogo: FileWithSignedUrl
    uploadWorkspaceMemberProfilePicture: FileWithSignedUrl
    uploadFilesFieldFile: FileWithSignedUrl
    uploadFilesFieldFileByUniversalIdentifier: FileWithSignedUrl
    createViewFilterGroup: ViewFilterGroup
    updateViewFilterGroup: ViewFilterGroup
    deleteViewFilterGroup: Scalars['Boolean']
    destroyViewFilterGroup: Scalars['Boolean']
    createViewFilter: ViewFilter
    updateViewFilter: ViewFilter
    deleteViewFilter: ViewFilter
    destroyViewFilter: ViewFilter
    createView: View
    updateView: View
    deleteView: Scalars['Boolean']
    destroyView: Scalars['Boolean']
    createViewSort: ViewSort
    updateViewSort: ViewSort
    deleteViewSort: Scalars['Boolean']
    destroyViewSort: Scalars['Boolean']
    updateViewField: ViewField
    createViewField: ViewField
    createManyViewFields: ViewField[]
    deleteViewField: ViewField
    destroyViewField: ViewField
    updateViewFieldGroup: ViewFieldGroup
    createViewFieldGroup: ViewFieldGroup
    createManyViewFieldGroups: ViewFieldGroup[]
    deleteViewFieldGroup: ViewFieldGroup
    destroyViewFieldGroup: ViewFieldGroup
    upsertFieldsWidget: View
    createApiKey: ApiKey
    updateApiKey?: ApiKey
    revokeApiKey?: ApiKey
    assignRoleToApiKey: Scalars['Boolean']
    createObjectEvent: Analytics
    trackAnalytics: Analytics
    refreshEnterpriseValidityToken: Scalars['Boolean']
    setEnterpriseKey: EnterpriseLicenseInfoDTO
    skipSyncEmailOnboardingStep: OnboardingStepSuccess
    skipBookOnboardingStep: OnboardingStepSuccess
    checkoutSession: BillingSession
    switchSubscriptionInterval: BillingUpdate
    switchBillingPlan: BillingUpdate
    cancelSwitchBillingPlan: BillingUpdate
    cancelSwitchBillingInterval: BillingUpdate
    setMeteredSubscriptionPrice: BillingUpdate
    endSubscriptionTrialPeriod: BillingEndTrialPeriod
    cancelSwitchMeteredPrice: BillingUpdate
    deleteWorkspaceInvitation: Scalars['String']
    resendWorkspaceInvitation: SendInvitations
    sendInvitations: SendInvitations
    createApprovedAccessDomain: ApprovedAccessDomain
    deleteApprovedAccessDomain: Scalars['Boolean']
    validateApprovedAccessDomain: ApprovedAccessDomain
    createPageLayoutTab: PageLayoutTab
    updatePageLayoutTab: PageLayoutTab
    destroyPageLayoutTab: Scalars['Boolean']
    createPageLayout: PageLayout
    updatePageLayout: PageLayout
    destroyPageLayout: Scalars['Boolean']
    updatePageLayoutWithTabsAndWidgets: PageLayout
    resetPageLayoutWidgetToDefault: PageLayoutWidget
    createPageLayoutWidget: PageLayoutWidget
    updatePageLayoutWidget: PageLayoutWidget
    destroyPageLayoutWidget: Scalars['Boolean']
    deleteOneLogicFunction: LogicFunction
    createOneLogicFunction: LogicFunction
    executeOneLogicFunction: LogicFunctionExecutionResult
    updateOneLogicFunction: Scalars['Boolean']
    createCommandMenuItem: CommandMenuItem
    updateCommandMenuItem: CommandMenuItem
    deleteCommandMenuItem: CommandMenuItem
    createFrontComponent: FrontComponent
    updateFrontComponent: FrontComponent
    deleteFrontComponent: FrontComponent
    createOneObject: Object
    deleteOneObject: Object
    updateOneObject: Object
    createOneAgent: Agent
    updateOneAgent: Agent
    deleteOneAgent: Agent
    updateWorkspaceMemberRole: WorkspaceMember
    createOneRole: Role
    updateOneRole: Role
    deleteOneRole: Scalars['String']
    upsertObjectPermissions: ObjectPermission[]
    upsertPermissionFlags: PermissionFlag[]
    upsertFieldPermissions: FieldPermission[]
    upsertRowLevelPermissionPredicates: UpsertRowLevelPermissionPredicatesResult
    assignRoleToAgent: Scalars['Boolean']
    removeRoleFromAgent: Scalars['Boolean']
    createOneField: Field
    updateOneField: Field
    deleteOneField: Field
    createViewGroup: ViewGroup
    createManyViewGroups: ViewGroup[]
    updateViewGroup: ViewGroup
    updateManyViewGroups: ViewGroup[]
    deleteViewGroup: ViewGroup
    destroyViewGroup: ViewGroup
    updateMessageFolder: MessageFolder
    updateMessageFolders: MessageFolder[]
    updateMessageChannel: MessageChannel
    deleteConnectedAccount: ConnectedAccountDTO
    updateCalendarChannel: CalendarChannel
    createWebhook: Webhook
    updateWebhook: Webhook
    deleteWebhook: Webhook
    createChatThread: AgentChatThread
    sendChatMessage: SendChatMessageResult
    stopAgentChatStream: Scalars['Boolean']
    deleteQueuedChatMessage: Scalars['Boolean']
    createSkill: Skill
    updateSkill: Skill
    deleteSkill: Skill
    activateSkill: Skill
    deactivateSkill: Skill
    evaluateAgentTurn: AgentTurnEvaluation
    runEvaluationInput: AgentTurn
    duplicateDashboard: DuplicatedDashboard
    getAuthorizationUrlForSSO: GetAuthorizationUrlForSSO
    getLoginTokenFromCredentials: LoginToken
    signIn: AvailableWorkspacesAndAccessTokens
    verifyEmailAndGetLoginToken: VerifyEmailAndGetLoginToken
    verifyEmailAndGetWorkspaceAgnosticToken: AvailableWorkspacesAndAccessTokens
    getAuthTokensFromOTP: AuthTokens
    signUp: AvailableWorkspacesAndAccessTokens
    signUpInWorkspace: SignUp
    signUpInNewWorkspace: SignUp
    generateTransientToken: TransientToken
    getAuthTokensFromLoginToken: AuthTokens
    authorizeApp: AuthorizeApp
    renewToken: AuthTokens
    generateApiKeyToken: ApiKeyToken
    emailPasswordResetLink: EmailPasswordResetLink
    updatePasswordViaResetToken: InvalidatePassword
    createApplicationRegistration: CreateApplicationRegistration
    updateApplicationRegistration: ApplicationRegistration
    deleteApplicationRegistration: Scalars['Boolean']
    rotateApplicationRegistrationClientSecret: RotateClientSecret
    createApplicationRegistrationVariable: ApplicationRegistrationVariable
    updateApplicationRegistrationVariable: ApplicationRegistrationVariable
    deleteApplicationRegistrationVariable: Scalars['Boolean']
    uploadAppTarball: ApplicationRegistration
    transferApplicationRegistrationOwnership: ApplicationRegistration
    initiateOTPProvisioning: InitiateTwoFactorAuthenticationProvisioning
    initiateOTPProvisioningForAuthenticatedUser: InitiateTwoFactorAuthenticationProvisioning
    deleteTwoFactorAuthenticationMethod: DeleteTwoFactorAuthenticationMethod
    verifyTwoFactorAuthenticationMethodForAuthenticatedUser: VerifyTwoFactorAuthenticationMethod
    deleteUser: User
    deleteUserFromWorkspace: UserWorkspace
    updateUserEmail: Scalars['Boolean']
    resendEmailVerificationToken: ResendEmailVerificationToken
    activateWorkspace: Workspace
    updateWorkspace: Workspace
    deleteCurrentWorkspace: Workspace
    checkCustomDomainValidRecords?: DomainValidRecords
    createOIDCIdentityProvider: SetupSso
    createSAMLIdentityProvider: SetupSso
    deleteSSOIdentityProvider: DeleteSso
    editSSOIdentityProvider: EditSso
    impersonate: Impersonate
    sendEmail: SendEmailOutput
    startChannelSync: ChannelSyncSuccess
    saveImapSmtpCaldavAccount: ImapSmtpCaldavConnectionSuccess
    updateLabPublicFeatureFlag: FeatureFlag
    userLookupAdminPanel: UserLookup
    updateWorkspaceFeatureFlag: Scalars['Boolean']
    setAdminAiModelEnabled: Scalars['Boolean']
    setAdminAiModelRecommended: Scalars['Boolean']
    setAdminDefaultAiModel: Scalars['Boolean']
    createDatabaseConfigVariable: Scalars['Boolean']
    updateDatabaseConfigVariable: Scalars['Boolean']
    deleteDatabaseConfigVariable: Scalars['Boolean']
    retryJobs: RetryJobsResponse
    deleteJobs: DeleteJobsResponse
    addAiProvider: Scalars['Boolean']
    removeAiProvider: Scalars['Boolean']
    addModelToProvider: Scalars['Boolean']
    removeModelFromProvider: Scalars['Boolean']
    setMaintenanceMode: Scalars['Boolean']
    clearMaintenanceMode: Scalars['Boolean']
    enablePostgresProxy: PostgresCredentials
    disablePostgresProxy: PostgresCredentials
    createPublicDomain: PublicDomain
    deletePublicDomain: Scalars['Boolean']
    checkPublicDomainValidRecords?: DomainValidRecords
    createEmailingDomain: EmailingDomain
    deleteEmailingDomain: Scalars['Boolean']
    verifyEmailingDomain: EmailingDomain
    createOneAppToken: AppToken
    installMarketplaceApp: Scalars['Boolean']
    syncMarketplaceCatalog: Scalars['Boolean']
    installApplication: Scalars['Boolean']
    runWorkspaceMigration: Scalars['Boolean']
    uninstallApplication: Scalars['Boolean']
    updateOneApplicationVariable: Scalars['Boolean']
    createDevelopmentApplication: DevelopmentApplication
    generateApplicationToken: ApplicationTokenPair
    syncApplication: WorkspaceMigration
    uploadApplicationFile: File
    upgradeApplication: Scalars['Boolean']
    renewApplicationToken: ApplicationTokenPair
    __typename: 'Mutation'
}

export type AnalyticsType = 'PAGEVIEW' | 'TRACK'

export type AiModelRole = 'FAST' | 'SMART'

export type WorkspaceMigrationActionType = 'delete' | 'create' | 'update'

export type FileFolder = 'ProfilePicture' | 'WorkspaceLogo' | 'Attachment' | 'PersonPicture' | 'CorePicture' | 'File' | 'AgentChat' | 'BuiltLogicFunction' | 'BuiltFrontComponent' | 'PublicAsset' | 'Source' | 'FilesField' | 'Dependencies' | 'Workflow' | 'AppTarball' | 'GeneratedSdkClient'

export interface Subscription {
    onEventSubscription?: EventSubscription
    logicFunctionLogs: LogicFunctionLogs
    onAgentChatEvent: AgentChatEvent
    __typename: 'Subscription'
}

export interface BillingProductDTOGenqlSelection{
    name?: boolean | number
    description?: boolean | number
    images?: boolean | number
    metadata?: BillingProductMetadataGenqlSelection
    on_BillingLicensedProduct?: BillingLicensedProductGenqlSelection
    on_BillingMeteredProduct?: BillingMeteredProductGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApiKeyGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    expiresAt?: boolean | number
    revokedAt?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    role?: RoleGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationRegistrationVariableGenqlSelection{
    id?: boolean | number
    key?: boolean | number
    description?: boolean | number
    isSecret?: boolean | number
    isRequired?: boolean | number
    isFilled?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationRegistrationGenqlSelection{
    id?: boolean | number
    universalIdentifier?: boolean | number
    name?: boolean | number
    oAuthClientId?: boolean | number
    oAuthRedirectUris?: boolean | number
    oAuthScopes?: boolean | number
    ownerWorkspaceId?: boolean | number
    sourceType?: boolean | number
    sourcePackage?: boolean | number
    latestAvailableVersion?: boolean | number
    isListed?: boolean | number
    isFeatured?: boolean | number
    logoUrl?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TwoFactorAuthenticationMethodSummaryGenqlSelection{
    twoFactorAuthenticationMethodId?: boolean | number
    status?: boolean | number
    strategy?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RowLevelPermissionPredicateGroupGenqlSelection{
    id?: boolean | number
    parentRowLevelPermissionPredicateGroupId?: boolean | number
    logicalOperator?: boolean | number
    positionInRowLevelPermissionPredicateGroup?: boolean | number
    roleId?: boolean | number
    objectMetadataId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RowLevelPermissionPredicateGenqlSelection{
    id?: boolean | number
    fieldMetadataId?: boolean | number
    objectMetadataId?: boolean | number
    operand?: boolean | number
    subFieldName?: boolean | number
    workspaceMemberFieldMetadataId?: boolean | number
    workspaceMemberSubFieldName?: boolean | number
    rowLevelPermissionPredicateGroupId?: boolean | number
    positionInRowLevelPermissionPredicateGroup?: boolean | number
    roleId?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectPermissionGenqlSelection{
    objectMetadataId?: boolean | number
    canReadObjectRecords?: boolean | number
    canUpdateObjectRecords?: boolean | number
    canSoftDeleteObjectRecords?: boolean | number
    canDestroyObjectRecords?: boolean | number
    restrictedFields?: boolean | number
    rowLevelPermissionPredicates?: RowLevelPermissionPredicateGenqlSelection
    rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroupGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserWorkspaceGenqlSelection{
    id?: boolean | number
    user?: UserGenqlSelection
    userId?: boolean | number
    locale?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    permissionFlags?: boolean | number
    objectPermissions?: ObjectPermissionGenqlSelection
    objectsPermissions?: ObjectPermissionGenqlSelection
    twoFactorAuthenticationMethodSummary?: TwoFactorAuthenticationMethodSummaryGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FullNameGenqlSelection{
    firstName?: boolean | number
    lastName?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceMemberGenqlSelection{
    id?: boolean | number
    name?: FullNameGenqlSelection
    userEmail?: boolean | number
    colorScheme?: boolean | number
    avatarUrl?: boolean | number
    locale?: boolean | number
    calendarStartDay?: boolean | number
    timeZone?: boolean | number
    dateFormat?: boolean | number
    timeFormat?: boolean | number
    roles?: RoleGenqlSelection
    userWorkspaceId?: boolean | number
    numberFormat?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    label?: boolean | number
    icon?: boolean | number
    description?: boolean | number
    prompt?: boolean | number
    modelId?: boolean | number
    responseFormat?: boolean | number
    roleId?: boolean | number
    isCustom?: boolean | number
    applicationId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    modelConfiguration?: boolean | number
    evaluationInputs?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FieldPermissionGenqlSelection{
    id?: boolean | number
    objectMetadataId?: boolean | number
    fieldMetadataId?: boolean | number
    roleId?: boolean | number
    canReadFieldValue?: boolean | number
    canUpdateFieldValue?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PermissionFlagGenqlSelection{
    id?: boolean | number
    roleId?: boolean | number
    flag?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApiKeyForRoleGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    expiresAt?: boolean | number
    revokedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RoleGenqlSelection{
    id?: boolean | number
    universalIdentifier?: boolean | number
    label?: boolean | number
    description?: boolean | number
    icon?: boolean | number
    isEditable?: boolean | number
    canBeAssignedToUsers?: boolean | number
    canBeAssignedToAgents?: boolean | number
    canBeAssignedToApiKeys?: boolean | number
    workspaceMembers?: WorkspaceMemberGenqlSelection
    agents?: AgentGenqlSelection
    apiKeys?: ApiKeyForRoleGenqlSelection
    canUpdateAllSettings?: boolean | number
    canAccessAllTools?: boolean | number
    canReadAllObjectRecords?: boolean | number
    canUpdateAllObjectRecords?: boolean | number
    canSoftDeleteAllObjectRecords?: boolean | number
    canDestroyAllObjectRecords?: boolean | number
    permissionFlags?: PermissionFlagGenqlSelection
    objectPermissions?: ObjectPermissionGenqlSelection
    fieldPermissions?: FieldPermissionGenqlSelection
    rowLevelPermissionPredicates?: RowLevelPermissionPredicateGenqlSelection
    rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroupGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationRegistrationSummaryGenqlSelection{
    id?: boolean | number
    latestAvailableVersion?: boolean | number
    sourceType?: boolean | number
    logoUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationVariableGenqlSelection{
    id?: boolean | number
    key?: boolean | number
    value?: boolean | number
    description?: boolean | number
    isSecret?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LogicFunctionGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    description?: boolean | number
    runtime?: boolean | number
    timeoutSeconds?: boolean | number
    sourceHandlerPath?: boolean | number
    handlerName?: boolean | number
    toolInputSchema?: boolean | number
    isTool?: boolean | number
    cronTriggerSettings?: boolean | number
    databaseEventTriggerSettings?: boolean | number
    httpRouteTriggerSettings?: boolean | number
    applicationId?: boolean | number
    universalIdentifier?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface StandardOverridesGenqlSelection{
    label?: boolean | number
    description?: boolean | number
    icon?: boolean | number
    translations?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FieldGenqlSelection{
    id?: boolean | number
    universalIdentifier?: boolean | number
    type?: boolean | number
    name?: boolean | number
    label?: boolean | number
    description?: boolean | number
    icon?: boolean | number
    standardOverrides?: StandardOverridesGenqlSelection
    isCustom?: boolean | number
    isActive?: boolean | number
    isSystem?: boolean | number
    isUIReadOnly?: boolean | number
    isNullable?: boolean | number
    isUnique?: boolean | number
    defaultValue?: boolean | number
    options?: boolean | number
    settings?: boolean | number
    objectMetadataId?: boolean | number
    isLabelSyncedWithName?: boolean | number
    morphId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    applicationId?: boolean | number
    relation?: RelationGenqlSelection
    morphRelations?: RelationGenqlSelection
    object?: ObjectGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IndexFieldGenqlSelection{
    id?: boolean | number
    fieldMetadataId?: boolean | number
    order?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IndexGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    isCustom?: boolean | number
    isUnique?: boolean | number
    indexWhereClause?: boolean | number
    indexType?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    indexFieldMetadataList?: IndexFieldGenqlSelection
    objectMetadata?: (IndexObjectMetadataConnectionGenqlSelection & { __args: {
    /** Limit or page results. */
    paging: CursorPaging, 
    /** Specify to filter the records returned. */
    filter: ObjectFilter} })
    indexFieldMetadatas?: (IndexIndexFieldMetadatasConnectionGenqlSelection & { __args: {
    /** Limit or page results. */
    paging: CursorPaging, 
    /** Specify to filter the records returned. */
    filter: IndexFieldFilter} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CursorPaging {
/** Paginate before opaque cursor */
before?: (Scalars['ConnectionCursor'] | null),
/** Paginate after opaque cursor */
after?: (Scalars['ConnectionCursor'] | null),
/** Paginate first */
first?: (Scalars['Int'] | null),
/** Paginate last */
last?: (Scalars['Int'] | null)}

export interface ObjectFilter {and?: (ObjectFilter[] | null),or?: (ObjectFilter[] | null),id?: (UUIDFilterComparison | null),isCustom?: (BooleanFieldComparison | null),isRemote?: (BooleanFieldComparison | null),isActive?: (BooleanFieldComparison | null),isSystem?: (BooleanFieldComparison | null),isUIReadOnly?: (BooleanFieldComparison | null),isSearchable?: (BooleanFieldComparison | null)}

export interface UUIDFilterComparison {is?: (Scalars['Boolean'] | null),isNot?: (Scalars['Boolean'] | null),eq?: (Scalars['UUID'] | null),neq?: (Scalars['UUID'] | null),gt?: (Scalars['UUID'] | null),gte?: (Scalars['UUID'] | null),lt?: (Scalars['UUID'] | null),lte?: (Scalars['UUID'] | null),like?: (Scalars['UUID'] | null),notLike?: (Scalars['UUID'] | null),iLike?: (Scalars['UUID'] | null),notILike?: (Scalars['UUID'] | null),in?: (Scalars['UUID'][] | null),notIn?: (Scalars['UUID'][] | null)}

export interface BooleanFieldComparison {is?: (Scalars['Boolean'] | null),isNot?: (Scalars['Boolean'] | null)}

export interface IndexFieldFilter {and?: (IndexFieldFilter[] | null),or?: (IndexFieldFilter[] | null),id?: (UUIDFilterComparison | null),fieldMetadataId?: (UUIDFilterComparison | null)}

export interface ObjectStandardOverridesGenqlSelection{
    labelSingular?: boolean | number
    labelPlural?: boolean | number
    description?: boolean | number
    icon?: boolean | number
    color?: boolean | number
    translations?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectGenqlSelection{
    id?: boolean | number
    universalIdentifier?: boolean | number
    nameSingular?: boolean | number
    namePlural?: boolean | number
    labelSingular?: boolean | number
    labelPlural?: boolean | number
    description?: boolean | number
    icon?: boolean | number
    standardOverrides?: ObjectStandardOverridesGenqlSelection
    shortcut?: boolean | number
    color?: boolean | number
    isCustom?: boolean | number
    isRemote?: boolean | number
    isActive?: boolean | number
    isSystem?: boolean | number
    isUIReadOnly?: boolean | number
    isSearchable?: boolean | number
    applicationId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    labelIdentifierFieldMetadataId?: boolean | number
    imageIdentifierFieldMetadataId?: boolean | number
    isLabelSyncedWithName?: boolean | number
    duplicateCriteria?: boolean | number
    fieldsList?: FieldGenqlSelection
    indexMetadataList?: IndexGenqlSelection
    fields?: (ObjectFieldsConnectionGenqlSelection & { __args: {
    /** Limit or page results. */
    paging: CursorPaging, 
    /** Specify to filter the records returned. */
    filter: FieldFilter} })
    indexMetadatas?: (ObjectIndexMetadatasConnectionGenqlSelection & { __args: {
    /** Limit or page results. */
    paging: CursorPaging, 
    /** Specify to filter the records returned. */
    filter: IndexFilter} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FieldFilter {and?: (FieldFilter[] | null),or?: (FieldFilter[] | null),id?: (UUIDFilterComparison | null),isCustom?: (BooleanFieldComparison | null),isActive?: (BooleanFieldComparison | null),isSystem?: (BooleanFieldComparison | null),isUIReadOnly?: (BooleanFieldComparison | null),objectMetadataId?: (UUIDFilterComparison | null)}

export interface IndexFilter {and?: (IndexFilter[] | null),or?: (IndexFilter[] | null),id?: (UUIDFilterComparison | null),isCustom?: (BooleanFieldComparison | null)}

export interface ApplicationGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    description?: boolean | number
    version?: boolean | number
    universalIdentifier?: boolean | number
    packageJsonChecksum?: boolean | number
    packageJsonFileId?: boolean | number
    yarnLockChecksum?: boolean | number
    yarnLockFileId?: boolean | number
    availablePackages?: boolean | number
    applicationRegistrationId?: boolean | number
    canBeUninstalled?: boolean | number
    defaultRoleId?: boolean | number
    settingsCustomTabFrontComponentId?: boolean | number
    defaultLogicFunctionRole?: RoleGenqlSelection
    agents?: AgentGenqlSelection
    logicFunctions?: LogicFunctionGenqlSelection
    objects?: ObjectGenqlSelection
    applicationVariables?: ApplicationVariableGenqlSelection
    applicationRegistration?: ApplicationRegistrationSummaryGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewFieldGenqlSelection{
    id?: boolean | number
    fieldMetadataId?: boolean | number
    isVisible?: boolean | number
    size?: boolean | number
    position?: boolean | number
    aggregateOperation?: boolean | number
    viewId?: boolean | number
    viewFieldGroupId?: boolean | number
    workspaceId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    isOverridden?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewFilterGroupGenqlSelection{
    id?: boolean | number
    parentViewFilterGroupId?: boolean | number
    logicalOperator?: boolean | number
    positionInViewFilterGroup?: boolean | number
    viewId?: boolean | number
    workspaceId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewFilterGenqlSelection{
    id?: boolean | number
    fieldMetadataId?: boolean | number
    operand?: boolean | number
    value?: boolean | number
    viewFilterGroupId?: boolean | number
    positionInViewFilterGroup?: boolean | number
    subFieldName?: boolean | number
    viewId?: boolean | number
    workspaceId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewGroupGenqlSelection{
    id?: boolean | number
    isVisible?: boolean | number
    fieldValue?: boolean | number
    position?: boolean | number
    viewId?: boolean | number
    workspaceId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewSortGenqlSelection{
    id?: boolean | number
    fieldMetadataId?: boolean | number
    direction?: boolean | number
    viewId?: boolean | number
    workspaceId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewFieldGroupGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    position?: boolean | number
    isVisible?: boolean | number
    viewId?: boolean | number
    workspaceId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    viewFields?: ViewFieldGenqlSelection
    isOverridden?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    objectMetadataId?: boolean | number
    type?: boolean | number
    key?: boolean | number
    icon?: boolean | number
    position?: boolean | number
    isCompact?: boolean | number
    isCustom?: boolean | number
    openRecordIn?: boolean | number
    kanbanAggregateOperation?: boolean | number
    kanbanAggregateOperationFieldMetadataId?: boolean | number
    mainGroupByFieldMetadataId?: boolean | number
    shouldHideEmptyGroups?: boolean | number
    calendarFieldMetadataId?: boolean | number
    workspaceId?: boolean | number
    anyFieldFilterValue?: boolean | number
    calendarLayout?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    viewFields?: ViewFieldGenqlSelection
    viewFilters?: ViewFilterGenqlSelection
    viewFilterGroups?: ViewFilterGroupGenqlSelection
    viewSorts?: ViewSortGenqlSelection
    viewGroups?: ViewGroupGenqlSelection
    viewFieldGroups?: ViewFieldGroupGenqlSelection
    visibility?: boolean | number
    createdByUserWorkspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceGenqlSelection{
    id?: boolean | number
    displayName?: boolean | number
    logo?: boolean | number
    logoFileId?: boolean | number
    inviteHash?: boolean | number
    deletedAt?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    allowImpersonation?: boolean | number
    isPublicInviteLinkEnabled?: boolean | number
    trashRetentionDays?: boolean | number
    eventLogRetentionDays?: boolean | number
    workspaceMembersCount?: boolean | number
    activationStatus?: boolean | number
    views?: ViewGenqlSelection
    viewFields?: ViewFieldGenqlSelection
    viewFilters?: ViewFilterGenqlSelection
    viewFilterGroups?: ViewFilterGroupGenqlSelection
    viewGroups?: ViewGroupGenqlSelection
    viewSorts?: ViewSortGenqlSelection
    metadataVersion?: boolean | number
    databaseSchema?: boolean | number
    subdomain?: boolean | number
    customDomain?: boolean | number
    isGoogleAuthEnabled?: boolean | number
    isGoogleAuthBypassEnabled?: boolean | number
    isTwoFactorAuthenticationEnforced?: boolean | number
    isPasswordAuthEnabled?: boolean | number
    isPasswordAuthBypassEnabled?: boolean | number
    isMicrosoftAuthEnabled?: boolean | number
    isMicrosoftAuthBypassEnabled?: boolean | number
    isCustomDomainEnabled?: boolean | number
    editableProfileFields?: boolean | number
    defaultRole?: RoleGenqlSelection
    version?: boolean | number
    fastModel?: boolean | number
    smartModel?: boolean | number
    aiAdditionalInstructions?: boolean | number
    enabledAiModelIds?: boolean | number
    useRecommendedModels?: boolean | number
    routerModel?: boolean | number
    workspaceCustomApplication?: ApplicationGenqlSelection
    featureFlags?: FeatureFlagGenqlSelection
    billingSubscriptions?: BillingSubscriptionGenqlSelection
    currentBillingSubscription?: BillingSubscriptionGenqlSelection
    billingEntitlements?: BillingEntitlementGenqlSelection
    hasValidEnterpriseKey?: boolean | number
    hasValidSignedEnterpriseKey?: boolean | number
    hasValidEnterpriseValidityToken?: boolean | number
    workspaceUrls?: WorkspaceUrlsGenqlSelection
    workspaceCustomApplicationId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AppTokenGenqlSelection{
    id?: boolean | number
    type?: boolean | number
    expiresAt?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserGenqlSelection{
    id?: boolean | number
    firstName?: boolean | number
    lastName?: boolean | number
    email?: boolean | number
    defaultAvatarUrl?: boolean | number
    isEmailVerified?: boolean | number
    disabled?: boolean | number
    canImpersonate?: boolean | number
    canAccessFullAdminPanel?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    locale?: boolean | number
    workspaceMember?: WorkspaceMemberGenqlSelection
    userWorkspaces?: UserWorkspaceGenqlSelection
    onboardingStatus?: boolean | number
    currentWorkspace?: WorkspaceGenqlSelection
    currentUserWorkspace?: UserWorkspaceGenqlSelection
    userVars?: boolean | number
    workspaceMembers?: WorkspaceMemberGenqlSelection
    deletedWorkspaceMembers?: DeletedWorkspaceMemberGenqlSelection
    hasPassword?: boolean | number
    supportUserHash?: boolean | number
    workspaces?: UserWorkspaceGenqlSelection
    availableWorkspaces?: AvailableWorkspacesGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RatioAggregateConfigGenqlSelection{
    fieldMetadataId?: boolean | number
    optionValue?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RichTextBodyGenqlSelection{
    blocknote?: boolean | number
    markdown?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface GridPositionGenqlSelection{
    row?: boolean | number
    column?: boolean | number
    rowSpan?: boolean | number
    columnSpan?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageLayoutWidgetGenqlSelection{
    id?: boolean | number
    pageLayoutTabId?: boolean | number
    title?: boolean | number
    type?: boolean | number
    objectMetadataId?: boolean | number
    gridPosition?: GridPositionGenqlSelection
    position?: PageLayoutWidgetPositionGenqlSelection
    configuration?: WidgetConfigurationGenqlSelection
    conditionalDisplay?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    isOverridden?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageLayoutWidgetPositionGenqlSelection{
    on_PageLayoutWidgetGridPosition?:PageLayoutWidgetGridPositionGenqlSelection,
    on_PageLayoutWidgetVerticalListPosition?:PageLayoutWidgetVerticalListPositionGenqlSelection,
    on_PageLayoutWidgetCanvasPosition?:PageLayoutWidgetCanvasPositionGenqlSelection,
    __typename?: boolean | number
}

export interface PageLayoutWidgetGridPositionGenqlSelection{
    layoutMode?: boolean | number
    row?: boolean | number
    column?: boolean | number
    rowSpan?: boolean | number
    columnSpan?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageLayoutWidgetVerticalListPositionGenqlSelection{
    layoutMode?: boolean | number
    index?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageLayoutWidgetCanvasPositionGenqlSelection{
    layoutMode?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WidgetConfigurationGenqlSelection{
    on_AggregateChartConfiguration?:AggregateChartConfigurationGenqlSelection,
    on_StandaloneRichTextConfiguration?:StandaloneRichTextConfigurationGenqlSelection,
    on_PieChartConfiguration?:PieChartConfigurationGenqlSelection,
    on_LineChartConfiguration?:LineChartConfigurationGenqlSelection,
    on_IframeConfiguration?:IframeConfigurationGenqlSelection,
    on_GaugeChartConfiguration?:GaugeChartConfigurationGenqlSelection,
    on_BarChartConfiguration?:BarChartConfigurationGenqlSelection,
    on_CalendarConfiguration?:CalendarConfigurationGenqlSelection,
    on_FrontComponentConfiguration?:FrontComponentConfigurationGenqlSelection,
    on_EmailsConfiguration?:EmailsConfigurationGenqlSelection,
    on_EmailThreadConfiguration?:EmailThreadConfigurationGenqlSelection,
    on_FieldConfiguration?:FieldConfigurationGenqlSelection,
    on_FieldRichTextConfiguration?:FieldRichTextConfigurationGenqlSelection,
    on_FieldsConfiguration?:FieldsConfigurationGenqlSelection,
    on_FilesConfiguration?:FilesConfigurationGenqlSelection,
    on_NotesConfiguration?:NotesConfigurationGenqlSelection,
    on_TasksConfiguration?:TasksConfigurationGenqlSelection,
    on_TimelineConfiguration?:TimelineConfigurationGenqlSelection,
    on_ViewConfiguration?:ViewConfigurationGenqlSelection,
    on_RecordTableConfiguration?:RecordTableConfigurationGenqlSelection,
    on_WorkflowConfiguration?:WorkflowConfigurationGenqlSelection,
    on_WorkflowRunConfiguration?:WorkflowRunConfigurationGenqlSelection,
    on_WorkflowVersionConfiguration?:WorkflowVersionConfigurationGenqlSelection,
    __typename?: boolean | number
}

export interface AggregateChartConfigurationGenqlSelection{
    configurationType?: boolean | number
    aggregateFieldMetadataId?: boolean | number
    aggregateOperation?: boolean | number
    label?: boolean | number
    displayDataLabel?: boolean | number
    format?: boolean | number
    description?: boolean | number
    filter?: boolean | number
    timezone?: boolean | number
    firstDayOfTheWeek?: boolean | number
    prefix?: boolean | number
    suffix?: boolean | number
    ratioAggregateConfig?: RatioAggregateConfigGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface StandaloneRichTextConfigurationGenqlSelection{
    configurationType?: boolean | number
    body?: RichTextBodyGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PieChartConfigurationGenqlSelection{
    configurationType?: boolean | number
    aggregateFieldMetadataId?: boolean | number
    aggregateOperation?: boolean | number
    groupByFieldMetadataId?: boolean | number
    groupBySubFieldName?: boolean | number
    dateGranularity?: boolean | number
    orderBy?: boolean | number
    manualSortOrder?: boolean | number
    displayDataLabel?: boolean | number
    showCenterMetric?: boolean | number
    displayLegend?: boolean | number
    hideEmptyCategory?: boolean | number
    splitMultiValueFields?: boolean | number
    description?: boolean | number
    color?: boolean | number
    filter?: boolean | number
    timezone?: boolean | number
    firstDayOfTheWeek?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LineChartConfigurationGenqlSelection{
    configurationType?: boolean | number
    aggregateFieldMetadataId?: boolean | number
    aggregateOperation?: boolean | number
    primaryAxisGroupByFieldMetadataId?: boolean | number
    primaryAxisGroupBySubFieldName?: boolean | number
    primaryAxisDateGranularity?: boolean | number
    primaryAxisOrderBy?: boolean | number
    primaryAxisManualSortOrder?: boolean | number
    secondaryAxisGroupByFieldMetadataId?: boolean | number
    secondaryAxisGroupBySubFieldName?: boolean | number
    secondaryAxisGroupByDateGranularity?: boolean | number
    secondaryAxisOrderBy?: boolean | number
    secondaryAxisManualSortOrder?: boolean | number
    omitNullValues?: boolean | number
    splitMultiValueFields?: boolean | number
    axisNameDisplay?: boolean | number
    displayDataLabel?: boolean | number
    displayLegend?: boolean | number
    rangeMin?: boolean | number
    rangeMax?: boolean | number
    description?: boolean | number
    color?: boolean | number
    filter?: boolean | number
    isStacked?: boolean | number
    isCumulative?: boolean | number
    timezone?: boolean | number
    firstDayOfTheWeek?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IframeConfigurationGenqlSelection{
    configurationType?: boolean | number
    url?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface GaugeChartConfigurationGenqlSelection{
    configurationType?: boolean | number
    aggregateFieldMetadataId?: boolean | number
    aggregateOperation?: boolean | number
    displayDataLabel?: boolean | number
    color?: boolean | number
    description?: boolean | number
    filter?: boolean | number
    timezone?: boolean | number
    firstDayOfTheWeek?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BarChartConfigurationGenqlSelection{
    configurationType?: boolean | number
    aggregateFieldMetadataId?: boolean | number
    aggregateOperation?: boolean | number
    primaryAxisGroupByFieldMetadataId?: boolean | number
    primaryAxisGroupBySubFieldName?: boolean | number
    primaryAxisDateGranularity?: boolean | number
    primaryAxisOrderBy?: boolean | number
    primaryAxisManualSortOrder?: boolean | number
    secondaryAxisGroupByFieldMetadataId?: boolean | number
    secondaryAxisGroupBySubFieldName?: boolean | number
    secondaryAxisGroupByDateGranularity?: boolean | number
    secondaryAxisOrderBy?: boolean | number
    secondaryAxisManualSortOrder?: boolean | number
    omitNullValues?: boolean | number
    splitMultiValueFields?: boolean | number
    axisNameDisplay?: boolean | number
    displayDataLabel?: boolean | number
    displayLegend?: boolean | number
    rangeMin?: boolean | number
    rangeMax?: boolean | number
    description?: boolean | number
    color?: boolean | number
    filter?: boolean | number
    groupMode?: boolean | number
    layout?: boolean | number
    isCumulative?: boolean | number
    timezone?: boolean | number
    firstDayOfTheWeek?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CalendarConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FrontComponentConfigurationGenqlSelection{
    configurationType?: boolean | number
    frontComponentId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EmailsConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EmailThreadConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FieldConfigurationGenqlSelection{
    configurationType?: boolean | number
    fieldMetadataId?: boolean | number
    fieldDisplayMode?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FieldRichTextConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FieldsConfigurationGenqlSelection{
    configurationType?: boolean | number
    viewId?: boolean | number
    newFieldDefaultVisibility?: boolean | number
    shouldAllowUserToSeeHiddenFields?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FilesConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface NotesConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TasksConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TimelineConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RecordTableConfigurationGenqlSelection{
    configurationType?: boolean | number
    viewId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkflowConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkflowRunConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkflowVersionConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageLayoutTabGenqlSelection{
    id?: boolean | number
    applicationId?: boolean | number
    title?: boolean | number
    position?: boolean | number
    pageLayoutId?: boolean | number
    widgets?: PageLayoutWidgetGenqlSelection
    icon?: boolean | number
    layoutMode?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    isOverridden?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageLayoutGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    type?: boolean | number
    objectMetadataId?: boolean | number
    tabs?: PageLayoutTabGenqlSelection
    defaultTabToFocusOnMobileAndSidePanelId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AnalyticsGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingSubscriptionSchedulePhaseItemGenqlSelection{
    price?: boolean | number
    quantity?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingSubscriptionSchedulePhaseGenqlSelection{
    start_date?: boolean | number
    end_date?: boolean | number
    items?: BillingSubscriptionSchedulePhaseItemGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingProductMetadataGenqlSelection{
    planKey?: boolean | number
    priceUsageBased?: boolean | number
    productKey?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingPriceLicensedGenqlSelection{
    recurringInterval?: boolean | number
    unitAmount?: boolean | number
    stripePriceId?: boolean | number
    priceUsageType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingPriceTierGenqlSelection{
    upTo?: boolean | number
    flatAmount?: boolean | number
    unitAmount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingPriceMeteredGenqlSelection{
    tiers?: BillingPriceTierGenqlSelection
    recurringInterval?: boolean | number
    stripePriceId?: boolean | number
    priceUsageType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingProductGenqlSelection{
    name?: boolean | number
    description?: boolean | number
    images?: boolean | number
    metadata?: BillingProductMetadataGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingLicensedProductGenqlSelection{
    name?: boolean | number
    description?: boolean | number
    images?: boolean | number
    metadata?: BillingProductMetadataGenqlSelection
    prices?: BillingPriceLicensedGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingMeteredProductGenqlSelection{
    name?: boolean | number
    description?: boolean | number
    images?: boolean | number
    metadata?: BillingProductMetadataGenqlSelection
    prices?: BillingPriceMeteredGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingSubscriptionItemGenqlSelection{
    id?: boolean | number
    hasReachedCurrentPeriodCap?: boolean | number
    quantity?: boolean | number
    stripePriceId?: boolean | number
    billingProduct?: BillingProductDTOGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingSubscriptionGenqlSelection{
    id?: boolean | number
    status?: boolean | number
    interval?: boolean | number
    billingSubscriptionItems?: BillingSubscriptionItemGenqlSelection
    currentPeriodEnd?: boolean | number
    metadata?: boolean | number
    phases?: BillingSubscriptionSchedulePhaseGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingEndTrialPeriodGenqlSelection{
    /** Updated subscription status */
    status?: boolean | number
    /** Boolean that confirms if a payment method was found */
    hasPaymentMethod?: boolean | number
    /** Billing portal URL for payment method update (returned when no payment method exists) */
    billingPortalUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingMeteredProductUsageGenqlSelection{
    productKey?: boolean | number
    periodStart?: boolean | number
    periodEnd?: boolean | number
    usedCredits?: boolean | number
    grantedCredits?: boolean | number
    rolloverCredits?: boolean | number
    totalGrantedCredits?: boolean | number
    unitPriceCents?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingPlanGenqlSelection{
    planKey?: boolean | number
    licensedProducts?: BillingLicensedProductGenqlSelection
    meteredProducts?: BillingMeteredProductGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingSessionGenqlSelection{
    url?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingUpdateGenqlSelection{
    /** Current billing subscription */
    currentBillingSubscription?: BillingSubscriptionGenqlSelection
    /** All billing subscriptions */
    billingSubscriptions?: BillingSubscriptionGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EnterpriseLicenseInfoDTOGenqlSelection{
    isValid?: boolean | number
    licensee?: boolean | number
    expiresAt?: boolean | number
    subscriptionId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EnterpriseSubscriptionStatusDTOGenqlSelection{
    status?: boolean | number
    licensee?: boolean | number
    expiresAt?: boolean | number
    cancelAt?: boolean | number
    currentPeriodEnd?: boolean | number
    isCancellationScheduled?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface OnboardingStepSuccessGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApprovedAccessDomainGenqlSelection{
    id?: boolean | number
    domain?: boolean | number
    isValidated?: boolean | number
    createdAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FileWithSignedUrlGenqlSelection{
    id?: boolean | number
    path?: boolean | number
    size?: boolean | number
    createdAt?: boolean | number
    url?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceInvitationGenqlSelection{
    id?: boolean | number
    email?: boolean | number
    roleId?: boolean | number
    expiresAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SendInvitationsGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    errors?: boolean | number
    result?: WorkspaceInvitationGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RecordIdentifierGenqlSelection{
    id?: boolean | number
    labelIdentifier?: boolean | number
    imageIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface NavigationMenuItemGenqlSelection{
    id?: boolean | number
    userWorkspaceId?: boolean | number
    targetRecordId?: boolean | number
    targetObjectMetadataId?: boolean | number
    viewId?: boolean | number
    type?: boolean | number
    name?: boolean | number
    link?: boolean | number
    icon?: boolean | number
    color?: boolean | number
    folderId?: boolean | number
    position?: boolean | number
    applicationId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    targetRecordIdentifier?: RecordIdentifierGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectRecordEventPropertiesGenqlSelection{
    updatedFields?: boolean | number
    before?: boolean | number
    after?: boolean | number
    diff?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MetadataEventGenqlSelection{
    type?: boolean | number
    metadataName?: boolean | number
    recordId?: boolean | number
    properties?: ObjectRecordEventPropertiesGenqlSelection
    updatedCollectionHash?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectRecordEventGenqlSelection{
    action?: boolean | number
    objectNameSingular?: boolean | number
    recordId?: boolean | number
    userId?: boolean | number
    workspaceMemberId?: boolean | number
    properties?: ObjectRecordEventPropertiesGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectRecordEventWithQueryIdsGenqlSelection{
    queryIds?: boolean | number
    objectRecordEvent?: ObjectRecordEventGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EventSubscriptionGenqlSelection{
    eventStreamId?: boolean | number
    objectRecordEventsWithQueryIds?: ObjectRecordEventWithQueryIdsGenqlSelection
    metadataEvents?: MetadataEventGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LogicFunctionExecutionResultGenqlSelection{
    /** Execution result in JSON format */
    data?: boolean | number
    /** Execution Logs */
    logs?: boolean | number
    /** Execution duration in milliseconds */
    duration?: boolean | number
    /** Execution status */
    status?: boolean | number
    /** Execution error in JSON format */
    error?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingTrialPeriodGenqlSelection{
    duration?: boolean | number
    isCreditCardRequired?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceUrlsGenqlSelection{
    customUrl?: boolean | number
    subdomainUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SSOIdentityProviderGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    type?: boolean | number
    status?: boolean | number
    issuer?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AuthProvidersGenqlSelection{
    sso?: SSOIdentityProviderGenqlSelection
    google?: boolean | number
    magicLink?: boolean | number
    password?: boolean | number
    microsoft?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AuthBypassProvidersGenqlSelection{
    google?: boolean | number
    password?: boolean | number
    microsoft?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PublicWorkspaceDataGenqlSelection{
    id?: boolean | number
    authProviders?: AuthProvidersGenqlSelection
    authBypassProviders?: AuthBypassProvidersGenqlSelection
    logo?: boolean | number
    displayName?: boolean | number
    workspaceUrls?: WorkspaceUrlsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface NativeModelCapabilitiesGenqlSelection{
    webSearch?: boolean | number
    twitterSearch?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ClientAIModelConfigGenqlSelection{
    modelId?: boolean | number
    label?: boolean | number
    modelFamily?: boolean | number
    modelFamilyLabel?: boolean | number
    sdkPackage?: boolean | number
    inputCostPerMillionTokensInCredits?: boolean | number
    outputCostPerMillionTokensInCredits?: boolean | number
    nativeCapabilities?: NativeModelCapabilitiesGenqlSelection
    isDeprecated?: boolean | number
    isRecommended?: boolean | number
    providerName?: boolean | number
    dataResidency?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AdminAIModelConfigGenqlSelection{
    modelId?: boolean | number
    label?: boolean | number
    modelFamily?: boolean | number
    modelFamilyLabel?: boolean | number
    sdkPackage?: boolean | number
    isAvailable?: boolean | number
    isAdminEnabled?: boolean | number
    isDeprecated?: boolean | number
    isRecommended?: boolean | number
    contextWindowTokens?: boolean | number
    maxOutputTokens?: boolean | number
    inputCostPerMillionTokens?: boolean | number
    outputCostPerMillionTokens?: boolean | number
    providerName?: boolean | number
    providerLabel?: boolean | number
    name?: boolean | number
    dataResidency?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AdminAIModelsGenqlSelection{
    models?: AdminAIModelConfigGenqlSelection
    defaultSmartModelId?: boolean | number
    defaultFastModelId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingGenqlSelection{
    isBillingEnabled?: boolean | number
    billingUrl?: boolean | number
    trialPeriods?: BillingTrialPeriodGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SupportGenqlSelection{
    supportDriver?: boolean | number
    supportFrontChatId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SentryGenqlSelection{
    environment?: boolean | number
    release?: boolean | number
    dsn?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CaptchaGenqlSelection{
    provider?: boolean | number
    siteKey?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApiConfigGenqlSelection{
    mutationMaximumAffectedRecords?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PublicFeatureFlagMetadataGenqlSelection{
    label?: boolean | number
    description?: boolean | number
    imagePath?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PublicFeatureFlagGenqlSelection{
    key?: boolean | number
    metadata?: PublicFeatureFlagMetadataGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ClientConfigMaintenanceModeGenqlSelection{
    startAt?: boolean | number
    endAt?: boolean | number
    link?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ClientConfigGenqlSelection{
    appVersion?: boolean | number
    authProviders?: AuthProvidersGenqlSelection
    billing?: BillingGenqlSelection
    aiModels?: ClientAIModelConfigGenqlSelection
    signInPrefilled?: boolean | number
    isMultiWorkspaceEnabled?: boolean | number
    isEmailVerificationRequired?: boolean | number
    defaultSubdomain?: boolean | number
    frontDomain?: boolean | number
    analyticsEnabled?: boolean | number
    support?: SupportGenqlSelection
    isAttachmentPreviewEnabled?: boolean | number
    sentry?: SentryGenqlSelection
    captcha?: CaptchaGenqlSelection
    api?: ApiConfigGenqlSelection
    canManageFeatureFlags?: boolean | number
    publicFeatureFlags?: PublicFeatureFlagGenqlSelection
    isMicrosoftMessagingEnabled?: boolean | number
    isMicrosoftCalendarEnabled?: boolean | number
    isGoogleMessagingEnabled?: boolean | number
    isGoogleCalendarEnabled?: boolean | number
    isConfigVariablesInDbEnabled?: boolean | number
    isImapSmtpCaldavEnabled?: boolean | number
    allowRequestsToTwentyIcons?: boolean | number
    calendarBookingPageId?: boolean | number
    isCloudflareIntegrationEnabled?: boolean | number
    isClickHouseConfigured?: boolean | number
    isWorkspaceSchemaDDLLocked?: boolean | number
    maintenance?: ClientConfigMaintenanceModeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UsageBreakdownItemGenqlSelection{
    key?: boolean | number
    label?: boolean | number
    creditsUsed?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ConfigVariableGenqlSelection{
    name?: boolean | number
    description?: boolean | number
    value?: boolean | number
    isSensitive?: boolean | number
    source?: boolean | number
    isEnvOnly?: boolean | number
    type?: boolean | number
    options?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ConfigVariablesGroupDataGenqlSelection{
    variables?: ConfigVariableGenqlSelection
    name?: boolean | number
    description?: boolean | number
    isHiddenOnLoad?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ConfigVariablesGenqlSelection{
    groups?: ConfigVariablesGroupDataGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface JobOperationResultGenqlSelection{
    jobId?: boolean | number
    success?: boolean | number
    error?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DeleteJobsResponseGenqlSelection{
    deletedCount?: boolean | number
    results?: JobOperationResultGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueueJobGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    data?: boolean | number
    state?: boolean | number
    timestamp?: boolean | number
    failedReason?: boolean | number
    processedOn?: boolean | number
    finishedOn?: boolean | number
    attemptsMade?: boolean | number
    returnValue?: boolean | number
    logs?: boolean | number
    stackTrace?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueueRetentionConfigGenqlSelection{
    completedMaxAge?: boolean | number
    completedMaxCount?: boolean | number
    failedMaxAge?: boolean | number
    failedMaxCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueueJobsResponseGenqlSelection{
    jobs?: QueueJobGenqlSelection
    count?: boolean | number
    totalCount?: boolean | number
    hasMore?: boolean | number
    retentionConfig?: QueueRetentionConfigGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RetryJobsResponseGenqlSelection{
    retriedCount?: boolean | number
    results?: JobOperationResultGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SystemHealthServiceGenqlSelection{
    id?: boolean | number
    label?: boolean | number
    status?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SystemHealthGenqlSelection{
    services?: SystemHealthServiceGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FeatureFlagGenqlSelection{
    key?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserInfoGenqlSelection{
    id?: boolean | number
    email?: boolean | number
    firstName?: boolean | number
    lastName?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceInfoGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    allowImpersonation?: boolean | number
    logo?: boolean | number
    totalUsers?: boolean | number
    workspaceUrls?: WorkspaceUrlsGenqlSelection
    users?: UserInfoGenqlSelection
    featureFlags?: FeatureFlagGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserLookupGenqlSelection{
    user?: UserInfoGenqlSelection
    workspaces?: WorkspaceInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface VersionInfoGenqlSelection{
    currentVersion?: boolean | number
    latestVersion?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AdminPanelWorkerQueueHealthGenqlSelection{
    id?: boolean | number
    queueName?: boolean | number
    status?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AdminPanelHealthServiceDataGenqlSelection{
    id?: boolean | number
    label?: boolean | number
    description?: boolean | number
    status?: boolean | number
    errorMessage?: boolean | number
    details?: boolean | number
    queues?: AdminPanelWorkerQueueHealthGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MaintenanceModeGenqlSelection{
    startAt?: boolean | number
    endAt?: boolean | number
    link?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ModelsDevModelSuggestionGenqlSelection{
    modelId?: boolean | number
    name?: boolean | number
    inputCostPerMillionTokens?: boolean | number
    outputCostPerMillionTokens?: boolean | number
    cachedInputCostPerMillionTokens?: boolean | number
    cacheCreationCostPerMillionTokens?: boolean | number
    contextWindowTokens?: boolean | number
    maxOutputTokens?: boolean | number
    modalities?: boolean | number
    supportsReasoning?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ModelsDevProviderSuggestionGenqlSelection{
    id?: boolean | number
    modelCount?: boolean | number
    npm?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueueMetricsDataPointGenqlSelection{
    x?: boolean | number
    y?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueueMetricsSeriesGenqlSelection{
    id?: boolean | number
    data?: QueueMetricsDataPointGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkerQueueMetricsGenqlSelection{
    failed?: boolean | number
    completed?: boolean | number
    waiting?: boolean | number
    active?: boolean | number
    delayed?: boolean | number
    failureRate?: boolean | number
    failedData?: boolean | number
    completedData?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueueMetricsDataGenqlSelection{
    queueName?: boolean | number
    workers?: boolean | number
    timeRange?: boolean | number
    details?: WorkerQueueMetricsGenqlSelection
    data?: QueueMetricsSeriesGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface VersionDistributionEntryGenqlSelection{
    version?: boolean | number
    count?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationRegistrationStatsGenqlSelection{
    activeInstalls?: boolean | number
    mostInstalledVersion?: boolean | number
    versionDistribution?: VersionDistributionEntryGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CreateApplicationRegistrationGenqlSelection{
    applicationRegistration?: ApplicationRegistrationGenqlSelection
    clientSecret?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PublicApplicationRegistrationGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    logoUrl?: boolean | number
    websiteUrl?: boolean | number
    oAuthScopes?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RotateClientSecretGenqlSelection{
    clientSecret?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ResendEmailVerificationTokenGenqlSelection{
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DeleteSsoGenqlSelection{
    identityProviderId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EditSsoGenqlSelection{
    id?: boolean | number
    type?: boolean | number
    issuer?: boolean | number
    name?: boolean | number
    status?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceNameAndIdGenqlSelection{
    displayName?: boolean | number
    id?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FindAvailableSSOIDPGenqlSelection{
    type?: boolean | number
    id?: boolean | number
    issuer?: boolean | number
    name?: boolean | number
    status?: boolean | number
    workspace?: WorkspaceNameAndIdGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SetupSsoGenqlSelection{
    id?: boolean | number
    type?: boolean | number
    issuer?: boolean | number
    name?: boolean | number
    status?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SSOConnectionGenqlSelection{
    type?: boolean | number
    id?: boolean | number
    issuer?: boolean | number
    name?: boolean | number
    status?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AvailableWorkspaceGenqlSelection{
    id?: boolean | number
    displayName?: boolean | number
    loginToken?: boolean | number
    personalInviteToken?: boolean | number
    inviteHash?: boolean | number
    workspaceUrls?: WorkspaceUrlsGenqlSelection
    logo?: boolean | number
    sso?: SSOConnectionGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AvailableWorkspacesGenqlSelection{
    availableWorkspacesForSignIn?: AvailableWorkspaceGenqlSelection
    availableWorkspacesForSignUp?: AvailableWorkspaceGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DeletedWorkspaceMemberGenqlSelection{
    id?: boolean | number
    name?: FullNameGenqlSelection
    userEmail?: boolean | number
    avatarUrl?: boolean | number
    userWorkspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingEntitlementGenqlSelection{
    key?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DomainRecordGenqlSelection{
    validationType?: boolean | number
    type?: boolean | number
    status?: boolean | number
    key?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DomainValidRecordsGenqlSelection{
    id?: boolean | number
    domain?: boolean | number
    records?: DomainRecordGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IndexEdgeGenqlSelection{
    /** The node containing the Index */
    node?: IndexGenqlSelection
    /** Cursor for this node. */
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageInfoGenqlSelection{
    /** true if paging forward and there are more records. */
    hasNextPage?: boolean | number
    /** true if paging backwards and there are more records. */
    hasPreviousPage?: boolean | number
    /** The cursor of the first returned record. */
    startCursor?: boolean | number
    /** The cursor of the last returned record. */
    endCursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IndexConnectionGenqlSelection{
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
    /** Array of edges. */
    edges?: IndexEdgeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IndexFieldEdgeGenqlSelection{
    /** The node containing the IndexField */
    node?: IndexFieldGenqlSelection
    /** Cursor for this node. */
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IndexIndexFieldMetadatasConnectionGenqlSelection{
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
    /** Array of edges. */
    edges?: IndexFieldEdgeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectEdgeGenqlSelection{
    /** The node containing the Object */
    node?: ObjectGenqlSelection
    /** Cursor for this node. */
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IndexObjectMetadataConnectionGenqlSelection{
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
    /** Array of edges. */
    edges?: ObjectEdgeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectRecordCountGenqlSelection{
    objectNamePlural?: boolean | number
    totalCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectConnectionGenqlSelection{
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
    /** Array of edges. */
    edges?: ObjectEdgeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectIndexMetadatasConnectionGenqlSelection{
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
    /** Array of edges. */
    edges?: IndexEdgeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FieldEdgeGenqlSelection{
    /** The node containing the Field */
    node?: FieldGenqlSelection
    /** Cursor for this node. */
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectFieldsConnectionGenqlSelection{
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
    /** Array of edges. */
    edges?: FieldEdgeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UpsertRowLevelPermissionPredicatesResultGenqlSelection{
    predicates?: RowLevelPermissionPredicateGenqlSelection
    predicateGroups?: RowLevelPermissionPredicateGroupGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RelationGenqlSelection{
    type?: boolean | number
    sourceObjectMetadata?: ObjectGenqlSelection
    targetObjectMetadata?: ObjectGenqlSelection
    sourceFieldMetadata?: FieldGenqlSelection
    targetFieldMetadata?: FieldGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FieldConnectionGenqlSelection{
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
    /** Array of edges. */
    edges?: FieldEdgeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AuthTokenGenqlSelection{
    token?: boolean | number
    expiresAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationTokenPairGenqlSelection{
    applicationAccessToken?: AuthTokenGenqlSelection
    applicationRefreshToken?: AuthTokenGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FrontComponentGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    description?: boolean | number
    sourceComponentPath?: boolean | number
    builtComponentPath?: boolean | number
    componentName?: boolean | number
    builtComponentChecksum?: boolean | number
    universalIdentifier?: boolean | number
    applicationId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    isHeadless?: boolean | number
    usesSdkClient?: boolean | number
    applicationTokenPair?: ApplicationTokenPairGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LogicFunctionLogsGenqlSelection{
    /** Execution Logs */
    logs?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DeleteTwoFactorAuthenticationMethodGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface InitiateTwoFactorAuthenticationProvisioningGenqlSelection{
    uri?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface VerifyTwoFactorAuthenticationMethodGenqlSelection{
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AuthorizeAppGenqlSelection{
    redirectUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AuthTokenPairGenqlSelection{
    accessOrWorkspaceAgnosticToken?: AuthTokenGenqlSelection
    refreshToken?: AuthTokenGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AvailableWorkspacesAndAccessTokensGenqlSelection{
    tokens?: AuthTokenPairGenqlSelection
    availableWorkspaces?: AvailableWorkspacesGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EmailPasswordResetLinkGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface GetAuthorizationUrlForSSOGenqlSelection{
    authorizationURL?: boolean | number
    type?: boolean | number
    id?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface InvalidatePasswordGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceUrlsAndIdGenqlSelection{
    workspaceUrls?: WorkspaceUrlsGenqlSelection
    id?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SignUpGenqlSelection{
    loginToken?: AuthTokenGenqlSelection
    workspace?: WorkspaceUrlsAndIdGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TransientTokenGenqlSelection{
    transientToken?: AuthTokenGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ValidatePasswordResetTokenGenqlSelection{
    id?: boolean | number
    email?: boolean | number
    hasPassword?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface VerifyEmailAndGetLoginTokenGenqlSelection{
    loginToken?: AuthTokenGenqlSelection
    workspaceUrls?: WorkspaceUrlsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApiKeyTokenGenqlSelection{
    token?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AuthTokensGenqlSelection{
    tokens?: AuthTokenPairGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LoginTokenGenqlSelection{
    loginToken?: AuthTokenGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CheckUserExistGenqlSelection{
    exists?: boolean | number
    availableWorkspacesCount?: boolean | number
    isEmailVerified?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceInviteHashValidGenqlSelection{
    isValid?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ImpersonateGenqlSelection{
    loginToken?: AuthTokenGenqlSelection
    workspace?: WorkspaceUrlsAndIdGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UsageTimeSeriesGenqlSelection{
    date?: boolean | number
    creditsUsed?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UsageUserDailyGenqlSelection{
    userWorkspaceId?: boolean | number
    dailyUsage?: UsageTimeSeriesGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UsageAnalyticsGenqlSelection{
    usageByUser?: UsageBreakdownItemGenqlSelection
    usageByOperationType?: UsageBreakdownItemGenqlSelection
    usageByModel?: UsageBreakdownItemGenqlSelection
    timeSeries?: UsageTimeSeriesGenqlSelection
    periodStart?: boolean | number
    periodEnd?: boolean | number
    userDailyUsage?: UsageUserDailyGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DevelopmentApplicationGenqlSelection{
    id?: boolean | number
    universalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceMigrationGenqlSelection{
    applicationUniversalIdentifier?: boolean | number
    actions?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FileGenqlSelection{
    id?: boolean | number
    path?: boolean | number
    size?: boolean | number
    createdAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MarketplaceAppGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    description?: boolean | number
    icon?: boolean | number
    author?: boolean | number
    category?: boolean | number
    logo?: boolean | number
    sourcePackage?: boolean | number
    isFeatured?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MarketplaceAppDetailGenqlSelection{
    universalIdentifier?: boolean | number
    id?: boolean | number
    name?: boolean | number
    sourceType?: boolean | number
    sourcePackage?: boolean | number
    latestAvailableVersion?: boolean | number
    isListed?: boolean | number
    isFeatured?: boolean | number
    manifest?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PublicDomainGenqlSelection{
    id?: boolean | number
    domain?: boolean | number
    isValidated?: boolean | number
    createdAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface VerificationRecordGenqlSelection{
    type?: boolean | number
    key?: boolean | number
    value?: boolean | number
    priority?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EmailingDomainGenqlSelection{
    id?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    domain?: boolean | number
    driver?: boolean | number
    status?: boolean | number
    verificationRecords?: VerificationRecordGenqlSelection
    verifiedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AutocompleteResultGenqlSelection{
    text?: boolean | number
    placeId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LocationGenqlSelection{
    lat?: boolean | number
    lng?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PlaceDetailsResultGenqlSelection{
    state?: boolean | number
    postcode?: boolean | number
    city?: boolean | number
    country?: boolean | number
    location?: LocationGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ConnectionParametersOutputGenqlSelection{
    host?: boolean | number
    port?: boolean | number
    username?: boolean | number
    password?: boolean | number
    secure?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ImapSmtpCaldavConnectionParametersGenqlSelection{
    IMAP?: ConnectionParametersOutputGenqlSelection
    SMTP?: ConnectionParametersOutputGenqlSelection
    CALDAV?: ConnectionParametersOutputGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ConnectedImapSmtpCaldavAccountGenqlSelection{
    id?: boolean | number
    handle?: boolean | number
    provider?: boolean | number
    userWorkspaceId?: boolean | number
    connectionParameters?: ImapSmtpCaldavConnectionParametersGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ImapSmtpCaldavConnectionSuccessGenqlSelection{
    success?: boolean | number
    connectedAccountId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PostgresCredentialsGenqlSelection{
    id?: boolean | number
    user?: boolean | number
    password?: boolean | number
    workspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CommandMenuItemGenqlSelection{
    id?: boolean | number
    workflowVersionId?: boolean | number
    frontComponentId?: boolean | number
    frontComponent?: FrontComponentGenqlSelection
    engineComponentKey?: boolean | number
    label?: boolean | number
    icon?: boolean | number
    shortLabel?: boolean | number
    position?: boolean | number
    isPinned?: boolean | number
    availabilityType?: boolean | number
    payload?: boolean | number
    hotKeys?: boolean | number
    conditionalAvailabilityExpression?: boolean | number
    availabilityObjectMetadataId?: boolean | number
    applicationId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ToolIndexEntryGenqlSelection{
    name?: boolean | number
    description?: boolean | number
    category?: boolean | number
    objectName?: boolean | number
    icon?: boolean | number
    inputSchema?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentMessagePartGenqlSelection{
    id?: boolean | number
    messageId?: boolean | number
    orderIndex?: boolean | number
    type?: boolean | number
    textContent?: boolean | number
    reasoningContent?: boolean | number
    toolName?: boolean | number
    toolCallId?: boolean | number
    toolInput?: boolean | number
    toolOutput?: boolean | number
    state?: boolean | number
    errorMessage?: boolean | number
    errorDetails?: boolean | number
    sourceUrlSourceId?: boolean | number
    sourceUrlUrl?: boolean | number
    sourceUrlTitle?: boolean | number
    sourceDocumentSourceId?: boolean | number
    sourceDocumentMediaType?: boolean | number
    sourceDocumentTitle?: boolean | number
    sourceDocumentFilename?: boolean | number
    fileMediaType?: boolean | number
    fileFilename?: boolean | number
    fileId?: boolean | number
    fileUrl?: boolean | number
    providerMetadata?: boolean | number
    createdAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ChannelSyncSuccessGenqlSelection{
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BarChartSeriesGenqlSelection{
    key?: boolean | number
    label?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BarChartDataGenqlSelection{
    data?: boolean | number
    indexBy?: boolean | number
    keys?: boolean | number
    series?: BarChartSeriesGenqlSelection
    xAxisLabel?: boolean | number
    yAxisLabel?: boolean | number
    showLegend?: boolean | number
    showDataLabels?: boolean | number
    layout?: boolean | number
    groupMode?: boolean | number
    hasTooManyGroups?: boolean | number
    formattedToRawLookup?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LineChartDataPointGenqlSelection{
    x?: boolean | number
    y?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LineChartSeriesGenqlSelection{
    id?: boolean | number
    label?: boolean | number
    data?: LineChartDataPointGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LineChartDataGenqlSelection{
    series?: LineChartSeriesGenqlSelection
    xAxisLabel?: boolean | number
    yAxisLabel?: boolean | number
    showLegend?: boolean | number
    showDataLabels?: boolean | number
    hasTooManyGroups?: boolean | number
    formattedToRawLookup?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PieChartDataItemGenqlSelection{
    id?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PieChartDataGenqlSelection{
    data?: PieChartDataItemGenqlSelection
    showLegend?: boolean | number
    showDataLabels?: boolean | number
    showCenterMetric?: boolean | number
    hasTooManyGroups?: boolean | number
    formattedToRawLookup?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DuplicatedDashboardGenqlSelection{
    id?: boolean | number
    title?: boolean | number
    pageLayoutId?: boolean | number
    position?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ConnectedAccountDTOGenqlSelection{
    id?: boolean | number
    handle?: boolean | number
    provider?: boolean | number
    lastCredentialsRefreshedAt?: boolean | number
    authFailedAt?: boolean | number
    handleAliases?: boolean | number
    scopes?: boolean | number
    connectionParameters?: ImapSmtpCaldavConnectionParametersGenqlSelection
    lastSignedInAt?: boolean | number
    userWorkspaceId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SendEmailOutputGenqlSelection{
    success?: boolean | number
    error?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EventLogRecordGenqlSelection{
    event?: boolean | number
    timestamp?: boolean | number
    userId?: boolean | number
    properties?: boolean | number
    recordId?: boolean | number
    objectMetadataId?: boolean | number
    isCustom?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EventLogPageInfoGenqlSelection{
    endCursor?: boolean | number
    hasNextPage?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EventLogQueryResultGenqlSelection{
    records?: EventLogRecordGenqlSelection
    totalCount?: boolean | number
    pageInfo?: EventLogPageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SkillGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    label?: boolean | number
    icon?: boolean | number
    description?: boolean | number
    content?: boolean | number
    isCustom?: boolean | number
    isActive?: boolean | number
    applicationId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatThreadGenqlSelection{
    id?: boolean | number
    title?: boolean | number
    totalInputTokens?: boolean | number
    totalOutputTokens?: boolean | number
    contextWindowTokens?: boolean | number
    conversationSize?: boolean | number
    totalInputCredits?: boolean | number
    totalOutputCredits?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentMessageGenqlSelection{
    id?: boolean | number
    threadId?: boolean | number
    turnId?: boolean | number
    agentId?: boolean | number
    role?: boolean | number
    status?: boolean | number
    parts?: AgentMessagePartGenqlSelection
    processedAt?: boolean | number
    createdAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AISystemPromptSectionGenqlSelection{
    title?: boolean | number
    content?: boolean | number
    estimatedTokenCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AISystemPromptPreviewGenqlSelection{
    sections?: AISystemPromptSectionGenqlSelection
    estimatedTokenCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ChatStreamCatchupChunksGenqlSelection{
    chunks?: boolean | number
    maxSeq?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SendChatMessageResultGenqlSelection{
    messageId?: boolean | number
    queued?: boolean | number
    streamId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatEventGenqlSelection{
    threadId?: boolean | number
    event?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatThreadEdgeGenqlSelection{
    /** The node containing the AgentChatThread */
    node?: AgentChatThreadGenqlSelection
    /** Cursor for this node. */
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatThreadConnectionGenqlSelection{
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
    /** Array of edges. */
    edges?: AgentChatThreadEdgeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentTurnEvaluationGenqlSelection{
    id?: boolean | number
    turnId?: boolean | number
    score?: boolean | number
    comment?: boolean | number
    createdAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentTurnGenqlSelection{
    id?: boolean | number
    threadId?: boolean | number
    agentId?: boolean | number
    evaluations?: AgentTurnEvaluationGenqlSelection
    messages?: AgentMessageGenqlSelection
    createdAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CalendarChannelGenqlSelection{
    id?: boolean | number
    handle?: boolean | number
    syncStatus?: boolean | number
    syncStage?: boolean | number
    visibility?: boolean | number
    isContactAutoCreationEnabled?: boolean | number
    contactAutoCreationPolicy?: boolean | number
    isSyncEnabled?: boolean | number
    syncedAt?: boolean | number
    syncStageStartedAt?: boolean | number
    throttleFailureCount?: boolean | number
    connectedAccountId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MessageChannelGenqlSelection{
    id?: boolean | number
    visibility?: boolean | number
    handle?: boolean | number
    type?: boolean | number
    isContactAutoCreationEnabled?: boolean | number
    contactAutoCreationPolicy?: boolean | number
    messageFolderImportPolicy?: boolean | number
    excludeNonProfessionalEmails?: boolean | number
    excludeGroupEmails?: boolean | number
    pendingGroupEmailsAction?: boolean | number
    isSyncEnabled?: boolean | number
    syncedAt?: boolean | number
    syncStatus?: boolean | number
    syncStage?: boolean | number
    syncStageStartedAt?: boolean | number
    throttleFailureCount?: boolean | number
    throttleRetryAfter?: boolean | number
    connectedAccountId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MessageFolderGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    isSentFolder?: boolean | number
    isSynced?: boolean | number
    parentFolderId?: boolean | number
    externalId?: boolean | number
    pendingSyncAction?: boolean | number
    messageChannelId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CollectionHashGenqlSelection{
    collectionName?: boolean | number
    hash?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MinimalObjectMetadataGenqlSelection{
    id?: boolean | number
    nameSingular?: boolean | number
    namePlural?: boolean | number
    labelSingular?: boolean | number
    labelPlural?: boolean | number
    icon?: boolean | number
    color?: boolean | number
    isCustom?: boolean | number
    isActive?: boolean | number
    isSystem?: boolean | number
    isRemote?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MinimalViewGenqlSelection{
    id?: boolean | number
    type?: boolean | number
    key?: boolean | number
    objectMetadataId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MinimalMetadataGenqlSelection{
    objectMetadataItems?: MinimalObjectMetadataGenqlSelection
    views?: MinimalViewGenqlSelection
    collectionHashes?: CollectionHashGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WebhookGenqlSelection{
    id?: boolean | number
    targetUrl?: boolean | number
    operations?: boolean | number
    description?: boolean | number
    secret?: boolean | number
    applicationId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryGenqlSelection{
    navigationMenuItems?: NavigationMenuItemGenqlSelection
    navigationMenuItem?: (NavigationMenuItemGenqlSelection & { __args: {id: Scalars['UUID']} })
    getViewFilterGroups?: (ViewFilterGroupGenqlSelection & { __args?: {viewId?: (Scalars['String'] | null)} })
    getViewFilterGroup?: (ViewFilterGroupGenqlSelection & { __args: {id: Scalars['String']} })
    getViewFilters?: (ViewFilterGenqlSelection & { __args?: {viewId?: (Scalars['String'] | null)} })
    getViewFilter?: (ViewFilterGenqlSelection & { __args: {id: Scalars['String']} })
    getViews?: (ViewGenqlSelection & { __args?: {objectMetadataId?: (Scalars['String'] | null), viewTypes?: (ViewType[] | null)} })
    getView?: (ViewGenqlSelection & { __args: {id: Scalars['String']} })
    getViewSorts?: (ViewSortGenqlSelection & { __args?: {viewId?: (Scalars['String'] | null)} })
    getViewSort?: (ViewSortGenqlSelection & { __args: {id: Scalars['String']} })
    getViewFields?: (ViewFieldGenqlSelection & { __args: {viewId: Scalars['String']} })
    getViewField?: (ViewFieldGenqlSelection & { __args: {id: Scalars['String']} })
    getViewFieldGroups?: (ViewFieldGroupGenqlSelection & { __args: {viewId: Scalars['String']} })
    getViewFieldGroup?: (ViewFieldGroupGenqlSelection & { __args: {id: Scalars['String']} })
    apiKeys?: ApiKeyGenqlSelection
    apiKey?: (ApiKeyGenqlSelection & { __args: {input: GetApiKeyInput} })
    enterprisePortalSession?: { __args: {returnUrlPath?: (Scalars['String'] | null)} } | boolean | number
    enterpriseCheckoutSession?: { __args: {billingInterval?: (Scalars['String'] | null)} } | boolean | number
    enterpriseSubscriptionStatus?: EnterpriseSubscriptionStatusDTOGenqlSelection
    billingPortalSession?: (BillingSessionGenqlSelection & { __args?: {returnUrlPath?: (Scalars['String'] | null)} })
    listPlans?: BillingPlanGenqlSelection
    getMeteredProductsUsage?: BillingMeteredProductUsageGenqlSelection
    findWorkspaceInvitations?: WorkspaceInvitationGenqlSelection
    getApprovedAccessDomains?: ApprovedAccessDomainGenqlSelection
    getPageLayoutTabs?: (PageLayoutTabGenqlSelection & { __args: {pageLayoutId: Scalars['String']} })
    getPageLayoutTab?: (PageLayoutTabGenqlSelection & { __args: {id: Scalars['String']} })
    getPageLayouts?: (PageLayoutGenqlSelection & { __args?: {objectMetadataId?: (Scalars['String'] | null), pageLayoutType?: (PageLayoutType | null)} })
    getPageLayout?: (PageLayoutGenqlSelection & { __args: {id: Scalars['String']} })
    getPageLayoutWidgets?: (PageLayoutWidgetGenqlSelection & { __args: {pageLayoutTabId: Scalars['String']} })
    getPageLayoutWidget?: (PageLayoutWidgetGenqlSelection & { __args: {id: Scalars['String']} })
    findOneLogicFunction?: (LogicFunctionGenqlSelection & { __args: {input: LogicFunctionIdInput} })
    findManyLogicFunctions?: LogicFunctionGenqlSelection
    getAvailablePackages?: { __args: {input: LogicFunctionIdInput} }
    getLogicFunctionSourceCode?: { __args: {input: LogicFunctionIdInput} }
    commandMenuItems?: CommandMenuItemGenqlSelection
    commandMenuItem?: (CommandMenuItemGenqlSelection & { __args: {id: Scalars['UUID']} })
    frontComponents?: FrontComponentGenqlSelection
    frontComponent?: (FrontComponentGenqlSelection & { __args: {id: Scalars['UUID']} })
    objectRecordCounts?: ObjectRecordCountGenqlSelection
    object?: (ObjectGenqlSelection & { __args: {
    /** The id of the record to find. */
    id: Scalars['UUID']} })
    objects?: (ObjectConnectionGenqlSelection & { __args: {
    /** Limit or page results. */
    paging: CursorPaging, 
    /** Specify to filter the records returned. */
    filter: ObjectFilter} })
    index?: (IndexGenqlSelection & { __args: {
    /** The id of the record to find. */
    id: Scalars['UUID']} })
    indexMetadatas?: (IndexConnectionGenqlSelection & { __args: {
    /** Limit or page results. */
    paging: CursorPaging, 
    /** Specify to filter the records returned. */
    filter: IndexFilter} })
    findManyAgents?: AgentGenqlSelection
    findOneAgent?: (AgentGenqlSelection & { __args: {input: AgentIdInput} })
    getRoles?: RoleGenqlSelection
    getToolIndex?: ToolIndexEntryGenqlSelection
    getToolInputSchema?: { __args: {toolName: Scalars['String']} }
    field?: (FieldGenqlSelection & { __args: {
    /** The id of the record to find. */
    id: Scalars['UUID']} })
    fields?: (FieldConnectionGenqlSelection & { __args: {
    /** Limit or page results. */
    paging: CursorPaging, 
    /** Specify to filter the records returned. */
    filter: FieldFilter} })
    getViewGroups?: (ViewGroupGenqlSelection & { __args?: {viewId?: (Scalars['String'] | null)} })
    getViewGroup?: (ViewGroupGenqlSelection & { __args: {id: Scalars['String']} })
    myMessageFolders?: (MessageFolderGenqlSelection & { __args?: {messageChannelId?: (Scalars['UUID'] | null)} })
    myMessageChannels?: (MessageChannelGenqlSelection & { __args?: {connectedAccountId?: (Scalars['UUID'] | null)} })
    myConnectedAccounts?: ConnectedAccountDTOGenqlSelection
    connectedAccounts?: ConnectedAccountDTOGenqlSelection
    myCalendarChannels?: (CalendarChannelGenqlSelection & { __args?: {connectedAccountId?: (Scalars['UUID'] | null)} })
    webhooks?: WebhookGenqlSelection
    webhook?: (WebhookGenqlSelection & { __args: {id: Scalars['UUID']} })
    minimalMetadata?: MinimalMetadataGenqlSelection
    chatThread?: (AgentChatThreadGenqlSelection & { __args: {id: Scalars['UUID']} })
    chatMessages?: (AgentMessageGenqlSelection & { __args: {threadId: Scalars['UUID']} })
    chatStreamCatchupChunks?: (ChatStreamCatchupChunksGenqlSelection & { __args: {threadId: Scalars['UUID']} })
    getAISystemPromptPreview?: AISystemPromptPreviewGenqlSelection
    skills?: SkillGenqlSelection
    skill?: (SkillGenqlSelection & { __args: {id: Scalars['UUID']} })
    chatThreads?: (AgentChatThreadConnectionGenqlSelection & { __args: {
    /** Limit or page results. */
    paging: CursorPaging, 
    /** Specify to filter the records returned. */
    filter: AgentChatThreadFilter, 
    /** Specify to sort results. */
    sorting: AgentChatThreadSort[]} })
    agentTurns?: (AgentTurnGenqlSelection & { __args: {agentId: Scalars['UUID']} })
    eventLogs?: (EventLogQueryResultGenqlSelection & { __args: {input: EventLogQueryInput} })
    pieChartData?: (PieChartDataGenqlSelection & { __args: {input: PieChartDataInput} })
    lineChartData?: (LineChartDataGenqlSelection & { __args: {input: LineChartDataInput} })
    barChartData?: (BarChartDataGenqlSelection & { __args: {input: BarChartDataInput} })
    checkUserExists?: (CheckUserExistGenqlSelection & { __args: {email: Scalars['String'], captchaToken?: (Scalars['String'] | null)} })
    checkWorkspaceInviteHashIsValid?: (WorkspaceInviteHashValidGenqlSelection & { __args: {inviteHash: Scalars['String']} })
    findWorkspaceFromInviteHash?: (WorkspaceGenqlSelection & { __args: {inviteHash: Scalars['String']} })
    validatePasswordResetToken?: (ValidatePasswordResetTokenGenqlSelection & { __args: {passwordResetToken: Scalars['String']} })
    findApplicationRegistrationByClientId?: (PublicApplicationRegistrationGenqlSelection & { __args: {clientId: Scalars['String']} })
    findApplicationRegistrationByUniversalIdentifier?: (ApplicationRegistrationGenqlSelection & { __args: {universalIdentifier: Scalars['String']} })
    findManyApplicationRegistrations?: ApplicationRegistrationGenqlSelection
    findOneApplicationRegistration?: (ApplicationRegistrationGenqlSelection & { __args: {id: Scalars['String']} })
    findApplicationRegistrationStats?: (ApplicationRegistrationStatsGenqlSelection & { __args: {id: Scalars['String']} })
    findApplicationRegistrationVariables?: (ApplicationRegistrationVariableGenqlSelection & { __args: {applicationRegistrationId: Scalars['String']} })
    applicationRegistrationTarballUrl?: { __args: {id: Scalars['String']} }
    currentUser?: UserGenqlSelection
    currentWorkspace?: WorkspaceGenqlSelection
    getPublicWorkspaceDataByDomain?: (PublicWorkspaceDataGenqlSelection & { __args?: {origin?: (Scalars['String'] | null)} })
    getSSOIdentityProviders?: FindAvailableSSOIDPGenqlSelection
    getConnectedImapSmtpCaldavAccount?: (ConnectedImapSmtpCaldavAccountGenqlSelection & { __args: {id: Scalars['UUID']} })
    getAutoCompleteAddress?: (AutocompleteResultGenqlSelection & { __args: {address: Scalars['String'], token: Scalars['String'], country?: (Scalars['String'] | null), isFieldCity?: (Scalars['Boolean'] | null)} })
    getAddressDetails?: (PlaceDetailsResultGenqlSelection & { __args: {placeId: Scalars['String'], token: Scalars['String']} })
    getConfigVariablesGrouped?: ConfigVariablesGenqlSelection
    getSystemHealthStatus?: SystemHealthGenqlSelection
    getIndicatorHealthStatus?: (AdminPanelHealthServiceDataGenqlSelection & { __args: {indicatorId: HealthIndicatorId} })
    getQueueMetrics?: (QueueMetricsDataGenqlSelection & { __args: {queueName: Scalars['String'], timeRange?: (QueueMetricsTimeRange | null)} })
    versionInfo?: VersionInfoGenqlSelection
    getAdminAiModels?: AdminAIModelsGenqlSelection
    getDatabaseConfigVariable?: (ConfigVariableGenqlSelection & { __args: {key: Scalars['String']} })
    getQueueJobs?: (QueueJobsResponseGenqlSelection & { __args: {queueName: Scalars['String'], state: JobState, limit?: (Scalars['Int'] | null), offset?: (Scalars['Int'] | null)} })
    findAllApplicationRegistrations?: ApplicationRegistrationGenqlSelection
    getAiProviders?: boolean | number
    getModelsDevProviders?: ModelsDevProviderSuggestionGenqlSelection
    getModelsDevSuggestions?: (ModelsDevModelSuggestionGenqlSelection & { __args: {providerType: Scalars['String']} })
    getAdminAiUsageByWorkspace?: (UsageBreakdownItemGenqlSelection & { __args?: {periodStart?: (Scalars['DateTime'] | null), periodEnd?: (Scalars['DateTime'] | null)} })
    getMaintenanceMode?: MaintenanceModeGenqlSelection
    getUsageAnalytics?: (UsageAnalyticsGenqlSelection & { __args?: {input?: (UsageAnalyticsInput | null)} })
    getPostgresCredentials?: PostgresCredentialsGenqlSelection
    findManyPublicDomains?: PublicDomainGenqlSelection
    getEmailingDomains?: EmailingDomainGenqlSelection
    findManyMarketplaceApps?: MarketplaceAppGenqlSelection
    findMarketplaceAppDetail?: (MarketplaceAppDetailGenqlSelection & { __args: {universalIdentifier: Scalars['String']} })
    findManyApplications?: ApplicationGenqlSelection
    findOneApplication?: (ApplicationGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), universalIdentifier?: (Scalars['UUID'] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface GetApiKeyInput {id: Scalars['UUID']}

export interface LogicFunctionIdInput {
/** The id of the function. */
id: Scalars['ID']}

export interface AgentIdInput {
/** The id of the agent. */
id: Scalars['UUID']}

export interface AgentChatThreadFilter {and?: (AgentChatThreadFilter[] | null),or?: (AgentChatThreadFilter[] | null),id?: (UUIDFilterComparison | null),updatedAt?: (DateFieldComparison | null)}

export interface DateFieldComparison {is?: (Scalars['Boolean'] | null),isNot?: (Scalars['Boolean'] | null),eq?: (Scalars['DateTime'] | null),neq?: (Scalars['DateTime'] | null),gt?: (Scalars['DateTime'] | null),gte?: (Scalars['DateTime'] | null),lt?: (Scalars['DateTime'] | null),lte?: (Scalars['DateTime'] | null),in?: (Scalars['DateTime'][] | null),notIn?: (Scalars['DateTime'][] | null),between?: (DateFieldComparisonBetween | null),notBetween?: (DateFieldComparisonBetween | null)}

export interface DateFieldComparisonBetween {lower: Scalars['DateTime'],upper: Scalars['DateTime']}

export interface AgentChatThreadSort {field: AgentChatThreadSortFields,direction: SortDirection,nulls?: (SortNulls | null)}

export interface EventLogQueryInput {table: EventLogTable,filters?: (EventLogFiltersInput | null),first?: (Scalars['Int'] | null),after?: (Scalars['String'] | null)}

export interface EventLogFiltersInput {eventType?: (Scalars['String'] | null),userWorkspaceId?: (Scalars['String'] | null),dateRange?: (EventLogDateRangeInput | null),recordId?: (Scalars['String'] | null),objectMetadataId?: (Scalars['String'] | null)}

export interface EventLogDateRangeInput {start?: (Scalars['DateTime'] | null),end?: (Scalars['DateTime'] | null)}

export interface PieChartDataInput {objectMetadataId: Scalars['UUID'],configuration: Scalars['JSON']}

export interface LineChartDataInput {objectMetadataId: Scalars['UUID'],configuration: Scalars['JSON']}

export interface BarChartDataInput {objectMetadataId: Scalars['UUID'],configuration: Scalars['JSON']}

export interface UsageAnalyticsInput {periodStart?: (Scalars['DateTime'] | null),periodEnd?: (Scalars['DateTime'] | null),userWorkspaceId?: (Scalars['String'] | null),operationTypes?: (UsageOperationType[] | null)}

export interface MutationGenqlSelection{
    addQueryToEventStream?: { __args: {input: AddQuerySubscriptionInput} }
    removeQueryFromEventStream?: { __args: {input: RemoveQueryFromEventStreamInput} }
    createManyNavigationMenuItems?: (NavigationMenuItemGenqlSelection & { __args: {inputs: CreateNavigationMenuItemInput[]} })
    createNavigationMenuItem?: (NavigationMenuItemGenqlSelection & { __args: {input: CreateNavigationMenuItemInput} })
    updateManyNavigationMenuItems?: (NavigationMenuItemGenqlSelection & { __args: {inputs: UpdateOneNavigationMenuItemInput[]} })
    updateNavigationMenuItem?: (NavigationMenuItemGenqlSelection & { __args: {input: UpdateOneNavigationMenuItemInput} })
    deleteManyNavigationMenuItems?: (NavigationMenuItemGenqlSelection & { __args: {ids: Scalars['UUID'][]} })
    deleteNavigationMenuItem?: (NavigationMenuItemGenqlSelection & { __args: {id: Scalars['UUID']} })
    uploadAIChatFile?: (FileWithSignedUrlGenqlSelection & { __args: {file: Scalars['Upload']} })
    uploadWorkflowFile?: (FileWithSignedUrlGenqlSelection & { __args: {file: Scalars['Upload']} })
    uploadWorkspaceLogo?: (FileWithSignedUrlGenqlSelection & { __args: {file: Scalars['Upload']} })
    uploadWorkspaceMemberProfilePicture?: (FileWithSignedUrlGenqlSelection & { __args: {file: Scalars['Upload']} })
    uploadFilesFieldFile?: (FileWithSignedUrlGenqlSelection & { __args: {file: Scalars['Upload'], fieldMetadataId: Scalars['String']} })
    uploadFilesFieldFileByUniversalIdentifier?: (FileWithSignedUrlGenqlSelection & { __args: {file: Scalars['Upload'], fieldMetadataUniversalIdentifier: Scalars['String']} })
    createViewFilterGroup?: (ViewFilterGroupGenqlSelection & { __args: {input: CreateViewFilterGroupInput} })
    updateViewFilterGroup?: (ViewFilterGroupGenqlSelection & { __args: {id: Scalars['String'], input: UpdateViewFilterGroupInput} })
    deleteViewFilterGroup?: { __args: {id: Scalars['String']} }
    destroyViewFilterGroup?: { __args: {id: Scalars['String']} }
    createViewFilter?: (ViewFilterGenqlSelection & { __args: {input: CreateViewFilterInput} })
    updateViewFilter?: (ViewFilterGenqlSelection & { __args: {input: UpdateViewFilterInput} })
    deleteViewFilter?: (ViewFilterGenqlSelection & { __args: {input: DeleteViewFilterInput} })
    destroyViewFilter?: (ViewFilterGenqlSelection & { __args: {input: DestroyViewFilterInput} })
    createView?: (ViewGenqlSelection & { __args: {input: CreateViewInput} })
    updateView?: (ViewGenqlSelection & { __args: {id: Scalars['String'], input: UpdateViewInput} })
    deleteView?: { __args: {id: Scalars['String']} }
    destroyView?: { __args: {id: Scalars['String']} }
    createViewSort?: (ViewSortGenqlSelection & { __args: {input: CreateViewSortInput} })
    updateViewSort?: (ViewSortGenqlSelection & { __args: {input: UpdateViewSortInput} })
    deleteViewSort?: { __args: {input: DeleteViewSortInput} }
    destroyViewSort?: { __args: {input: DestroyViewSortInput} }
    updateViewField?: (ViewFieldGenqlSelection & { __args: {input: UpdateViewFieldInput} })
    createViewField?: (ViewFieldGenqlSelection & { __args: {input: CreateViewFieldInput} })
    createManyViewFields?: (ViewFieldGenqlSelection & { __args: {inputs: CreateViewFieldInput[]} })
    deleteViewField?: (ViewFieldGenqlSelection & { __args: {input: DeleteViewFieldInput} })
    destroyViewField?: (ViewFieldGenqlSelection & { __args: {input: DestroyViewFieldInput} })
    updateViewFieldGroup?: (ViewFieldGroupGenqlSelection & { __args: {input: UpdateViewFieldGroupInput} })
    createViewFieldGroup?: (ViewFieldGroupGenqlSelection & { __args: {input: CreateViewFieldGroupInput} })
    createManyViewFieldGroups?: (ViewFieldGroupGenqlSelection & { __args: {inputs: CreateViewFieldGroupInput[]} })
    deleteViewFieldGroup?: (ViewFieldGroupGenqlSelection & { __args: {input: DeleteViewFieldGroupInput} })
    destroyViewFieldGroup?: (ViewFieldGroupGenqlSelection & { __args: {input: DestroyViewFieldGroupInput} })
    upsertFieldsWidget?: (ViewGenqlSelection & { __args: {input: UpsertFieldsWidgetInput} })
    createApiKey?: (ApiKeyGenqlSelection & { __args: {input: CreateApiKeyInput} })
    updateApiKey?: (ApiKeyGenqlSelection & { __args: {input: UpdateApiKeyInput} })
    revokeApiKey?: (ApiKeyGenqlSelection & { __args: {input: RevokeApiKeyInput} })
    assignRoleToApiKey?: { __args: {apiKeyId: Scalars['UUID'], roleId: Scalars['UUID']} }
    createObjectEvent?: (AnalyticsGenqlSelection & { __args: {event: Scalars['String'], recordId: Scalars['UUID'], objectMetadataId: Scalars['UUID'], properties?: (Scalars['JSON'] | null)} })
    trackAnalytics?: (AnalyticsGenqlSelection & { __args: {type: AnalyticsType, name?: (Scalars['String'] | null), event?: (Scalars['String'] | null), properties?: (Scalars['JSON'] | null)} })
    refreshEnterpriseValidityToken?: boolean | number
    setEnterpriseKey?: (EnterpriseLicenseInfoDTOGenqlSelection & { __args: {enterpriseKey: Scalars['String']} })
    skipSyncEmailOnboardingStep?: OnboardingStepSuccessGenqlSelection
    skipBookOnboardingStep?: OnboardingStepSuccessGenqlSelection
    checkoutSession?: (BillingSessionGenqlSelection & { __args: {recurringInterval: SubscriptionInterval, plan: BillingPlanKey, requirePaymentMethod: Scalars['Boolean'], successUrlPath?: (Scalars['String'] | null)} })
    switchSubscriptionInterval?: BillingUpdateGenqlSelection
    switchBillingPlan?: BillingUpdateGenqlSelection
    cancelSwitchBillingPlan?: BillingUpdateGenqlSelection
    cancelSwitchBillingInterval?: BillingUpdateGenqlSelection
    setMeteredSubscriptionPrice?: (BillingUpdateGenqlSelection & { __args: {priceId: Scalars['String']} })
    endSubscriptionTrialPeriod?: BillingEndTrialPeriodGenqlSelection
    cancelSwitchMeteredPrice?: BillingUpdateGenqlSelection
    deleteWorkspaceInvitation?: { __args: {appTokenId: Scalars['String']} }
    resendWorkspaceInvitation?: (SendInvitationsGenqlSelection & { __args: {appTokenId: Scalars['String']} })
    sendInvitations?: (SendInvitationsGenqlSelection & { __args: {emails: Scalars['String'][], roleId?: (Scalars['UUID'] | null)} })
    createApprovedAccessDomain?: (ApprovedAccessDomainGenqlSelection & { __args: {input: CreateApprovedAccessDomainInput} })
    deleteApprovedAccessDomain?: { __args: {input: DeleteApprovedAccessDomainInput} }
    validateApprovedAccessDomain?: (ApprovedAccessDomainGenqlSelection & { __args: {input: ValidateApprovedAccessDomainInput} })
    createPageLayoutTab?: (PageLayoutTabGenqlSelection & { __args: {input: CreatePageLayoutTabInput} })
    updatePageLayoutTab?: (PageLayoutTabGenqlSelection & { __args: {id: Scalars['String'], input: UpdatePageLayoutTabInput} })
    destroyPageLayoutTab?: { __args: {id: Scalars['String']} }
    createPageLayout?: (PageLayoutGenqlSelection & { __args: {input: CreatePageLayoutInput} })
    updatePageLayout?: (PageLayoutGenqlSelection & { __args: {id: Scalars['String'], input: UpdatePageLayoutInput} })
    destroyPageLayout?: { __args: {id: Scalars['String']} }
    updatePageLayoutWithTabsAndWidgets?: (PageLayoutGenqlSelection & { __args: {id: Scalars['String'], input: UpdatePageLayoutWithTabsInput} })
    resetPageLayoutWidgetToDefault?: (PageLayoutWidgetGenqlSelection & { __args: {id: Scalars['String']} })
    createPageLayoutWidget?: (PageLayoutWidgetGenqlSelection & { __args: {input: CreatePageLayoutWidgetInput} })
    updatePageLayoutWidget?: (PageLayoutWidgetGenqlSelection & { __args: {id: Scalars['String'], input: UpdatePageLayoutWidgetInput} })
    destroyPageLayoutWidget?: { __args: {id: Scalars['String']} }
    deleteOneLogicFunction?: (LogicFunctionGenqlSelection & { __args: {input: LogicFunctionIdInput} })
    createOneLogicFunction?: (LogicFunctionGenqlSelection & { __args: {input: CreateLogicFunctionFromSourceInput} })
    executeOneLogicFunction?: (LogicFunctionExecutionResultGenqlSelection & { __args: {input: ExecuteOneLogicFunctionInput} })
    updateOneLogicFunction?: { __args: {input: UpdateLogicFunctionFromSourceInput} }
    createCommandMenuItem?: (CommandMenuItemGenqlSelection & { __args: {input: CreateCommandMenuItemInput} })
    updateCommandMenuItem?: (CommandMenuItemGenqlSelection & { __args: {input: UpdateCommandMenuItemInput} })
    deleteCommandMenuItem?: (CommandMenuItemGenqlSelection & { __args: {id: Scalars['UUID']} })
    createFrontComponent?: (FrontComponentGenqlSelection & { __args: {input: CreateFrontComponentInput} })
    updateFrontComponent?: (FrontComponentGenqlSelection & { __args: {input: UpdateFrontComponentInput} })
    deleteFrontComponent?: (FrontComponentGenqlSelection & { __args: {id: Scalars['UUID']} })
    createOneObject?: (ObjectGenqlSelection & { __args: {input: CreateOneObjectInput} })
    deleteOneObject?: (ObjectGenqlSelection & { __args: {input: DeleteOneObjectInput} })
    updateOneObject?: (ObjectGenqlSelection & { __args: {input: UpdateOneObjectInput} })
    createOneAgent?: (AgentGenqlSelection & { __args: {input: CreateAgentInput} })
    updateOneAgent?: (AgentGenqlSelection & { __args: {input: UpdateAgentInput} })
    deleteOneAgent?: (AgentGenqlSelection & { __args: {input: AgentIdInput} })
    updateWorkspaceMemberRole?: (WorkspaceMemberGenqlSelection & { __args: {workspaceMemberId: Scalars['UUID'], roleId: Scalars['UUID']} })
    createOneRole?: (RoleGenqlSelection & { __args: {createRoleInput: CreateRoleInput} })
    updateOneRole?: (RoleGenqlSelection & { __args: {updateRoleInput: UpdateRoleInput} })
    deleteOneRole?: { __args: {roleId: Scalars['UUID']} }
    upsertObjectPermissions?: (ObjectPermissionGenqlSelection & { __args: {upsertObjectPermissionsInput: UpsertObjectPermissionsInput} })
    upsertPermissionFlags?: (PermissionFlagGenqlSelection & { __args: {upsertPermissionFlagsInput: UpsertPermissionFlagsInput} })
    upsertFieldPermissions?: (FieldPermissionGenqlSelection & { __args: {upsertFieldPermissionsInput: UpsertFieldPermissionsInput} })
    upsertRowLevelPermissionPredicates?: (UpsertRowLevelPermissionPredicatesResultGenqlSelection & { __args: {input: UpsertRowLevelPermissionPredicatesInput} })
    assignRoleToAgent?: { __args: {agentId: Scalars['UUID'], roleId: Scalars['UUID']} }
    removeRoleFromAgent?: { __args: {agentId: Scalars['UUID']} }
    createOneField?: (FieldGenqlSelection & { __args: {input: CreateOneFieldMetadataInput} })
    updateOneField?: (FieldGenqlSelection & { __args: {input: UpdateOneFieldMetadataInput} })
    deleteOneField?: (FieldGenqlSelection & { __args: {input: DeleteOneFieldInput} })
    createViewGroup?: (ViewGroupGenqlSelection & { __args: {input: CreateViewGroupInput} })
    createManyViewGroups?: (ViewGroupGenqlSelection & { __args: {inputs: CreateViewGroupInput[]} })
    updateViewGroup?: (ViewGroupGenqlSelection & { __args: {input: UpdateViewGroupInput} })
    updateManyViewGroups?: (ViewGroupGenqlSelection & { __args: {inputs: UpdateViewGroupInput[]} })
    deleteViewGroup?: (ViewGroupGenqlSelection & { __args: {input: DeleteViewGroupInput} })
    destroyViewGroup?: (ViewGroupGenqlSelection & { __args: {input: DestroyViewGroupInput} })
    updateMessageFolder?: (MessageFolderGenqlSelection & { __args: {input: UpdateMessageFolderInput} })
    updateMessageFolders?: (MessageFolderGenqlSelection & { __args: {input: UpdateMessageFoldersInput} })
    updateMessageChannel?: (MessageChannelGenqlSelection & { __args: {input: UpdateMessageChannelInput} })
    deleteConnectedAccount?: (ConnectedAccountDTOGenqlSelection & { __args: {id: Scalars['UUID']} })
    updateCalendarChannel?: (CalendarChannelGenqlSelection & { __args: {input: UpdateCalendarChannelInput} })
    createWebhook?: (WebhookGenqlSelection & { __args: {input: CreateWebhookInput} })
    updateWebhook?: (WebhookGenqlSelection & { __args: {input: UpdateWebhookInput} })
    deleteWebhook?: (WebhookGenqlSelection & { __args: {id: Scalars['UUID']} })
    createChatThread?: AgentChatThreadGenqlSelection
    sendChatMessage?: (SendChatMessageResultGenqlSelection & { __args: {threadId: Scalars['UUID'], text: Scalars['String'], messageId: Scalars['UUID'], browsingContext?: (Scalars['JSON'] | null), modelId?: (Scalars['String'] | null)} })
    stopAgentChatStream?: { __args: {threadId: Scalars['UUID']} }
    deleteQueuedChatMessage?: { __args: {messageId: Scalars['UUID']} }
    createSkill?: (SkillGenqlSelection & { __args: {input: CreateSkillInput} })
    updateSkill?: (SkillGenqlSelection & { __args: {input: UpdateSkillInput} })
    deleteSkill?: (SkillGenqlSelection & { __args: {id: Scalars['UUID']} })
    activateSkill?: (SkillGenqlSelection & { __args: {id: Scalars['UUID']} })
    deactivateSkill?: (SkillGenqlSelection & { __args: {id: Scalars['UUID']} })
    evaluateAgentTurn?: (AgentTurnEvaluationGenqlSelection & { __args: {turnId: Scalars['UUID']} })
    runEvaluationInput?: (AgentTurnGenqlSelection & { __args: {agentId: Scalars['UUID'], input: Scalars['String']} })
    duplicateDashboard?: (DuplicatedDashboardGenqlSelection & { __args: {id: Scalars['UUID']} })
    getAuthorizationUrlForSSO?: (GetAuthorizationUrlForSSOGenqlSelection & { __args: {input: GetAuthorizationUrlForSSOInput} })
    getLoginTokenFromCredentials?: (LoginTokenGenqlSelection & { __args: {email: Scalars['String'], password: Scalars['String'], captchaToken?: (Scalars['String'] | null), locale?: (Scalars['String'] | null), verifyEmailRedirectPath?: (Scalars['String'] | null), origin: Scalars['String']} })
    signIn?: (AvailableWorkspacesAndAccessTokensGenqlSelection & { __args: {email: Scalars['String'], password: Scalars['String'], captchaToken?: (Scalars['String'] | null), locale?: (Scalars['String'] | null), verifyEmailRedirectPath?: (Scalars['String'] | null)} })
    verifyEmailAndGetLoginToken?: (VerifyEmailAndGetLoginTokenGenqlSelection & { __args: {emailVerificationToken: Scalars['String'], email: Scalars['String'], captchaToken?: (Scalars['String'] | null), origin: Scalars['String']} })
    verifyEmailAndGetWorkspaceAgnosticToken?: (AvailableWorkspacesAndAccessTokensGenqlSelection & { __args: {emailVerificationToken: Scalars['String'], email: Scalars['String'], captchaToken?: (Scalars['String'] | null)} })
    getAuthTokensFromOTP?: (AuthTokensGenqlSelection & { __args: {otp: Scalars['String'], loginToken: Scalars['String'], captchaToken?: (Scalars['String'] | null), origin: Scalars['String']} })
    signUp?: (AvailableWorkspacesAndAccessTokensGenqlSelection & { __args: {email: Scalars['String'], password: Scalars['String'], captchaToken?: (Scalars['String'] | null), locale?: (Scalars['String'] | null), verifyEmailRedirectPath?: (Scalars['String'] | null)} })
    signUpInWorkspace?: (SignUpGenqlSelection & { __args: {email: Scalars['String'], password: Scalars['String'], workspaceId?: (Scalars['UUID'] | null), workspaceInviteHash?: (Scalars['String'] | null), workspacePersonalInviteToken?: (Scalars['String'] | null), captchaToken?: (Scalars['String'] | null), locale?: (Scalars['String'] | null), verifyEmailRedirectPath?: (Scalars['String'] | null)} })
    signUpInNewWorkspace?: SignUpGenqlSelection
    generateTransientToken?: TransientTokenGenqlSelection
    getAuthTokensFromLoginToken?: (AuthTokensGenqlSelection & { __args: {loginToken: Scalars['String'], origin: Scalars['String']} })
    authorizeApp?: (AuthorizeAppGenqlSelection & { __args: {clientId: Scalars['String'], codeChallenge?: (Scalars['String'] | null), redirectUrl: Scalars['String'], state?: (Scalars['String'] | null), scope?: (Scalars['String'] | null)} })
    renewToken?: (AuthTokensGenqlSelection & { __args: {appToken: Scalars['String']} })
    generateApiKeyToken?: (ApiKeyTokenGenqlSelection & { __args: {apiKeyId: Scalars['UUID'], expiresAt: Scalars['String']} })
    emailPasswordResetLink?: (EmailPasswordResetLinkGenqlSelection & { __args: {email: Scalars['String'], workspaceId?: (Scalars['UUID'] | null)} })
    updatePasswordViaResetToken?: (InvalidatePasswordGenqlSelection & { __args: {passwordResetToken: Scalars['String'], newPassword: Scalars['String']} })
    createApplicationRegistration?: (CreateApplicationRegistrationGenqlSelection & { __args: {input: CreateApplicationRegistrationInput} })
    updateApplicationRegistration?: (ApplicationRegistrationGenqlSelection & { __args: {input: UpdateApplicationRegistrationInput} })
    deleteApplicationRegistration?: { __args: {id: Scalars['String']} }
    rotateApplicationRegistrationClientSecret?: (RotateClientSecretGenqlSelection & { __args: {id: Scalars['String']} })
    createApplicationRegistrationVariable?: (ApplicationRegistrationVariableGenqlSelection & { __args: {input: CreateApplicationRegistrationVariableInput} })
    updateApplicationRegistrationVariable?: (ApplicationRegistrationVariableGenqlSelection & { __args: {input: UpdateApplicationRegistrationVariableInput} })
    deleteApplicationRegistrationVariable?: { __args: {id: Scalars['String']} }
    uploadAppTarball?: (ApplicationRegistrationGenqlSelection & { __args: {file: Scalars['Upload'], universalIdentifier?: (Scalars['String'] | null)} })
    transferApplicationRegistrationOwnership?: (ApplicationRegistrationGenqlSelection & { __args: {applicationRegistrationId: Scalars['String'], targetWorkspaceSubdomain: Scalars['String']} })
    initiateOTPProvisioning?: (InitiateTwoFactorAuthenticationProvisioningGenqlSelection & { __args: {loginToken: Scalars['String'], origin: Scalars['String']} })
    initiateOTPProvisioningForAuthenticatedUser?: InitiateTwoFactorAuthenticationProvisioningGenqlSelection
    deleteTwoFactorAuthenticationMethod?: (DeleteTwoFactorAuthenticationMethodGenqlSelection & { __args: {twoFactorAuthenticationMethodId: Scalars['UUID']} })
    verifyTwoFactorAuthenticationMethodForAuthenticatedUser?: (VerifyTwoFactorAuthenticationMethodGenqlSelection & { __args: {otp: Scalars['String']} })
    deleteUser?: UserGenqlSelection
    deleteUserFromWorkspace?: (UserWorkspaceGenqlSelection & { __args: {workspaceMemberIdToDelete: Scalars['String']} })
    updateUserEmail?: { __args: {newEmail: Scalars['String'], verifyEmailRedirectPath?: (Scalars['String'] | null)} }
    resendEmailVerificationToken?: (ResendEmailVerificationTokenGenqlSelection & { __args: {email: Scalars['String'], origin: Scalars['String']} })
    activateWorkspace?: (WorkspaceGenqlSelection & { __args: {data: ActivateWorkspaceInput} })
    updateWorkspace?: (WorkspaceGenqlSelection & { __args: {data: UpdateWorkspaceInput} })
    deleteCurrentWorkspace?: WorkspaceGenqlSelection
    checkCustomDomainValidRecords?: DomainValidRecordsGenqlSelection
    createOIDCIdentityProvider?: (SetupSsoGenqlSelection & { __args: {input: SetupOIDCSsoInput} })
    createSAMLIdentityProvider?: (SetupSsoGenqlSelection & { __args: {input: SetupSAMLSsoInput} })
    deleteSSOIdentityProvider?: (DeleteSsoGenqlSelection & { __args: {input: DeleteSsoInput} })
    editSSOIdentityProvider?: (EditSsoGenqlSelection & { __args: {input: EditSsoInput} })
    impersonate?: (ImpersonateGenqlSelection & { __args: {userId: Scalars['UUID'], workspaceId: Scalars['UUID']} })
    sendEmail?: (SendEmailOutputGenqlSelection & { __args: {input: SendEmailInput} })
    startChannelSync?: (ChannelSyncSuccessGenqlSelection & { __args: {connectedAccountId: Scalars['UUID']} })
    saveImapSmtpCaldavAccount?: (ImapSmtpCaldavConnectionSuccessGenqlSelection & { __args: {accountOwnerId: Scalars['UUID'], handle: Scalars['String'], connectionParameters: EmailAccountConnectionParameters, id?: (Scalars['UUID'] | null)} })
    updateLabPublicFeatureFlag?: (FeatureFlagGenqlSelection & { __args: {input: UpdateLabPublicFeatureFlagInput} })
    userLookupAdminPanel?: (UserLookupGenqlSelection & { __args: {userIdentifier: Scalars['String']} })
    updateWorkspaceFeatureFlag?: { __args: {workspaceId: Scalars['UUID'], featureFlag: Scalars['String'], value: Scalars['Boolean']} }
    setAdminAiModelEnabled?: { __args: {modelId: Scalars['String'], enabled: Scalars['Boolean']} }
    setAdminAiModelRecommended?: { __args: {modelId: Scalars['String'], recommended: Scalars['Boolean']} }
    setAdminDefaultAiModel?: { __args: {role: AiModelRole, modelId: Scalars['String']} }
    createDatabaseConfigVariable?: { __args: {key: Scalars['String'], value: Scalars['JSON']} }
    updateDatabaseConfigVariable?: { __args: {key: Scalars['String'], value: Scalars['JSON']} }
    deleteDatabaseConfigVariable?: { __args: {key: Scalars['String']} }
    retryJobs?: (RetryJobsResponseGenqlSelection & { __args: {queueName: Scalars['String'], jobIds: Scalars['String'][]} })
    deleteJobs?: (DeleteJobsResponseGenqlSelection & { __args: {queueName: Scalars['String'], jobIds: Scalars['String'][]} })
    addAiProvider?: { __args: {providerName: Scalars['String'], providerConfig: Scalars['JSON']} }
    removeAiProvider?: { __args: {providerName: Scalars['String']} }
    addModelToProvider?: { __args: {providerName: Scalars['String'], modelConfig: Scalars['JSON']} }
    removeModelFromProvider?: { __args: {providerName: Scalars['String'], modelName: Scalars['String']} }
    setMaintenanceMode?: { __args: {startAt: Scalars['DateTime'], endAt: Scalars['DateTime'], link?: (Scalars['String'] | null)} }
    clearMaintenanceMode?: boolean | number
    enablePostgresProxy?: PostgresCredentialsGenqlSelection
    disablePostgresProxy?: PostgresCredentialsGenqlSelection
    createPublicDomain?: (PublicDomainGenqlSelection & { __args: {domain: Scalars['String']} })
    deletePublicDomain?: { __args: {domain: Scalars['String']} }
    checkPublicDomainValidRecords?: (DomainValidRecordsGenqlSelection & { __args: {domain: Scalars['String']} })
    createEmailingDomain?: (EmailingDomainGenqlSelection & { __args: {domain: Scalars['String'], driver: EmailingDomainDriver} })
    deleteEmailingDomain?: { __args: {id: Scalars['String']} }
    verifyEmailingDomain?: (EmailingDomainGenqlSelection & { __args: {id: Scalars['String']} })
    createOneAppToken?: (AppTokenGenqlSelection & { __args: {input: CreateOneAppTokenInput} })
    installMarketplaceApp?: { __args: {universalIdentifier: Scalars['String'], version?: (Scalars['String'] | null)} }
    syncMarketplaceCatalog?: boolean | number
    installApplication?: { __args: {appRegistrationId: Scalars['String'], version?: (Scalars['String'] | null)} }
    runWorkspaceMigration?: { __args: {workspaceMigration: WorkspaceMigrationInput} }
    uninstallApplication?: { __args: {universalIdentifier: Scalars['String']} }
    updateOneApplicationVariable?: { __args: {key: Scalars['String'], value: Scalars['String'], applicationId: Scalars['UUID']} }
    createDevelopmentApplication?: (DevelopmentApplicationGenqlSelection & { __args: {universalIdentifier: Scalars['String'], name: Scalars['String']} })
    generateApplicationToken?: (ApplicationTokenPairGenqlSelection & { __args: {applicationId: Scalars['UUID']} })
    syncApplication?: (WorkspaceMigrationGenqlSelection & { __args: {manifest: Scalars['JSON']} })
    uploadApplicationFile?: (FileGenqlSelection & { __args: {file: Scalars['Upload'], applicationUniversalIdentifier: Scalars['String'], fileFolder: FileFolder, filePath: Scalars['String']} })
    upgradeApplication?: { __args: {appRegistrationId: Scalars['String'], targetVersion: Scalars['String']} }
    renewApplicationToken?: (ApplicationTokenPairGenqlSelection & { __args: {applicationRefreshToken: Scalars['String']} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AddQuerySubscriptionInput {eventStreamId: Scalars['String'],queryId: Scalars['String'],operationSignature: Scalars['JSON']}

export interface RemoveQueryFromEventStreamInput {eventStreamId: Scalars['String'],queryId: Scalars['String']}

export interface CreateNavigationMenuItemInput {id?: (Scalars['UUID'] | null),userWorkspaceId?: (Scalars['UUID'] | null),targetRecordId?: (Scalars['UUID'] | null),targetObjectMetadataId?: (Scalars['UUID'] | null),viewId?: (Scalars['UUID'] | null),type: NavigationMenuItemType,name?: (Scalars['String'] | null),link?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),color?: (Scalars['String'] | null),folderId?: (Scalars['UUID'] | null),position?: (Scalars['Float'] | null)}

export interface UpdateOneNavigationMenuItemInput {
/** The id of the record to update */
id: Scalars['UUID'],
/** The record to update */
update: UpdateNavigationMenuItemInput}

export interface UpdateNavigationMenuItemInput {folderId?: (Scalars['UUID'] | null),position?: (Scalars['Float'] | null),name?: (Scalars['String'] | null),link?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),color?: (Scalars['String'] | null)}

export interface CreateViewFilterGroupInput {id?: (Scalars['UUID'] | null),parentViewFilterGroupId?: (Scalars['UUID'] | null),logicalOperator?: (ViewFilterGroupLogicalOperator | null),positionInViewFilterGroup?: (Scalars['Float'] | null),viewId: Scalars['UUID']}

export interface UpdateViewFilterGroupInput {id?: (Scalars['UUID'] | null),parentViewFilterGroupId?: (Scalars['UUID'] | null),logicalOperator?: (ViewFilterGroupLogicalOperator | null),positionInViewFilterGroup?: (Scalars['Float'] | null),viewId?: (Scalars['UUID'] | null)}

export interface CreateViewFilterInput {id?: (Scalars['UUID'] | null),fieldMetadataId: Scalars['UUID'],operand?: (ViewFilterOperand | null),value: Scalars['JSON'],viewFilterGroupId?: (Scalars['UUID'] | null),positionInViewFilterGroup?: (Scalars['Float'] | null),subFieldName?: (Scalars['String'] | null),viewId: Scalars['UUID']}

export interface UpdateViewFilterInput {
/** The id of the view filter to update */
id: Scalars['UUID'],
/** The view filter to update */
update: UpdateViewFilterInputUpdates}

export interface UpdateViewFilterInputUpdates {fieldMetadataId?: (Scalars['UUID'] | null),operand?: (ViewFilterOperand | null),value?: (Scalars['JSON'] | null),viewFilterGroupId?: (Scalars['UUID'] | null),positionInViewFilterGroup?: (Scalars['Float'] | null),subFieldName?: (Scalars['String'] | null)}

export interface DeleteViewFilterInput {
/** The id of the view filter to delete. */
id: Scalars['UUID']}

export interface DestroyViewFilterInput {
/** The id of the view filter to destroy. */
id: Scalars['UUID']}

export interface CreateViewInput {id?: (Scalars['UUID'] | null),name: Scalars['String'],objectMetadataId: Scalars['UUID'],type?: (ViewType | null),key?: (ViewKey | null),icon: Scalars['String'],position?: (Scalars['Float'] | null),isCompact?: (Scalars['Boolean'] | null),shouldHideEmptyGroups?: (Scalars['Boolean'] | null),openRecordIn?: (ViewOpenRecordIn | null),kanbanAggregateOperation?: (AggregateOperations | null),kanbanAggregateOperationFieldMetadataId?: (Scalars['UUID'] | null),anyFieldFilterValue?: (Scalars['String'] | null),calendarLayout?: (ViewCalendarLayout | null),calendarFieldMetadataId?: (Scalars['UUID'] | null),mainGroupByFieldMetadataId?: (Scalars['UUID'] | null),visibility?: (ViewVisibility | null)}

export interface UpdateViewInput {id?: (Scalars['UUID'] | null),name?: (Scalars['String'] | null),type?: (ViewType | null),icon?: (Scalars['String'] | null),position?: (Scalars['Float'] | null),isCompact?: (Scalars['Boolean'] | null),openRecordIn?: (ViewOpenRecordIn | null),kanbanAggregateOperation?: (AggregateOperations | null),kanbanAggregateOperationFieldMetadataId?: (Scalars['UUID'] | null),anyFieldFilterValue?: (Scalars['String'] | null),calendarLayout?: (ViewCalendarLayout | null),calendarFieldMetadataId?: (Scalars['UUID'] | null),visibility?: (ViewVisibility | null),mainGroupByFieldMetadataId?: (Scalars['UUID'] | null),shouldHideEmptyGroups?: (Scalars['Boolean'] | null)}

export interface CreateViewSortInput {id?: (Scalars['UUID'] | null),fieldMetadataId: Scalars['UUID'],direction?: (ViewSortDirection | null),viewId: Scalars['UUID']}

export interface UpdateViewSortInput {
/** The id of the view sort to update */
id: Scalars['UUID'],
/** The view sort to update */
update: UpdateViewSortInputUpdates}

export interface UpdateViewSortInputUpdates {direction?: (ViewSortDirection | null)}

export interface DeleteViewSortInput {
/** The id of the view sort to delete. */
id: Scalars['UUID']}

export interface DestroyViewSortInput {
/** The id of the view sort to destroy. */
id: Scalars['UUID']}

export interface UpdateViewFieldInput {
/** The id of the view field to update */
id: Scalars['UUID'],
/** The view field to update */
update: UpdateViewFieldInputUpdates}

export interface UpdateViewFieldInputUpdates {isVisible?: (Scalars['Boolean'] | null),size?: (Scalars['Float'] | null),position?: (Scalars['Float'] | null),aggregateOperation?: (AggregateOperations | null),viewFieldGroupId?: (Scalars['UUID'] | null)}

export interface CreateViewFieldInput {id?: (Scalars['UUID'] | null),fieldMetadataId: Scalars['UUID'],viewId: Scalars['UUID'],isVisible?: (Scalars['Boolean'] | null),size?: (Scalars['Float'] | null),position?: (Scalars['Float'] | null),aggregateOperation?: (AggregateOperations | null),viewFieldGroupId?: (Scalars['UUID'] | null)}

export interface DeleteViewFieldInput {
/** The id of the view field to delete. */
id: Scalars['UUID']}

export interface DestroyViewFieldInput {
/** The id of the view field to destroy. */
id: Scalars['UUID']}

export interface UpdateViewFieldGroupInput {
/** The id of the view field group to update */
id: Scalars['UUID'],
/** The view field group to update */
update: UpdateViewFieldGroupInputUpdates}

export interface UpdateViewFieldGroupInputUpdates {name?: (Scalars['String'] | null),position?: (Scalars['Float'] | null),isVisible?: (Scalars['Boolean'] | null),deletedAt?: (Scalars['String'] | null)}

export interface CreateViewFieldGroupInput {id?: (Scalars['UUID'] | null),name: Scalars['String'],viewId: Scalars['UUID'],position?: (Scalars['Float'] | null),isVisible?: (Scalars['Boolean'] | null)}

export interface DeleteViewFieldGroupInput {
/** The id of the view field group to delete. */
id: Scalars['UUID']}

export interface DestroyViewFieldGroupInput {
/** The id of the view field group to destroy. */
id: Scalars['UUID']}

export interface UpsertFieldsWidgetInput {
/** The id of the fields widget whose groups and fields to upsert */
widgetId: Scalars['UUID'],
/** The groups (with nested fields) to upsert. Mutually exclusive with "fields". */
groups?: (UpsertFieldsWidgetGroupInput[] | null),
/** The ungrouped fields to upsert. When provided, all existing groups are deleted and fields are detached from groups. Mutually exclusive with "groups". */
fields?: (UpsertFieldsWidgetFieldInput[] | null)}

export interface UpsertFieldsWidgetGroupInput {id: Scalars['UUID'],name: Scalars['String'],position: Scalars['Float'],isVisible: Scalars['Boolean'],fields: UpsertFieldsWidgetFieldInput[]}

export interface UpsertFieldsWidgetFieldInput {
/** The id of the view field. Required if fieldMetadataId is not provided. */
viewFieldId?: (Scalars['UUID'] | null),
/** The id of the field metadata. Used to create a new view field when viewFieldId is not provided. */
fieldMetadataId?: (Scalars['UUID'] | null),isVisible: Scalars['Boolean'],position: Scalars['Float']}

export interface CreateApiKeyInput {name: Scalars['String'],expiresAt: Scalars['String'],revokedAt?: (Scalars['String'] | null),roleId: Scalars['UUID']}

export interface UpdateApiKeyInput {id: Scalars['UUID'],name?: (Scalars['String'] | null),expiresAt?: (Scalars['String'] | null),revokedAt?: (Scalars['String'] | null)}

export interface RevokeApiKeyInput {id: Scalars['UUID']}

export interface CreateApprovedAccessDomainInput {domain: Scalars['String'],email: Scalars['String']}

export interface DeleteApprovedAccessDomainInput {id: Scalars['UUID']}

export interface ValidateApprovedAccessDomainInput {validationToken: Scalars['String'],approvedAccessDomainId: Scalars['UUID']}

export interface CreatePageLayoutTabInput {title: Scalars['String'],position?: (Scalars['Float'] | null),pageLayoutId: Scalars['UUID'],layoutMode?: (PageLayoutTabLayoutMode | null)}

export interface UpdatePageLayoutTabInput {title?: (Scalars['String'] | null),position?: (Scalars['Float'] | null),icon?: (Scalars['String'] | null),layoutMode?: (PageLayoutTabLayoutMode | null)}

export interface CreatePageLayoutInput {name: Scalars['String'],type?: (PageLayoutType | null),objectMetadataId?: (Scalars['UUID'] | null)}

export interface UpdatePageLayoutInput {name?: (Scalars['String'] | null),type?: (PageLayoutType | null),objectMetadataId?: (Scalars['UUID'] | null)}

export interface UpdatePageLayoutWithTabsInput {name: Scalars['String'],type: PageLayoutType,objectMetadataId?: (Scalars['UUID'] | null),tabs: UpdatePageLayoutTabWithWidgetsInput[]}

export interface UpdatePageLayoutTabWithWidgetsInput {id: Scalars['UUID'],title: Scalars['String'],position: Scalars['Float'],icon?: (Scalars['String'] | null),layoutMode?: (PageLayoutTabLayoutMode | null),widgets: UpdatePageLayoutWidgetWithIdInput[]}

export interface UpdatePageLayoutWidgetWithIdInput {id: Scalars['UUID'],pageLayoutTabId: Scalars['UUID'],title: Scalars['String'],type: WidgetType,objectMetadataId?: (Scalars['UUID'] | null),gridPosition: GridPositionInput,position?: (Scalars['JSON'] | null),configuration?: (Scalars['JSON'] | null),conditionalDisplay?: (Scalars['JSON'] | null)}

export interface GridPositionInput {row: Scalars['Float'],column: Scalars['Float'],rowSpan: Scalars['Float'],columnSpan: Scalars['Float']}

export interface CreatePageLayoutWidgetInput {pageLayoutTabId: Scalars['UUID'],title: Scalars['String'],type: WidgetType,objectMetadataId?: (Scalars['UUID'] | null),gridPosition: GridPositionInput,position?: (Scalars['JSON'] | null),configuration: Scalars['JSON']}

export interface UpdatePageLayoutWidgetInput {title?: (Scalars['String'] | null),type?: (WidgetType | null),objectMetadataId?: (Scalars['UUID'] | null),gridPosition?: (GridPositionInput | null),position?: (Scalars['JSON'] | null),configuration?: (Scalars['JSON'] | null),conditionalDisplay?: (Scalars['JSON'] | null)}

export interface CreateLogicFunctionFromSourceInput {id?: (Scalars['UUID'] | null),universalIdentifier?: (Scalars['UUID'] | null),name: Scalars['String'],description?: (Scalars['String'] | null),timeoutSeconds?: (Scalars['Float'] | null),toolInputSchema?: (Scalars['JSON'] | null),isTool?: (Scalars['Boolean'] | null),source?: (Scalars['JSON'] | null),cronTriggerSettings?: (Scalars['JSON'] | null),databaseEventTriggerSettings?: (Scalars['JSON'] | null),httpRouteTriggerSettings?: (Scalars['JSON'] | null)}

export interface ExecuteOneLogicFunctionInput {
/** Id of the logic function to execute */
id: Scalars['UUID'],
/** Payload in JSON format */
payload: Scalars['JSON']}

export interface UpdateLogicFunctionFromSourceInput {
/** Id of the logic function to update */
id: Scalars['UUID'],
/** The logic function updates */
update: UpdateLogicFunctionFromSourceInputUpdates}

export interface UpdateLogicFunctionFromSourceInputUpdates {name?: (Scalars['String'] | null),description?: (Scalars['String'] | null),timeoutSeconds?: (Scalars['Float'] | null),sourceHandlerCode?: (Scalars['String'] | null),toolInputSchema?: (Scalars['JSON'] | null),handlerName?: (Scalars['String'] | null),sourceHandlerPath?: (Scalars['String'] | null),isTool?: (Scalars['Boolean'] | null),cronTriggerSettings?: (Scalars['JSON'] | null),databaseEventTriggerSettings?: (Scalars['JSON'] | null),httpRouteTriggerSettings?: (Scalars['JSON'] | null)}

export interface CreateCommandMenuItemInput {workflowVersionId?: (Scalars['UUID'] | null),frontComponentId?: (Scalars['UUID'] | null),engineComponentKey: EngineComponentKey,label: Scalars['String'],icon?: (Scalars['String'] | null),shortLabel?: (Scalars['String'] | null),position?: (Scalars['Float'] | null),isPinned?: (Scalars['Boolean'] | null),availabilityType?: (CommandMenuItemAvailabilityType | null),hotKeys?: (Scalars['String'][] | null),conditionalAvailabilityExpression?: (Scalars['String'] | null),availabilityObjectMetadataId?: (Scalars['UUID'] | null),payload?: (Scalars['JSON'] | null)}

export interface UpdateCommandMenuItemInput {id: Scalars['UUID'],label?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),shortLabel?: (Scalars['String'] | null),position?: (Scalars['Float'] | null),isPinned?: (Scalars['Boolean'] | null),availabilityType?: (CommandMenuItemAvailabilityType | null),availabilityObjectMetadataId?: (Scalars['UUID'] | null),engineComponentKey?: (EngineComponentKey | null),hotKeys?: (Scalars['String'][] | null)}

export interface CreateFrontComponentInput {id?: (Scalars['UUID'] | null),name: Scalars['String'],description?: (Scalars['String'] | null),sourceComponentPath: Scalars['String'],builtComponentPath: Scalars['String'],componentName: Scalars['String'],builtComponentChecksum: Scalars['String']}

export interface UpdateFrontComponentInput {
/** The id of the front component to update */
id: Scalars['UUID'],
/** The front component fields to update */
update: UpdateFrontComponentInputUpdates}

export interface UpdateFrontComponentInputUpdates {name?: (Scalars['String'] | null),description?: (Scalars['String'] | null)}

export interface CreateOneObjectInput {
/** The object to create */
object: CreateObjectInput}

export interface CreateObjectInput {nameSingular: Scalars['String'],namePlural: Scalars['String'],labelSingular: Scalars['String'],labelPlural: Scalars['String'],description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),shortcut?: (Scalars['String'] | null),color?: (Scalars['String'] | null),skipNameField?: (Scalars['Boolean'] | null),isRemote?: (Scalars['Boolean'] | null),primaryKeyColumnType?: (Scalars['String'] | null),primaryKeyFieldMetadataSettings?: (Scalars['JSON'] | null),isLabelSyncedWithName?: (Scalars['Boolean'] | null)}

export interface DeleteOneObjectInput {
/** The id of the record to delete. */
id: Scalars['UUID']}

export interface UpdateOneObjectInput {update: UpdateObjectPayload,
/** The id of the object to update */
id: Scalars['UUID']}

export interface UpdateObjectPayload {labelSingular?: (Scalars['String'] | null),labelPlural?: (Scalars['String'] | null),nameSingular?: (Scalars['String'] | null),namePlural?: (Scalars['String'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),shortcut?: (Scalars['String'] | null),color?: (Scalars['String'] | null),isActive?: (Scalars['Boolean'] | null),labelIdentifierFieldMetadataId?: (Scalars['UUID'] | null),imageIdentifierFieldMetadataId?: (Scalars['UUID'] | null),isLabelSyncedWithName?: (Scalars['Boolean'] | null),isSearchable?: (Scalars['Boolean'] | null)}

export interface CreateAgentInput {name?: (Scalars['String'] | null),label: Scalars['String'],icon?: (Scalars['String'] | null),description?: (Scalars['String'] | null),prompt: Scalars['String'],modelId: Scalars['String'],roleId?: (Scalars['UUID'] | null),responseFormat?: (Scalars['JSON'] | null),modelConfiguration?: (Scalars['JSON'] | null),evaluationInputs?: (Scalars['String'][] | null)}

export interface UpdateAgentInput {id: Scalars['UUID'],name?: (Scalars['String'] | null),label?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),description?: (Scalars['String'] | null),prompt?: (Scalars['String'] | null),modelId?: (Scalars['String'] | null),roleId?: (Scalars['UUID'] | null),responseFormat?: (Scalars['JSON'] | null),modelConfiguration?: (Scalars['JSON'] | null),evaluationInputs?: (Scalars['String'][] | null)}

export interface CreateRoleInput {id?: (Scalars['String'] | null),label: Scalars['String'],description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),canUpdateAllSettings?: (Scalars['Boolean'] | null),canAccessAllTools?: (Scalars['Boolean'] | null),canReadAllObjectRecords?: (Scalars['Boolean'] | null),canUpdateAllObjectRecords?: (Scalars['Boolean'] | null),canSoftDeleteAllObjectRecords?: (Scalars['Boolean'] | null),canDestroyAllObjectRecords?: (Scalars['Boolean'] | null),canBeAssignedToUsers?: (Scalars['Boolean'] | null),canBeAssignedToAgents?: (Scalars['Boolean'] | null),canBeAssignedToApiKeys?: (Scalars['Boolean'] | null)}

export interface UpdateRoleInput {update: UpdateRolePayload,
/** The id of the role to update */
id: Scalars['UUID']}

export interface UpdateRolePayload {label?: (Scalars['String'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),canUpdateAllSettings?: (Scalars['Boolean'] | null),canAccessAllTools?: (Scalars['Boolean'] | null),canReadAllObjectRecords?: (Scalars['Boolean'] | null),canUpdateAllObjectRecords?: (Scalars['Boolean'] | null),canSoftDeleteAllObjectRecords?: (Scalars['Boolean'] | null),canDestroyAllObjectRecords?: (Scalars['Boolean'] | null),canBeAssignedToUsers?: (Scalars['Boolean'] | null),canBeAssignedToAgents?: (Scalars['Boolean'] | null),canBeAssignedToApiKeys?: (Scalars['Boolean'] | null)}

export interface UpsertObjectPermissionsInput {roleId: Scalars['UUID'],objectPermissions: ObjectPermissionInput[]}

export interface ObjectPermissionInput {objectMetadataId: Scalars['UUID'],canReadObjectRecords?: (Scalars['Boolean'] | null),canUpdateObjectRecords?: (Scalars['Boolean'] | null),canSoftDeleteObjectRecords?: (Scalars['Boolean'] | null),canDestroyObjectRecords?: (Scalars['Boolean'] | null)}

export interface UpsertPermissionFlagsInput {roleId: Scalars['UUID'],permissionFlagKeys: PermissionFlagType[]}

export interface UpsertFieldPermissionsInput {roleId: Scalars['UUID'],fieldPermissions: FieldPermissionInput[]}

export interface FieldPermissionInput {objectMetadataId: Scalars['UUID'],fieldMetadataId: Scalars['UUID'],canReadFieldValue?: (Scalars['Boolean'] | null),canUpdateFieldValue?: (Scalars['Boolean'] | null)}

export interface UpsertRowLevelPermissionPredicatesInput {roleId: Scalars['UUID'],objectMetadataId: Scalars['UUID'],predicates: RowLevelPermissionPredicateInput[],predicateGroups: RowLevelPermissionPredicateGroupInput[]}

export interface RowLevelPermissionPredicateInput {id?: (Scalars['UUID'] | null),fieldMetadataId: Scalars['UUID'],operand: RowLevelPermissionPredicateOperand,value?: (Scalars['JSON'] | null),subFieldName?: (Scalars['String'] | null),workspaceMemberFieldMetadataId?: (Scalars['String'] | null),workspaceMemberSubFieldName?: (Scalars['String'] | null),rowLevelPermissionPredicateGroupId?: (Scalars['UUID'] | null),positionInRowLevelPermissionPredicateGroup?: (Scalars['Float'] | null)}

export interface RowLevelPermissionPredicateGroupInput {id?: (Scalars['UUID'] | null),objectMetadataId: Scalars['UUID'],parentRowLevelPermissionPredicateGroupId?: (Scalars['UUID'] | null),logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator,positionInRowLevelPermissionPredicateGroup?: (Scalars['Float'] | null)}

export interface CreateOneFieldMetadataInput {
/** The record to create */
field: CreateFieldInput}

export interface CreateFieldInput {type: FieldMetadataType,name: Scalars['String'],label: Scalars['String'],description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),isCustom?: (Scalars['Boolean'] | null),isActive?: (Scalars['Boolean'] | null),isSystem?: (Scalars['Boolean'] | null),isUIReadOnly?: (Scalars['Boolean'] | null),isNullable?: (Scalars['Boolean'] | null),isUnique?: (Scalars['Boolean'] | null),defaultValue?: (Scalars['JSON'] | null),options?: (Scalars['JSON'] | null),settings?: (Scalars['JSON'] | null),objectMetadataId: Scalars['UUID'],isLabelSyncedWithName?: (Scalars['Boolean'] | null),isRemoteCreation?: (Scalars['Boolean'] | null),relationCreationPayload?: (Scalars['JSON'] | null),morphRelationsCreationPayload?: (Scalars['JSON'][] | null)}

export interface UpdateOneFieldMetadataInput {
/** The id of the record to update */
id: Scalars['UUID'],
/** The record to update */
update: UpdateFieldInput}

export interface UpdateFieldInput {universalIdentifier?: (Scalars['String'] | null),name?: (Scalars['String'] | null),label?: (Scalars['String'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),isActive?: (Scalars['Boolean'] | null),isSystem?: (Scalars['Boolean'] | null),isUIReadOnly?: (Scalars['Boolean'] | null),isNullable?: (Scalars['Boolean'] | null),isUnique?: (Scalars['Boolean'] | null),defaultValue?: (Scalars['JSON'] | null),options?: (Scalars['JSON'] | null),settings?: (Scalars['JSON'] | null),objectMetadataId?: (Scalars['UUID'] | null),isLabelSyncedWithName?: (Scalars['Boolean'] | null),morphRelationsUpdatePayload?: (Scalars['JSON'][] | null)}

export interface DeleteOneFieldInput {
/** The id of the field to delete. */
id: Scalars['UUID']}

export interface CreateViewGroupInput {id?: (Scalars['UUID'] | null),isVisible?: (Scalars['Boolean'] | null),fieldValue: Scalars['String'],position?: (Scalars['Float'] | null),viewId: Scalars['UUID']}

export interface UpdateViewGroupInput {
/** The id of the view group to update */
id: Scalars['UUID'],
/** The view group to update */
update: UpdateViewGroupInputUpdates}

export interface UpdateViewGroupInputUpdates {fieldMetadataId?: (Scalars['UUID'] | null),isVisible?: (Scalars['Boolean'] | null),fieldValue?: (Scalars['String'] | null),position?: (Scalars['Float'] | null)}

export interface DeleteViewGroupInput {
/** The id of the view group to delete. */
id: Scalars['UUID']}

export interface DestroyViewGroupInput {
/** The id of the view group to destroy. */
id: Scalars['UUID']}

export interface UpdateMessageFolderInput {id: Scalars['UUID'],update: UpdateMessageFolderInputUpdates}

export interface UpdateMessageFolderInputUpdates {isSynced?: (Scalars['Boolean'] | null)}

export interface UpdateMessageFoldersInput {ids: Scalars['UUID'][],update: UpdateMessageFolderInputUpdates}

export interface UpdateMessageChannelInput {id: Scalars['UUID'],update: UpdateMessageChannelInputUpdates}

export interface UpdateMessageChannelInputUpdates {visibility?: (MessageChannelVisibility | null),isContactAutoCreationEnabled?: (Scalars['Boolean'] | null),contactAutoCreationPolicy?: (MessageChannelContactAutoCreationPolicy | null),messageFolderImportPolicy?: (MessageFolderImportPolicy | null),isSyncEnabled?: (Scalars['Boolean'] | null),excludeNonProfessionalEmails?: (Scalars['Boolean'] | null),excludeGroupEmails?: (Scalars['Boolean'] | null)}

export interface UpdateCalendarChannelInput {id: Scalars['UUID'],update: UpdateCalendarChannelInputUpdates}

export interface UpdateCalendarChannelInputUpdates {visibility?: (CalendarChannelVisibility | null),isContactAutoCreationEnabled?: (Scalars['Boolean'] | null),contactAutoCreationPolicy?: (CalendarChannelContactAutoCreationPolicy | null),isSyncEnabled?: (Scalars['Boolean'] | null)}

export interface CreateWebhookInput {id?: (Scalars['UUID'] | null),targetUrl: Scalars['String'],operations: Scalars['String'][],description?: (Scalars['String'] | null),secret?: (Scalars['String'] | null)}

export interface UpdateWebhookInput {
/** The id of the webhook to update */
id: Scalars['UUID'],
/** The webhook fields to update */
update: UpdateWebhookInputUpdates}

export interface UpdateWebhookInputUpdates {targetUrl?: (Scalars['String'] | null),operations?: (Scalars['String'][] | null),description?: (Scalars['String'] | null),secret?: (Scalars['String'] | null)}

export interface CreateSkillInput {id?: (Scalars['UUID'] | null),name: Scalars['String'],label: Scalars['String'],icon?: (Scalars['String'] | null),description?: (Scalars['String'] | null),content: Scalars['String']}

export interface UpdateSkillInput {id: Scalars['UUID'],name?: (Scalars['String'] | null),label?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),description?: (Scalars['String'] | null),content?: (Scalars['String'] | null),isActive?: (Scalars['Boolean'] | null)}

export interface GetAuthorizationUrlForSSOInput {identityProviderId: Scalars['UUID'],workspaceInviteHash?: (Scalars['String'] | null)}

export interface CreateApplicationRegistrationInput {name: Scalars['String'],universalIdentifier?: (Scalars['String'] | null),oAuthRedirectUris?: (Scalars['String'][] | null),oAuthScopes?: (Scalars['String'][] | null)}

export interface UpdateApplicationRegistrationInput {id: Scalars['String'],update: UpdateApplicationRegistrationPayload}

export interface UpdateApplicationRegistrationPayload {name?: (Scalars['String'] | null),oAuthRedirectUris?: (Scalars['String'][] | null),oAuthScopes?: (Scalars['String'][] | null),isListed?: (Scalars['Boolean'] | null)}

export interface CreateApplicationRegistrationVariableInput {applicationRegistrationId: Scalars['String'],key: Scalars['String'],value: Scalars['String'],description?: (Scalars['String'] | null),isSecret?: (Scalars['Boolean'] | null)}

export interface UpdateApplicationRegistrationVariableInput {id: Scalars['String'],update: UpdateApplicationRegistrationVariablePayload}

export interface UpdateApplicationRegistrationVariablePayload {value?: (Scalars['String'] | null),description?: (Scalars['String'] | null)}

export interface ActivateWorkspaceInput {displayName?: (Scalars['String'] | null)}

export interface UpdateWorkspaceInput {subdomain?: (Scalars['String'] | null),customDomain?: (Scalars['String'] | null),displayName?: (Scalars['String'] | null),logo?: (Scalars['String'] | null),inviteHash?: (Scalars['String'] | null),isPublicInviteLinkEnabled?: (Scalars['Boolean'] | null),allowImpersonation?: (Scalars['Boolean'] | null),isGoogleAuthEnabled?: (Scalars['Boolean'] | null),isMicrosoftAuthEnabled?: (Scalars['Boolean'] | null),isPasswordAuthEnabled?: (Scalars['Boolean'] | null),isGoogleAuthBypassEnabled?: (Scalars['Boolean'] | null),isMicrosoftAuthBypassEnabled?: (Scalars['Boolean'] | null),isPasswordAuthBypassEnabled?: (Scalars['Boolean'] | null),defaultRoleId?: (Scalars['UUID'] | null),isTwoFactorAuthenticationEnforced?: (Scalars['Boolean'] | null),trashRetentionDays?: (Scalars['Float'] | null),eventLogRetentionDays?: (Scalars['Float'] | null),fastModel?: (Scalars['String'] | null),smartModel?: (Scalars['String'] | null),aiAdditionalInstructions?: (Scalars['String'] | null),editableProfileFields?: (Scalars['String'][] | null),enabledAiModelIds?: (Scalars['String'][] | null),useRecommendedModels?: (Scalars['Boolean'] | null)}

export interface SetupOIDCSsoInput {name: Scalars['String'],issuer: Scalars['String'],clientID: Scalars['String'],clientSecret: Scalars['String']}

export interface SetupSAMLSsoInput {name: Scalars['String'],issuer: Scalars['String'],id: Scalars['UUID'],ssoURL: Scalars['String'],certificate: Scalars['String'],fingerprint?: (Scalars['String'] | null)}

export interface DeleteSsoInput {identityProviderId: Scalars['UUID']}

export interface EditSsoInput {id: Scalars['UUID'],status: SSOIdentityProviderStatus}

export interface SendEmailInput {connectedAccountId: Scalars['String'],to: Scalars['String'],cc?: (Scalars['String'] | null),bcc?: (Scalars['String'] | null),subject: Scalars['String'],body: Scalars['String'],inReplyTo?: (Scalars['String'] | null)}

export interface EmailAccountConnectionParameters {IMAP?: (ConnectionParameters | null),SMTP?: (ConnectionParameters | null),CALDAV?: (ConnectionParameters | null)}

export interface ConnectionParameters {host: Scalars['String'],port: Scalars['Float'],username?: (Scalars['String'] | null),password: Scalars['String'],secure?: (Scalars['Boolean'] | null)}

export interface UpdateLabPublicFeatureFlagInput {publicFeatureFlag: Scalars['String'],value: Scalars['Boolean']}

export interface CreateOneAppTokenInput {
/** The record to create */
appToken: CreateAppTokenInput}

export interface CreateAppTokenInput {expiresAt: Scalars['DateTime']}

export interface WorkspaceMigrationInput {actions: WorkspaceMigrationDeleteActionInput[]}

export interface WorkspaceMigrationDeleteActionInput {type: WorkspaceMigrationActionType,metadataName: AllMetadataName,universalIdentifier: Scalars['String']}

export interface SubscriptionGenqlSelection{
    onEventSubscription?: (EventSubscriptionGenqlSelection & { __args: {eventStreamId: Scalars['String']} })
    logicFunctionLogs?: (LogicFunctionLogsGenqlSelection & { __args: {input: LogicFunctionLogsInput} })
    onAgentChatEvent?: (AgentChatEventGenqlSelection & { __args: {threadId: Scalars['UUID']} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LogicFunctionLogsInput {applicationId?: (Scalars['UUID'] | null),applicationUniversalIdentifier?: (Scalars['UUID'] | null),name?: (Scalars['String'] | null),id?: (Scalars['UUID'] | null),universalIdentifier?: (Scalars['UUID'] | null)}


    const BillingProductDTO_possibleTypes: string[] = ['BillingLicensedProduct','BillingMeteredProduct']
    export const isBillingProductDTO = (obj?: { __typename?: any } | null): obj is BillingProductDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingProductDTO"')
      return BillingProductDTO_possibleTypes.includes(obj.__typename)
    }
    


    const ApiKey_possibleTypes: string[] = ['ApiKey']
    export const isApiKey = (obj?: { __typename?: any } | null): obj is ApiKey => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApiKey"')
      return ApiKey_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationRegistrationVariable_possibleTypes: string[] = ['ApplicationRegistrationVariable']
    export const isApplicationRegistrationVariable = (obj?: { __typename?: any } | null): obj is ApplicationRegistrationVariable => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationRegistrationVariable"')
      return ApplicationRegistrationVariable_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationRegistration_possibleTypes: string[] = ['ApplicationRegistration']
    export const isApplicationRegistration = (obj?: { __typename?: any } | null): obj is ApplicationRegistration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationRegistration"')
      return ApplicationRegistration_possibleTypes.includes(obj.__typename)
    }
    


    const TwoFactorAuthenticationMethodSummary_possibleTypes: string[] = ['TwoFactorAuthenticationMethodSummary']
    export const isTwoFactorAuthenticationMethodSummary = (obj?: { __typename?: any } | null): obj is TwoFactorAuthenticationMethodSummary => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTwoFactorAuthenticationMethodSummary"')
      return TwoFactorAuthenticationMethodSummary_possibleTypes.includes(obj.__typename)
    }
    


    const RowLevelPermissionPredicateGroup_possibleTypes: string[] = ['RowLevelPermissionPredicateGroup']
    export const isRowLevelPermissionPredicateGroup = (obj?: { __typename?: any } | null): obj is RowLevelPermissionPredicateGroup => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRowLevelPermissionPredicateGroup"')
      return RowLevelPermissionPredicateGroup_possibleTypes.includes(obj.__typename)
    }
    


    const RowLevelPermissionPredicate_possibleTypes: string[] = ['RowLevelPermissionPredicate']
    export const isRowLevelPermissionPredicate = (obj?: { __typename?: any } | null): obj is RowLevelPermissionPredicate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRowLevelPermissionPredicate"')
      return RowLevelPermissionPredicate_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectPermission_possibleTypes: string[] = ['ObjectPermission']
    export const isObjectPermission = (obj?: { __typename?: any } | null): obj is ObjectPermission => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectPermission"')
      return ObjectPermission_possibleTypes.includes(obj.__typename)
    }
    


    const UserWorkspace_possibleTypes: string[] = ['UserWorkspace']
    export const isUserWorkspace = (obj?: { __typename?: any } | null): obj is UserWorkspace => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUserWorkspace"')
      return UserWorkspace_possibleTypes.includes(obj.__typename)
    }
    


    const FullName_possibleTypes: string[] = ['FullName']
    export const isFullName = (obj?: { __typename?: any } | null): obj is FullName => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFullName"')
      return FullName_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceMember_possibleTypes: string[] = ['WorkspaceMember']
    export const isWorkspaceMember = (obj?: { __typename?: any } | null): obj is WorkspaceMember => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceMember"')
      return WorkspaceMember_possibleTypes.includes(obj.__typename)
    }
    


    const Agent_possibleTypes: string[] = ['Agent']
    export const isAgent = (obj?: { __typename?: any } | null): obj is Agent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgent"')
      return Agent_possibleTypes.includes(obj.__typename)
    }
    


    const FieldPermission_possibleTypes: string[] = ['FieldPermission']
    export const isFieldPermission = (obj?: { __typename?: any } | null): obj is FieldPermission => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFieldPermission"')
      return FieldPermission_possibleTypes.includes(obj.__typename)
    }
    


    const PermissionFlag_possibleTypes: string[] = ['PermissionFlag']
    export const isPermissionFlag = (obj?: { __typename?: any } | null): obj is PermissionFlag => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPermissionFlag"')
      return PermissionFlag_possibleTypes.includes(obj.__typename)
    }
    


    const ApiKeyForRole_possibleTypes: string[] = ['ApiKeyForRole']
    export const isApiKeyForRole = (obj?: { __typename?: any } | null): obj is ApiKeyForRole => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApiKeyForRole"')
      return ApiKeyForRole_possibleTypes.includes(obj.__typename)
    }
    


    const Role_possibleTypes: string[] = ['Role']
    export const isRole = (obj?: { __typename?: any } | null): obj is Role => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRole"')
      return Role_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationRegistrationSummary_possibleTypes: string[] = ['ApplicationRegistrationSummary']
    export const isApplicationRegistrationSummary = (obj?: { __typename?: any } | null): obj is ApplicationRegistrationSummary => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationRegistrationSummary"')
      return ApplicationRegistrationSummary_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationVariable_possibleTypes: string[] = ['ApplicationVariable']
    export const isApplicationVariable = (obj?: { __typename?: any } | null): obj is ApplicationVariable => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationVariable"')
      return ApplicationVariable_possibleTypes.includes(obj.__typename)
    }
    


    const LogicFunction_possibleTypes: string[] = ['LogicFunction']
    export const isLogicFunction = (obj?: { __typename?: any } | null): obj is LogicFunction => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLogicFunction"')
      return LogicFunction_possibleTypes.includes(obj.__typename)
    }
    


    const StandardOverrides_possibleTypes: string[] = ['StandardOverrides']
    export const isStandardOverrides = (obj?: { __typename?: any } | null): obj is StandardOverrides => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isStandardOverrides"')
      return StandardOverrides_possibleTypes.includes(obj.__typename)
    }
    


    const Field_possibleTypes: string[] = ['Field']
    export const isField = (obj?: { __typename?: any } | null): obj is Field => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isField"')
      return Field_possibleTypes.includes(obj.__typename)
    }
    


    const IndexField_possibleTypes: string[] = ['IndexField']
    export const isIndexField = (obj?: { __typename?: any } | null): obj is IndexField => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isIndexField"')
      return IndexField_possibleTypes.includes(obj.__typename)
    }
    


    const Index_possibleTypes: string[] = ['Index']
    export const isIndex = (obj?: { __typename?: any } | null): obj is Index => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isIndex"')
      return Index_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectStandardOverrides_possibleTypes: string[] = ['ObjectStandardOverrides']
    export const isObjectStandardOverrides = (obj?: { __typename?: any } | null): obj is ObjectStandardOverrides => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectStandardOverrides"')
      return ObjectStandardOverrides_possibleTypes.includes(obj.__typename)
    }
    


    const Object_possibleTypes: string[] = ['Object']
    export const isObject = (obj?: { __typename?: any } | null): obj is Object => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObject"')
      return Object_possibleTypes.includes(obj.__typename)
    }
    


    const Application_possibleTypes: string[] = ['Application']
    export const isApplication = (obj?: { __typename?: any } | null): obj is Application => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplication"')
      return Application_possibleTypes.includes(obj.__typename)
    }
    


    const ViewField_possibleTypes: string[] = ['ViewField']
    export const isViewField = (obj?: { __typename?: any } | null): obj is ViewField => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewField"')
      return ViewField_possibleTypes.includes(obj.__typename)
    }
    


    const ViewFilterGroup_possibleTypes: string[] = ['ViewFilterGroup']
    export const isViewFilterGroup = (obj?: { __typename?: any } | null): obj is ViewFilterGroup => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewFilterGroup"')
      return ViewFilterGroup_possibleTypes.includes(obj.__typename)
    }
    


    const ViewFilter_possibleTypes: string[] = ['ViewFilter']
    export const isViewFilter = (obj?: { __typename?: any } | null): obj is ViewFilter => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewFilter"')
      return ViewFilter_possibleTypes.includes(obj.__typename)
    }
    


    const ViewGroup_possibleTypes: string[] = ['ViewGroup']
    export const isViewGroup = (obj?: { __typename?: any } | null): obj is ViewGroup => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewGroup"')
      return ViewGroup_possibleTypes.includes(obj.__typename)
    }
    


    const ViewSort_possibleTypes: string[] = ['ViewSort']
    export const isViewSort = (obj?: { __typename?: any } | null): obj is ViewSort => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewSort"')
      return ViewSort_possibleTypes.includes(obj.__typename)
    }
    


    const ViewFieldGroup_possibleTypes: string[] = ['ViewFieldGroup']
    export const isViewFieldGroup = (obj?: { __typename?: any } | null): obj is ViewFieldGroup => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewFieldGroup"')
      return ViewFieldGroup_possibleTypes.includes(obj.__typename)
    }
    


    const View_possibleTypes: string[] = ['View']
    export const isView = (obj?: { __typename?: any } | null): obj is View => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isView"')
      return View_possibleTypes.includes(obj.__typename)
    }
    


    const Workspace_possibleTypes: string[] = ['Workspace']
    export const isWorkspace = (obj?: { __typename?: any } | null): obj is Workspace => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspace"')
      return Workspace_possibleTypes.includes(obj.__typename)
    }
    


    const AppToken_possibleTypes: string[] = ['AppToken']
    export const isAppToken = (obj?: { __typename?: any } | null): obj is AppToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAppToken"')
      return AppToken_possibleTypes.includes(obj.__typename)
    }
    


    const User_possibleTypes: string[] = ['User']
    export const isUser = (obj?: { __typename?: any } | null): obj is User => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUser"')
      return User_possibleTypes.includes(obj.__typename)
    }
    


    const RatioAggregateConfig_possibleTypes: string[] = ['RatioAggregateConfig']
    export const isRatioAggregateConfig = (obj?: { __typename?: any } | null): obj is RatioAggregateConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRatioAggregateConfig"')
      return RatioAggregateConfig_possibleTypes.includes(obj.__typename)
    }
    


    const RichTextBody_possibleTypes: string[] = ['RichTextBody']
    export const isRichTextBody = (obj?: { __typename?: any } | null): obj is RichTextBody => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRichTextBody"')
      return RichTextBody_possibleTypes.includes(obj.__typename)
    }
    


    const GridPosition_possibleTypes: string[] = ['GridPosition']
    export const isGridPosition = (obj?: { __typename?: any } | null): obj is GridPosition => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isGridPosition"')
      return GridPosition_possibleTypes.includes(obj.__typename)
    }
    


    const PageLayoutWidget_possibleTypes: string[] = ['PageLayoutWidget']
    export const isPageLayoutWidget = (obj?: { __typename?: any } | null): obj is PageLayoutWidget => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageLayoutWidget"')
      return PageLayoutWidget_possibleTypes.includes(obj.__typename)
    }
    


    const PageLayoutWidgetPosition_possibleTypes: string[] = ['PageLayoutWidgetGridPosition','PageLayoutWidgetVerticalListPosition','PageLayoutWidgetCanvasPosition']
    export const isPageLayoutWidgetPosition = (obj?: { __typename?: any } | null): obj is PageLayoutWidgetPosition => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageLayoutWidgetPosition"')
      return PageLayoutWidgetPosition_possibleTypes.includes(obj.__typename)
    }
    


    const PageLayoutWidgetGridPosition_possibleTypes: string[] = ['PageLayoutWidgetGridPosition']
    export const isPageLayoutWidgetGridPosition = (obj?: { __typename?: any } | null): obj is PageLayoutWidgetGridPosition => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageLayoutWidgetGridPosition"')
      return PageLayoutWidgetGridPosition_possibleTypes.includes(obj.__typename)
    }
    


    const PageLayoutWidgetVerticalListPosition_possibleTypes: string[] = ['PageLayoutWidgetVerticalListPosition']
    export const isPageLayoutWidgetVerticalListPosition = (obj?: { __typename?: any } | null): obj is PageLayoutWidgetVerticalListPosition => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageLayoutWidgetVerticalListPosition"')
      return PageLayoutWidgetVerticalListPosition_possibleTypes.includes(obj.__typename)
    }
    


    const PageLayoutWidgetCanvasPosition_possibleTypes: string[] = ['PageLayoutWidgetCanvasPosition']
    export const isPageLayoutWidgetCanvasPosition = (obj?: { __typename?: any } | null): obj is PageLayoutWidgetCanvasPosition => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageLayoutWidgetCanvasPosition"')
      return PageLayoutWidgetCanvasPosition_possibleTypes.includes(obj.__typename)
    }
    


    const WidgetConfiguration_possibleTypes: string[] = ['AggregateChartConfiguration','StandaloneRichTextConfiguration','PieChartConfiguration','LineChartConfiguration','IframeConfiguration','GaugeChartConfiguration','BarChartConfiguration','CalendarConfiguration','FrontComponentConfiguration','EmailsConfiguration','EmailThreadConfiguration','FieldConfiguration','FieldRichTextConfiguration','FieldsConfiguration','FilesConfiguration','NotesConfiguration','TasksConfiguration','TimelineConfiguration','ViewConfiguration','RecordTableConfiguration','WorkflowConfiguration','WorkflowRunConfiguration','WorkflowVersionConfiguration']
    export const isWidgetConfiguration = (obj?: { __typename?: any } | null): obj is WidgetConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWidgetConfiguration"')
      return WidgetConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const AggregateChartConfiguration_possibleTypes: string[] = ['AggregateChartConfiguration']
    export const isAggregateChartConfiguration = (obj?: { __typename?: any } | null): obj is AggregateChartConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAggregateChartConfiguration"')
      return AggregateChartConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const StandaloneRichTextConfiguration_possibleTypes: string[] = ['StandaloneRichTextConfiguration']
    export const isStandaloneRichTextConfiguration = (obj?: { __typename?: any } | null): obj is StandaloneRichTextConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isStandaloneRichTextConfiguration"')
      return StandaloneRichTextConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const PieChartConfiguration_possibleTypes: string[] = ['PieChartConfiguration']
    export const isPieChartConfiguration = (obj?: { __typename?: any } | null): obj is PieChartConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPieChartConfiguration"')
      return PieChartConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const LineChartConfiguration_possibleTypes: string[] = ['LineChartConfiguration']
    export const isLineChartConfiguration = (obj?: { __typename?: any } | null): obj is LineChartConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLineChartConfiguration"')
      return LineChartConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const IframeConfiguration_possibleTypes: string[] = ['IframeConfiguration']
    export const isIframeConfiguration = (obj?: { __typename?: any } | null): obj is IframeConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isIframeConfiguration"')
      return IframeConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const GaugeChartConfiguration_possibleTypes: string[] = ['GaugeChartConfiguration']
    export const isGaugeChartConfiguration = (obj?: { __typename?: any } | null): obj is GaugeChartConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isGaugeChartConfiguration"')
      return GaugeChartConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const BarChartConfiguration_possibleTypes: string[] = ['BarChartConfiguration']
    export const isBarChartConfiguration = (obj?: { __typename?: any } | null): obj is BarChartConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBarChartConfiguration"')
      return BarChartConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const CalendarConfiguration_possibleTypes: string[] = ['CalendarConfiguration']
    export const isCalendarConfiguration = (obj?: { __typename?: any } | null): obj is CalendarConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCalendarConfiguration"')
      return CalendarConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const FrontComponentConfiguration_possibleTypes: string[] = ['FrontComponentConfiguration']
    export const isFrontComponentConfiguration = (obj?: { __typename?: any } | null): obj is FrontComponentConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFrontComponentConfiguration"')
      return FrontComponentConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const EmailsConfiguration_possibleTypes: string[] = ['EmailsConfiguration']
    export const isEmailsConfiguration = (obj?: { __typename?: any } | null): obj is EmailsConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEmailsConfiguration"')
      return EmailsConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const EmailThreadConfiguration_possibleTypes: string[] = ['EmailThreadConfiguration']
    export const isEmailThreadConfiguration = (obj?: { __typename?: any } | null): obj is EmailThreadConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEmailThreadConfiguration"')
      return EmailThreadConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const FieldConfiguration_possibleTypes: string[] = ['FieldConfiguration']
    export const isFieldConfiguration = (obj?: { __typename?: any } | null): obj is FieldConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFieldConfiguration"')
      return FieldConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const FieldRichTextConfiguration_possibleTypes: string[] = ['FieldRichTextConfiguration']
    export const isFieldRichTextConfiguration = (obj?: { __typename?: any } | null): obj is FieldRichTextConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFieldRichTextConfiguration"')
      return FieldRichTextConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const FieldsConfiguration_possibleTypes: string[] = ['FieldsConfiguration']
    export const isFieldsConfiguration = (obj?: { __typename?: any } | null): obj is FieldsConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFieldsConfiguration"')
      return FieldsConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const FilesConfiguration_possibleTypes: string[] = ['FilesConfiguration']
    export const isFilesConfiguration = (obj?: { __typename?: any } | null): obj is FilesConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFilesConfiguration"')
      return FilesConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const NotesConfiguration_possibleTypes: string[] = ['NotesConfiguration']
    export const isNotesConfiguration = (obj?: { __typename?: any } | null): obj is NotesConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNotesConfiguration"')
      return NotesConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const TasksConfiguration_possibleTypes: string[] = ['TasksConfiguration']
    export const isTasksConfiguration = (obj?: { __typename?: any } | null): obj is TasksConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTasksConfiguration"')
      return TasksConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const TimelineConfiguration_possibleTypes: string[] = ['TimelineConfiguration']
    export const isTimelineConfiguration = (obj?: { __typename?: any } | null): obj is TimelineConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTimelineConfiguration"')
      return TimelineConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const ViewConfiguration_possibleTypes: string[] = ['ViewConfiguration']
    export const isViewConfiguration = (obj?: { __typename?: any } | null): obj is ViewConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewConfiguration"')
      return ViewConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const RecordTableConfiguration_possibleTypes: string[] = ['RecordTableConfiguration']
    export const isRecordTableConfiguration = (obj?: { __typename?: any } | null): obj is RecordTableConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRecordTableConfiguration"')
      return RecordTableConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowConfiguration_possibleTypes: string[] = ['WorkflowConfiguration']
    export const isWorkflowConfiguration = (obj?: { __typename?: any } | null): obj is WorkflowConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowConfiguration"')
      return WorkflowConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowRunConfiguration_possibleTypes: string[] = ['WorkflowRunConfiguration']
    export const isWorkflowRunConfiguration = (obj?: { __typename?: any } | null): obj is WorkflowRunConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowRunConfiguration"')
      return WorkflowRunConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowVersionConfiguration_possibleTypes: string[] = ['WorkflowVersionConfiguration']
    export const isWorkflowVersionConfiguration = (obj?: { __typename?: any } | null): obj is WorkflowVersionConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowVersionConfiguration"')
      return WorkflowVersionConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const PageLayoutTab_possibleTypes: string[] = ['PageLayoutTab']
    export const isPageLayoutTab = (obj?: { __typename?: any } | null): obj is PageLayoutTab => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageLayoutTab"')
      return PageLayoutTab_possibleTypes.includes(obj.__typename)
    }
    


    const PageLayout_possibleTypes: string[] = ['PageLayout']
    export const isPageLayout = (obj?: { __typename?: any } | null): obj is PageLayout => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageLayout"')
      return PageLayout_possibleTypes.includes(obj.__typename)
    }
    


    const Analytics_possibleTypes: string[] = ['Analytics']
    export const isAnalytics = (obj?: { __typename?: any } | null): obj is Analytics => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAnalytics"')
      return Analytics_possibleTypes.includes(obj.__typename)
    }
    


    const BillingSubscriptionSchedulePhaseItem_possibleTypes: string[] = ['BillingSubscriptionSchedulePhaseItem']
    export const isBillingSubscriptionSchedulePhaseItem = (obj?: { __typename?: any } | null): obj is BillingSubscriptionSchedulePhaseItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingSubscriptionSchedulePhaseItem"')
      return BillingSubscriptionSchedulePhaseItem_possibleTypes.includes(obj.__typename)
    }
    


    const BillingSubscriptionSchedulePhase_possibleTypes: string[] = ['BillingSubscriptionSchedulePhase']
    export const isBillingSubscriptionSchedulePhase = (obj?: { __typename?: any } | null): obj is BillingSubscriptionSchedulePhase => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingSubscriptionSchedulePhase"')
      return BillingSubscriptionSchedulePhase_possibleTypes.includes(obj.__typename)
    }
    


    const BillingProductMetadata_possibleTypes: string[] = ['BillingProductMetadata']
    export const isBillingProductMetadata = (obj?: { __typename?: any } | null): obj is BillingProductMetadata => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingProductMetadata"')
      return BillingProductMetadata_possibleTypes.includes(obj.__typename)
    }
    


    const BillingPriceLicensed_possibleTypes: string[] = ['BillingPriceLicensed']
    export const isBillingPriceLicensed = (obj?: { __typename?: any } | null): obj is BillingPriceLicensed => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingPriceLicensed"')
      return BillingPriceLicensed_possibleTypes.includes(obj.__typename)
    }
    


    const BillingPriceTier_possibleTypes: string[] = ['BillingPriceTier']
    export const isBillingPriceTier = (obj?: { __typename?: any } | null): obj is BillingPriceTier => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingPriceTier"')
      return BillingPriceTier_possibleTypes.includes(obj.__typename)
    }
    


    const BillingPriceMetered_possibleTypes: string[] = ['BillingPriceMetered']
    export const isBillingPriceMetered = (obj?: { __typename?: any } | null): obj is BillingPriceMetered => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingPriceMetered"')
      return BillingPriceMetered_possibleTypes.includes(obj.__typename)
    }
    


    const BillingProduct_possibleTypes: string[] = ['BillingProduct']
    export const isBillingProduct = (obj?: { __typename?: any } | null): obj is BillingProduct => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingProduct"')
      return BillingProduct_possibleTypes.includes(obj.__typename)
    }
    


    const BillingLicensedProduct_possibleTypes: string[] = ['BillingLicensedProduct']
    export const isBillingLicensedProduct = (obj?: { __typename?: any } | null): obj is BillingLicensedProduct => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingLicensedProduct"')
      return BillingLicensedProduct_possibleTypes.includes(obj.__typename)
    }
    


    const BillingMeteredProduct_possibleTypes: string[] = ['BillingMeteredProduct']
    export const isBillingMeteredProduct = (obj?: { __typename?: any } | null): obj is BillingMeteredProduct => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingMeteredProduct"')
      return BillingMeteredProduct_possibleTypes.includes(obj.__typename)
    }
    


    const BillingSubscriptionItem_possibleTypes: string[] = ['BillingSubscriptionItem']
    export const isBillingSubscriptionItem = (obj?: { __typename?: any } | null): obj is BillingSubscriptionItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingSubscriptionItem"')
      return BillingSubscriptionItem_possibleTypes.includes(obj.__typename)
    }
    


    const BillingSubscription_possibleTypes: string[] = ['BillingSubscription']
    export const isBillingSubscription = (obj?: { __typename?: any } | null): obj is BillingSubscription => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingSubscription"')
      return BillingSubscription_possibleTypes.includes(obj.__typename)
    }
    


    const BillingEndTrialPeriod_possibleTypes: string[] = ['BillingEndTrialPeriod']
    export const isBillingEndTrialPeriod = (obj?: { __typename?: any } | null): obj is BillingEndTrialPeriod => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingEndTrialPeriod"')
      return BillingEndTrialPeriod_possibleTypes.includes(obj.__typename)
    }
    


    const BillingMeteredProductUsage_possibleTypes: string[] = ['BillingMeteredProductUsage']
    export const isBillingMeteredProductUsage = (obj?: { __typename?: any } | null): obj is BillingMeteredProductUsage => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingMeteredProductUsage"')
      return BillingMeteredProductUsage_possibleTypes.includes(obj.__typename)
    }
    


    const BillingPlan_possibleTypes: string[] = ['BillingPlan']
    export const isBillingPlan = (obj?: { __typename?: any } | null): obj is BillingPlan => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingPlan"')
      return BillingPlan_possibleTypes.includes(obj.__typename)
    }
    


    const BillingSession_possibleTypes: string[] = ['BillingSession']
    export const isBillingSession = (obj?: { __typename?: any } | null): obj is BillingSession => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingSession"')
      return BillingSession_possibleTypes.includes(obj.__typename)
    }
    


    const BillingUpdate_possibleTypes: string[] = ['BillingUpdate']
    export const isBillingUpdate = (obj?: { __typename?: any } | null): obj is BillingUpdate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingUpdate"')
      return BillingUpdate_possibleTypes.includes(obj.__typename)
    }
    


    const EnterpriseLicenseInfoDTO_possibleTypes: string[] = ['EnterpriseLicenseInfoDTO']
    export const isEnterpriseLicenseInfoDTO = (obj?: { __typename?: any } | null): obj is EnterpriseLicenseInfoDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEnterpriseLicenseInfoDTO"')
      return EnterpriseLicenseInfoDTO_possibleTypes.includes(obj.__typename)
    }
    


    const EnterpriseSubscriptionStatusDTO_possibleTypes: string[] = ['EnterpriseSubscriptionStatusDTO']
    export const isEnterpriseSubscriptionStatusDTO = (obj?: { __typename?: any } | null): obj is EnterpriseSubscriptionStatusDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEnterpriseSubscriptionStatusDTO"')
      return EnterpriseSubscriptionStatusDTO_possibleTypes.includes(obj.__typename)
    }
    


    const OnboardingStepSuccess_possibleTypes: string[] = ['OnboardingStepSuccess']
    export const isOnboardingStepSuccess = (obj?: { __typename?: any } | null): obj is OnboardingStepSuccess => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOnboardingStepSuccess"')
      return OnboardingStepSuccess_possibleTypes.includes(obj.__typename)
    }
    


    const ApprovedAccessDomain_possibleTypes: string[] = ['ApprovedAccessDomain']
    export const isApprovedAccessDomain = (obj?: { __typename?: any } | null): obj is ApprovedAccessDomain => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApprovedAccessDomain"')
      return ApprovedAccessDomain_possibleTypes.includes(obj.__typename)
    }
    


    const FileWithSignedUrl_possibleTypes: string[] = ['FileWithSignedUrl']
    export const isFileWithSignedUrl = (obj?: { __typename?: any } | null): obj is FileWithSignedUrl => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFileWithSignedUrl"')
      return FileWithSignedUrl_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceInvitation_possibleTypes: string[] = ['WorkspaceInvitation']
    export const isWorkspaceInvitation = (obj?: { __typename?: any } | null): obj is WorkspaceInvitation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceInvitation"')
      return WorkspaceInvitation_possibleTypes.includes(obj.__typename)
    }
    


    const SendInvitations_possibleTypes: string[] = ['SendInvitations']
    export const isSendInvitations = (obj?: { __typename?: any } | null): obj is SendInvitations => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSendInvitations"')
      return SendInvitations_possibleTypes.includes(obj.__typename)
    }
    


    const RecordIdentifier_possibleTypes: string[] = ['RecordIdentifier']
    export const isRecordIdentifier = (obj?: { __typename?: any } | null): obj is RecordIdentifier => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRecordIdentifier"')
      return RecordIdentifier_possibleTypes.includes(obj.__typename)
    }
    


    const NavigationMenuItem_possibleTypes: string[] = ['NavigationMenuItem']
    export const isNavigationMenuItem = (obj?: { __typename?: any } | null): obj is NavigationMenuItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNavigationMenuItem"')
      return NavigationMenuItem_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectRecordEventProperties_possibleTypes: string[] = ['ObjectRecordEventProperties']
    export const isObjectRecordEventProperties = (obj?: { __typename?: any } | null): obj is ObjectRecordEventProperties => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectRecordEventProperties"')
      return ObjectRecordEventProperties_possibleTypes.includes(obj.__typename)
    }
    


    const MetadataEvent_possibleTypes: string[] = ['MetadataEvent']
    export const isMetadataEvent = (obj?: { __typename?: any } | null): obj is MetadataEvent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMetadataEvent"')
      return MetadataEvent_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectRecordEvent_possibleTypes: string[] = ['ObjectRecordEvent']
    export const isObjectRecordEvent = (obj?: { __typename?: any } | null): obj is ObjectRecordEvent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectRecordEvent"')
      return ObjectRecordEvent_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectRecordEventWithQueryIds_possibleTypes: string[] = ['ObjectRecordEventWithQueryIds']
    export const isObjectRecordEventWithQueryIds = (obj?: { __typename?: any } | null): obj is ObjectRecordEventWithQueryIds => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectRecordEventWithQueryIds"')
      return ObjectRecordEventWithQueryIds_possibleTypes.includes(obj.__typename)
    }
    


    const EventSubscription_possibleTypes: string[] = ['EventSubscription']
    export const isEventSubscription = (obj?: { __typename?: any } | null): obj is EventSubscription => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEventSubscription"')
      return EventSubscription_possibleTypes.includes(obj.__typename)
    }
    


    const LogicFunctionExecutionResult_possibleTypes: string[] = ['LogicFunctionExecutionResult']
    export const isLogicFunctionExecutionResult = (obj?: { __typename?: any } | null): obj is LogicFunctionExecutionResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLogicFunctionExecutionResult"')
      return LogicFunctionExecutionResult_possibleTypes.includes(obj.__typename)
    }
    


    const BillingTrialPeriod_possibleTypes: string[] = ['BillingTrialPeriod']
    export const isBillingTrialPeriod = (obj?: { __typename?: any } | null): obj is BillingTrialPeriod => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingTrialPeriod"')
      return BillingTrialPeriod_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceUrls_possibleTypes: string[] = ['WorkspaceUrls']
    export const isWorkspaceUrls = (obj?: { __typename?: any } | null): obj is WorkspaceUrls => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceUrls"')
      return WorkspaceUrls_possibleTypes.includes(obj.__typename)
    }
    


    const SSOIdentityProvider_possibleTypes: string[] = ['SSOIdentityProvider']
    export const isSSOIdentityProvider = (obj?: { __typename?: any } | null): obj is SSOIdentityProvider => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSSOIdentityProvider"')
      return SSOIdentityProvider_possibleTypes.includes(obj.__typename)
    }
    


    const AuthProviders_possibleTypes: string[] = ['AuthProviders']
    export const isAuthProviders = (obj?: { __typename?: any } | null): obj is AuthProviders => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAuthProviders"')
      return AuthProviders_possibleTypes.includes(obj.__typename)
    }
    


    const AuthBypassProviders_possibleTypes: string[] = ['AuthBypassProviders']
    export const isAuthBypassProviders = (obj?: { __typename?: any } | null): obj is AuthBypassProviders => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAuthBypassProviders"')
      return AuthBypassProviders_possibleTypes.includes(obj.__typename)
    }
    


    const PublicWorkspaceData_possibleTypes: string[] = ['PublicWorkspaceData']
    export const isPublicWorkspaceData = (obj?: { __typename?: any } | null): obj is PublicWorkspaceData => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicWorkspaceData"')
      return PublicWorkspaceData_possibleTypes.includes(obj.__typename)
    }
    


    const NativeModelCapabilities_possibleTypes: string[] = ['NativeModelCapabilities']
    export const isNativeModelCapabilities = (obj?: { __typename?: any } | null): obj is NativeModelCapabilities => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNativeModelCapabilities"')
      return NativeModelCapabilities_possibleTypes.includes(obj.__typename)
    }
    


    const ClientAIModelConfig_possibleTypes: string[] = ['ClientAIModelConfig']
    export const isClientAIModelConfig = (obj?: { __typename?: any } | null): obj is ClientAIModelConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isClientAIModelConfig"')
      return ClientAIModelConfig_possibleTypes.includes(obj.__typename)
    }
    


    const AdminAIModelConfig_possibleTypes: string[] = ['AdminAIModelConfig']
    export const isAdminAIModelConfig = (obj?: { __typename?: any } | null): obj is AdminAIModelConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAdminAIModelConfig"')
      return AdminAIModelConfig_possibleTypes.includes(obj.__typename)
    }
    


    const AdminAIModels_possibleTypes: string[] = ['AdminAIModels']
    export const isAdminAIModels = (obj?: { __typename?: any } | null): obj is AdminAIModels => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAdminAIModels"')
      return AdminAIModels_possibleTypes.includes(obj.__typename)
    }
    


    const Billing_possibleTypes: string[] = ['Billing']
    export const isBilling = (obj?: { __typename?: any } | null): obj is Billing => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBilling"')
      return Billing_possibleTypes.includes(obj.__typename)
    }
    


    const Support_possibleTypes: string[] = ['Support']
    export const isSupport = (obj?: { __typename?: any } | null): obj is Support => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSupport"')
      return Support_possibleTypes.includes(obj.__typename)
    }
    


    const Sentry_possibleTypes: string[] = ['Sentry']
    export const isSentry = (obj?: { __typename?: any } | null): obj is Sentry => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSentry"')
      return Sentry_possibleTypes.includes(obj.__typename)
    }
    


    const Captcha_possibleTypes: string[] = ['Captcha']
    export const isCaptcha = (obj?: { __typename?: any } | null): obj is Captcha => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCaptcha"')
      return Captcha_possibleTypes.includes(obj.__typename)
    }
    


    const ApiConfig_possibleTypes: string[] = ['ApiConfig']
    export const isApiConfig = (obj?: { __typename?: any } | null): obj is ApiConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApiConfig"')
      return ApiConfig_possibleTypes.includes(obj.__typename)
    }
    


    const PublicFeatureFlagMetadata_possibleTypes: string[] = ['PublicFeatureFlagMetadata']
    export const isPublicFeatureFlagMetadata = (obj?: { __typename?: any } | null): obj is PublicFeatureFlagMetadata => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicFeatureFlagMetadata"')
      return PublicFeatureFlagMetadata_possibleTypes.includes(obj.__typename)
    }
    


    const PublicFeatureFlag_possibleTypes: string[] = ['PublicFeatureFlag']
    export const isPublicFeatureFlag = (obj?: { __typename?: any } | null): obj is PublicFeatureFlag => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicFeatureFlag"')
      return PublicFeatureFlag_possibleTypes.includes(obj.__typename)
    }
    


    const ClientConfigMaintenanceMode_possibleTypes: string[] = ['ClientConfigMaintenanceMode']
    export const isClientConfigMaintenanceMode = (obj?: { __typename?: any } | null): obj is ClientConfigMaintenanceMode => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isClientConfigMaintenanceMode"')
      return ClientConfigMaintenanceMode_possibleTypes.includes(obj.__typename)
    }
    


    const ClientConfig_possibleTypes: string[] = ['ClientConfig']
    export const isClientConfig = (obj?: { __typename?: any } | null): obj is ClientConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isClientConfig"')
      return ClientConfig_possibleTypes.includes(obj.__typename)
    }
    


    const UsageBreakdownItem_possibleTypes: string[] = ['UsageBreakdownItem']
    export const isUsageBreakdownItem = (obj?: { __typename?: any } | null): obj is UsageBreakdownItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUsageBreakdownItem"')
      return UsageBreakdownItem_possibleTypes.includes(obj.__typename)
    }
    


    const ConfigVariable_possibleTypes: string[] = ['ConfigVariable']
    export const isConfigVariable = (obj?: { __typename?: any } | null): obj is ConfigVariable => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConfigVariable"')
      return ConfigVariable_possibleTypes.includes(obj.__typename)
    }
    


    const ConfigVariablesGroupData_possibleTypes: string[] = ['ConfigVariablesGroupData']
    export const isConfigVariablesGroupData = (obj?: { __typename?: any } | null): obj is ConfigVariablesGroupData => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConfigVariablesGroupData"')
      return ConfigVariablesGroupData_possibleTypes.includes(obj.__typename)
    }
    


    const ConfigVariables_possibleTypes: string[] = ['ConfigVariables']
    export const isConfigVariables = (obj?: { __typename?: any } | null): obj is ConfigVariables => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConfigVariables"')
      return ConfigVariables_possibleTypes.includes(obj.__typename)
    }
    


    const JobOperationResult_possibleTypes: string[] = ['JobOperationResult']
    export const isJobOperationResult = (obj?: { __typename?: any } | null): obj is JobOperationResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isJobOperationResult"')
      return JobOperationResult_possibleTypes.includes(obj.__typename)
    }
    


    const DeleteJobsResponse_possibleTypes: string[] = ['DeleteJobsResponse']
    export const isDeleteJobsResponse = (obj?: { __typename?: any } | null): obj is DeleteJobsResponse => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDeleteJobsResponse"')
      return DeleteJobsResponse_possibleTypes.includes(obj.__typename)
    }
    


    const QueueJob_possibleTypes: string[] = ['QueueJob']
    export const isQueueJob = (obj?: { __typename?: any } | null): obj is QueueJob => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueueJob"')
      return QueueJob_possibleTypes.includes(obj.__typename)
    }
    


    const QueueRetentionConfig_possibleTypes: string[] = ['QueueRetentionConfig']
    export const isQueueRetentionConfig = (obj?: { __typename?: any } | null): obj is QueueRetentionConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueueRetentionConfig"')
      return QueueRetentionConfig_possibleTypes.includes(obj.__typename)
    }
    


    const QueueJobsResponse_possibleTypes: string[] = ['QueueJobsResponse']
    export const isQueueJobsResponse = (obj?: { __typename?: any } | null): obj is QueueJobsResponse => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueueJobsResponse"')
      return QueueJobsResponse_possibleTypes.includes(obj.__typename)
    }
    


    const RetryJobsResponse_possibleTypes: string[] = ['RetryJobsResponse']
    export const isRetryJobsResponse = (obj?: { __typename?: any } | null): obj is RetryJobsResponse => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRetryJobsResponse"')
      return RetryJobsResponse_possibleTypes.includes(obj.__typename)
    }
    


    const SystemHealthService_possibleTypes: string[] = ['SystemHealthService']
    export const isSystemHealthService = (obj?: { __typename?: any } | null): obj is SystemHealthService => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSystemHealthService"')
      return SystemHealthService_possibleTypes.includes(obj.__typename)
    }
    


    const SystemHealth_possibleTypes: string[] = ['SystemHealth']
    export const isSystemHealth = (obj?: { __typename?: any } | null): obj is SystemHealth => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSystemHealth"')
      return SystemHealth_possibleTypes.includes(obj.__typename)
    }
    


    const FeatureFlag_possibleTypes: string[] = ['FeatureFlag']
    export const isFeatureFlag = (obj?: { __typename?: any } | null): obj is FeatureFlag => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFeatureFlag"')
      return FeatureFlag_possibleTypes.includes(obj.__typename)
    }
    


    const UserInfo_possibleTypes: string[] = ['UserInfo']
    export const isUserInfo = (obj?: { __typename?: any } | null): obj is UserInfo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUserInfo"')
      return UserInfo_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceInfo_possibleTypes: string[] = ['WorkspaceInfo']
    export const isWorkspaceInfo = (obj?: { __typename?: any } | null): obj is WorkspaceInfo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceInfo"')
      return WorkspaceInfo_possibleTypes.includes(obj.__typename)
    }
    


    const UserLookup_possibleTypes: string[] = ['UserLookup']
    export const isUserLookup = (obj?: { __typename?: any } | null): obj is UserLookup => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUserLookup"')
      return UserLookup_possibleTypes.includes(obj.__typename)
    }
    


    const VersionInfo_possibleTypes: string[] = ['VersionInfo']
    export const isVersionInfo = (obj?: { __typename?: any } | null): obj is VersionInfo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isVersionInfo"')
      return VersionInfo_possibleTypes.includes(obj.__typename)
    }
    


    const AdminPanelWorkerQueueHealth_possibleTypes: string[] = ['AdminPanelWorkerQueueHealth']
    export const isAdminPanelWorkerQueueHealth = (obj?: { __typename?: any } | null): obj is AdminPanelWorkerQueueHealth => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAdminPanelWorkerQueueHealth"')
      return AdminPanelWorkerQueueHealth_possibleTypes.includes(obj.__typename)
    }
    


    const AdminPanelHealthServiceData_possibleTypes: string[] = ['AdminPanelHealthServiceData']
    export const isAdminPanelHealthServiceData = (obj?: { __typename?: any } | null): obj is AdminPanelHealthServiceData => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAdminPanelHealthServiceData"')
      return AdminPanelHealthServiceData_possibleTypes.includes(obj.__typename)
    }
    


    const MaintenanceMode_possibleTypes: string[] = ['MaintenanceMode']
    export const isMaintenanceMode = (obj?: { __typename?: any } | null): obj is MaintenanceMode => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMaintenanceMode"')
      return MaintenanceMode_possibleTypes.includes(obj.__typename)
    }
    


    const ModelsDevModelSuggestion_possibleTypes: string[] = ['ModelsDevModelSuggestion']
    export const isModelsDevModelSuggestion = (obj?: { __typename?: any } | null): obj is ModelsDevModelSuggestion => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isModelsDevModelSuggestion"')
      return ModelsDevModelSuggestion_possibleTypes.includes(obj.__typename)
    }
    


    const ModelsDevProviderSuggestion_possibleTypes: string[] = ['ModelsDevProviderSuggestion']
    export const isModelsDevProviderSuggestion = (obj?: { __typename?: any } | null): obj is ModelsDevProviderSuggestion => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isModelsDevProviderSuggestion"')
      return ModelsDevProviderSuggestion_possibleTypes.includes(obj.__typename)
    }
    


    const QueueMetricsDataPoint_possibleTypes: string[] = ['QueueMetricsDataPoint']
    export const isQueueMetricsDataPoint = (obj?: { __typename?: any } | null): obj is QueueMetricsDataPoint => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueueMetricsDataPoint"')
      return QueueMetricsDataPoint_possibleTypes.includes(obj.__typename)
    }
    


    const QueueMetricsSeries_possibleTypes: string[] = ['QueueMetricsSeries']
    export const isQueueMetricsSeries = (obj?: { __typename?: any } | null): obj is QueueMetricsSeries => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueueMetricsSeries"')
      return QueueMetricsSeries_possibleTypes.includes(obj.__typename)
    }
    


    const WorkerQueueMetrics_possibleTypes: string[] = ['WorkerQueueMetrics']
    export const isWorkerQueueMetrics = (obj?: { __typename?: any } | null): obj is WorkerQueueMetrics => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkerQueueMetrics"')
      return WorkerQueueMetrics_possibleTypes.includes(obj.__typename)
    }
    


    const QueueMetricsData_possibleTypes: string[] = ['QueueMetricsData']
    export const isQueueMetricsData = (obj?: { __typename?: any } | null): obj is QueueMetricsData => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueueMetricsData"')
      return QueueMetricsData_possibleTypes.includes(obj.__typename)
    }
    


    const VersionDistributionEntry_possibleTypes: string[] = ['VersionDistributionEntry']
    export const isVersionDistributionEntry = (obj?: { __typename?: any } | null): obj is VersionDistributionEntry => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isVersionDistributionEntry"')
      return VersionDistributionEntry_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationRegistrationStats_possibleTypes: string[] = ['ApplicationRegistrationStats']
    export const isApplicationRegistrationStats = (obj?: { __typename?: any } | null): obj is ApplicationRegistrationStats => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationRegistrationStats"')
      return ApplicationRegistrationStats_possibleTypes.includes(obj.__typename)
    }
    


    const CreateApplicationRegistration_possibleTypes: string[] = ['CreateApplicationRegistration']
    export const isCreateApplicationRegistration = (obj?: { __typename?: any } | null): obj is CreateApplicationRegistration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCreateApplicationRegistration"')
      return CreateApplicationRegistration_possibleTypes.includes(obj.__typename)
    }
    


    const PublicApplicationRegistration_possibleTypes: string[] = ['PublicApplicationRegistration']
    export const isPublicApplicationRegistration = (obj?: { __typename?: any } | null): obj is PublicApplicationRegistration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicApplicationRegistration"')
      return PublicApplicationRegistration_possibleTypes.includes(obj.__typename)
    }
    


    const RotateClientSecret_possibleTypes: string[] = ['RotateClientSecret']
    export const isRotateClientSecret = (obj?: { __typename?: any } | null): obj is RotateClientSecret => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRotateClientSecret"')
      return RotateClientSecret_possibleTypes.includes(obj.__typename)
    }
    


    const ResendEmailVerificationToken_possibleTypes: string[] = ['ResendEmailVerificationToken']
    export const isResendEmailVerificationToken = (obj?: { __typename?: any } | null): obj is ResendEmailVerificationToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isResendEmailVerificationToken"')
      return ResendEmailVerificationToken_possibleTypes.includes(obj.__typename)
    }
    


    const DeleteSso_possibleTypes: string[] = ['DeleteSso']
    export const isDeleteSso = (obj?: { __typename?: any } | null): obj is DeleteSso => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDeleteSso"')
      return DeleteSso_possibleTypes.includes(obj.__typename)
    }
    


    const EditSso_possibleTypes: string[] = ['EditSso']
    export const isEditSso = (obj?: { __typename?: any } | null): obj is EditSso => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEditSso"')
      return EditSso_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceNameAndId_possibleTypes: string[] = ['WorkspaceNameAndId']
    export const isWorkspaceNameAndId = (obj?: { __typename?: any } | null): obj is WorkspaceNameAndId => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceNameAndId"')
      return WorkspaceNameAndId_possibleTypes.includes(obj.__typename)
    }
    


    const FindAvailableSSOIDP_possibleTypes: string[] = ['FindAvailableSSOIDP']
    export const isFindAvailableSSOIDP = (obj?: { __typename?: any } | null): obj is FindAvailableSSOIDP => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFindAvailableSSOIDP"')
      return FindAvailableSSOIDP_possibleTypes.includes(obj.__typename)
    }
    


    const SetupSso_possibleTypes: string[] = ['SetupSso']
    export const isSetupSso = (obj?: { __typename?: any } | null): obj is SetupSso => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSetupSso"')
      return SetupSso_possibleTypes.includes(obj.__typename)
    }
    


    const SSOConnection_possibleTypes: string[] = ['SSOConnection']
    export const isSSOConnection = (obj?: { __typename?: any } | null): obj is SSOConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSSOConnection"')
      return SSOConnection_possibleTypes.includes(obj.__typename)
    }
    


    const AvailableWorkspace_possibleTypes: string[] = ['AvailableWorkspace']
    export const isAvailableWorkspace = (obj?: { __typename?: any } | null): obj is AvailableWorkspace => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAvailableWorkspace"')
      return AvailableWorkspace_possibleTypes.includes(obj.__typename)
    }
    


    const AvailableWorkspaces_possibleTypes: string[] = ['AvailableWorkspaces']
    export const isAvailableWorkspaces = (obj?: { __typename?: any } | null): obj is AvailableWorkspaces => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAvailableWorkspaces"')
      return AvailableWorkspaces_possibleTypes.includes(obj.__typename)
    }
    


    const DeletedWorkspaceMember_possibleTypes: string[] = ['DeletedWorkspaceMember']
    export const isDeletedWorkspaceMember = (obj?: { __typename?: any } | null): obj is DeletedWorkspaceMember => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDeletedWorkspaceMember"')
      return DeletedWorkspaceMember_possibleTypes.includes(obj.__typename)
    }
    


    const BillingEntitlement_possibleTypes: string[] = ['BillingEntitlement']
    export const isBillingEntitlement = (obj?: { __typename?: any } | null): obj is BillingEntitlement => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingEntitlement"')
      return BillingEntitlement_possibleTypes.includes(obj.__typename)
    }
    


    const DomainRecord_possibleTypes: string[] = ['DomainRecord']
    export const isDomainRecord = (obj?: { __typename?: any } | null): obj is DomainRecord => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDomainRecord"')
      return DomainRecord_possibleTypes.includes(obj.__typename)
    }
    


    const DomainValidRecords_possibleTypes: string[] = ['DomainValidRecords']
    export const isDomainValidRecords = (obj?: { __typename?: any } | null): obj is DomainValidRecords => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDomainValidRecords"')
      return DomainValidRecords_possibleTypes.includes(obj.__typename)
    }
    


    const IndexEdge_possibleTypes: string[] = ['IndexEdge']
    export const isIndexEdge = (obj?: { __typename?: any } | null): obj is IndexEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isIndexEdge"')
      return IndexEdge_possibleTypes.includes(obj.__typename)
    }
    


    const PageInfo_possibleTypes: string[] = ['PageInfo']
    export const isPageInfo = (obj?: { __typename?: any } | null): obj is PageInfo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageInfo"')
      return PageInfo_possibleTypes.includes(obj.__typename)
    }
    


    const IndexConnection_possibleTypes: string[] = ['IndexConnection']
    export const isIndexConnection = (obj?: { __typename?: any } | null): obj is IndexConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isIndexConnection"')
      return IndexConnection_possibleTypes.includes(obj.__typename)
    }
    


    const IndexFieldEdge_possibleTypes: string[] = ['IndexFieldEdge']
    export const isIndexFieldEdge = (obj?: { __typename?: any } | null): obj is IndexFieldEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isIndexFieldEdge"')
      return IndexFieldEdge_possibleTypes.includes(obj.__typename)
    }
    


    const IndexIndexFieldMetadatasConnection_possibleTypes: string[] = ['IndexIndexFieldMetadatasConnection']
    export const isIndexIndexFieldMetadatasConnection = (obj?: { __typename?: any } | null): obj is IndexIndexFieldMetadatasConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isIndexIndexFieldMetadatasConnection"')
      return IndexIndexFieldMetadatasConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectEdge_possibleTypes: string[] = ['ObjectEdge']
    export const isObjectEdge = (obj?: { __typename?: any } | null): obj is ObjectEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectEdge"')
      return ObjectEdge_possibleTypes.includes(obj.__typename)
    }
    


    const IndexObjectMetadataConnection_possibleTypes: string[] = ['IndexObjectMetadataConnection']
    export const isIndexObjectMetadataConnection = (obj?: { __typename?: any } | null): obj is IndexObjectMetadataConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isIndexObjectMetadataConnection"')
      return IndexObjectMetadataConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectRecordCount_possibleTypes: string[] = ['ObjectRecordCount']
    export const isObjectRecordCount = (obj?: { __typename?: any } | null): obj is ObjectRecordCount => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectRecordCount"')
      return ObjectRecordCount_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectConnection_possibleTypes: string[] = ['ObjectConnection']
    export const isObjectConnection = (obj?: { __typename?: any } | null): obj is ObjectConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectConnection"')
      return ObjectConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectIndexMetadatasConnection_possibleTypes: string[] = ['ObjectIndexMetadatasConnection']
    export const isObjectIndexMetadatasConnection = (obj?: { __typename?: any } | null): obj is ObjectIndexMetadatasConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectIndexMetadatasConnection"')
      return ObjectIndexMetadatasConnection_possibleTypes.includes(obj.__typename)
    }
    


    const FieldEdge_possibleTypes: string[] = ['FieldEdge']
    export const isFieldEdge = (obj?: { __typename?: any } | null): obj is FieldEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFieldEdge"')
      return FieldEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectFieldsConnection_possibleTypes: string[] = ['ObjectFieldsConnection']
    export const isObjectFieldsConnection = (obj?: { __typename?: any } | null): obj is ObjectFieldsConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectFieldsConnection"')
      return ObjectFieldsConnection_possibleTypes.includes(obj.__typename)
    }
    


    const UpsertRowLevelPermissionPredicatesResult_possibleTypes: string[] = ['UpsertRowLevelPermissionPredicatesResult']
    export const isUpsertRowLevelPermissionPredicatesResult = (obj?: { __typename?: any } | null): obj is UpsertRowLevelPermissionPredicatesResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUpsertRowLevelPermissionPredicatesResult"')
      return UpsertRowLevelPermissionPredicatesResult_possibleTypes.includes(obj.__typename)
    }
    


    const Relation_possibleTypes: string[] = ['Relation']
    export const isRelation = (obj?: { __typename?: any } | null): obj is Relation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRelation"')
      return Relation_possibleTypes.includes(obj.__typename)
    }
    


    const FieldConnection_possibleTypes: string[] = ['FieldConnection']
    export const isFieldConnection = (obj?: { __typename?: any } | null): obj is FieldConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFieldConnection"')
      return FieldConnection_possibleTypes.includes(obj.__typename)
    }
    


    const AuthToken_possibleTypes: string[] = ['AuthToken']
    export const isAuthToken = (obj?: { __typename?: any } | null): obj is AuthToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAuthToken"')
      return AuthToken_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationTokenPair_possibleTypes: string[] = ['ApplicationTokenPair']
    export const isApplicationTokenPair = (obj?: { __typename?: any } | null): obj is ApplicationTokenPair => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationTokenPair"')
      return ApplicationTokenPair_possibleTypes.includes(obj.__typename)
    }
    


    const FrontComponent_possibleTypes: string[] = ['FrontComponent']
    export const isFrontComponent = (obj?: { __typename?: any } | null): obj is FrontComponent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFrontComponent"')
      return FrontComponent_possibleTypes.includes(obj.__typename)
    }
    


    const LogicFunctionLogs_possibleTypes: string[] = ['LogicFunctionLogs']
    export const isLogicFunctionLogs = (obj?: { __typename?: any } | null): obj is LogicFunctionLogs => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLogicFunctionLogs"')
      return LogicFunctionLogs_possibleTypes.includes(obj.__typename)
    }
    


    const DeleteTwoFactorAuthenticationMethod_possibleTypes: string[] = ['DeleteTwoFactorAuthenticationMethod']
    export const isDeleteTwoFactorAuthenticationMethod = (obj?: { __typename?: any } | null): obj is DeleteTwoFactorAuthenticationMethod => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDeleteTwoFactorAuthenticationMethod"')
      return DeleteTwoFactorAuthenticationMethod_possibleTypes.includes(obj.__typename)
    }
    


    const InitiateTwoFactorAuthenticationProvisioning_possibleTypes: string[] = ['InitiateTwoFactorAuthenticationProvisioning']
    export const isInitiateTwoFactorAuthenticationProvisioning = (obj?: { __typename?: any } | null): obj is InitiateTwoFactorAuthenticationProvisioning => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isInitiateTwoFactorAuthenticationProvisioning"')
      return InitiateTwoFactorAuthenticationProvisioning_possibleTypes.includes(obj.__typename)
    }
    


    const VerifyTwoFactorAuthenticationMethod_possibleTypes: string[] = ['VerifyTwoFactorAuthenticationMethod']
    export const isVerifyTwoFactorAuthenticationMethod = (obj?: { __typename?: any } | null): obj is VerifyTwoFactorAuthenticationMethod => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isVerifyTwoFactorAuthenticationMethod"')
      return VerifyTwoFactorAuthenticationMethod_possibleTypes.includes(obj.__typename)
    }
    


    const AuthorizeApp_possibleTypes: string[] = ['AuthorizeApp']
    export const isAuthorizeApp = (obj?: { __typename?: any } | null): obj is AuthorizeApp => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAuthorizeApp"')
      return AuthorizeApp_possibleTypes.includes(obj.__typename)
    }
    


    const AuthTokenPair_possibleTypes: string[] = ['AuthTokenPair']
    export const isAuthTokenPair = (obj?: { __typename?: any } | null): obj is AuthTokenPair => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAuthTokenPair"')
      return AuthTokenPair_possibleTypes.includes(obj.__typename)
    }
    


    const AvailableWorkspacesAndAccessTokens_possibleTypes: string[] = ['AvailableWorkspacesAndAccessTokens']
    export const isAvailableWorkspacesAndAccessTokens = (obj?: { __typename?: any } | null): obj is AvailableWorkspacesAndAccessTokens => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAvailableWorkspacesAndAccessTokens"')
      return AvailableWorkspacesAndAccessTokens_possibleTypes.includes(obj.__typename)
    }
    


    const EmailPasswordResetLink_possibleTypes: string[] = ['EmailPasswordResetLink']
    export const isEmailPasswordResetLink = (obj?: { __typename?: any } | null): obj is EmailPasswordResetLink => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEmailPasswordResetLink"')
      return EmailPasswordResetLink_possibleTypes.includes(obj.__typename)
    }
    


    const GetAuthorizationUrlForSSO_possibleTypes: string[] = ['GetAuthorizationUrlForSSO']
    export const isGetAuthorizationUrlForSSO = (obj?: { __typename?: any } | null): obj is GetAuthorizationUrlForSSO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isGetAuthorizationUrlForSSO"')
      return GetAuthorizationUrlForSSO_possibleTypes.includes(obj.__typename)
    }
    


    const InvalidatePassword_possibleTypes: string[] = ['InvalidatePassword']
    export const isInvalidatePassword = (obj?: { __typename?: any } | null): obj is InvalidatePassword => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isInvalidatePassword"')
      return InvalidatePassword_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceUrlsAndId_possibleTypes: string[] = ['WorkspaceUrlsAndId']
    export const isWorkspaceUrlsAndId = (obj?: { __typename?: any } | null): obj is WorkspaceUrlsAndId => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceUrlsAndId"')
      return WorkspaceUrlsAndId_possibleTypes.includes(obj.__typename)
    }
    


    const SignUp_possibleTypes: string[] = ['SignUp']
    export const isSignUp = (obj?: { __typename?: any } | null): obj is SignUp => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSignUp"')
      return SignUp_possibleTypes.includes(obj.__typename)
    }
    


    const TransientToken_possibleTypes: string[] = ['TransientToken']
    export const isTransientToken = (obj?: { __typename?: any } | null): obj is TransientToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTransientToken"')
      return TransientToken_possibleTypes.includes(obj.__typename)
    }
    


    const ValidatePasswordResetToken_possibleTypes: string[] = ['ValidatePasswordResetToken']
    export const isValidatePasswordResetToken = (obj?: { __typename?: any } | null): obj is ValidatePasswordResetToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isValidatePasswordResetToken"')
      return ValidatePasswordResetToken_possibleTypes.includes(obj.__typename)
    }
    


    const VerifyEmailAndGetLoginToken_possibleTypes: string[] = ['VerifyEmailAndGetLoginToken']
    export const isVerifyEmailAndGetLoginToken = (obj?: { __typename?: any } | null): obj is VerifyEmailAndGetLoginToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isVerifyEmailAndGetLoginToken"')
      return VerifyEmailAndGetLoginToken_possibleTypes.includes(obj.__typename)
    }
    


    const ApiKeyToken_possibleTypes: string[] = ['ApiKeyToken']
    export const isApiKeyToken = (obj?: { __typename?: any } | null): obj is ApiKeyToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApiKeyToken"')
      return ApiKeyToken_possibleTypes.includes(obj.__typename)
    }
    


    const AuthTokens_possibleTypes: string[] = ['AuthTokens']
    export const isAuthTokens = (obj?: { __typename?: any } | null): obj is AuthTokens => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAuthTokens"')
      return AuthTokens_possibleTypes.includes(obj.__typename)
    }
    


    const LoginToken_possibleTypes: string[] = ['LoginToken']
    export const isLoginToken = (obj?: { __typename?: any } | null): obj is LoginToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLoginToken"')
      return LoginToken_possibleTypes.includes(obj.__typename)
    }
    


    const CheckUserExist_possibleTypes: string[] = ['CheckUserExist']
    export const isCheckUserExist = (obj?: { __typename?: any } | null): obj is CheckUserExist => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCheckUserExist"')
      return CheckUserExist_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceInviteHashValid_possibleTypes: string[] = ['WorkspaceInviteHashValid']
    export const isWorkspaceInviteHashValid = (obj?: { __typename?: any } | null): obj is WorkspaceInviteHashValid => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceInviteHashValid"')
      return WorkspaceInviteHashValid_possibleTypes.includes(obj.__typename)
    }
    


    const Impersonate_possibleTypes: string[] = ['Impersonate']
    export const isImpersonate = (obj?: { __typename?: any } | null): obj is Impersonate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isImpersonate"')
      return Impersonate_possibleTypes.includes(obj.__typename)
    }
    


    const UsageTimeSeries_possibleTypes: string[] = ['UsageTimeSeries']
    export const isUsageTimeSeries = (obj?: { __typename?: any } | null): obj is UsageTimeSeries => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUsageTimeSeries"')
      return UsageTimeSeries_possibleTypes.includes(obj.__typename)
    }
    


    const UsageUserDaily_possibleTypes: string[] = ['UsageUserDaily']
    export const isUsageUserDaily = (obj?: { __typename?: any } | null): obj is UsageUserDaily => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUsageUserDaily"')
      return UsageUserDaily_possibleTypes.includes(obj.__typename)
    }
    


    const UsageAnalytics_possibleTypes: string[] = ['UsageAnalytics']
    export const isUsageAnalytics = (obj?: { __typename?: any } | null): obj is UsageAnalytics => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUsageAnalytics"')
      return UsageAnalytics_possibleTypes.includes(obj.__typename)
    }
    


    const DevelopmentApplication_possibleTypes: string[] = ['DevelopmentApplication']
    export const isDevelopmentApplication = (obj?: { __typename?: any } | null): obj is DevelopmentApplication => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDevelopmentApplication"')
      return DevelopmentApplication_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceMigration_possibleTypes: string[] = ['WorkspaceMigration']
    export const isWorkspaceMigration = (obj?: { __typename?: any } | null): obj is WorkspaceMigration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceMigration"')
      return WorkspaceMigration_possibleTypes.includes(obj.__typename)
    }
    


    const File_possibleTypes: string[] = ['File']
    export const isFile = (obj?: { __typename?: any } | null): obj is File => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFile"')
      return File_possibleTypes.includes(obj.__typename)
    }
    


    const MarketplaceApp_possibleTypes: string[] = ['MarketplaceApp']
    export const isMarketplaceApp = (obj?: { __typename?: any } | null): obj is MarketplaceApp => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMarketplaceApp"')
      return MarketplaceApp_possibleTypes.includes(obj.__typename)
    }
    


    const MarketplaceAppDetail_possibleTypes: string[] = ['MarketplaceAppDetail']
    export const isMarketplaceAppDetail = (obj?: { __typename?: any } | null): obj is MarketplaceAppDetail => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMarketplaceAppDetail"')
      return MarketplaceAppDetail_possibleTypes.includes(obj.__typename)
    }
    


    const PublicDomain_possibleTypes: string[] = ['PublicDomain']
    export const isPublicDomain = (obj?: { __typename?: any } | null): obj is PublicDomain => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicDomain"')
      return PublicDomain_possibleTypes.includes(obj.__typename)
    }
    


    const VerificationRecord_possibleTypes: string[] = ['VerificationRecord']
    export const isVerificationRecord = (obj?: { __typename?: any } | null): obj is VerificationRecord => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isVerificationRecord"')
      return VerificationRecord_possibleTypes.includes(obj.__typename)
    }
    


    const EmailingDomain_possibleTypes: string[] = ['EmailingDomain']
    export const isEmailingDomain = (obj?: { __typename?: any } | null): obj is EmailingDomain => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEmailingDomain"')
      return EmailingDomain_possibleTypes.includes(obj.__typename)
    }
    


    const AutocompleteResult_possibleTypes: string[] = ['AutocompleteResult']
    export const isAutocompleteResult = (obj?: { __typename?: any } | null): obj is AutocompleteResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAutocompleteResult"')
      return AutocompleteResult_possibleTypes.includes(obj.__typename)
    }
    


    const Location_possibleTypes: string[] = ['Location']
    export const isLocation = (obj?: { __typename?: any } | null): obj is Location => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLocation"')
      return Location_possibleTypes.includes(obj.__typename)
    }
    


    const PlaceDetailsResult_possibleTypes: string[] = ['PlaceDetailsResult']
    export const isPlaceDetailsResult = (obj?: { __typename?: any } | null): obj is PlaceDetailsResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPlaceDetailsResult"')
      return PlaceDetailsResult_possibleTypes.includes(obj.__typename)
    }
    


    const ConnectionParametersOutput_possibleTypes: string[] = ['ConnectionParametersOutput']
    export const isConnectionParametersOutput = (obj?: { __typename?: any } | null): obj is ConnectionParametersOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConnectionParametersOutput"')
      return ConnectionParametersOutput_possibleTypes.includes(obj.__typename)
    }
    


    const ImapSmtpCaldavConnectionParameters_possibleTypes: string[] = ['ImapSmtpCaldavConnectionParameters']
    export const isImapSmtpCaldavConnectionParameters = (obj?: { __typename?: any } | null): obj is ImapSmtpCaldavConnectionParameters => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isImapSmtpCaldavConnectionParameters"')
      return ImapSmtpCaldavConnectionParameters_possibleTypes.includes(obj.__typename)
    }
    


    const ConnectedImapSmtpCaldavAccount_possibleTypes: string[] = ['ConnectedImapSmtpCaldavAccount']
    export const isConnectedImapSmtpCaldavAccount = (obj?: { __typename?: any } | null): obj is ConnectedImapSmtpCaldavAccount => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConnectedImapSmtpCaldavAccount"')
      return ConnectedImapSmtpCaldavAccount_possibleTypes.includes(obj.__typename)
    }
    


    const ImapSmtpCaldavConnectionSuccess_possibleTypes: string[] = ['ImapSmtpCaldavConnectionSuccess']
    export const isImapSmtpCaldavConnectionSuccess = (obj?: { __typename?: any } | null): obj is ImapSmtpCaldavConnectionSuccess => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isImapSmtpCaldavConnectionSuccess"')
      return ImapSmtpCaldavConnectionSuccess_possibleTypes.includes(obj.__typename)
    }
    


    const PostgresCredentials_possibleTypes: string[] = ['PostgresCredentials']
    export const isPostgresCredentials = (obj?: { __typename?: any } | null): obj is PostgresCredentials => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPostgresCredentials"')
      return PostgresCredentials_possibleTypes.includes(obj.__typename)
    }
    


    const CommandMenuItem_possibleTypes: string[] = ['CommandMenuItem']
    export const isCommandMenuItem = (obj?: { __typename?: any } | null): obj is CommandMenuItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCommandMenuItem"')
      return CommandMenuItem_possibleTypes.includes(obj.__typename)
    }
    


    const ToolIndexEntry_possibleTypes: string[] = ['ToolIndexEntry']
    export const isToolIndexEntry = (obj?: { __typename?: any } | null): obj is ToolIndexEntry => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isToolIndexEntry"')
      return ToolIndexEntry_possibleTypes.includes(obj.__typename)
    }
    


    const AgentMessagePart_possibleTypes: string[] = ['AgentMessagePart']
    export const isAgentMessagePart = (obj?: { __typename?: any } | null): obj is AgentMessagePart => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentMessagePart"')
      return AgentMessagePart_possibleTypes.includes(obj.__typename)
    }
    


    const ChannelSyncSuccess_possibleTypes: string[] = ['ChannelSyncSuccess']
    export const isChannelSyncSuccess = (obj?: { __typename?: any } | null): obj is ChannelSyncSuccess => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isChannelSyncSuccess"')
      return ChannelSyncSuccess_possibleTypes.includes(obj.__typename)
    }
    


    const BarChartSeries_possibleTypes: string[] = ['BarChartSeries']
    export const isBarChartSeries = (obj?: { __typename?: any } | null): obj is BarChartSeries => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBarChartSeries"')
      return BarChartSeries_possibleTypes.includes(obj.__typename)
    }
    


    const BarChartData_possibleTypes: string[] = ['BarChartData']
    export const isBarChartData = (obj?: { __typename?: any } | null): obj is BarChartData => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBarChartData"')
      return BarChartData_possibleTypes.includes(obj.__typename)
    }
    


    const LineChartDataPoint_possibleTypes: string[] = ['LineChartDataPoint']
    export const isLineChartDataPoint = (obj?: { __typename?: any } | null): obj is LineChartDataPoint => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLineChartDataPoint"')
      return LineChartDataPoint_possibleTypes.includes(obj.__typename)
    }
    


    const LineChartSeries_possibleTypes: string[] = ['LineChartSeries']
    export const isLineChartSeries = (obj?: { __typename?: any } | null): obj is LineChartSeries => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLineChartSeries"')
      return LineChartSeries_possibleTypes.includes(obj.__typename)
    }
    


    const LineChartData_possibleTypes: string[] = ['LineChartData']
    export const isLineChartData = (obj?: { __typename?: any } | null): obj is LineChartData => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLineChartData"')
      return LineChartData_possibleTypes.includes(obj.__typename)
    }
    


    const PieChartDataItem_possibleTypes: string[] = ['PieChartDataItem']
    export const isPieChartDataItem = (obj?: { __typename?: any } | null): obj is PieChartDataItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPieChartDataItem"')
      return PieChartDataItem_possibleTypes.includes(obj.__typename)
    }
    


    const PieChartData_possibleTypes: string[] = ['PieChartData']
    export const isPieChartData = (obj?: { __typename?: any } | null): obj is PieChartData => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPieChartData"')
      return PieChartData_possibleTypes.includes(obj.__typename)
    }
    


    const DuplicatedDashboard_possibleTypes: string[] = ['DuplicatedDashboard']
    export const isDuplicatedDashboard = (obj?: { __typename?: any } | null): obj is DuplicatedDashboard => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDuplicatedDashboard"')
      return DuplicatedDashboard_possibleTypes.includes(obj.__typename)
    }
    


    const ConnectedAccountDTO_possibleTypes: string[] = ['ConnectedAccountDTO']
    export const isConnectedAccountDTO = (obj?: { __typename?: any } | null): obj is ConnectedAccountDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConnectedAccountDTO"')
      return ConnectedAccountDTO_possibleTypes.includes(obj.__typename)
    }
    


    const SendEmailOutput_possibleTypes: string[] = ['SendEmailOutput']
    export const isSendEmailOutput = (obj?: { __typename?: any } | null): obj is SendEmailOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSendEmailOutput"')
      return SendEmailOutput_possibleTypes.includes(obj.__typename)
    }
    


    const EventLogRecord_possibleTypes: string[] = ['EventLogRecord']
    export const isEventLogRecord = (obj?: { __typename?: any } | null): obj is EventLogRecord => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEventLogRecord"')
      return EventLogRecord_possibleTypes.includes(obj.__typename)
    }
    


    const EventLogPageInfo_possibleTypes: string[] = ['EventLogPageInfo']
    export const isEventLogPageInfo = (obj?: { __typename?: any } | null): obj is EventLogPageInfo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEventLogPageInfo"')
      return EventLogPageInfo_possibleTypes.includes(obj.__typename)
    }
    


    const EventLogQueryResult_possibleTypes: string[] = ['EventLogQueryResult']
    export const isEventLogQueryResult = (obj?: { __typename?: any } | null): obj is EventLogQueryResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEventLogQueryResult"')
      return EventLogQueryResult_possibleTypes.includes(obj.__typename)
    }
    


    const Skill_possibleTypes: string[] = ['Skill']
    export const isSkill = (obj?: { __typename?: any } | null): obj is Skill => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSkill"')
      return Skill_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatThread_possibleTypes: string[] = ['AgentChatThread']
    export const isAgentChatThread = (obj?: { __typename?: any } | null): obj is AgentChatThread => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatThread"')
      return AgentChatThread_possibleTypes.includes(obj.__typename)
    }
    


    const AgentMessage_possibleTypes: string[] = ['AgentMessage']
    export const isAgentMessage = (obj?: { __typename?: any } | null): obj is AgentMessage => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentMessage"')
      return AgentMessage_possibleTypes.includes(obj.__typename)
    }
    


    const AISystemPromptSection_possibleTypes: string[] = ['AISystemPromptSection']
    export const isAISystemPromptSection = (obj?: { __typename?: any } | null): obj is AISystemPromptSection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAISystemPromptSection"')
      return AISystemPromptSection_possibleTypes.includes(obj.__typename)
    }
    


    const AISystemPromptPreview_possibleTypes: string[] = ['AISystemPromptPreview']
    export const isAISystemPromptPreview = (obj?: { __typename?: any } | null): obj is AISystemPromptPreview => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAISystemPromptPreview"')
      return AISystemPromptPreview_possibleTypes.includes(obj.__typename)
    }
    


    const ChatStreamCatchupChunks_possibleTypes: string[] = ['ChatStreamCatchupChunks']
    export const isChatStreamCatchupChunks = (obj?: { __typename?: any } | null): obj is ChatStreamCatchupChunks => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isChatStreamCatchupChunks"')
      return ChatStreamCatchupChunks_possibleTypes.includes(obj.__typename)
    }
    


    const SendChatMessageResult_possibleTypes: string[] = ['SendChatMessageResult']
    export const isSendChatMessageResult = (obj?: { __typename?: any } | null): obj is SendChatMessageResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSendChatMessageResult"')
      return SendChatMessageResult_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatEvent_possibleTypes: string[] = ['AgentChatEvent']
    export const isAgentChatEvent = (obj?: { __typename?: any } | null): obj is AgentChatEvent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatEvent"')
      return AgentChatEvent_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatThreadEdge_possibleTypes: string[] = ['AgentChatThreadEdge']
    export const isAgentChatThreadEdge = (obj?: { __typename?: any } | null): obj is AgentChatThreadEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatThreadEdge"')
      return AgentChatThreadEdge_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatThreadConnection_possibleTypes: string[] = ['AgentChatThreadConnection']
    export const isAgentChatThreadConnection = (obj?: { __typename?: any } | null): obj is AgentChatThreadConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatThreadConnection"')
      return AgentChatThreadConnection_possibleTypes.includes(obj.__typename)
    }
    


    const AgentTurnEvaluation_possibleTypes: string[] = ['AgentTurnEvaluation']
    export const isAgentTurnEvaluation = (obj?: { __typename?: any } | null): obj is AgentTurnEvaluation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentTurnEvaluation"')
      return AgentTurnEvaluation_possibleTypes.includes(obj.__typename)
    }
    


    const AgentTurn_possibleTypes: string[] = ['AgentTurn']
    export const isAgentTurn = (obj?: { __typename?: any } | null): obj is AgentTurn => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentTurn"')
      return AgentTurn_possibleTypes.includes(obj.__typename)
    }
    


    const CalendarChannel_possibleTypes: string[] = ['CalendarChannel']
    export const isCalendarChannel = (obj?: { __typename?: any } | null): obj is CalendarChannel => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCalendarChannel"')
      return CalendarChannel_possibleTypes.includes(obj.__typename)
    }
    


    const MessageChannel_possibleTypes: string[] = ['MessageChannel']
    export const isMessageChannel = (obj?: { __typename?: any } | null): obj is MessageChannel => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageChannel"')
      return MessageChannel_possibleTypes.includes(obj.__typename)
    }
    


    const MessageFolder_possibleTypes: string[] = ['MessageFolder']
    export const isMessageFolder = (obj?: { __typename?: any } | null): obj is MessageFolder => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageFolder"')
      return MessageFolder_possibleTypes.includes(obj.__typename)
    }
    


    const CollectionHash_possibleTypes: string[] = ['CollectionHash']
    export const isCollectionHash = (obj?: { __typename?: any } | null): obj is CollectionHash => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCollectionHash"')
      return CollectionHash_possibleTypes.includes(obj.__typename)
    }
    


    const MinimalObjectMetadata_possibleTypes: string[] = ['MinimalObjectMetadata']
    export const isMinimalObjectMetadata = (obj?: { __typename?: any } | null): obj is MinimalObjectMetadata => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMinimalObjectMetadata"')
      return MinimalObjectMetadata_possibleTypes.includes(obj.__typename)
    }
    


    const MinimalView_possibleTypes: string[] = ['MinimalView']
    export const isMinimalView = (obj?: { __typename?: any } | null): obj is MinimalView => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMinimalView"')
      return MinimalView_possibleTypes.includes(obj.__typename)
    }
    


    const MinimalMetadata_possibleTypes: string[] = ['MinimalMetadata']
    export const isMinimalMetadata = (obj?: { __typename?: any } | null): obj is MinimalMetadata => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMinimalMetadata"')
      return MinimalMetadata_possibleTypes.includes(obj.__typename)
    }
    


    const Webhook_possibleTypes: string[] = ['Webhook']
    export const isWebhook = (obj?: { __typename?: any } | null): obj is Webhook => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWebhook"')
      return Webhook_possibleTypes.includes(obj.__typename)
    }
    


    const Query_possibleTypes: string[] = ['Query']
    export const isQuery = (obj?: { __typename?: any } | null): obj is Query => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuery"')
      return Query_possibleTypes.includes(obj.__typename)
    }
    


    const Mutation_possibleTypes: string[] = ['Mutation']
    export const isMutation = (obj?: { __typename?: any } | null): obj is Mutation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMutation"')
      return Mutation_possibleTypes.includes(obj.__typename)
    }
    


    const Subscription_possibleTypes: string[] = ['Subscription']
    export const isSubscription = (obj?: { __typename?: any } | null): obj is Subscription => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSubscription"')
      return Subscription_possibleTypes.includes(obj.__typename)
    }
    

export const enumApplicationRegistrationSourceType = {
   NPM: 'NPM' as const,
   TARBALL: 'TARBALL' as const,
   LOCAL: 'LOCAL' as const,
   OAUTH_ONLY: 'OAUTH_ONLY' as const
}

export const enumRowLevelPermissionPredicateGroupLogicalOperator = {
   AND: 'AND' as const,
   OR: 'OR' as const
}

export const enumRowLevelPermissionPredicateOperand = {
   IS: 'IS' as const,
   IS_NOT_NULL: 'IS_NOT_NULL' as const,
   IS_NOT: 'IS_NOT' as const,
   LESS_THAN_OR_EQUAL: 'LESS_THAN_OR_EQUAL' as const,
   GREATER_THAN_OR_EQUAL: 'GREATER_THAN_OR_EQUAL' as const,
   IS_BEFORE: 'IS_BEFORE' as const,
   IS_AFTER: 'IS_AFTER' as const,
   CONTAINS: 'CONTAINS' as const,
   DOES_NOT_CONTAIN: 'DOES_NOT_CONTAIN' as const,
   IS_EMPTY: 'IS_EMPTY' as const,
   IS_NOT_EMPTY: 'IS_NOT_EMPTY' as const,
   IS_RELATIVE: 'IS_RELATIVE' as const,
   IS_IN_PAST: 'IS_IN_PAST' as const,
   IS_IN_FUTURE: 'IS_IN_FUTURE' as const,
   IS_TODAY: 'IS_TODAY' as const,
   VECTOR_SEARCH: 'VECTOR_SEARCH' as const
}

export const enumPermissionFlagType = {
   API_KEYS_AND_WEBHOOKS: 'API_KEYS_AND_WEBHOOKS' as const,
   WORKSPACE: 'WORKSPACE' as const,
   WORKSPACE_MEMBERS: 'WORKSPACE_MEMBERS' as const,
   ROLES: 'ROLES' as const,
   DATA_MODEL: 'DATA_MODEL' as const,
   SECURITY: 'SECURITY' as const,
   WORKFLOWS: 'WORKFLOWS' as const,
   IMPERSONATE: 'IMPERSONATE' as const,
   SSO_BYPASS: 'SSO_BYPASS' as const,
   APPLICATIONS: 'APPLICATIONS' as const,
   MARKETPLACE_APPS: 'MARKETPLACE_APPS' as const,
   LAYOUTS: 'LAYOUTS' as const,
   BILLING: 'BILLING' as const,
   AI_SETTINGS: 'AI_SETTINGS' as const,
   AI: 'AI' as const,
   VIEWS: 'VIEWS' as const,
   UPLOAD_FILE: 'UPLOAD_FILE' as const,
   DOWNLOAD_FILE: 'DOWNLOAD_FILE' as const,
   SEND_EMAIL_TOOL: 'SEND_EMAIL_TOOL' as const,
   HTTP_REQUEST_TOOL: 'HTTP_REQUEST_TOOL' as const,
   CODE_INTERPRETER_TOOL: 'CODE_INTERPRETER_TOOL' as const,
   IMPORT_CSV: 'IMPORT_CSV' as const,
   EXPORT_CSV: 'EXPORT_CSV' as const,
   CONNECTED_ACCOUNTS: 'CONNECTED_ACCOUNTS' as const,
   PROFILE_INFORMATION: 'PROFILE_INFORMATION' as const
}

export const enumWorkspaceMemberDateFormatEnum = {
   SYSTEM: 'SYSTEM' as const,
   MONTH_FIRST: 'MONTH_FIRST' as const,
   DAY_FIRST: 'DAY_FIRST' as const,
   YEAR_FIRST: 'YEAR_FIRST' as const
}

export const enumWorkspaceMemberTimeFormatEnum = {
   SYSTEM: 'SYSTEM' as const,
   HOUR_12: 'HOUR_12' as const,
   HOUR_24: 'HOUR_24' as const
}

export const enumWorkspaceMemberNumberFormatEnum = {
   SYSTEM: 'SYSTEM' as const,
   COMMAS_AND_DOT: 'COMMAS_AND_DOT' as const,
   SPACES_AND_COMMA: 'SPACES_AND_COMMA' as const,
   DOTS_AND_COMMA: 'DOTS_AND_COMMA' as const,
   APOSTROPHE_AND_DOT: 'APOSTROPHE_AND_DOT' as const
}

export const enumFieldMetadataType = {
   ACTOR: 'ACTOR' as const,
   ADDRESS: 'ADDRESS' as const,
   ARRAY: 'ARRAY' as const,
   BOOLEAN: 'BOOLEAN' as const,
   CURRENCY: 'CURRENCY' as const,
   DATE: 'DATE' as const,
   DATE_TIME: 'DATE_TIME' as const,
   EMAILS: 'EMAILS' as const,
   FILES: 'FILES' as const,
   FULL_NAME: 'FULL_NAME' as const,
   LINKS: 'LINKS' as const,
   MORPH_RELATION: 'MORPH_RELATION' as const,
   MULTI_SELECT: 'MULTI_SELECT' as const,
   NUMBER: 'NUMBER' as const,
   NUMERIC: 'NUMERIC' as const,
   PHONES: 'PHONES' as const,
   POSITION: 'POSITION' as const,
   RATING: 'RATING' as const,
   RAW_JSON: 'RAW_JSON' as const,
   RELATION: 'RELATION' as const,
   RICH_TEXT: 'RICH_TEXT' as const,
   SELECT: 'SELECT' as const,
   TEXT: 'TEXT' as const,
   TS_VECTOR: 'TS_VECTOR' as const,
   UUID: 'UUID' as const
}

export const enumIndexType = {
   BTREE: 'BTREE' as const,
   GIN: 'GIN' as const
}

export const enumAggregateOperations = {
   MIN: 'MIN' as const,
   MAX: 'MAX' as const,
   AVG: 'AVG' as const,
   SUM: 'SUM' as const,
   COUNT: 'COUNT' as const,
   COUNT_UNIQUE_VALUES: 'COUNT_UNIQUE_VALUES' as const,
   COUNT_EMPTY: 'COUNT_EMPTY' as const,
   COUNT_NOT_EMPTY: 'COUNT_NOT_EMPTY' as const,
   COUNT_TRUE: 'COUNT_TRUE' as const,
   COUNT_FALSE: 'COUNT_FALSE' as const,
   PERCENTAGE_EMPTY: 'PERCENTAGE_EMPTY' as const,
   PERCENTAGE_NOT_EMPTY: 'PERCENTAGE_NOT_EMPTY' as const
}

export const enumViewFilterGroupLogicalOperator = {
   AND: 'AND' as const,
   OR: 'OR' as const,
   NOT: 'NOT' as const
}

export const enumViewFilterOperand = {
   IS: 'IS' as const,
   IS_NOT_NULL: 'IS_NOT_NULL' as const,
   IS_NOT: 'IS_NOT' as const,
   LESS_THAN_OR_EQUAL: 'LESS_THAN_OR_EQUAL' as const,
   GREATER_THAN_OR_EQUAL: 'GREATER_THAN_OR_EQUAL' as const,
   IS_BEFORE: 'IS_BEFORE' as const,
   IS_AFTER: 'IS_AFTER' as const,
   CONTAINS: 'CONTAINS' as const,
   DOES_NOT_CONTAIN: 'DOES_NOT_CONTAIN' as const,
   IS_EMPTY: 'IS_EMPTY' as const,
   IS_NOT_EMPTY: 'IS_NOT_EMPTY' as const,
   IS_RELATIVE: 'IS_RELATIVE' as const,
   IS_IN_PAST: 'IS_IN_PAST' as const,
   IS_IN_FUTURE: 'IS_IN_FUTURE' as const,
   IS_TODAY: 'IS_TODAY' as const,
   VECTOR_SEARCH: 'VECTOR_SEARCH' as const
}

export const enumViewSortDirection = {
   ASC: 'ASC' as const,
   DESC: 'DESC' as const
}

export const enumViewType = {
   TABLE: 'TABLE' as const,
   KANBAN: 'KANBAN' as const,
   CALENDAR: 'CALENDAR' as const,
   FIELDS_WIDGET: 'FIELDS_WIDGET' as const
}

export const enumViewKey = {
   INDEX: 'INDEX' as const
}

export const enumViewOpenRecordIn = {
   SIDE_PANEL: 'SIDE_PANEL' as const,
   RECORD_PAGE: 'RECORD_PAGE' as const
}

export const enumViewCalendarLayout = {
   DAY: 'DAY' as const,
   WEEK: 'WEEK' as const,
   MONTH: 'MONTH' as const
}

export const enumViewVisibility = {
   WORKSPACE: 'WORKSPACE' as const,
   UNLISTED: 'UNLISTED' as const
}

export const enumWorkspaceActivationStatus = {
   ONGOING_CREATION: 'ONGOING_CREATION' as const,
   PENDING_CREATION: 'PENDING_CREATION' as const,
   ACTIVE: 'ACTIVE' as const,
   INACTIVE: 'INACTIVE' as const,
   SUSPENDED: 'SUSPENDED' as const
}

export const enumOnboardingStatus = {
   PLAN_REQUIRED: 'PLAN_REQUIRED' as const,
   WORKSPACE_ACTIVATION: 'WORKSPACE_ACTIVATION' as const,
   PROFILE_CREATION: 'PROFILE_CREATION' as const,
   SYNC_EMAIL: 'SYNC_EMAIL' as const,
   INVITE_TEAM: 'INVITE_TEAM' as const,
   BOOK_ONBOARDING: 'BOOK_ONBOARDING' as const,
   COMPLETED: 'COMPLETED' as const
}

export const enumWidgetType = {
   VIEW: 'VIEW' as const,
   IFRAME: 'IFRAME' as const,
   FIELD: 'FIELD' as const,
   FIELDS: 'FIELDS' as const,
   GRAPH: 'GRAPH' as const,
   STANDALONE_RICH_TEXT: 'STANDALONE_RICH_TEXT' as const,
   TIMELINE: 'TIMELINE' as const,
   TASKS: 'TASKS' as const,
   NOTES: 'NOTES' as const,
   FILES: 'FILES' as const,
   EMAILS: 'EMAILS' as const,
   CALENDAR: 'CALENDAR' as const,
   FIELD_RICH_TEXT: 'FIELD_RICH_TEXT' as const,
   WORKFLOW: 'WORKFLOW' as const,
   WORKFLOW_VERSION: 'WORKFLOW_VERSION' as const,
   WORKFLOW_RUN: 'WORKFLOW_RUN' as const,
   FRONT_COMPONENT: 'FRONT_COMPONENT' as const,
   RECORD_TABLE: 'RECORD_TABLE' as const,
   EMAIL_THREAD: 'EMAIL_THREAD' as const
}

export const enumPageLayoutTabLayoutMode = {
   GRID: 'GRID' as const,
   VERTICAL_LIST: 'VERTICAL_LIST' as const,
   CANVAS: 'CANVAS' as const
}

export const enumWidgetConfigurationType = {
   AGGREGATE_CHART: 'AGGREGATE_CHART' as const,
   GAUGE_CHART: 'GAUGE_CHART' as const,
   PIE_CHART: 'PIE_CHART' as const,
   BAR_CHART: 'BAR_CHART' as const,
   LINE_CHART: 'LINE_CHART' as const,
   IFRAME: 'IFRAME' as const,
   STANDALONE_RICH_TEXT: 'STANDALONE_RICH_TEXT' as const,
   VIEW: 'VIEW' as const,
   FIELD: 'FIELD' as const,
   FIELDS: 'FIELDS' as const,
   TIMELINE: 'TIMELINE' as const,
   TASKS: 'TASKS' as const,
   NOTES: 'NOTES' as const,
   FILES: 'FILES' as const,
   EMAILS: 'EMAILS' as const,
   CALENDAR: 'CALENDAR' as const,
   FIELD_RICH_TEXT: 'FIELD_RICH_TEXT' as const,
   WORKFLOW: 'WORKFLOW' as const,
   WORKFLOW_VERSION: 'WORKFLOW_VERSION' as const,
   WORKFLOW_RUN: 'WORKFLOW_RUN' as const,
   FRONT_COMPONENT: 'FRONT_COMPONENT' as const,
   RECORD_TABLE: 'RECORD_TABLE' as const,
   EMAIL_THREAD: 'EMAIL_THREAD' as const
}

export const enumObjectRecordGroupByDateGranularity = {
   DAY: 'DAY' as const,
   MONTH: 'MONTH' as const,
   QUARTER: 'QUARTER' as const,
   YEAR: 'YEAR' as const,
   WEEK: 'WEEK' as const,
   DAY_OF_THE_WEEK: 'DAY_OF_THE_WEEK' as const,
   MONTH_OF_THE_YEAR: 'MONTH_OF_THE_YEAR' as const,
   QUARTER_OF_THE_YEAR: 'QUARTER_OF_THE_YEAR' as const,
   NONE: 'NONE' as const
}

export const enumGraphOrderBy = {
   FIELD_ASC: 'FIELD_ASC' as const,
   FIELD_DESC: 'FIELD_DESC' as const,
   FIELD_POSITION_ASC: 'FIELD_POSITION_ASC' as const,
   FIELD_POSITION_DESC: 'FIELD_POSITION_DESC' as const,
   VALUE_ASC: 'VALUE_ASC' as const,
   VALUE_DESC: 'VALUE_DESC' as const,
   MANUAL: 'MANUAL' as const
}

export const enumAxisNameDisplay = {
   NONE: 'NONE' as const,
   X: 'X' as const,
   Y: 'Y' as const,
   BOTH: 'BOTH' as const
}

export const enumBarChartGroupMode = {
   STACKED: 'STACKED' as const,
   GROUPED: 'GROUPED' as const
}

export const enumBarChartLayout = {
   VERTICAL: 'VERTICAL' as const,
   HORIZONTAL: 'HORIZONTAL' as const
}

export const enumFieldDisplayMode = {
   CARD: 'CARD' as const,
   FIELD: 'FIELD' as const,
   VIEW: 'VIEW' as const
}

export const enumPageLayoutType = {
   RECORD_INDEX: 'RECORD_INDEX' as const,
   RECORD_PAGE: 'RECORD_PAGE' as const,
   DASHBOARD: 'DASHBOARD' as const
}

export const enumBillingPlanKey = {
   PRO: 'PRO' as const,
   ENTERPRISE: 'ENTERPRISE' as const
}

export const enumBillingUsageType = {
   METERED: 'METERED' as const,
   LICENSED: 'LICENSED' as const
}

export const enumBillingProductKey = {
   BASE_PRODUCT: 'BASE_PRODUCT' as const,
   WORKFLOW_NODE_EXECUTION: 'WORKFLOW_NODE_EXECUTION' as const
}

export const enumSubscriptionInterval = {
   Month: 'Month' as const,
   Year: 'Year' as const
}

export const enumSubscriptionStatus = {
   Active: 'Active' as const,
   Canceled: 'Canceled' as const,
   Incomplete: 'Incomplete' as const,
   IncompleteExpired: 'IncompleteExpired' as const,
   PastDue: 'PastDue' as const,
   Paused: 'Paused' as const,
   Trialing: 'Trialing' as const,
   Unpaid: 'Unpaid' as const
}

export const enumNavigationMenuItemType = {
   VIEW: 'VIEW' as const,
   FOLDER: 'FOLDER' as const,
   LINK: 'LINK' as const,
   OBJECT: 'OBJECT' as const,
   RECORD: 'RECORD' as const
}

export const enumMetadataEventAction = {
   CREATED: 'CREATED' as const,
   UPDATED: 'UPDATED' as const,
   DELETED: 'DELETED' as const
}

export const enumDatabaseEventAction = {
   CREATED: 'CREATED' as const,
   UPDATED: 'UPDATED' as const,
   DELETED: 'DELETED' as const,
   DESTROYED: 'DESTROYED' as const,
   RESTORED: 'RESTORED' as const,
   UPSERTED: 'UPSERTED' as const
}

export const enumLogicFunctionExecutionStatus = {
   IDLE: 'IDLE' as const,
   SUCCESS: 'SUCCESS' as const,
   ERROR: 'ERROR' as const
}

export const enumIdentityProviderType = {
   OIDC: 'OIDC' as const,
   SAML: 'SAML' as const
}

export const enumSsoIdentityProviderStatus = {
   Active: 'Active' as const,
   Inactive: 'Inactive' as const,
   Error: 'Error' as const
}

export const enumModelFamily = {
   GPT: 'GPT' as const,
   CLAUDE: 'CLAUDE' as const,
   GEMINI: 'GEMINI' as const,
   MISTRAL: 'MISTRAL' as const,
   GROK: 'GROK' as const
}

export const enumSupportDriver = {
   NONE: 'NONE' as const,
   FRONT: 'FRONT' as const
}

export const enumCaptchaDriverType = {
   GOOGLE_RECAPTCHA: 'GOOGLE_RECAPTCHA' as const,
   TURNSTILE: 'TURNSTILE' as const
}

export const enumFeatureFlagKey = {
   IS_UNIQUE_INDEXES_ENABLED: 'IS_UNIQUE_INDEXES_ENABLED' as const,
   IS_JSON_FILTER_ENABLED: 'IS_JSON_FILTER_ENABLED' as const,
   IS_AI_ENABLED: 'IS_AI_ENABLED' as const,
   IS_COMMAND_MENU_ITEM_ENABLED: 'IS_COMMAND_MENU_ITEM_ENABLED' as const,
   IS_MARKETPLACE_SETTING_TAB_VISIBLE: 'IS_MARKETPLACE_SETTING_TAB_VISIBLE' as const,
   IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED: 'IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED' as const,
   IS_PUBLIC_DOMAIN_ENABLED: 'IS_PUBLIC_DOMAIN_ENABLED' as const,
   IS_EMAILING_DOMAIN_ENABLED: 'IS_EMAILING_DOMAIN_ENABLED' as const,
   IS_JUNCTION_RELATIONS_ENABLED: 'IS_JUNCTION_RELATIONS_ENABLED' as const,
   IS_DRAFT_EMAIL_ENABLED: 'IS_DRAFT_EMAIL_ENABLED' as const,
   IS_CONNECTED_ACCOUNT_MIGRATED: 'IS_CONNECTED_ACCOUNT_MIGRATED' as const,
   IS_USAGE_ANALYTICS_ENABLED: 'IS_USAGE_ANALYTICS_ENABLED' as const,
   IS_RICH_TEXT_V1_MIGRATED: 'IS_RICH_TEXT_V1_MIGRATED' as const,
   IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED: 'IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED' as const,
   IS_RECORD_TABLE_WIDGET_ENABLED: 'IS_RECORD_TABLE_WIDGET_ENABLED' as const,
   IS_DATASOURCE_MIGRATED: 'IS_DATASOURCE_MIGRATED' as const
}

export const enumConfigSource = {
   ENVIRONMENT: 'ENVIRONMENT' as const,
   DATABASE: 'DATABASE' as const,
   DEFAULT: 'DEFAULT' as const
}

export const enumConfigVariableType = {
   BOOLEAN: 'BOOLEAN' as const,
   NUMBER: 'NUMBER' as const,
   ARRAY: 'ARRAY' as const,
   STRING: 'STRING' as const,
   ENUM: 'ENUM' as const,
   JSON: 'JSON' as const
}

export const enumConfigVariablesGroup = {
   SERVER_CONFIG: 'SERVER_CONFIG' as const,
   RATE_LIMITING: 'RATE_LIMITING' as const,
   STORAGE_CONFIG: 'STORAGE_CONFIG' as const,
   GOOGLE_AUTH: 'GOOGLE_AUTH' as const,
   MICROSOFT_AUTH: 'MICROSOFT_AUTH' as const,
   EMAIL_SETTINGS: 'EMAIL_SETTINGS' as const,
   LOGGING: 'LOGGING' as const,
   ADVANCED_SETTINGS: 'ADVANCED_SETTINGS' as const,
   BILLING_CONFIG: 'BILLING_CONFIG' as const,
   CAPTCHA_CONFIG: 'CAPTCHA_CONFIG' as const,
   CLOUDFLARE_CONFIG: 'CLOUDFLARE_CONFIG' as const,
   LLM: 'LLM' as const,
   LOGIC_FUNCTION_CONFIG: 'LOGIC_FUNCTION_CONFIG' as const,
   CODE_INTERPRETER_CONFIG: 'CODE_INTERPRETER_CONFIG' as const,
   SSL: 'SSL' as const,
   SUPPORT_CHAT_CONFIG: 'SUPPORT_CHAT_CONFIG' as const,
   ANALYTICS_CONFIG: 'ANALYTICS_CONFIG' as const,
   TOKENS_DURATION: 'TOKENS_DURATION' as const,
   AWS_SES_SETTINGS: 'AWS_SES_SETTINGS' as const
}

export const enumJobState = {
   COMPLETED: 'COMPLETED' as const,
   FAILED: 'FAILED' as const,
   ACTIVE: 'ACTIVE' as const,
   WAITING: 'WAITING' as const,
   DELAYED: 'DELAYED' as const,
   PRIORITIZED: 'PRIORITIZED' as const,
   WAITING_CHILDREN: 'WAITING_CHILDREN' as const
}

export const enumHealthIndicatorId = {
   database: 'database' as const,
   redis: 'redis' as const,
   worker: 'worker' as const,
   connectedAccount: 'connectedAccount' as const,
   app: 'app' as const
}

export const enumAdminPanelHealthServiceStatus = {
   OPERATIONAL: 'OPERATIONAL' as const,
   OUTAGE: 'OUTAGE' as const
}

export const enumQueueMetricsTimeRange = {
   SevenDays: 'SevenDays' as const,
   OneDay: 'OneDay' as const,
   TwelveHours: 'TwelveHours' as const,
   FourHours: 'FourHours' as const,
   OneHour: 'OneHour' as const
}

export const enumBillingEntitlementKey = {
   SSO: 'SSO' as const,
   CUSTOM_DOMAIN: 'CUSTOM_DOMAIN' as const,
   RLS: 'RLS' as const,
   AUDIT_LOGS: 'AUDIT_LOGS' as const
}

export const enumRelationType = {
   ONE_TO_MANY: 'ONE_TO_MANY' as const,
   MANY_TO_ONE: 'MANY_TO_ONE' as const
}

export const enumEmailingDomainDriver = {
   AWS_SES: 'AWS_SES' as const
}

export const enumEmailingDomainStatus = {
   PENDING: 'PENDING' as const,
   VERIFIED: 'VERIFIED' as const,
   FAILED: 'FAILED' as const,
   TEMPORARY_FAILURE: 'TEMPORARY_FAILURE' as const
}

export const enumEngineComponentKey = {
   NAVIGATE_TO_NEXT_RECORD: 'NAVIGATE_TO_NEXT_RECORD' as const,
   NAVIGATE_TO_PREVIOUS_RECORD: 'NAVIGATE_TO_PREVIOUS_RECORD' as const,
   CREATE_NEW_RECORD: 'CREATE_NEW_RECORD' as const,
   DELETE_RECORDS: 'DELETE_RECORDS' as const,
   RESTORE_RECORDS: 'RESTORE_RECORDS' as const,
   DESTROY_RECORDS: 'DESTROY_RECORDS' as const,
   ADD_TO_FAVORITES: 'ADD_TO_FAVORITES' as const,
   REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES' as const,
   EXPORT_NOTE_TO_PDF: 'EXPORT_NOTE_TO_PDF' as const,
   EXPORT_RECORDS: 'EXPORT_RECORDS' as const,
   UPDATE_MULTIPLE_RECORDS: 'UPDATE_MULTIPLE_RECORDS' as const,
   MERGE_MULTIPLE_RECORDS: 'MERGE_MULTIPLE_RECORDS' as const,
   IMPORT_RECORDS: 'IMPORT_RECORDS' as const,
   EXPORT_VIEW: 'EXPORT_VIEW' as const,
   SEE_DELETED_RECORDS: 'SEE_DELETED_RECORDS' as const,
   CREATE_NEW_VIEW: 'CREATE_NEW_VIEW' as const,
   HIDE_DELETED_RECORDS: 'HIDE_DELETED_RECORDS' as const,
   EDIT_RECORD_PAGE_LAYOUT: 'EDIT_RECORD_PAGE_LAYOUT' as const,
   EDIT_DASHBOARD_LAYOUT: 'EDIT_DASHBOARD_LAYOUT' as const,
   SAVE_DASHBOARD_LAYOUT: 'SAVE_DASHBOARD_LAYOUT' as const,
   CANCEL_DASHBOARD_LAYOUT: 'CANCEL_DASHBOARD_LAYOUT' as const,
   DUPLICATE_DASHBOARD: 'DUPLICATE_DASHBOARD' as const,
   ACTIVATE_WORKFLOW: 'ACTIVATE_WORKFLOW' as const,
   DEACTIVATE_WORKFLOW: 'DEACTIVATE_WORKFLOW' as const,
   DISCARD_DRAFT_WORKFLOW: 'DISCARD_DRAFT_WORKFLOW' as const,
   TEST_WORKFLOW: 'TEST_WORKFLOW' as const,
   SEE_ACTIVE_VERSION_WORKFLOW: 'SEE_ACTIVE_VERSION_WORKFLOW' as const,
   SEE_RUNS_WORKFLOW: 'SEE_RUNS_WORKFLOW' as const,
   SEE_VERSIONS_WORKFLOW: 'SEE_VERSIONS_WORKFLOW' as const,
   ADD_NODE_WORKFLOW: 'ADD_NODE_WORKFLOW' as const,
   TIDY_UP_WORKFLOW: 'TIDY_UP_WORKFLOW' as const,
   DUPLICATE_WORKFLOW: 'DUPLICATE_WORKFLOW' as const,
   SEE_VERSION_WORKFLOW_RUN: 'SEE_VERSION_WORKFLOW_RUN' as const,
   SEE_WORKFLOW_WORKFLOW_RUN: 'SEE_WORKFLOW_WORKFLOW_RUN' as const,
   STOP_WORKFLOW_RUN: 'STOP_WORKFLOW_RUN' as const,
   SEE_RUNS_WORKFLOW_VERSION: 'SEE_RUNS_WORKFLOW_VERSION' as const,
   SEE_WORKFLOW_WORKFLOW_VERSION: 'SEE_WORKFLOW_WORKFLOW_VERSION' as const,
   USE_AS_DRAFT_WORKFLOW_VERSION: 'USE_AS_DRAFT_WORKFLOW_VERSION' as const,
   SEE_VERSIONS_WORKFLOW_VERSION: 'SEE_VERSIONS_WORKFLOW_VERSION' as const,
   SEARCH_RECORDS: 'SEARCH_RECORDS' as const,
   SEARCH_RECORDS_FALLBACK: 'SEARCH_RECORDS_FALLBACK' as const,
   ASK_AI: 'ASK_AI' as const,
   VIEW_PREVIOUS_AI_CHATS: 'VIEW_PREVIOUS_AI_CHATS' as const,
   NAVIGATION: 'NAVIGATION' as const,
   TRIGGER_WORKFLOW_VERSION: 'TRIGGER_WORKFLOW_VERSION' as const,
   FRONT_COMPONENT_RENDERER: 'FRONT_COMPONENT_RENDERER' as const,
   REPLY_TO_EMAIL_THREAD: 'REPLY_TO_EMAIL_THREAD' as const,
   COMPOSE_EMAIL: 'COMPOSE_EMAIL' as const,
   GO_TO_PEOPLE: 'GO_TO_PEOPLE' as const,
   GO_TO_COMPANIES: 'GO_TO_COMPANIES' as const,
   GO_TO_DASHBOARDS: 'GO_TO_DASHBOARDS' as const,
   GO_TO_OPPORTUNITIES: 'GO_TO_OPPORTUNITIES' as const,
   GO_TO_SETTINGS: 'GO_TO_SETTINGS' as const,
   GO_TO_TASKS: 'GO_TO_TASKS' as const,
   GO_TO_NOTES: 'GO_TO_NOTES' as const,
   GO_TO_WORKFLOWS: 'GO_TO_WORKFLOWS' as const,
   GO_TO_RUNS: 'GO_TO_RUNS' as const,
   DELETE_SINGLE_RECORD: 'DELETE_SINGLE_RECORD' as const,
   DELETE_MULTIPLE_RECORDS: 'DELETE_MULTIPLE_RECORDS' as const,
   RESTORE_SINGLE_RECORD: 'RESTORE_SINGLE_RECORD' as const,
   RESTORE_MULTIPLE_RECORDS: 'RESTORE_MULTIPLE_RECORDS' as const,
   DESTROY_SINGLE_RECORD: 'DESTROY_SINGLE_RECORD' as const,
   DESTROY_MULTIPLE_RECORDS: 'DESTROY_MULTIPLE_RECORDS' as const,
   EXPORT_FROM_RECORD_INDEX: 'EXPORT_FROM_RECORD_INDEX' as const,
   EXPORT_FROM_RECORD_SHOW: 'EXPORT_FROM_RECORD_SHOW' as const,
   EXPORT_MULTIPLE_RECORDS: 'EXPORT_MULTIPLE_RECORDS' as const
}

export const enumCommandMenuItemAvailabilityType = {
   GLOBAL: 'GLOBAL' as const,
   RECORD_SELECTION: 'RECORD_SELECTION' as const,
   FALLBACK: 'FALLBACK' as const
}

export const enumCalendarChannelSyncStatus = {
   NOT_SYNCED: 'NOT_SYNCED' as const,
   ONGOING: 'ONGOING' as const,
   ACTIVE: 'ACTIVE' as const,
   FAILED_INSUFFICIENT_PERMISSIONS: 'FAILED_INSUFFICIENT_PERMISSIONS' as const,
   FAILED_UNKNOWN: 'FAILED_UNKNOWN' as const
}

export const enumCalendarChannelSyncStage = {
   PENDING_CONFIGURATION: 'PENDING_CONFIGURATION' as const,
   CALENDAR_EVENT_LIST_FETCH_PENDING: 'CALENDAR_EVENT_LIST_FETCH_PENDING' as const,
   CALENDAR_EVENT_LIST_FETCH_SCHEDULED: 'CALENDAR_EVENT_LIST_FETCH_SCHEDULED' as const,
   CALENDAR_EVENT_LIST_FETCH_ONGOING: 'CALENDAR_EVENT_LIST_FETCH_ONGOING' as const,
   CALENDAR_EVENTS_IMPORT_PENDING: 'CALENDAR_EVENTS_IMPORT_PENDING' as const,
   CALENDAR_EVENTS_IMPORT_SCHEDULED: 'CALENDAR_EVENTS_IMPORT_SCHEDULED' as const,
   CALENDAR_EVENTS_IMPORT_ONGOING: 'CALENDAR_EVENTS_IMPORT_ONGOING' as const,
   FAILED: 'FAILED' as const
}

export const enumCalendarChannelVisibility = {
   METADATA: 'METADATA' as const,
   SHARE_EVERYTHING: 'SHARE_EVERYTHING' as const
}

export const enumCalendarChannelContactAutoCreationPolicy = {
   AS_PARTICIPANT_AND_ORGANIZER: 'AS_PARTICIPANT_AND_ORGANIZER' as const,
   AS_PARTICIPANT: 'AS_PARTICIPANT' as const,
   AS_ORGANIZER: 'AS_ORGANIZER' as const,
   NONE: 'NONE' as const
}

export const enumMessageChannelVisibility = {
   METADATA: 'METADATA' as const,
   SUBJECT: 'SUBJECT' as const,
   SHARE_EVERYTHING: 'SHARE_EVERYTHING' as const
}

export const enumMessageChannelType = {
   EMAIL: 'EMAIL' as const,
   SMS: 'SMS' as const
}

export const enumMessageChannelContactAutoCreationPolicy = {
   SENT_AND_RECEIVED: 'SENT_AND_RECEIVED' as const,
   SENT: 'SENT' as const,
   NONE: 'NONE' as const
}

export const enumMessageFolderImportPolicy = {
   ALL_FOLDERS: 'ALL_FOLDERS' as const,
   SELECTED_FOLDERS: 'SELECTED_FOLDERS' as const
}

export const enumMessageChannelPendingGroupEmailsAction = {
   GROUP_EMAILS_DELETION: 'GROUP_EMAILS_DELETION' as const,
   GROUP_EMAILS_IMPORT: 'GROUP_EMAILS_IMPORT' as const,
   NONE: 'NONE' as const
}

export const enumMessageChannelSyncStatus = {
   NOT_SYNCED: 'NOT_SYNCED' as const,
   ONGOING: 'ONGOING' as const,
   ACTIVE: 'ACTIVE' as const,
   FAILED_INSUFFICIENT_PERMISSIONS: 'FAILED_INSUFFICIENT_PERMISSIONS' as const,
   FAILED_UNKNOWN: 'FAILED_UNKNOWN' as const
}

export const enumMessageChannelSyncStage = {
   PENDING_CONFIGURATION: 'PENDING_CONFIGURATION' as const,
   MESSAGE_LIST_FETCH_PENDING: 'MESSAGE_LIST_FETCH_PENDING' as const,
   MESSAGE_LIST_FETCH_SCHEDULED: 'MESSAGE_LIST_FETCH_SCHEDULED' as const,
   MESSAGE_LIST_FETCH_ONGOING: 'MESSAGE_LIST_FETCH_ONGOING' as const,
   MESSAGES_IMPORT_PENDING: 'MESSAGES_IMPORT_PENDING' as const,
   MESSAGES_IMPORT_SCHEDULED: 'MESSAGES_IMPORT_SCHEDULED' as const,
   MESSAGES_IMPORT_ONGOING: 'MESSAGES_IMPORT_ONGOING' as const,
   FAILED: 'FAILED' as const
}

export const enumMessageFolderPendingSyncAction = {
   FOLDER_DELETION: 'FOLDER_DELETION' as const,
   NONE: 'NONE' as const
}

export const enumAllMetadataName = {
   fieldMetadata: 'fieldMetadata' as const,
   objectMetadata: 'objectMetadata' as const,
   view: 'view' as const,
   viewField: 'viewField' as const,
   viewFieldGroup: 'viewFieldGroup' as const,
   viewGroup: 'viewGroup' as const,
   viewSort: 'viewSort' as const,
   rowLevelPermissionPredicate: 'rowLevelPermissionPredicate' as const,
   rowLevelPermissionPredicateGroup: 'rowLevelPermissionPredicateGroup' as const,
   viewFilterGroup: 'viewFilterGroup' as const,
   index: 'index' as const,
   logicFunction: 'logicFunction' as const,
   viewFilter: 'viewFilter' as const,
   role: 'role' as const,
   roleTarget: 'roleTarget' as const,
   agent: 'agent' as const,
   skill: 'skill' as const,
   pageLayout: 'pageLayout' as const,
   pageLayoutWidget: 'pageLayoutWidget' as const,
   pageLayoutTab: 'pageLayoutTab' as const,
   commandMenuItem: 'commandMenuItem' as const,
   navigationMenuItem: 'navigationMenuItem' as const,
   permissionFlag: 'permissionFlag' as const,
   objectPermission: 'objectPermission' as const,
   fieldPermission: 'fieldPermission' as const,
   frontComponent: 'frontComponent' as const,
   webhook: 'webhook' as const
}

export const enumAgentChatThreadSortFields = {
   id: 'id' as const,
   updatedAt: 'updatedAt' as const
}

export const enumSortDirection = {
   ASC: 'ASC' as const,
   DESC: 'DESC' as const
}

export const enumSortNulls = {
   NULLS_FIRST: 'NULLS_FIRST' as const,
   NULLS_LAST: 'NULLS_LAST' as const
}

export const enumEventLogTable = {
   WORKSPACE_EVENT: 'WORKSPACE_EVENT' as const,
   PAGEVIEW: 'PAGEVIEW' as const,
   OBJECT_EVENT: 'OBJECT_EVENT' as const,
   USAGE_EVENT: 'USAGE_EVENT' as const
}

export const enumUsageOperationType = {
   AI_CHAT_TOKEN: 'AI_CHAT_TOKEN' as const,
   AI_WORKFLOW_TOKEN: 'AI_WORKFLOW_TOKEN' as const,
   WORKFLOW_EXECUTION: 'WORKFLOW_EXECUTION' as const,
   CODE_EXECUTION: 'CODE_EXECUTION' as const,
   WEB_SEARCH: 'WEB_SEARCH' as const
}

export const enumAnalyticsType = {
   PAGEVIEW: 'PAGEVIEW' as const,
   TRACK: 'TRACK' as const
}

export const enumAiModelRole = {
   FAST: 'FAST' as const,
   SMART: 'SMART' as const
}

export const enumWorkspaceMigrationActionType = {
   delete: 'delete' as const,
   create: 'create' as const,
   update: 'update' as const
}

export const enumFileFolder = {
   ProfilePicture: 'ProfilePicture' as const,
   WorkspaceLogo: 'WorkspaceLogo' as const,
   Attachment: 'Attachment' as const,
   PersonPicture: 'PersonPicture' as const,
   CorePicture: 'CorePicture' as const,
   File: 'File' as const,
   AgentChat: 'AgentChat' as const,
   BuiltLogicFunction: 'BuiltLogicFunction' as const,
   BuiltFrontComponent: 'BuiltFrontComponent' as const,
   PublicAsset: 'PublicAsset' as const,
   Source: 'Source' as const,
   FilesField: 'FilesField' as const,
   Dependencies: 'Dependencies' as const,
   Workflow: 'Workflow' as const,
   AppTarball: 'AppTarball' as const,
   GeneratedSdkClient: 'GeneratedSdkClient' as const
}
