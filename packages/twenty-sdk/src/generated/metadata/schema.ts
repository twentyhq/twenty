// @ts-nocheck
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Scalars = {
    String: string,
    UUID: any,
    DateTime: any,
    Boolean: boolean,
    JSON: any,
    Int: number,
    Float: number,
    JSONObject: any,
    ConnectionCursor: any,
    ID: string,
    Date: any,
    Upload: any,
}

export type BillingProductDTO = (BillingLicensedProduct | BillingMeteredProduct) & { __isUnion?: true }

export interface ApiKey {
    id: Scalars['UUID']
    name: Scalars['String']
    expiresAt: Scalars['DateTime']
    revokedAt: (Scalars['DateTime'] | null)
    workspaceId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    workspace: Workspace
    role: Role
    __typename: 'ApiKey'
}

export interface FeatureFlag {
    id: Scalars['UUID']
    key: FeatureFlagKey
    workspaceId: Scalars['UUID']
    value: Scalars['Boolean']
    __typename: 'FeatureFlag'
}

export type FeatureFlagKey = 'IS_AIRTABLE_INTEGRATION_ENABLED' | 'IS_POSTGRESQL_INTEGRATION_ENABLED' | 'IS_STRIPE_INTEGRATION_ENABLED' | 'IS_UNIQUE_INDEXES_ENABLED' | 'IS_JSON_FILTER_ENABLED' | 'IS_AI_ENABLED' | 'IS_APPLICATION_ENABLED' | 'IS_IMAP_SMTP_CALDAV_ENABLED' | 'IS_MORPH_RELATION_ENABLED' | 'IS_RELATION_CONNECT_ENABLED' | 'IS_CORE_VIEW_SYNCING_ENABLED' | 'IS_CORE_VIEW_ENABLED' | 'IS_WORKSPACE_MIGRATION_V2_ENABLED' | 'IS_PAGE_LAYOUT_ENABLED' | 'IS_RECORD_PAGE_LAYOUT_ENABLED' | 'IS_MESSAGE_FOLDER_CONTROL_ENABLED' | 'IS_CALENDAR_VIEW_ENABLED' | 'IS_GROUP_BY_ENABLED' | 'IS_PUBLIC_DOMAIN_ENABLED' | 'IS_EMAILING_DOMAIN_ENABLED' | 'IS_DYNAMIC_SEARCH_FIELDS_ENABLED' | 'IS_COMMON_API_ENABLED'

export interface TwoFactorAuthenticationMethodDTO {
    twoFactorAuthenticationMethodId: Scalars['UUID']
    status: Scalars['String']
    strategy: Scalars['String']
    __typename: 'TwoFactorAuthenticationMethodDTO'
}

export interface ObjectPermission {
    objectMetadataId: Scalars['UUID']
    canReadObjectRecords: (Scalars['Boolean'] | null)
    canUpdateObjectRecords: (Scalars['Boolean'] | null)
    canSoftDeleteObjectRecords: (Scalars['Boolean'] | null)
    canDestroyObjectRecords: (Scalars['Boolean'] | null)
    restrictedFields: (Scalars['JSON'] | null)
    __typename: 'ObjectPermission'
}

export interface UserWorkspace {
    id: Scalars['UUID']
    user: User
    userId: Scalars['UUID']
    workspace: (Workspace | null)
    workspaceId: Scalars['UUID']
    locale: Scalars['String']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt: (Scalars['DateTime'] | null)
    permissionFlags: (PermissionFlagType[] | null)
    objectPermissions: (ObjectPermission[] | null)
    objectsPermissions: (ObjectPermission[] | null)
    twoFactorAuthenticationMethodSummary: (TwoFactorAuthenticationMethodDTO[] | null)
    __typename: 'UserWorkspace'
}

export type PermissionFlagType = 'API_KEYS_AND_WEBHOOKS' | 'WORKSPACE' | 'WORKSPACE_MEMBERS' | 'ROLES' | 'DATA_MODEL' | 'ADMIN_PANEL' | 'SECURITY' | 'WORKFLOWS' | 'IMPERSONATE' | 'SEND_EMAIL_TOOL' | 'IMPORT_CSV' | 'EXPORT_CSV'

export interface Webhook {
    id: Scalars['UUID']
    targetUrl: Scalars['String']
    operations: Scalars['String'][]
    description: (Scalars['String'] | null)
    secret: Scalars['String']
    workspaceId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt: (Scalars['DateTime'] | null)
    workspace: Workspace
    __typename: 'Webhook'
}

export interface Agent {
    id: Scalars['UUID']
    standardId: (Scalars['UUID'] | null)
    name: Scalars['String']
    label: Scalars['String']
    icon: (Scalars['String'] | null)
    description: (Scalars['String'] | null)
    prompt: Scalars['String']
    modelId: Scalars['String']
    responseFormat: (Scalars['JSON'] | null)
    roleId: (Scalars['UUID'] | null)
    isCustom: Scalars['Boolean']
    applicationId: (Scalars['UUID'] | null)
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    modelConfiguration: (Scalars['JSON'] | null)
    __typename: 'Agent'
}

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
    avatarUrl: (Scalars['String'] | null)
    locale: (Scalars['String'] | null)
    calendarStartDay: (Scalars['Int'] | null)
    timeZone: (Scalars['String'] | null)
    dateFormat: (WorkspaceMemberDateFormatEnum | null)
    timeFormat: (WorkspaceMemberTimeFormatEnum | null)
    roles: (Role[] | null)
    userWorkspaceId: (Scalars['UUID'] | null)
    numberFormat: (WorkspaceMemberNumberFormatEnum | null)
    __typename: 'WorkspaceMember'
}


/** Date format as Month first, Day first, Year first or system as default */
export type WorkspaceMemberDateFormatEnum = 'SYSTEM' | 'MONTH_FIRST' | 'DAY_FIRST' | 'YEAR_FIRST'


/** Time time as Military, Standard or system as default */
export type WorkspaceMemberTimeFormatEnum = 'SYSTEM' | 'HOUR_12' | 'HOUR_24'


/** Number format for displaying numbers */
export type WorkspaceMemberNumberFormatEnum = 'SYSTEM' | 'COMMAS_AND_DOT' | 'SPACES_AND_COMMA' | 'DOTS_AND_COMMA' | 'APOSTROPHE_AND_DOT'

export interface FieldPermission {
    id: Scalars['UUID']
    objectMetadataId: Scalars['UUID']
    fieldMetadataId: Scalars['UUID']
    roleId: Scalars['UUID']
    canReadFieldValue: (Scalars['Boolean'] | null)
    canUpdateFieldValue: (Scalars['Boolean'] | null)
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
    revokedAt: (Scalars['DateTime'] | null)
    __typename: 'ApiKeyForRole'
}

export interface Role {
    id: Scalars['UUID']
    standardId: (Scalars['UUID'] | null)
    label: Scalars['String']
    description: (Scalars['String'] | null)
    icon: (Scalars['String'] | null)
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
    permissionFlags: (PermissionFlag[] | null)
    objectPermissions: (ObjectPermission[] | null)
    fieldPermissions: (FieldPermission[] | null)
    __typename: 'Role'
}

export interface CoreViewField {
    id: Scalars['UUID']
    fieldMetadataId: Scalars['UUID']
    isVisible: Scalars['Boolean']
    size: Scalars['Float']
    position: Scalars['Float']
    aggregateOperation: (AggregateOperations | null)
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt: (Scalars['DateTime'] | null)
    __typename: 'CoreViewField'
}

export type AggregateOperations = 'MIN' | 'MAX' | 'AVG' | 'SUM' | 'COUNT' | 'COUNT_UNIQUE_VALUES' | 'COUNT_EMPTY' | 'COUNT_NOT_EMPTY' | 'COUNT_TRUE' | 'COUNT_FALSE' | 'PERCENTAGE_EMPTY' | 'PERCENTAGE_NOT_EMPTY'

export interface CoreViewFilterGroup {
    id: Scalars['UUID']
    parentViewFilterGroupId: (Scalars['UUID'] | null)
    logicalOperator: ViewFilterGroupLogicalOperator
    positionInViewFilterGroup: (Scalars['Float'] | null)
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt: (Scalars['DateTime'] | null)
    __typename: 'CoreViewFilterGroup'
}

export type ViewFilterGroupLogicalOperator = 'AND' | 'OR' | 'NOT'

export interface CoreViewFilter {
    id: Scalars['UUID']
    fieldMetadataId: Scalars['UUID']
    operand: ViewFilterOperand
    value: Scalars['JSON']
    viewFilterGroupId: (Scalars['UUID'] | null)
    positionInViewFilterGroup: (Scalars['Float'] | null)
    subFieldName: (Scalars['String'] | null)
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt: (Scalars['DateTime'] | null)
    __typename: 'CoreViewFilter'
}

export type ViewFilterOperand = 'IS' | 'IS_NOT_NULL' | 'IS_NOT' | 'LESS_THAN_OR_EQUAL' | 'GREATER_THAN_OR_EQUAL' | 'IS_BEFORE' | 'IS_AFTER' | 'CONTAINS' | 'DOES_NOT_CONTAIN' | 'IS_EMPTY' | 'IS_NOT_EMPTY' | 'IS_RELATIVE' | 'IS_IN_PAST' | 'IS_IN_FUTURE' | 'IS_TODAY' | 'VECTOR_SEARCH'

export interface CoreViewGroup {
    id: Scalars['UUID']
    fieldMetadataId: Scalars['UUID']
    isVisible: Scalars['Boolean']
    fieldValue: Scalars['String']
    position: Scalars['Float']
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt: (Scalars['DateTime'] | null)
    __typename: 'CoreViewGroup'
}

export interface CoreViewSort {
    id: Scalars['UUID']
    fieldMetadataId: Scalars['UUID']
    direction: ViewSortDirection
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt: (Scalars['DateTime'] | null)
    __typename: 'CoreViewSort'
}

export type ViewSortDirection = 'ASC' | 'DESC'

export interface CoreView {
    id: Scalars['UUID']
    name: Scalars['String']
    objectMetadataId: Scalars['UUID']
    type: ViewType
    key: (ViewKey | null)
    icon: Scalars['String']
    position: Scalars['Float']
    isCompact: Scalars['Boolean']
    isCustom: Scalars['Boolean']
    openRecordIn: ViewOpenRecordIn
    kanbanAggregateOperation: (AggregateOperations | null)
    kanbanAggregateOperationFieldMetadataId: (Scalars['UUID'] | null)
    calendarFieldMetadataId: (Scalars['UUID'] | null)
    workspaceId: Scalars['UUID']
    anyFieldFilterValue: (Scalars['String'] | null)
    calendarLayout: (ViewCalendarLayout | null)
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt: (Scalars['DateTime'] | null)
    viewFields: CoreViewField[]
    viewFilters: CoreViewFilter[]
    viewFilterGroups: CoreViewFilterGroup[]
    viewSorts: CoreViewSort[]
    viewGroups: CoreViewGroup[]
    __typename: 'CoreView'
}

export type ViewType = 'TABLE' | 'KANBAN' | 'CALENDAR'

export type ViewKey = 'INDEX'

export type ViewOpenRecordIn = 'SIDE_PANEL' | 'RECORD_PAGE'

export type ViewCalendarLayout = 'DAY' | 'WEEK' | 'MONTH'

export interface Workspace {
    id: Scalars['UUID']
    displayName: (Scalars['String'] | null)
    logo: (Scalars['String'] | null)
    inviteHash: (Scalars['String'] | null)
    deletedAt: (Scalars['DateTime'] | null)
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    allowImpersonation: Scalars['Boolean']
    isPublicInviteLinkEnabled: Scalars['Boolean']
    trashRetentionDays: Scalars['Float']
    workspaceMembersCount: (Scalars['Float'] | null)
    activationStatus: WorkspaceActivationStatus
    views: (CoreView[] | null)
    viewFields: (CoreViewField[] | null)
    viewFilters: (CoreViewFilter[] | null)
    viewFilterGroups: (CoreViewFilterGroup[] | null)
    viewGroups: (CoreViewGroup[] | null)
    viewSorts: (CoreViewSort[] | null)
    metadataVersion: Scalars['Float']
    databaseUrl: Scalars['String']
    databaseSchema: Scalars['String']
    subdomain: Scalars['String']
    customDomain: (Scalars['String'] | null)
    isGoogleAuthEnabled: Scalars['Boolean']
    isTwoFactorAuthenticationEnforced: Scalars['Boolean']
    isPasswordAuthEnabled: Scalars['Boolean']
    isMicrosoftAuthEnabled: Scalars['Boolean']
    isCustomDomainEnabled: Scalars['Boolean']
    defaultRole: (Role | null)
    defaultAgent: (Agent | null)
    version: (Scalars['String'] | null)
    featureFlags: (FeatureFlagDTO[] | null)
    billingSubscriptions: BillingSubscription[]
    currentBillingSubscription: (BillingSubscription | null)
    hasValidEnterpriseKey: Scalars['Boolean']
    workspaceUrls: WorkspaceUrls
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
    defaultAvatarUrl: (Scalars['String'] | null)
    isEmailVerified: Scalars['Boolean']
    disabled: (Scalars['Boolean'] | null)
    passwordHash: (Scalars['String'] | null)
    canImpersonate: Scalars['Boolean']
    canAccessFullAdminPanel: Scalars['Boolean']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt: (Scalars['DateTime'] | null)
    locale: Scalars['String']
    workspaceMember: (WorkspaceMember | null)
    userWorkspaces: UserWorkspace[]
    onboardingStatus: (OnboardingStatus | null)
    currentWorkspace: (Workspace | null)
    currentUserWorkspace: (UserWorkspace | null)
    userVars: (Scalars['JSONObject'] | null)
    workspaceMembers: (WorkspaceMember[] | null)
    deletedWorkspaceMembers: (DeletedWorkspaceMember[] | null)
    supportUserHash: (Scalars['String'] | null)
    workspaces: UserWorkspace[]
    availableWorkspaces: AvailableWorkspaces
    __typename: 'User'
}


/** Onboarding status */
export type OnboardingStatus = 'PLAN_REQUIRED' | 'WORKSPACE_ACTIVATION' | 'PROFILE_CREATION' | 'SYNC_EMAIL' | 'INVITE_TEAM' | 'BOOK_ONBOARDING' | 'COMPLETED'

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
    objectMetadataId: (Scalars['UUID'] | null)
    gridPosition: GridPosition
    configuration: (WidgetConfiguration | null)
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt: (Scalars['DateTime'] | null)
    __typename: 'PageLayoutWidget'
}

export type WidgetType = 'VIEW' | 'IFRAME' | 'FIELDS' | 'GRAPH'

export type WidgetConfiguration = (BarChartConfiguration | LineChartConfiguration | PieChartConfiguration | NumberChartConfiguration | GaugeChartConfiguration | IframeConfiguration) & { __isUnion?: true }

export interface BarChartConfiguration {
    graphType: GraphType
    aggregateFieldMetadataId: Scalars['UUID']
    aggregateOperation: ExtendedAggregateOperations
    primaryAxisGroupByFieldMetadataId: Scalars['UUID']
    primaryAxisGroupBySubFieldName: (Scalars['String'] | null)
    primaryAxisOrderBy: (GraphOrderBy | null)
    secondaryAxisGroupByFieldMetadataId: (Scalars['UUID'] | null)
    secondaryAxisGroupBySubFieldName: (Scalars['String'] | null)
    secondaryAxisOrderBy: (GraphOrderBy | null)
    omitNullValues: (Scalars['Boolean'] | null)
    axisNameDisplay: (AxisNameDisplay | null)
    displayDataLabel: (Scalars['Boolean'] | null)
    rangeMin: (Scalars['Float'] | null)
    rangeMax: (Scalars['Float'] | null)
    description: (Scalars['String'] | null)
    color: (Scalars['String'] | null)
    filter: (Scalars['JSON'] | null)
    groupMode: (BarChartGroupMode | null)
    __typename: 'BarChartConfiguration'
}


/** Type of graph widget */
export type GraphType = 'NUMBER' | 'GAUGE' | 'PIE' | 'VERTICAL_BAR' | 'HORIZONTAL_BAR' | 'LINE'

export type ExtendedAggregateOperations = 'MIN' | 'MAX' | 'AVG' | 'SUM' | 'COUNT' | 'COUNT_UNIQUE_VALUES' | 'COUNT_EMPTY' | 'COUNT_NOT_EMPTY' | 'COUNT_TRUE' | 'COUNT_FALSE' | 'PERCENTAGE_EMPTY' | 'PERCENTAGE_NOT_EMPTY' | 'EARLIEST' | 'LATEST'


/** Order by options for graph widgets */
export type GraphOrderBy = 'FIELD_ASC' | 'FIELD_DESC' | 'VALUE_ASC' | 'VALUE_DESC'


/** Which axes should display labels */
export type AxisNameDisplay = 'NONE' | 'X' | 'Y' | 'BOTH'


/** Display mode for bar charts with secondary grouping */
export type BarChartGroupMode = 'STACKED' | 'GROUPED'

export interface LineChartConfiguration {
    graphType: GraphType
    aggregateFieldMetadataId: Scalars['UUID']
    aggregateOperation: ExtendedAggregateOperations
    primaryAxisGroupByFieldMetadataId: Scalars['UUID']
    primaryAxisGroupBySubFieldName: (Scalars['String'] | null)
    primaryAxisOrderBy: (GraphOrderBy | null)
    secondaryAxisGroupByFieldMetadataId: (Scalars['UUID'] | null)
    secondaryAxisGroupBySubFieldName: (Scalars['String'] | null)
    secondaryAxisOrderBy: (GraphOrderBy | null)
    omitNullValues: (Scalars['Boolean'] | null)
    axisNameDisplay: (AxisNameDisplay | null)
    displayDataLabel: (Scalars['Boolean'] | null)
    rangeMin: (Scalars['Float'] | null)
    rangeMax: (Scalars['Float'] | null)
    description: (Scalars['String'] | null)
    color: (Scalars['String'] | null)
    filter: (Scalars['JSON'] | null)
    __typename: 'LineChartConfiguration'
}

export interface PieChartConfiguration {
    graphType: GraphType
    aggregateFieldMetadataId: Scalars['UUID']
    aggregateOperation: ExtendedAggregateOperations
    groupByFieldMetadataId: Scalars['UUID']
    groupBySubFieldName: (Scalars['String'] | null)
    orderBy: (GraphOrderBy | null)
    displayDataLabel: (Scalars['Boolean'] | null)
    description: (Scalars['String'] | null)
    color: (Scalars['String'] | null)
    filter: (Scalars['JSON'] | null)
    __typename: 'PieChartConfiguration'
}

export interface NumberChartConfiguration {
    graphType: GraphType
    aggregateFieldMetadataId: Scalars['UUID']
    aggregateOperation: ExtendedAggregateOperations
    label: (Scalars['String'] | null)
    displayDataLabel: (Scalars['Boolean'] | null)
    format: (Scalars['String'] | null)
    description: (Scalars['String'] | null)
    filter: (Scalars['JSON'] | null)
    __typename: 'NumberChartConfiguration'
}

export interface GaugeChartConfiguration {
    graphType: GraphType
    aggregateFieldMetadataId: Scalars['UUID']
    aggregateOperation: ExtendedAggregateOperations
    displayDataLabel: (Scalars['Boolean'] | null)
    color: (Scalars['String'] | null)
    description: (Scalars['String'] | null)
    filter: (Scalars['JSON'] | null)
    __typename: 'GaugeChartConfiguration'
}

export interface IframeConfiguration {
    url: Scalars['String']
    __typename: 'IframeConfiguration'
}

export interface PageLayoutTab {
    id: Scalars['UUID']
    title: Scalars['String']
    position: Scalars['Float']
    pageLayoutId: Scalars['UUID']
    widgets: (PageLayoutWidget[] | null)
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt: (Scalars['DateTime'] | null)
    __typename: 'PageLayoutTab'
}

export interface PageLayout {
    id: Scalars['UUID']
    name: Scalars['String']
    type: PageLayoutType
    objectMetadataId: (Scalars['UUID'] | null)
    tabs: (PageLayoutTab[] | null)
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    deletedAt: (Scalars['DateTime'] | null)
    __typename: 'PageLayout'
}

export type PageLayoutType = 'RECORD_INDEX' | 'RECORD_PAGE' | 'DASHBOARD'

export interface StandardOverrides {
    label: (Scalars['String'] | null)
    description: (Scalars['String'] | null)
    icon: (Scalars['String'] | null)
    translations: (Scalars['JSON'] | null)
    __typename: 'StandardOverrides'
}

export interface ObjectStandardOverrides {
    labelSingular: (Scalars['String'] | null)
    labelPlural: (Scalars['String'] | null)
    description: (Scalars['String'] | null)
    icon: (Scalars['String'] | null)
    translations: (Scalars['JSON'] | null)
    __typename: 'ObjectStandardOverrides'
}

export interface Object {
    id: Scalars['UUID']
    nameSingular: Scalars['String']
    namePlural: Scalars['String']
    labelSingular: Scalars['String']
    labelPlural: Scalars['String']
    description: (Scalars['String'] | null)
    icon: (Scalars['String'] | null)
    standardOverrides: (ObjectStandardOverrides | null)
    shortcut: (Scalars['String'] | null)
    isCustom: Scalars['Boolean']
    isRemote: Scalars['Boolean']
    isActive: Scalars['Boolean']
    isSystem: Scalars['Boolean']
    isUIReadOnly: Scalars['Boolean']
    isSearchable: Scalars['Boolean']
    applicationId: (Scalars['UUID'] | null)
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    labelIdentifierFieldMetadataId: (Scalars['UUID'] | null)
    imageIdentifierFieldMetadataId: (Scalars['UUID'] | null)
    isLabelSyncedWithName: Scalars['Boolean']
    duplicateCriteria: (Scalars['String'][][] | null)
    fieldsList: Field[]
    indexMetadataList: Index[]
    fields: ObjectFieldsConnection
    indexMetadatas: ObjectIndexMetadatasConnection
    __typename: 'Object'
}

export interface Field {
    id: Scalars['UUID']
    type: FieldMetadataType
    name: Scalars['String']
    label: Scalars['String']
    description: (Scalars['String'] | null)
    icon: (Scalars['String'] | null)
    standardOverrides: (StandardOverrides | null)
    isCustom: (Scalars['Boolean'] | null)
    isActive: (Scalars['Boolean'] | null)
    isSystem: (Scalars['Boolean'] | null)
    isUIReadOnly: (Scalars['Boolean'] | null)
    isNullable: (Scalars['Boolean'] | null)
    isUnique: (Scalars['Boolean'] | null)
    defaultValue: (Scalars['JSON'] | null)
    options: (Scalars['JSON'] | null)
    settings: (Scalars['JSON'] | null)
    isLabelSyncedWithName: (Scalars['Boolean'] | null)
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    relation: (Relation | null)
    morphRelations: (Relation[] | null)
    object: (Object | null)
    __typename: 'Field'
}


/** Type of the field */
export type FieldMetadataType = 'UUID' | 'TEXT' | 'PHONES' | 'EMAILS' | 'DATE_TIME' | 'DATE' | 'BOOLEAN' | 'NUMBER' | 'NUMERIC' | 'LINKS' | 'CURRENCY' | 'FULL_NAME' | 'RATING' | 'SELECT' | 'MULTI_SELECT' | 'RELATION' | 'MORPH_RELATION' | 'POSITION' | 'ADDRESS' | 'RAW_JSON' | 'RICH_TEXT' | 'RICH_TEXT_V2' | 'ACTOR' | 'ARRAY' | 'TS_VECTOR'

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
    isCustom: (Scalars['Boolean'] | null)
    isUnique: Scalars['Boolean']
    indexWhereClause: (Scalars['String'] | null)
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

export interface IndexEdge {
    /** The node containing the Index */
    node: Index
    /** Cursor for this node. */
    cursor: Scalars['ConnectionCursor']
    __typename: 'IndexEdge'
}

export interface PageInfo {
    /** true if paging forward and there are more records. */
    hasNextPage: (Scalars['Boolean'] | null)
    /** true if paging backwards and there are more records. */
    hasPreviousPage: (Scalars['Boolean'] | null)
    /** The cursor of the first returned record. */
    startCursor: (Scalars['ConnectionCursor'] | null)
    /** The cursor of the last returned record. */
    endCursor: (Scalars['ConnectionCursor'] | null)
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

export interface Analytics {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'Analytics'
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

export interface BillingPriceLicensedDTO {
    recurringInterval: SubscriptionInterval
    unitAmount: Scalars['Float']
    stripePriceId: Scalars['String']
    priceUsageType: BillingUsageType
    __typename: 'BillingPriceLicensedDTO'
}

export type SubscriptionInterval = 'Month' | 'Year'

export interface BillingPriceTierDTO {
    upTo: (Scalars['Float'] | null)
    flatAmount: (Scalars['Float'] | null)
    unitAmount: (Scalars['Float'] | null)
    __typename: 'BillingPriceTierDTO'
}

export interface BillingPriceMeteredDTO {
    tiers: BillingPriceTierDTO[]
    recurringInterval: SubscriptionInterval
    stripePriceId: Scalars['String']
    priceUsageType: BillingUsageType
    __typename: 'BillingPriceMeteredDTO'
}

export interface BillingProduct {
    name: Scalars['String']
    description: Scalars['String']
    images: (Scalars['String'][] | null)
    metadata: BillingProductMetadata
    __typename: 'BillingProduct'
}

export interface BillingLicensedProduct {
    name: Scalars['String']
    description: Scalars['String']
    images: (Scalars['String'][] | null)
    metadata: BillingProductMetadata
    prices: (BillingPriceLicensedDTO[] | null)
    __typename: 'BillingLicensedProduct'
}

export interface BillingMeteredProduct {
    name: Scalars['String']
    description: Scalars['String']
    images: (Scalars['String'][] | null)
    metadata: BillingProductMetadata
    prices: (BillingPriceMeteredDTO[] | null)
    __typename: 'BillingMeteredProduct'
}

export interface BillingSubscriptionItemDTO {
    id: Scalars['UUID']
    hasReachedCurrentPeriodCap: Scalars['Boolean']
    quantity: (Scalars['Float'] | null)
    stripePriceId: Scalars['String']
    billingProduct: BillingProductDTO
    __typename: 'BillingSubscriptionItemDTO'
}

export interface BillingSubscriptionSchedulePhaseItem {
    price: Scalars['String']
    quantity: (Scalars['Float'] | null)
    __typename: 'BillingSubscriptionSchedulePhaseItem'
}

export interface BillingSubscriptionSchedulePhase {
    start_date: Scalars['Float']
    end_date: Scalars['Float']
    items: BillingSubscriptionSchedulePhaseItem[]
    __typename: 'BillingSubscriptionSchedulePhase'
}

export interface BillingSubscription {
    id: Scalars['UUID']
    status: SubscriptionStatus
    interval: (SubscriptionInterval | null)
    billingSubscriptionItems: (BillingSubscriptionItemDTO[] | null)
    currentPeriodEnd: (Scalars['DateTime'] | null)
    metadata: Scalars['JSON']
    phases: BillingSubscriptionSchedulePhase[]
    __typename: 'BillingSubscription'
}

export type SubscriptionStatus = 'Active' | 'Canceled' | 'Incomplete' | 'IncompleteExpired' | 'PastDue' | 'Paused' | 'Trialing' | 'Unpaid'

export interface ResendEmailVerificationTokenOutput {
    success: Scalars['Boolean']
    __typename: 'ResendEmailVerificationTokenOutput'
}

export interface ApprovedAccessDomain {
    id: Scalars['UUID']
    domain: Scalars['String']
    isValidated: Scalars['Boolean']
    createdAt: Scalars['DateTime']
    __typename: 'ApprovedAccessDomain'
}

export interface File {
    id: Scalars['UUID']
    name: Scalars['String']
    fullPath: Scalars['String']
    size: Scalars['Float']
    type: Scalars['String']
    createdAt: Scalars['DateTime']
    __typename: 'File'
}

export interface SignedFileDTO {
    path: Scalars['String']
    token: Scalars['String']
    __typename: 'SignedFileDTO'
}

export interface ServerlessFunctionLayer {
    id: Scalars['UUID']
    applicationId: (Scalars['UUID'] | null)
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'ServerlessFunctionLayer'
}

export interface ServerlessFunctionExecutionResult {
    /** Execution result in JSON format */
    data: (Scalars['JSON'] | null)
    /** Execution Logs */
    logs: Scalars['String']
    /** Execution duration in milliseconds */
    duration: Scalars['Float']
    /** Execution status */
    status: ServerlessFunctionExecutionStatus
    /** Execution error in JSON format */
    error: (Scalars['JSON'] | null)
    __typename: 'ServerlessFunctionExecutionResult'
}


/** Status of the serverless function execution */
export type ServerlessFunctionExecutionStatus = 'IDLE' | 'SUCCESS' | 'ERROR'

export interface CronTrigger {
    id: Scalars['UUID']
    settings: Scalars['JSON']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'CronTrigger'
}

export interface DatabaseEventTrigger {
    id: Scalars['UUID']
    settings: Scalars['JSON']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'DatabaseEventTrigger'
}

export interface RouteTrigger {
    id: Scalars['ID']
    path: Scalars['String']
    isAuthRequired: Scalars['Boolean']
    httpMethod: HTTPMethod
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'RouteTrigger'
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ServerlessFunction {
    id: Scalars['UUID']
    name: Scalars['String']
    description: (Scalars['String'] | null)
    runtime: Scalars['String']
    timeoutSeconds: Scalars['Float']
    latestVersion: (Scalars['String'] | null)
    publishedVersions: Scalars['String'][]
    cronTriggers: (CronTrigger[] | null)
    databaseEventTriggers: (DatabaseEventTrigger[] | null)
    routeTriggers: (RouteTrigger[] | null)
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'ServerlessFunction'
}

export interface BillingEndTrialPeriodOutput {
    /** Updated subscription status */
    status: (SubscriptionStatus | null)
    /** Boolean that confirms if a payment method was found */
    hasPaymentMethod: Scalars['Boolean']
    __typename: 'BillingEndTrialPeriodOutput'
}

export interface BillingMeteredProductUsageOutput {
    productKey: BillingProductKey
    periodStart: Scalars['DateTime']
    periodEnd: Scalars['DateTime']
    usedCredits: Scalars['Float']
    grantedCredits: Scalars['Float']
    unitPriceCents: Scalars['Float']
    __typename: 'BillingMeteredProductUsageOutput'
}

export interface BillingPlanOutput {
    planKey: BillingPlanKey
    licensedProducts: BillingLicensedProduct[]
    meteredProducts: BillingMeteredProduct[]
    __typename: 'BillingPlanOutput'
}

export interface BillingSessionOutput {
    url: (Scalars['String'] | null)
    __typename: 'BillingSessionOutput'
}

export interface BillingUpdateOutput {
    /** Current billing subscription */
    currentBillingSubscription: BillingSubscription
    /** All billing subscriptions */
    billingSubscriptions: BillingSubscription[]
    __typename: 'BillingUpdateOutput'
}

export interface OnboardingStepSuccess {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'OnboardingStepSuccess'
}

export interface WorkspaceInvitation {
    id: Scalars['UUID']
    email: Scalars['String']
    expiresAt: Scalars['DateTime']
    __typename: 'WorkspaceInvitation'
}

export interface SendInvitationsOutput {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    errors: Scalars['String'][]
    result: WorkspaceInvitation[]
    __typename: 'SendInvitationsOutput'
}

export interface WorkspaceUrls {
    customUrl: (Scalars['String'] | null)
    subdomainUrl: Scalars['String']
    __typename: 'WorkspaceUrls'
}

export interface SSOConnection {
    type: IdentityProviderType
    id: Scalars['UUID']
    issuer: Scalars['String']
    name: Scalars['String']
    status: SSOIdentityProviderStatus
    __typename: 'SSOConnection'
}

export type IdentityProviderType = 'OIDC' | 'SAML'

export type SSOIdentityProviderStatus = 'Active' | 'Inactive' | 'Error'

export interface AvailableWorkspace {
    id: Scalars['UUID']
    displayName: (Scalars['String'] | null)
    loginToken: (Scalars['String'] | null)
    personalInviteToken: (Scalars['String'] | null)
    inviteHash: (Scalars['String'] | null)
    workspaceUrls: WorkspaceUrls
    logo: (Scalars['String'] | null)
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
    avatarUrl: (Scalars['String'] | null)
    userWorkspaceId: (Scalars['UUID'] | null)
    __typename: 'DeletedWorkspaceMember'
}

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

export interface FeatureFlagDTO {
    key: FeatureFlagKey
    value: Scalars['Boolean']
    __typename: 'FeatureFlagDTO'
}

export interface SSOIdentityProvider {
    id: Scalars['UUID']
    name: Scalars['String']
    type: IdentityProviderType
    status: SSOIdentityProviderStatus
    issuer: Scalars['String']
    __typename: 'SSOIdentityProvider'
}

export interface AuthProviders {
    sso: SSOIdentityProvider[]
    google: Scalars['Boolean']
    magicLink: Scalars['Boolean']
    password: Scalars['Boolean']
    microsoft: Scalars['Boolean']
    __typename: 'AuthProviders'
}

export interface PublicWorkspaceDataOutput {
    id: Scalars['UUID']
    authProviders: AuthProviders
    logo: (Scalars['String'] | null)
    displayName: (Scalars['String'] | null)
    workspaceUrls: WorkspaceUrls
    __typename: 'PublicWorkspaceDataOutput'
}

export interface AgentChatMessagePart {
    id: Scalars['UUID']
    messageId: Scalars['UUID']
    orderIndex: Scalars['Int']
    type: Scalars['String']
    textContent: (Scalars['String'] | null)
    reasoningContent: (Scalars['String'] | null)
    toolName: (Scalars['String'] | null)
    toolCallId: (Scalars['String'] | null)
    toolInput: (Scalars['JSON'] | null)
    toolOutput: (Scalars['JSON'] | null)
    state: (Scalars['String'] | null)
    errorMessage: (Scalars['String'] | null)
    errorDetails: (Scalars['JSON'] | null)
    sourceUrlSourceId: (Scalars['String'] | null)
    sourceUrlUrl: (Scalars['String'] | null)
    sourceUrlTitle: (Scalars['String'] | null)
    sourceDocumentSourceId: (Scalars['String'] | null)
    sourceDocumentMediaType: (Scalars['String'] | null)
    sourceDocumentTitle: (Scalars['String'] | null)
    sourceDocumentFilename: (Scalars['String'] | null)
    fileMediaType: (Scalars['String'] | null)
    fileFilename: (Scalars['String'] | null)
    fileUrl: (Scalars['String'] | null)
    providerMetadata: (Scalars['JSON'] | null)
    createdAt: Scalars['DateTime']
    __typename: 'AgentChatMessagePart'
}

export interface AgentChatMessage {
    id: Scalars['UUID']
    threadId: Scalars['UUID']
    role: Scalars['String']
    parts: AgentChatMessagePart[]
    createdAt: Scalars['DateTime']
    __typename: 'AgentChatMessage'
}

export interface AgentChatThread {
    id: Scalars['UUID']
    agentId: Scalars['UUID']
    title: (Scalars['String'] | null)
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'AgentChatThread'
}

export interface AgentHandoffDTO {
    id: Scalars['UUID']
    description: (Scalars['String'] | null)
    toAgent: Agent
    __typename: 'AgentHandoffDTO'
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

export interface WorkspaceEdge {
    /** The node containing the Workspace */
    node: Workspace
    /** Cursor for this node. */
    cursor: Scalars['ConnectionCursor']
    __typename: 'WorkspaceEdge'
}

export interface UserEdge {
    /** The node containing the User */
    node: User
    /** Cursor for this node. */
    cursor: Scalars['ConnectionCursor']
    __typename: 'UserEdge'
}

export interface DeleteSsoOutput {
    identityProviderId: Scalars['UUID']
    __typename: 'DeleteSsoOutput'
}

export interface EditSsoOutput {
    id: Scalars['UUID']
    type: IdentityProviderType
    issuer: Scalars['String']
    name: Scalars['String']
    status: SSOIdentityProviderStatus
    __typename: 'EditSsoOutput'
}

export interface WorkspaceNameAndId {
    displayName: (Scalars['String'] | null)
    id: Scalars['UUID']
    __typename: 'WorkspaceNameAndId'
}

export interface FindAvailableSSOIDPOutput {
    type: IdentityProviderType
    id: Scalars['UUID']
    issuer: Scalars['String']
    name: Scalars['String']
    status: SSOIdentityProviderStatus
    workspace: WorkspaceNameAndId
    __typename: 'FindAvailableSSOIDPOutput'
}

export interface SetupSsoOutput {
    id: Scalars['UUID']
    type: IdentityProviderType
    issuer: Scalars['String']
    name: Scalars['String']
    status: SSOIdentityProviderStatus
    __typename: 'SetupSsoOutput'
}

export interface DeleteTwoFactorAuthenticationMethodOutput {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'DeleteTwoFactorAuthenticationMethodOutput'
}

export interface InitiateTwoFactorAuthenticationProvisioningOutput {
    uri: Scalars['String']
    __typename: 'InitiateTwoFactorAuthenticationProvisioningOutput'
}

export interface VerifyTwoFactorAuthenticationMethodOutput {
    success: Scalars['Boolean']
    __typename: 'VerifyTwoFactorAuthenticationMethodOutput'
}

export interface AuthorizeApp {
    redirectUrl: Scalars['String']
    __typename: 'AuthorizeApp'
}

export interface EmailPasswordResetLink {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'EmailPasswordResetLink'
}

export interface InvalidatePassword {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'InvalidatePassword'
}

export interface AuthToken {
    token: Scalars['String']
    expiresAt: Scalars['DateTime']
    __typename: 'AuthToken'
}

export interface ApiKeyToken {
    token: Scalars['String']
    __typename: 'ApiKeyToken'
}

export interface AuthTokenPair {
    accessOrWorkspaceAgnosticToken: AuthToken
    refreshToken: AuthToken
    __typename: 'AuthTokenPair'
}

export interface AuthTokens {
    tokens: AuthTokenPair
    __typename: 'AuthTokens'
}

export interface TransientToken {
    transientToken: AuthToken
    __typename: 'TransientToken'
}

export interface ValidatePasswordResetToken {
    id: Scalars['UUID']
    email: Scalars['String']
    __typename: 'ValidatePasswordResetToken'
}

export interface AvailableWorkspacesAndAccessTokensOutput {
    tokens: AuthTokenPair
    availableWorkspaces: AvailableWorkspaces
    __typename: 'AvailableWorkspacesAndAccessTokensOutput'
}

export interface GetAuthorizationUrlForSSOOutput {
    authorizationURL: Scalars['String']
    type: Scalars['String']
    id: Scalars['UUID']
    __typename: 'GetAuthorizationUrlForSSOOutput'
}

export interface GetLoginTokenFromEmailVerificationTokenOutput {
    loginToken: AuthToken
    workspaceUrls: WorkspaceUrls
    __typename: 'GetLoginTokenFromEmailVerificationTokenOutput'
}

export interface WorkspaceUrlsAndId {
    workspaceUrls: WorkspaceUrls
    id: Scalars['UUID']
    __typename: 'WorkspaceUrlsAndId'
}

export interface SignUpOutput {
    loginToken: AuthToken
    workspace: WorkspaceUrlsAndId
    __typename: 'SignUpOutput'
}

export interface LoginToken {
    loginToken: AuthToken
    __typename: 'LoginToken'
}

export interface CheckUserExistOutput {
    exists: Scalars['Boolean']
    availableWorkspacesCount: Scalars['Float']
    isEmailVerified: Scalars['Boolean']
    __typename: 'CheckUserExistOutput'
}

export interface WorkspaceInviteHashValid {
    isValid: Scalars['Boolean']
    __typename: 'WorkspaceInviteHashValid'
}

export interface OnDbEventDTO {
    action: DatabaseEventAction
    objectNameSingular: Scalars['String']
    eventDate: Scalars['DateTime']
    record: Scalars['JSON']
    updatedFields: (Scalars['String'][] | null)
    __typename: 'OnDbEventDTO'
}


/** Database Event Action */
export type DatabaseEventAction = 'CREATED' | 'UPDATED' | 'DELETED' | 'DESTROYED' | 'RESTORED' | 'UPSERTED'

export interface UserMappingOptionsUser {
    user: (Scalars['String'] | null)
    __typename: 'UserMappingOptionsUser'
}

export interface RemoteServer {
    id: Scalars['UUID']
    foreignDataWrapperId: Scalars['UUID']
    foreignDataWrapperType: Scalars['String']
    label: Scalars['String']
    foreignDataWrapperOptions: (Scalars['JSON'] | null)
    userMappingOptions: (UserMappingOptionsUser | null)
    schema: (Scalars['String'] | null)
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    __typename: 'RemoteServer'
}

export interface RemoteTable {
    id: (Scalars['UUID'] | null)
    name: Scalars['String']
    status: RemoteTableStatus
    schema: (Scalars['String'] | null)
    schemaPendingUpdates: (DistantTableUpdate[] | null)
    __typename: 'RemoteTable'
}


/** Status of the table */
export type RemoteTableStatus = 'SYNCED' | 'NOT_SYNCED'


/** Schema update on a table */
export type DistantTableUpdate = 'TABLE_DELETED' | 'COLUMNS_DELETED' | 'COLUMNS_ADDED' | 'COLUMNS_TYPE_CHANGED'

export interface ConfigVariable {
    name: Scalars['String']
    description: Scalars['String']
    value: (Scalars['JSON'] | null)
    isSensitive: Scalars['Boolean']
    source: ConfigSource
    isEnvOnly: Scalars['Boolean']
    type: ConfigVariableType
    options: (Scalars['JSON'] | null)
    __typename: 'ConfigVariable'
}

export type ConfigSource = 'ENVIRONMENT' | 'DATABASE' | 'DEFAULT'

export type ConfigVariableType = 'BOOLEAN' | 'NUMBER' | 'ARRAY' | 'STRING' | 'ENUM'

export interface ConfigVariablesGroupData {
    variables: ConfigVariable[]
    name: ConfigVariablesGroup
    description: Scalars['String']
    isHiddenOnLoad: Scalars['Boolean']
    __typename: 'ConfigVariablesGroupData'
}

export type ConfigVariablesGroup = 'ServerConfig' | 'RateLimiting' | 'StorageConfig' | 'GoogleAuth' | 'MicrosoftAuth' | 'EmailSettings' | 'Logging' | 'Metering' | 'ExceptionHandler' | 'Other' | 'BillingConfig' | 'CaptchaConfig' | 'CloudflareConfig' | 'LLM' | 'ServerlessConfig' | 'SSL' | 'SupportChatConfig' | 'AnalyticsConfig' | 'TokensDuration' | 'TwoFactorAuthentication' | 'AwsSesSettings'

export interface ConfigVariablesOutput {
    groups: ConfigVariablesGroupData[]
    __typename: 'ConfigVariablesOutput'
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

export interface UserInfo {
    id: Scalars['UUID']
    email: Scalars['String']
    firstName: (Scalars['String'] | null)
    lastName: (Scalars['String'] | null)
    __typename: 'UserInfo'
}

export interface WorkspaceInfo {
    id: Scalars['UUID']
    name: Scalars['String']
    allowImpersonation: Scalars['Boolean']
    logo: (Scalars['String'] | null)
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
    currentVersion: (Scalars['String'] | null)
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
    errorMessage: (Scalars['String'] | null)
    details: (Scalars['String'] | null)
    queues: (AdminPanelWorkerQueueHealth[] | null)
    __typename: 'AdminPanelHealthServiceData'
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
    failedData: (Scalars['Float'][] | null)
    completedData: (Scalars['Float'][] | null)
    __typename: 'WorkerQueueMetrics'
}

export interface QueueMetricsData {
    queueName: Scalars['String']
    workers: Scalars['Float']
    timeRange: QueueMetricsTimeRange
    details: (WorkerQueueMetrics | null)
    data: QueueMetricsSeries[]
    __typename: 'QueueMetricsData'
}

export type QueueMetricsTimeRange = 'SevenDays' | 'OneDay' | 'TwelveHours' | 'FourHours' | 'OneHour'

export interface ImpersonateOutput {
    loginToken: AuthToken
    workspace: WorkspaceUrlsAndId
    __typename: 'ImpersonateOutput'
}

export interface AppTokenEdge {
    /** The node containing the AppToken */
    node: AppToken
    /** Cursor for this node. */
    cursor: Scalars['ConnectionCursor']
    __typename: 'AppTokenEdge'
}

export interface ApplicationVariable {
    id: Scalars['UUID']
    key: Scalars['String']
    value: Scalars['String']
    description: Scalars['String']
    isSecret: Scalars['Boolean']
    __typename: 'ApplicationVariable'
}

export interface Application {
    id: Scalars['UUID']
    name: Scalars['String']
    description: Scalars['String']
    version: Scalars['String']
    agents: Agent[]
    serverlessFunctions: ServerlessFunction[]
    objects: Object[]
    applicationVariables: ApplicationVariable[]
    __typename: 'Application'
}

export interface TimelineCalendarEventParticipant {
    personId: (Scalars['UUID'] | null)
    workspaceMemberId: (Scalars['UUID'] | null)
    firstName: Scalars['String']
    lastName: Scalars['String']
    displayName: Scalars['String']
    avatarUrl: Scalars['String']
    handle: Scalars['String']
    __typename: 'TimelineCalendarEventParticipant'
}

export interface LinkMetadata {
    label: Scalars['String']
    url: Scalars['String']
    __typename: 'LinkMetadata'
}

export interface LinksMetadata {
    primaryLinkLabel: Scalars['String']
    primaryLinkUrl: Scalars['String']
    secondaryLinks: (LinkMetadata[] | null)
    __typename: 'LinksMetadata'
}

export interface TimelineCalendarEvent {
    id: Scalars['UUID']
    title: Scalars['String']
    isCanceled: Scalars['Boolean']
    isFullDay: Scalars['Boolean']
    startsAt: Scalars['DateTime']
    endsAt: Scalars['DateTime']
    description: Scalars['String']
    location: Scalars['String']
    conferenceSolution: Scalars['String']
    conferenceLink: LinksMetadata
    participants: TimelineCalendarEventParticipant[]
    visibility: CalendarChannelVisibility
    __typename: 'TimelineCalendarEvent'
}

export type CalendarChannelVisibility = 'METADATA' | 'SHARE_EVERYTHING'

export interface TimelineCalendarEventsWithTotal {
    totalNumberOfCalendarEvents: Scalars['Int']
    timelineCalendarEvents: TimelineCalendarEvent[]
    __typename: 'TimelineCalendarEventsWithTotal'
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
    priority: (Scalars['Float'] | null)
    __typename: 'VerificationRecord'
}

export interface EmailingDomain {
    id: Scalars['UUID']
    createdAt: Scalars['DateTime']
    updatedAt: Scalars['DateTime']
    domain: Scalars['String']
    driver: EmailingDomainDriver
    status: EmailingDomainStatus
    verificationRecords: (VerificationRecord[] | null)
    verifiedAt: (Scalars['DateTime'] | null)
    __typename: 'EmailingDomain'
}

export type EmailingDomainDriver = 'AWS_SES'

export type EmailingDomainStatus = 'PENDING' | 'VERIFIED' | 'FAILED' | 'TEMPORARY_FAILURE'

export interface AutocompleteResultDto {
    text: Scalars['String']
    placeId: Scalars['String']
    __typename: 'AutocompleteResultDto'
}

export interface LocationDto {
    lat: (Scalars['Float'] | null)
    lng: (Scalars['Float'] | null)
    __typename: 'LocationDto'
}

export interface PlaceDetailsResultDto {
    state: (Scalars['String'] | null)
    postcode: (Scalars['String'] | null)
    city: (Scalars['String'] | null)
    country: (Scalars['String'] | null)
    location: (LocationDto | null)
    __typename: 'PlaceDetailsResultDto'
}

export interface ConnectionParametersOutput {
    host: Scalars['String']
    port: Scalars['Float']
    username: (Scalars['String'] | null)
    password: Scalars['String']
    secure: (Scalars['Boolean'] | null)
    __typename: 'ConnectionParametersOutput'
}

export interface ImapSmtpCaldavConnectionParameters {
    IMAP: (ConnectionParametersOutput | null)
    SMTP: (ConnectionParametersOutput | null)
    CALDAV: (ConnectionParametersOutput | null)
    __typename: 'ImapSmtpCaldavConnectionParameters'
}

export interface ConnectedImapSmtpCaldavAccount {
    id: Scalars['UUID']
    handle: Scalars['String']
    provider: Scalars['String']
    accountOwnerId: Scalars['UUID']
    connectionParameters: (ImapSmtpCaldavConnectionParameters | null)
    __typename: 'ConnectedImapSmtpCaldavAccount'
}

export interface ImapSmtpCaldavConnectionSuccess {
    success: Scalars['Boolean']
    connectedAccountId: Scalars['String']
    __typename: 'ImapSmtpCaldavConnectionSuccess'
}

export interface TimelineThreadParticipant {
    personId: (Scalars['UUID'] | null)
    workspaceMemberId: (Scalars['UUID'] | null)
    firstName: Scalars['String']
    lastName: Scalars['String']
    displayName: Scalars['String']
    avatarUrl: Scalars['String']
    handle: Scalars['String']
    __typename: 'TimelineThreadParticipant'
}

export interface TimelineThread {
    id: Scalars['UUID']
    read: Scalars['Boolean']
    visibility: MessageChannelVisibility
    firstParticipant: TimelineThreadParticipant
    lastTwoParticipants: TimelineThreadParticipant[]
    lastMessageReceivedAt: Scalars['DateTime']
    lastMessageBody: Scalars['String']
    subject: Scalars['String']
    numberOfMessagesInThread: Scalars['Float']
    participantCount: Scalars['Float']
    __typename: 'TimelineThread'
}

export type MessageChannelVisibility = 'METADATA' | 'SUBJECT' | 'SHARE_EVERYTHING'

export interface TimelineThreadsWithTotal {
    totalNumberOfThreads: Scalars['Int']
    timelineThreads: TimelineThread[]
    __typename: 'TimelineThreadsWithTotal'
}

export interface PostgresCredentials {
    id: Scalars['UUID']
    user: Scalars['String']
    password: Scalars['String']
    workspaceId: Scalars['UUID']
    __typename: 'PostgresCredentials'
}

export interface SearchRecord {
    recordId: Scalars['UUID']
    objectNameSingular: Scalars['String']
    label: Scalars['String']
    imageUrl: (Scalars['String'] | null)
    tsRankCD: Scalars['Float']
    tsRank: Scalars['Float']
    __typename: 'SearchRecord'
}

export interface SearchResultEdge {
    node: SearchRecord
    cursor: Scalars['String']
    __typename: 'SearchResultEdge'
}

export interface SearchResultPageInfo {
    endCursor: (Scalars['String'] | null)
    hasNextPage: Scalars['Boolean']
    __typename: 'SearchResultPageInfo'
}

export interface SearchResultConnection {
    edges: SearchResultEdge[]
    pageInfo: SearchResultPageInfo
    __typename: 'SearchResultConnection'
}

export interface WorkflowRun {
    workflowRunId: Scalars['UUID']
    __typename: 'WorkflowRun'
}

export interface WorkflowVersionStepChanges {
    triggerDiff: (Scalars['JSON'] | null)
    stepsDiff: (Scalars['JSON'] | null)
    __typename: 'WorkflowVersionStepChanges'
}

export interface WorkflowStepPosition {
    x: Scalars['Float']
    y: Scalars['Float']
    __typename: 'WorkflowStepPosition'
}

export interface WorkflowAction {
    id: Scalars['UUID']
    name: Scalars['String']
    type: Scalars['String']
    settings: Scalars['JSON']
    valid: Scalars['Boolean']
    nextStepIds: (Scalars['UUID'][] | null)
    position: (WorkflowStepPosition | null)
    __typename: 'WorkflowAction'
}

export interface WorkflowVersionDTO {
    id: Scalars['UUID']
    name: Scalars['String']
    createdAt: Scalars['String']
    updatedAt: Scalars['String']
    workflowId: Scalars['UUID']
    status: Scalars['String']
    trigger: (Scalars['JSON'] | null)
    steps: (Scalars['JSON'] | null)
    __typename: 'WorkflowVersionDTO'
}

export interface ChannelSyncSuccess {
    success: Scalars['Boolean']
    __typename: 'ChannelSyncSuccess'
}

export interface BillingTrialPeriodDTO {
    duration: Scalars['Float']
    isCreditCardRequired: Scalars['Boolean']
    __typename: 'BillingTrialPeriodDTO'
}

export interface NativeModelCapabilities {
    webSearch: (Scalars['Boolean'] | null)
    twitterSearch: (Scalars['Boolean'] | null)
    __typename: 'NativeModelCapabilities'
}

export interface ClientAIModelConfig {
    modelId: Scalars['String']
    label: Scalars['String']
    provider: ModelProvider
    inputCostPer1kTokensInCredits: Scalars['Float']
    outputCostPer1kTokensInCredits: Scalars['Float']
    nativeCapabilities: (NativeModelCapabilities | null)
    __typename: 'ClientAIModelConfig'
}

export type ModelProvider = 'NONE' | 'OPENAI' | 'ANTHROPIC' | 'OPENAI_COMPATIBLE' | 'XAI'

export interface Billing {
    isBillingEnabled: Scalars['Boolean']
    billingUrl: (Scalars['String'] | null)
    trialPeriods: BillingTrialPeriodDTO[]
    __typename: 'Billing'
}

export interface Support {
    supportDriver: SupportDriver
    supportFrontChatId: (Scalars['String'] | null)
    __typename: 'Support'
}

export type SupportDriver = 'NONE' | 'FRONT'

export interface Sentry {
    environment: (Scalars['String'] | null)
    release: (Scalars['String'] | null)
    dsn: (Scalars['String'] | null)
    __typename: 'Sentry'
}

export interface Captcha {
    provider: (CaptchaDriverType | null)
    siteKey: (Scalars['String'] | null)
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
    imagePath: Scalars['String']
    __typename: 'PublicFeatureFlagMetadata'
}

export interface PublicFeatureFlag {
    key: FeatureFlagKey
    metadata: PublicFeatureFlagMetadata
    __typename: 'PublicFeatureFlag'
}

export interface Query {
    object: Object
    objects: ObjectConnection
    getCoreViewFields: CoreViewField[]
    getCoreViewField: (CoreViewField | null)
    getCoreViews: CoreView[]
    getCoreView: (CoreView | null)
    getCoreViewSorts: CoreViewSort[]
    getCoreViewSort: (CoreViewSort | null)
    getCoreViewGroups: CoreViewGroup[]
    getCoreViewGroup: (CoreViewGroup | null)
    getCoreViewFilterGroups: CoreViewFilterGroup[]
    getCoreViewFilterGroup: (CoreViewFilterGroup | null)
    getCoreViewFilters: CoreViewFilter[]
    getCoreViewFilter: (CoreViewFilter | null)
    index: Index
    indexMetadatas: IndexConnection
    findOneServerlessFunction: ServerlessFunction
    findManyServerlessFunctions: ServerlessFunction[]
    getAvailablePackages: Scalars['JSON']
    getServerlessFunctionSourceCode: (Scalars['JSON'] | null)
    findOneDatabaseEventTrigger: DatabaseEventTrigger
    findManyDatabaseEventTriggers: DatabaseEventTrigger[]
    findOneCronTrigger: CronTrigger
    findManyCronTriggers: CronTrigger[]
    findOneRouteTrigger: RouteTrigger
    findManyRouteTriggers: RouteTrigger[]
    checkUserExists: CheckUserExistOutput
    checkWorkspaceInviteHashIsValid: WorkspaceInviteHashValid
    findWorkspaceFromInviteHash: Workspace
    validatePasswordResetToken: ValidatePasswordResetToken
    apiKeys: ApiKey[]
    apiKey: (ApiKey | null)
    currentUser: User
    findWorkspaceInvitations: WorkspaceInvitation[]
    billingPortalSession: BillingSessionOutput
    listPlans: BillingPlanOutput[]
    getMeteredProductsUsage: BillingMeteredProductUsageOutput[]
    getApprovedAccessDomains: ApprovedAccessDomain[]
    currentWorkspace: Workspace
    getPublicWorkspaceDataByDomain: PublicWorkspaceDataOutput
    findManyAgents: Agent[]
    findOneAgent: Agent
    findAgentHandoffTargets: Agent[]
    findAgentHandoffs: AgentHandoffDTO[]
    agentChatThreads: AgentChatThread[]
    agentChatThread: AgentChatThread
    agentChatMessages: AgentChatMessage[]
    getRoles: Role[]
    field: Field
    fields: FieldConnection
    getSSOIdentityProviders: FindAvailableSSOIDPOutput[]
    findOneRemoteServerById: RemoteServer
    findManyRemoteServersByType: RemoteServer[]
    findDistantTablesWithStatus: RemoteTable[]
    getPageLayouts: PageLayout[]
    getPageLayout: (PageLayout | null)
    getPageLayoutTabs: PageLayoutTab[]
    getPageLayoutTab: PageLayoutTab
    getPageLayoutWidgets: PageLayoutWidget[]
    getPageLayoutWidget: PageLayoutWidget
    webhooks: Webhook[]
    webhook: (Webhook | null)
    search: SearchResultConnection
    getConnectedImapSmtpCaldavAccount: ConnectedImapSmtpCaldavAccount
    getAutoCompleteAddress: AutocompleteResultDto[]
    getAddressDetails: PlaceDetailsResultDto
    getConfigVariablesGrouped: ConfigVariablesOutput
    getSystemHealthStatus: SystemHealth
    getIndicatorHealthStatus: AdminPanelHealthServiceData
    getQueueMetrics: QueueMetricsData
    versionInfo: VersionInfo
    getDatabaseConfigVariable: ConfigVariable
    getPostgresCredentials: (PostgresCredentials | null)
    findManyPublicDomains: PublicDomain[]
    getEmailingDomains: EmailingDomain[]
    getTimelineCalendarEventsFromPersonId: TimelineCalendarEventsWithTotal
    getTimelineCalendarEventsFromCompanyId: TimelineCalendarEventsWithTotal
    getTimelineCalendarEventsFromOpportunityId: TimelineCalendarEventsWithTotal
    getTimelineThreadsFromPersonId: TimelineThreadsWithTotal
    getTimelineThreadsFromCompanyId: TimelineThreadsWithTotal
    getTimelineThreadsFromOpportunityId: TimelineThreadsWithTotal
    findManyApplications: Application[]
    findOneApplication: Application
    __typename: 'Query'
}

export type FilterIs = 'NotNull' | 'Null'

export interface Mutation {
    createObjectEvent: Analytics
    trackAnalytics: Analytics
    deleteOneObject: Object
    updateOneObject: Object
    createOneObject: Object
    updateCoreViewField: CoreViewField
    createCoreViewField: CoreViewField
    deleteCoreViewField: CoreViewField
    destroyCoreViewField: CoreViewField
    createCoreView: CoreView
    updateCoreView: CoreView
    deleteCoreView: Scalars['Boolean']
    destroyCoreView: Scalars['Boolean']
    createCoreViewSort: CoreViewSort
    updateCoreViewSort: CoreViewSort
    deleteCoreViewSort: Scalars['Boolean']
    destroyCoreViewSort: Scalars['Boolean']
    createCoreViewGroup: CoreViewGroup
    updateCoreViewGroup: CoreViewGroup
    deleteCoreViewGroup: CoreViewGroup
    destroyCoreViewGroup: CoreViewGroup
    createCoreViewFilterGroup: CoreViewFilterGroup
    updateCoreViewFilterGroup: CoreViewFilterGroup
    deleteCoreViewFilterGroup: Scalars['Boolean']
    destroyCoreViewFilterGroup: Scalars['Boolean']
    createCoreViewFilter: CoreViewFilter
    updateCoreViewFilter: CoreViewFilter
    deleteCoreViewFilter: CoreViewFilter
    destroyCoreViewFilter: CoreViewFilter
    deleteOneServerlessFunction: ServerlessFunction
    updateOneServerlessFunction: ServerlessFunction
    createOneServerlessFunction: ServerlessFunction
    executeOneServerlessFunction: ServerlessFunctionExecutionResult
    publishServerlessFunction: ServerlessFunction
    createOneServerlessFunctionLayer: ServerlessFunctionLayer
    createFile: File
    deleteFile: File
    uploadFile: SignedFileDTO
    uploadImage: SignedFileDTO
    deleteOneDatabaseEventTrigger: DatabaseEventTrigger
    updateOneDatabaseEventTrigger: DatabaseEventTrigger
    createOneDatabaseEventTrigger: DatabaseEventTrigger
    deleteOneCronTrigger: CronTrigger
    updateOneCronTrigger: CronTrigger
    createOneCronTrigger: CronTrigger
    deleteOneRouteTrigger: RouteTrigger
    updateOneRouteTrigger: RouteTrigger
    createOneRouteTrigger: RouteTrigger
    getAuthorizationUrlForSSO: GetAuthorizationUrlForSSOOutput
    getLoginTokenFromCredentials: LoginToken
    signIn: AvailableWorkspacesAndAccessTokensOutput
    getLoginTokenFromEmailVerificationToken: GetLoginTokenFromEmailVerificationTokenOutput
    getWorkspaceAgnosticTokenFromEmailVerificationToken: AvailableWorkspacesAndAccessTokensOutput
    getAuthTokensFromOTP: AuthTokens
    signUp: AvailableWorkspacesAndAccessTokensOutput
    signUpInWorkspace: SignUpOutput
    signUpInNewWorkspace: SignUpOutput
    generateTransientToken: TransientToken
    getAuthTokensFromLoginToken: AuthTokens
    authorizeApp: AuthorizeApp
    renewToken: AuthTokens
    generateApiKeyToken: ApiKeyToken
    emailPasswordResetLink: EmailPasswordResetLink
    updatePasswordViaResetToken: InvalidatePassword
    createApiKey: ApiKey
    updateApiKey: (ApiKey | null)
    revokeApiKey: (ApiKey | null)
    assignRoleToApiKey: Scalars['Boolean']
    initiateOTPProvisioning: InitiateTwoFactorAuthenticationProvisioningOutput
    initiateOTPProvisioningForAuthenticatedUser: InitiateTwoFactorAuthenticationProvisioningOutput
    deleteTwoFactorAuthenticationMethod: DeleteTwoFactorAuthenticationMethodOutput
    verifyTwoFactorAuthenticationMethodForAuthenticatedUser: VerifyTwoFactorAuthenticationMethodOutput
    uploadProfilePicture: SignedFileDTO
    deleteUser: User
    deleteWorkspaceInvitation: Scalars['String']
    resendWorkspaceInvitation: SendInvitationsOutput
    sendInvitations: SendInvitationsOutput
    skipSyncEmailOnboardingStep: OnboardingStepSuccess
    skipBookOnboardingStep: OnboardingStepSuccess
    checkoutSession: BillingSessionOutput
    switchSubscriptionInterval: BillingUpdateOutput
    switchBillingPlan: BillingUpdateOutput
    cancelSwitchBillingPlan: BillingUpdateOutput
    cancelSwitchBillingInterval: BillingUpdateOutput
    setMeteredSubscriptionPrice: BillingUpdateOutput
    endSubscriptionTrialPeriod: BillingEndTrialPeriodOutput
    cancelSwitchMeteredPrice: BillingUpdateOutput
    createApprovedAccessDomain: ApprovedAccessDomain
    deleteApprovedAccessDomain: Scalars['Boolean']
    validateApprovedAccessDomain: ApprovedAccessDomain
    activateWorkspace: Workspace
    updateWorkspace: Workspace
    uploadWorkspaceLogo: SignedFileDTO
    deleteCurrentWorkspace: Workspace
    checkCustomDomainValidRecords: (DomainValidRecords | null)
    createOneAgent: Agent
    updateOneAgent: Agent
    deleteOneAgent: Agent
    createAgentHandoff: Scalars['Boolean']
    removeAgentHandoff: Scalars['Boolean']
    createAgentChatThread: AgentChatThread
    updateWorkspaceMemberRole: WorkspaceMember
    createOneRole: Role
    updateOneRole: Role
    deleteOneRole: Scalars['String']
    upsertObjectPermissions: ObjectPermission[]
    upsertPermissionFlags: PermissionFlag[]
    upsertFieldPermissions: FieldPermission[]
    assignRoleToAgent: Scalars['Boolean']
    removeRoleFromAgent: Scalars['Boolean']
    createOneField: Field
    updateOneField: Field
    deleteOneField: Field
    resendEmailVerificationToken: ResendEmailVerificationTokenOutput
    createOIDCIdentityProvider: SetupSsoOutput
    createSAMLIdentityProvider: SetupSsoOutput
    deleteSSOIdentityProvider: DeleteSsoOutput
    editSSOIdentityProvider: EditSsoOutput
    createOneRemoteServer: RemoteServer
    updateOneRemoteServer: RemoteServer
    deleteOneRemoteServer: RemoteServer
    syncRemoteTable: RemoteTable
    unsyncRemoteTable: RemoteTable
    syncRemoteTableSchemaChanges: RemoteTable
    impersonate: ImpersonateOutput
    createPageLayout: PageLayout
    updatePageLayout: PageLayout
    deletePageLayout: PageLayout
    destroyPageLayout: Scalars['Boolean']
    restorePageLayout: PageLayout
    updatePageLayoutWithTabsAndWidgets: PageLayout
    createPageLayoutTab: PageLayoutTab
    updatePageLayoutTab: PageLayoutTab
    deletePageLayoutTab: Scalars['Boolean']
    destroyPageLayoutTab: Scalars['Boolean']
    restorePageLayoutTab: PageLayoutTab
    createPageLayoutWidget: PageLayoutWidget
    updatePageLayoutWidget: PageLayoutWidget
    deletePageLayoutWidget: PageLayoutWidget
    destroyPageLayoutWidget: Scalars['Boolean']
    restorePageLayoutWidget: PageLayoutWidget
    createWebhook: Webhook
    updateWebhook: (Webhook | null)
    deleteWebhook: Scalars['Boolean']
    startChannelSync: ChannelSyncSuccess
    saveImapSmtpCaldavAccount: ImapSmtpCaldavConnectionSuccess
    updateLabPublicFeatureFlag: FeatureFlagDTO
    userLookupAdminPanel: UserLookup
    updateWorkspaceFeatureFlag: Scalars['Boolean']
    createDatabaseConfigVariable: Scalars['Boolean']
    updateDatabaseConfigVariable: Scalars['Boolean']
    deleteDatabaseConfigVariable: Scalars['Boolean']
    activateWorkflowVersion: Scalars['Boolean']
    deactivateWorkflowVersion: Scalars['Boolean']
    runWorkflowVersion: WorkflowRun
    computeStepOutputSchema: Scalars['JSON']
    createWorkflowVersionStep: WorkflowVersionStepChanges
    updateWorkflowVersionStep: WorkflowAction
    deleteWorkflowVersionStep: WorkflowVersionStepChanges
    submitFormStep: Scalars['Boolean']
    updateWorkflowRunStep: WorkflowAction
    duplicateWorkflowVersionStep: WorkflowVersionStepChanges
    createWorkflowVersionEdge: WorkflowVersionStepChanges
    deleteWorkflowVersionEdge: WorkflowVersionStepChanges
    createDraftFromWorkflowVersion: WorkflowVersionDTO
    updateWorkflowVersionPositions: Scalars['Boolean']
    enablePostgresProxy: PostgresCredentials
    disablePostgresProxy: PostgresCredentials
    createPublicDomain: PublicDomain
    deletePublicDomain: Scalars['Boolean']
    checkPublicDomainValidRecords: (DomainValidRecords | null)
    createEmailingDomain: EmailingDomain
    deleteEmailingDomain: Scalars['Boolean']
    verifyEmailingDomain: EmailingDomain
    createOneAppToken: AppToken
    syncApplication: Scalars['Boolean']
    deleteApplication: Scalars['Boolean']
    updateOneApplicationVariable: Scalars['Boolean']
    __typename: 'Mutation'
}

export type AnalyticsType = 'PAGEVIEW' | 'TRACK'

export type FileFolder = 'ProfilePicture' | 'WorkspaceLogo' | 'Attachment' | 'PersonPicture' | 'ServerlessFunction' | 'ServerlessFunctionToDelete' | 'File' | 'AgentChat'

export interface Subscription {
    onDbEvent: OnDbEventDTO
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
    workspaceId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    workspace?: WorkspaceGenqlSelection
    role?: RoleGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FeatureFlagGenqlSelection{
    id?: boolean | number
    key?: boolean | number
    workspaceId?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TwoFactorAuthenticationMethodDTOGenqlSelection{
    twoFactorAuthenticationMethodId?: boolean | number
    status?: boolean | number
    strategy?: boolean | number
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
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserWorkspaceGenqlSelection{
    id?: boolean | number
    user?: UserGenqlSelection
    userId?: boolean | number
    workspace?: WorkspaceGenqlSelection
    workspaceId?: boolean | number
    locale?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    permissionFlags?: boolean | number
    objectPermissions?: ObjectPermissionGenqlSelection
    objectsPermissions?: ObjectPermissionGenqlSelection
    twoFactorAuthenticationMethodSummary?: TwoFactorAuthenticationMethodDTOGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WebhookGenqlSelection{
    id?: boolean | number
    targetUrl?: boolean | number
    operations?: boolean | number
    description?: boolean | number
    secret?: boolean | number
    workspaceId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    workspace?: WorkspaceGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentGenqlSelection{
    id?: boolean | number
    standardId?: boolean | number
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
    standardId?: boolean | number
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
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CoreViewFieldGenqlSelection{
    id?: boolean | number
    fieldMetadataId?: boolean | number
    isVisible?: boolean | number
    size?: boolean | number
    position?: boolean | number
    aggregateOperation?: boolean | number
    viewId?: boolean | number
    workspaceId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CoreViewFilterGroupGenqlSelection{
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

export interface CoreViewFilterGenqlSelection{
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

export interface CoreViewGroupGenqlSelection{
    id?: boolean | number
    fieldMetadataId?: boolean | number
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

export interface CoreViewSortGenqlSelection{
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

export interface CoreViewGenqlSelection{
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
    calendarFieldMetadataId?: boolean | number
    workspaceId?: boolean | number
    anyFieldFilterValue?: boolean | number
    calendarLayout?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    viewFields?: CoreViewFieldGenqlSelection
    viewFilters?: CoreViewFilterGenqlSelection
    viewFilterGroups?: CoreViewFilterGroupGenqlSelection
    viewSorts?: CoreViewSortGenqlSelection
    viewGroups?: CoreViewGroupGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceGenqlSelection{
    id?: boolean | number
    displayName?: boolean | number
    logo?: boolean | number
    inviteHash?: boolean | number
    deletedAt?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    allowImpersonation?: boolean | number
    isPublicInviteLinkEnabled?: boolean | number
    trashRetentionDays?: boolean | number
    workspaceMembersCount?: boolean | number
    activationStatus?: boolean | number
    views?: CoreViewGenqlSelection
    viewFields?: CoreViewFieldGenqlSelection
    viewFilters?: CoreViewFilterGenqlSelection
    viewFilterGroups?: CoreViewFilterGroupGenqlSelection
    viewGroups?: CoreViewGroupGenqlSelection
    viewSorts?: CoreViewSortGenqlSelection
    metadataVersion?: boolean | number
    databaseUrl?: boolean | number
    databaseSchema?: boolean | number
    subdomain?: boolean | number
    customDomain?: boolean | number
    isGoogleAuthEnabled?: boolean | number
    isTwoFactorAuthenticationEnforced?: boolean | number
    isPasswordAuthEnabled?: boolean | number
    isMicrosoftAuthEnabled?: boolean | number
    isCustomDomainEnabled?: boolean | number
    defaultRole?: RoleGenqlSelection
    defaultAgent?: AgentGenqlSelection
    version?: boolean | number
    featureFlags?: FeatureFlagDTOGenqlSelection
    billingSubscriptions?: BillingSubscriptionGenqlSelection
    currentBillingSubscription?: BillingSubscriptionGenqlSelection
    hasValidEnterpriseKey?: boolean | number
    workspaceUrls?: WorkspaceUrlsGenqlSelection
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
    passwordHash?: boolean | number
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
    supportUserHash?: boolean | number
    workspaces?: UserWorkspaceGenqlSelection
    availableWorkspaces?: AvailableWorkspacesGenqlSelection
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
    configuration?: WidgetConfigurationGenqlSelection
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WidgetConfigurationGenqlSelection{
    on_BarChartConfiguration?:BarChartConfigurationGenqlSelection,
    on_LineChartConfiguration?:LineChartConfigurationGenqlSelection,
    on_PieChartConfiguration?:PieChartConfigurationGenqlSelection,
    on_NumberChartConfiguration?:NumberChartConfigurationGenqlSelection,
    on_GaugeChartConfiguration?:GaugeChartConfigurationGenqlSelection,
    on_IframeConfiguration?:IframeConfigurationGenqlSelection,
    __typename?: boolean | number
}

export interface BarChartConfigurationGenqlSelection{
    graphType?: boolean | number
    aggregateFieldMetadataId?: boolean | number
    aggregateOperation?: boolean | number
    primaryAxisGroupByFieldMetadataId?: boolean | number
    primaryAxisGroupBySubFieldName?: boolean | number
    primaryAxisOrderBy?: boolean | number
    secondaryAxisGroupByFieldMetadataId?: boolean | number
    secondaryAxisGroupBySubFieldName?: boolean | number
    secondaryAxisOrderBy?: boolean | number
    omitNullValues?: boolean | number
    axisNameDisplay?: boolean | number
    displayDataLabel?: boolean | number
    rangeMin?: boolean | number
    rangeMax?: boolean | number
    description?: boolean | number
    color?: boolean | number
    filter?: boolean | number
    groupMode?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LineChartConfigurationGenqlSelection{
    graphType?: boolean | number
    aggregateFieldMetadataId?: boolean | number
    aggregateOperation?: boolean | number
    primaryAxisGroupByFieldMetadataId?: boolean | number
    primaryAxisGroupBySubFieldName?: boolean | number
    primaryAxisOrderBy?: boolean | number
    secondaryAxisGroupByFieldMetadataId?: boolean | number
    secondaryAxisGroupBySubFieldName?: boolean | number
    secondaryAxisOrderBy?: boolean | number
    omitNullValues?: boolean | number
    axisNameDisplay?: boolean | number
    displayDataLabel?: boolean | number
    rangeMin?: boolean | number
    rangeMax?: boolean | number
    description?: boolean | number
    color?: boolean | number
    filter?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PieChartConfigurationGenqlSelection{
    graphType?: boolean | number
    aggregateFieldMetadataId?: boolean | number
    aggregateOperation?: boolean | number
    groupByFieldMetadataId?: boolean | number
    groupBySubFieldName?: boolean | number
    orderBy?: boolean | number
    displayDataLabel?: boolean | number
    description?: boolean | number
    color?: boolean | number
    filter?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface NumberChartConfigurationGenqlSelection{
    graphType?: boolean | number
    aggregateFieldMetadataId?: boolean | number
    aggregateOperation?: boolean | number
    label?: boolean | number
    displayDataLabel?: boolean | number
    format?: boolean | number
    description?: boolean | number
    filter?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface GaugeChartConfigurationGenqlSelection{
    graphType?: boolean | number
    aggregateFieldMetadataId?: boolean | number
    aggregateOperation?: boolean | number
    displayDataLabel?: boolean | number
    color?: boolean | number
    description?: boolean | number
    filter?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IframeConfigurationGenqlSelection{
    url?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageLayoutTabGenqlSelection{
    id?: boolean | number
    title?: boolean | number
    position?: boolean | number
    pageLayoutId?: boolean | number
    widgets?: PageLayoutWidgetGenqlSelection
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageLayoutGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    type?: boolean | number
    objectMetadataId?: boolean | number
    tabs?: PageLayoutTabGenqlSelection
    createdAt?: boolean | number
    updatedAt?: boolean | number
    deletedAt?: boolean | number
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

export interface ObjectStandardOverridesGenqlSelection{
    labelSingular?: boolean | number
    labelPlural?: boolean | number
    description?: boolean | number
    icon?: boolean | number
    translations?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectGenqlSelection{
    id?: boolean | number
    nameSingular?: boolean | number
    namePlural?: boolean | number
    labelSingular?: boolean | number
    labelPlural?: boolean | number
    description?: boolean | number
    icon?: boolean | number
    standardOverrides?: ObjectStandardOverridesGenqlSelection
    shortcut?: boolean | number
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
    fields?: (ObjectFieldsConnectionGenqlSelection & { __args?: {
    /** Limit or page results. */
    paging?: CursorPaging, 
    /** Specify to filter the records returned. */
    filter?: FieldFilter} })
    indexMetadatas?: (ObjectIndexMetadatasConnectionGenqlSelection & { __args?: {
    /** Limit or page results. */
    paging?: CursorPaging, 
    /** Specify to filter the records returned. */
    filter?: IndexFilter} })
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

export interface FieldFilter {and?: (FieldFilter[] | null),or?: (FieldFilter[] | null),id?: (UUIDFilterComparison | null),isCustom?: (BooleanFieldComparison | null),isActive?: (BooleanFieldComparison | null),isSystem?: (BooleanFieldComparison | null),isUIReadOnly?: (BooleanFieldComparison | null)}

export interface UUIDFilterComparison {is?: (Scalars['Boolean'] | null),isNot?: (Scalars['Boolean'] | null),eq?: (Scalars['UUID'] | null),neq?: (Scalars['UUID'] | null),gt?: (Scalars['UUID'] | null),gte?: (Scalars['UUID'] | null),lt?: (Scalars['UUID'] | null),lte?: (Scalars['UUID'] | null),like?: (Scalars['UUID'] | null),notLike?: (Scalars['UUID'] | null),iLike?: (Scalars['UUID'] | null),notILike?: (Scalars['UUID'] | null),in?: (Scalars['UUID'][] | null),notIn?: (Scalars['UUID'][] | null)}

export interface BooleanFieldComparison {is?: (Scalars['Boolean'] | null),isNot?: (Scalars['Boolean'] | null)}

export interface IndexFilter {and?: (IndexFilter[] | null),or?: (IndexFilter[] | null),id?: (UUIDFilterComparison | null),isCustom?: (BooleanFieldComparison | null)}

export interface FieldGenqlSelection{
    id?: boolean | number
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
    isLabelSyncedWithName?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
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
    objectMetadata?: (IndexObjectMetadataConnectionGenqlSelection & { __args?: {
    /** Limit or page results. */
    paging?: CursorPaging, 
    /** Specify to filter the records returned. */
    filter?: ObjectFilter} })
    indexFieldMetadatas?: (IndexIndexFieldMetadatasConnectionGenqlSelection & { __args?: {
    /** Limit or page results. */
    paging?: CursorPaging, 
    /** Specify to filter the records returned. */
    filter?: IndexFieldFilter} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectFilter {and?: (ObjectFilter[] | null),or?: (ObjectFilter[] | null),id?: (UUIDFilterComparison | null),isCustom?: (BooleanFieldComparison | null),isRemote?: (BooleanFieldComparison | null),isActive?: (BooleanFieldComparison | null),isSystem?: (BooleanFieldComparison | null),isUIReadOnly?: (BooleanFieldComparison | null),isSearchable?: (BooleanFieldComparison | null)}

export interface IndexFieldFilter {and?: (IndexFieldFilter[] | null),or?: (IndexFieldFilter[] | null),id?: (UUIDFilterComparison | null),fieldMetadataId?: (UUIDFilterComparison | null)}

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

export interface AnalyticsGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
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

export interface BillingPriceLicensedDTOGenqlSelection{
    recurringInterval?: boolean | number
    unitAmount?: boolean | number
    stripePriceId?: boolean | number
    priceUsageType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingPriceTierDTOGenqlSelection{
    upTo?: boolean | number
    flatAmount?: boolean | number
    unitAmount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingPriceMeteredDTOGenqlSelection{
    tiers?: BillingPriceTierDTOGenqlSelection
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
    prices?: BillingPriceLicensedDTOGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingMeteredProductGenqlSelection{
    name?: boolean | number
    description?: boolean | number
    images?: boolean | number
    metadata?: BillingProductMetadataGenqlSelection
    prices?: BillingPriceMeteredDTOGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingSubscriptionItemDTOGenqlSelection{
    id?: boolean | number
    hasReachedCurrentPeriodCap?: boolean | number
    quantity?: boolean | number
    stripePriceId?: boolean | number
    billingProduct?: BillingProductDTOGenqlSelection
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

export interface BillingSubscriptionGenqlSelection{
    id?: boolean | number
    status?: boolean | number
    interval?: boolean | number
    billingSubscriptionItems?: BillingSubscriptionItemDTOGenqlSelection
    currentPeriodEnd?: boolean | number
    metadata?: boolean | number
    phases?: BillingSubscriptionSchedulePhaseGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ResendEmailVerificationTokenOutputGenqlSelection{
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

export interface FileGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    fullPath?: boolean | number
    size?: boolean | number
    type?: boolean | number
    createdAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SignedFileDTOGenqlSelection{
    path?: boolean | number
    token?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ServerlessFunctionLayerGenqlSelection{
    id?: boolean | number
    applicationId?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ServerlessFunctionExecutionResultGenqlSelection{
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

export interface CronTriggerGenqlSelection{
    id?: boolean | number
    settings?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DatabaseEventTriggerGenqlSelection{
    id?: boolean | number
    settings?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RouteTriggerGenqlSelection{
    id?: boolean | number
    path?: boolean | number
    isAuthRequired?: boolean | number
    httpMethod?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ServerlessFunctionGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    description?: boolean | number
    runtime?: boolean | number
    timeoutSeconds?: boolean | number
    latestVersion?: boolean | number
    publishedVersions?: boolean | number
    cronTriggers?: CronTriggerGenqlSelection
    databaseEventTriggers?: DatabaseEventTriggerGenqlSelection
    routeTriggers?: RouteTriggerGenqlSelection
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingEndTrialPeriodOutputGenqlSelection{
    /** Updated subscription status */
    status?: boolean | number
    /** Boolean that confirms if a payment method was found */
    hasPaymentMethod?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingMeteredProductUsageOutputGenqlSelection{
    productKey?: boolean | number
    periodStart?: boolean | number
    periodEnd?: boolean | number
    usedCredits?: boolean | number
    grantedCredits?: boolean | number
    unitPriceCents?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingPlanOutputGenqlSelection{
    planKey?: boolean | number
    licensedProducts?: BillingLicensedProductGenqlSelection
    meteredProducts?: BillingMeteredProductGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingSessionOutputGenqlSelection{
    url?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingUpdateOutputGenqlSelection{
    /** Current billing subscription */
    currentBillingSubscription?: BillingSubscriptionGenqlSelection
    /** All billing subscriptions */
    billingSubscriptions?: BillingSubscriptionGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface OnboardingStepSuccessGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceInvitationGenqlSelection{
    id?: boolean | number
    email?: boolean | number
    expiresAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SendInvitationsOutputGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    errors?: boolean | number
    result?: WorkspaceInvitationGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceUrlsGenqlSelection{
    customUrl?: boolean | number
    subdomainUrl?: boolean | number
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

export interface FeatureFlagDTOGenqlSelection{
    key?: boolean | number
    value?: boolean | number
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

export interface PublicWorkspaceDataOutputGenqlSelection{
    id?: boolean | number
    authProviders?: AuthProvidersGenqlSelection
    logo?: boolean | number
    displayName?: boolean | number
    workspaceUrls?: WorkspaceUrlsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatMessagePartGenqlSelection{
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
    fileUrl?: boolean | number
    providerMetadata?: boolean | number
    createdAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatMessageGenqlSelection{
    id?: boolean | number
    threadId?: boolean | number
    role?: boolean | number
    parts?: AgentChatMessagePartGenqlSelection
    createdAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatThreadGenqlSelection{
    id?: boolean | number
    agentId?: boolean | number
    title?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentHandoffDTOGenqlSelection{
    id?: boolean | number
    description?: boolean | number
    toAgent?: AgentGenqlSelection
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

export interface WorkspaceEdgeGenqlSelection{
    /** The node containing the Workspace */
    node?: WorkspaceGenqlSelection
    /** Cursor for this node. */
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserEdgeGenqlSelection{
    /** The node containing the User */
    node?: UserGenqlSelection
    /** Cursor for this node. */
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DeleteSsoOutputGenqlSelection{
    identityProviderId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EditSsoOutputGenqlSelection{
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

export interface FindAvailableSSOIDPOutputGenqlSelection{
    type?: boolean | number
    id?: boolean | number
    issuer?: boolean | number
    name?: boolean | number
    status?: boolean | number
    workspace?: WorkspaceNameAndIdGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SetupSsoOutputGenqlSelection{
    id?: boolean | number
    type?: boolean | number
    issuer?: boolean | number
    name?: boolean | number
    status?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DeleteTwoFactorAuthenticationMethodOutputGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface InitiateTwoFactorAuthenticationProvisioningOutputGenqlSelection{
    uri?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface VerifyTwoFactorAuthenticationMethodOutputGenqlSelection{
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AuthorizeAppGenqlSelection{
    redirectUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EmailPasswordResetLinkGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface InvalidatePasswordGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AuthTokenGenqlSelection{
    token?: boolean | number
    expiresAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApiKeyTokenGenqlSelection{
    token?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AuthTokenPairGenqlSelection{
    accessOrWorkspaceAgnosticToken?: AuthTokenGenqlSelection
    refreshToken?: AuthTokenGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AuthTokensGenqlSelection{
    tokens?: AuthTokenPairGenqlSelection
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
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AvailableWorkspacesAndAccessTokensOutputGenqlSelection{
    tokens?: AuthTokenPairGenqlSelection
    availableWorkspaces?: AvailableWorkspacesGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface GetAuthorizationUrlForSSOOutputGenqlSelection{
    authorizationURL?: boolean | number
    type?: boolean | number
    id?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface GetLoginTokenFromEmailVerificationTokenOutputGenqlSelection{
    loginToken?: AuthTokenGenqlSelection
    workspaceUrls?: WorkspaceUrlsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceUrlsAndIdGenqlSelection{
    workspaceUrls?: WorkspaceUrlsGenqlSelection
    id?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SignUpOutputGenqlSelection{
    loginToken?: AuthTokenGenqlSelection
    workspace?: WorkspaceUrlsAndIdGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LoginTokenGenqlSelection{
    loginToken?: AuthTokenGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CheckUserExistOutputGenqlSelection{
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

export interface OnDbEventDTOGenqlSelection{
    action?: boolean | number
    objectNameSingular?: boolean | number
    eventDate?: boolean | number
    record?: boolean | number
    updatedFields?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserMappingOptionsUserGenqlSelection{
    user?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RemoteServerGenqlSelection{
    id?: boolean | number
    foreignDataWrapperId?: boolean | number
    foreignDataWrapperType?: boolean | number
    label?: boolean | number
    foreignDataWrapperOptions?: boolean | number
    userMappingOptions?: UserMappingOptionsUserGenqlSelection
    schema?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RemoteTableGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    status?: boolean | number
    schema?: boolean | number
    schemaPendingUpdates?: boolean | number
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

export interface ConfigVariablesOutputGenqlSelection{
    groups?: ConfigVariablesGroupDataGenqlSelection
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

export interface ImpersonateOutputGenqlSelection{
    loginToken?: AuthTokenGenqlSelection
    workspace?: WorkspaceUrlsAndIdGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AppTokenEdgeGenqlSelection{
    /** The node containing the AppToken */
    node?: AppTokenGenqlSelection
    /** Cursor for this node. */
    cursor?: boolean | number
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

export interface ApplicationGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    description?: boolean | number
    version?: boolean | number
    agents?: AgentGenqlSelection
    serverlessFunctions?: ServerlessFunctionGenqlSelection
    objects?: ObjectGenqlSelection
    applicationVariables?: ApplicationVariableGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TimelineCalendarEventParticipantGenqlSelection{
    personId?: boolean | number
    workspaceMemberId?: boolean | number
    firstName?: boolean | number
    lastName?: boolean | number
    displayName?: boolean | number
    avatarUrl?: boolean | number
    handle?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LinkMetadataGenqlSelection{
    label?: boolean | number
    url?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LinksMetadataGenqlSelection{
    primaryLinkLabel?: boolean | number
    primaryLinkUrl?: boolean | number
    secondaryLinks?: LinkMetadataGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TimelineCalendarEventGenqlSelection{
    id?: boolean | number
    title?: boolean | number
    isCanceled?: boolean | number
    isFullDay?: boolean | number
    startsAt?: boolean | number
    endsAt?: boolean | number
    description?: boolean | number
    location?: boolean | number
    conferenceSolution?: boolean | number
    conferenceLink?: LinksMetadataGenqlSelection
    participants?: TimelineCalendarEventParticipantGenqlSelection
    visibility?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TimelineCalendarEventsWithTotalGenqlSelection{
    totalNumberOfCalendarEvents?: boolean | number
    timelineCalendarEvents?: TimelineCalendarEventGenqlSelection
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

export interface AutocompleteResultDtoGenqlSelection{
    text?: boolean | number
    placeId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LocationDtoGenqlSelection{
    lat?: boolean | number
    lng?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PlaceDetailsResultDtoGenqlSelection{
    state?: boolean | number
    postcode?: boolean | number
    city?: boolean | number
    country?: boolean | number
    location?: LocationDtoGenqlSelection
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
    accountOwnerId?: boolean | number
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

export interface TimelineThreadParticipantGenqlSelection{
    personId?: boolean | number
    workspaceMemberId?: boolean | number
    firstName?: boolean | number
    lastName?: boolean | number
    displayName?: boolean | number
    avatarUrl?: boolean | number
    handle?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TimelineThreadGenqlSelection{
    id?: boolean | number
    read?: boolean | number
    visibility?: boolean | number
    firstParticipant?: TimelineThreadParticipantGenqlSelection
    lastTwoParticipants?: TimelineThreadParticipantGenqlSelection
    lastMessageReceivedAt?: boolean | number
    lastMessageBody?: boolean | number
    subject?: boolean | number
    numberOfMessagesInThread?: boolean | number
    participantCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TimelineThreadsWithTotalGenqlSelection{
    totalNumberOfThreads?: boolean | number
    timelineThreads?: TimelineThreadGenqlSelection
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

export interface SearchRecordGenqlSelection{
    recordId?: boolean | number
    objectNameSingular?: boolean | number
    label?: boolean | number
    imageUrl?: boolean | number
    tsRankCD?: boolean | number
    tsRank?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SearchResultEdgeGenqlSelection{
    node?: SearchRecordGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SearchResultPageInfoGenqlSelection{
    endCursor?: boolean | number
    hasNextPage?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SearchResultConnectionGenqlSelection{
    edges?: SearchResultEdgeGenqlSelection
    pageInfo?: SearchResultPageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkflowRunGenqlSelection{
    workflowRunId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkflowVersionStepChangesGenqlSelection{
    triggerDiff?: boolean | number
    stepsDiff?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkflowStepPositionGenqlSelection{
    x?: boolean | number
    y?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkflowActionGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    type?: boolean | number
    settings?: boolean | number
    valid?: boolean | number
    nextStepIds?: boolean | number
    position?: WorkflowStepPositionGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkflowVersionDTOGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    createdAt?: boolean | number
    updatedAt?: boolean | number
    workflowId?: boolean | number
    status?: boolean | number
    trigger?: boolean | number
    steps?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ChannelSyncSuccessGenqlSelection{
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingTrialPeriodDTOGenqlSelection{
    duration?: boolean | number
    isCreditCardRequired?: boolean | number
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
    provider?: boolean | number
    inputCostPer1kTokensInCredits?: boolean | number
    outputCostPer1kTokensInCredits?: boolean | number
    nativeCapabilities?: NativeModelCapabilitiesGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingGenqlSelection{
    isBillingEnabled?: boolean | number
    billingUrl?: boolean | number
    trialPeriods?: BillingTrialPeriodDTOGenqlSelection
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

export interface QueryGenqlSelection{
    object?: (ObjectGenqlSelection & { __args: {
    /** The id of the record to find. */
    id: Scalars['UUID']} })
    objects?: (ObjectConnectionGenqlSelection & { __args?: {
    /** Limit or page results. */
    paging?: CursorPaging, 
    /** Specify to filter the records returned. */
    filter?: ObjectFilter} })
    getCoreViewFields?: (CoreViewFieldGenqlSelection & { __args: {viewId: Scalars['String']} })
    getCoreViewField?: (CoreViewFieldGenqlSelection & { __args: {id: Scalars['String']} })
    getCoreViews?: (CoreViewGenqlSelection & { __args?: {objectMetadataId?: (Scalars['String'] | null)} })
    getCoreView?: (CoreViewGenqlSelection & { __args: {id: Scalars['String']} })
    getCoreViewSorts?: (CoreViewSortGenqlSelection & { __args?: {viewId?: (Scalars['String'] | null)} })
    getCoreViewSort?: (CoreViewSortGenqlSelection & { __args: {id: Scalars['String']} })
    getCoreViewGroups?: (CoreViewGroupGenqlSelection & { __args?: {viewId?: (Scalars['String'] | null)} })
    getCoreViewGroup?: (CoreViewGroupGenqlSelection & { __args: {id: Scalars['String']} })
    getCoreViewFilterGroups?: (CoreViewFilterGroupGenqlSelection & { __args?: {viewId?: (Scalars['String'] | null)} })
    getCoreViewFilterGroup?: (CoreViewFilterGroupGenqlSelection & { __args: {id: Scalars['String']} })
    getCoreViewFilters?: (CoreViewFilterGenqlSelection & { __args?: {viewId?: (Scalars['String'] | null)} })
    getCoreViewFilter?: (CoreViewFilterGenqlSelection & { __args: {id: Scalars['String']} })
    index?: (IndexGenqlSelection & { __args: {
    /** The id of the record to find. */
    id: Scalars['UUID']} })
    indexMetadatas?: (IndexConnectionGenqlSelection & { __args?: {
    /** Limit or page results. */
    paging?: CursorPaging, 
    /** Specify to filter the records returned. */
    filter?: IndexFilter} })
    findOneServerlessFunction?: (ServerlessFunctionGenqlSelection & { __args: {input: ServerlessFunctionIdInput} })
    findManyServerlessFunctions?: ServerlessFunctionGenqlSelection
    getAvailablePackages?: { __args: {input: ServerlessFunctionIdInput} }
    getServerlessFunctionSourceCode?: { __args: {input: GetServerlessFunctionSourceCodeInput} }
    findOneDatabaseEventTrigger?: (DatabaseEventTriggerGenqlSelection & { __args: {input: DatabaseEventTriggerIdInput} })
    findManyDatabaseEventTriggers?: DatabaseEventTriggerGenqlSelection
    findOneCronTrigger?: (CronTriggerGenqlSelection & { __args: {input: CronTriggerIdInput} })
    findManyCronTriggers?: CronTriggerGenqlSelection
    findOneRouteTrigger?: (RouteTriggerGenqlSelection & { __args: {input: RouteTriggerIdInput} })
    findManyRouteTriggers?: RouteTriggerGenqlSelection
    checkUserExists?: (CheckUserExistOutputGenqlSelection & { __args: {email: Scalars['String'], captchaToken?: (Scalars['String'] | null)} })
    checkWorkspaceInviteHashIsValid?: (WorkspaceInviteHashValidGenqlSelection & { __args: {inviteHash: Scalars['String']} })
    findWorkspaceFromInviteHash?: (WorkspaceGenqlSelection & { __args: {inviteHash: Scalars['String']} })
    validatePasswordResetToken?: (ValidatePasswordResetTokenGenqlSelection & { __args: {passwordResetToken: Scalars['String']} })
    apiKeys?: ApiKeyGenqlSelection
    apiKey?: (ApiKeyGenqlSelection & { __args: {input: GetApiKeyDTO} })
    currentUser?: UserGenqlSelection
    findWorkspaceInvitations?: WorkspaceInvitationGenqlSelection
    billingPortalSession?: (BillingSessionOutputGenqlSelection & { __args?: {returnUrlPath?: (Scalars['String'] | null)} })
    listPlans?: BillingPlanOutputGenqlSelection
    getMeteredProductsUsage?: BillingMeteredProductUsageOutputGenqlSelection
    getApprovedAccessDomains?: ApprovedAccessDomainGenqlSelection
    currentWorkspace?: WorkspaceGenqlSelection
    getPublicWorkspaceDataByDomain?: (PublicWorkspaceDataOutputGenqlSelection & { __args?: {origin?: (Scalars['String'] | null)} })
    findManyAgents?: AgentGenqlSelection
    findOneAgent?: (AgentGenqlSelection & { __args: {input: AgentIdInput} })
    findAgentHandoffTargets?: (AgentGenqlSelection & { __args: {input: AgentIdInput} })
    findAgentHandoffs?: (AgentHandoffDTOGenqlSelection & { __args: {input: AgentIdInput} })
    agentChatThreads?: (AgentChatThreadGenqlSelection & { __args: {agentId: Scalars['UUID']} })
    agentChatThread?: (AgentChatThreadGenqlSelection & { __args: {id: Scalars['UUID']} })
    agentChatMessages?: (AgentChatMessageGenqlSelection & { __args: {threadId: Scalars['UUID']} })
    getRoles?: RoleGenqlSelection
    field?: (FieldGenqlSelection & { __args: {
    /** The id of the record to find. */
    id: Scalars['UUID']} })
    fields?: (FieldConnectionGenqlSelection & { __args?: {
    /** Limit or page results. */
    paging?: CursorPaging, 
    /** Specify to filter the records returned. */
    filter?: FieldFilter} })
    getSSOIdentityProviders?: FindAvailableSSOIDPOutputGenqlSelection
    findOneRemoteServerById?: (RemoteServerGenqlSelection & { __args: {input: RemoteServerIdInput} })
    findManyRemoteServersByType?: (RemoteServerGenqlSelection & { __args: {input: RemoteServerTypeInput} })
    findDistantTablesWithStatus?: (RemoteTableGenqlSelection & { __args: {input: FindManyRemoteTablesInput} })
    getPageLayouts?: (PageLayoutGenqlSelection & { __args?: {objectMetadataId?: (Scalars['String'] | null)} })
    getPageLayout?: (PageLayoutGenqlSelection & { __args: {id: Scalars['String']} })
    getPageLayoutTabs?: (PageLayoutTabGenqlSelection & { __args: {pageLayoutId: Scalars['String']} })
    getPageLayoutTab?: (PageLayoutTabGenqlSelection & { __args: {id: Scalars['String']} })
    getPageLayoutWidgets?: (PageLayoutWidgetGenqlSelection & { __args: {pageLayoutTabId: Scalars['String']} })
    getPageLayoutWidget?: (PageLayoutWidgetGenqlSelection & { __args: {id: Scalars['String']} })
    webhooks?: WebhookGenqlSelection
    webhook?: (WebhookGenqlSelection & { __args: {input: GetWebhookDTO} })
    search?: (SearchResultConnectionGenqlSelection & { __args: {searchInput: Scalars['String'], limit: Scalars['Int'], after?: (Scalars['String'] | null), includedObjectNameSingulars?: (Scalars['String'][] | null), filter?: (ObjectRecordFilterInput | null), excludedObjectNameSingulars?: (Scalars['String'][] | null)} })
    getConnectedImapSmtpCaldavAccount?: (ConnectedImapSmtpCaldavAccountGenqlSelection & { __args: {id: Scalars['UUID']} })
    getAutoCompleteAddress?: (AutocompleteResultDtoGenqlSelection & { __args: {address: Scalars['String'], token: Scalars['String'], country?: (Scalars['String'] | null), isFieldCity?: (Scalars['Boolean'] | null)} })
    getAddressDetails?: (PlaceDetailsResultDtoGenqlSelection & { __args: {placeId: Scalars['String'], token: Scalars['String']} })
    getConfigVariablesGrouped?: ConfigVariablesOutputGenqlSelection
    getSystemHealthStatus?: SystemHealthGenqlSelection
    getIndicatorHealthStatus?: (AdminPanelHealthServiceDataGenqlSelection & { __args: {indicatorId: HealthIndicatorId} })
    getQueueMetrics?: (QueueMetricsDataGenqlSelection & { __args: {queueName: Scalars['String'], timeRange?: (QueueMetricsTimeRange | null)} })
    versionInfo?: VersionInfoGenqlSelection
    getDatabaseConfigVariable?: (ConfigVariableGenqlSelection & { __args: {key: Scalars['String']} })
    getPostgresCredentials?: PostgresCredentialsGenqlSelection
    findManyPublicDomains?: PublicDomainGenqlSelection
    getEmailingDomains?: EmailingDomainGenqlSelection
    getTimelineCalendarEventsFromPersonId?: (TimelineCalendarEventsWithTotalGenqlSelection & { __args: {personId: Scalars['UUID'], page: Scalars['Int'], pageSize: Scalars['Int']} })
    getTimelineCalendarEventsFromCompanyId?: (TimelineCalendarEventsWithTotalGenqlSelection & { __args: {companyId: Scalars['UUID'], page: Scalars['Int'], pageSize: Scalars['Int']} })
    getTimelineCalendarEventsFromOpportunityId?: (TimelineCalendarEventsWithTotalGenqlSelection & { __args: {opportunityId: Scalars['UUID'], page: Scalars['Int'], pageSize: Scalars['Int']} })
    getTimelineThreadsFromPersonId?: (TimelineThreadsWithTotalGenqlSelection & { __args: {personId: Scalars['UUID'], page: Scalars['Int'], pageSize: Scalars['Int']} })
    getTimelineThreadsFromCompanyId?: (TimelineThreadsWithTotalGenqlSelection & { __args: {companyId: Scalars['UUID'], page: Scalars['Int'], pageSize: Scalars['Int']} })
    getTimelineThreadsFromOpportunityId?: (TimelineThreadsWithTotalGenqlSelection & { __args: {opportunityId: Scalars['UUID'], page: Scalars['Int'], pageSize: Scalars['Int']} })
    findManyApplications?: ApplicationGenqlSelection
    findOneApplication?: (ApplicationGenqlSelection & { __args: {id: Scalars['UUID']} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ServerlessFunctionIdInput {
/** The id of the function. */
id: Scalars['ID']}

export interface GetServerlessFunctionSourceCodeInput {
/** The id of the function. */
id: Scalars['ID'],
/** The version of the function */
version?: Scalars['String']}

export interface DatabaseEventTriggerIdInput {id: Scalars['String']}

export interface CronTriggerIdInput {id: Scalars['String']}

export interface RouteTriggerIdInput {id: Scalars['String']}

export interface GetApiKeyDTO {id: Scalars['UUID']}

export interface AgentIdInput {
/** The id of the agent. */
id: Scalars['UUID']}

export interface RemoteServerIdInput {
/** The id of the record. */
id: Scalars['ID']}

export interface RemoteServerTypeInput {foreignDataWrapperType: Scalars['String']}

export interface FindManyRemoteTablesInput {
/** The id of the remote server. */
id: Scalars['ID'],
/** Indicates if pending schema updates status should be computed. */
shouldFetchPendingSchemaUpdates?: (Scalars['Boolean'] | null)}

export interface GetWebhookDTO {id: Scalars['UUID']}

export interface ObjectRecordFilterInput {and?: (ObjectRecordFilterInput[] | null),not?: (ObjectRecordFilterInput | null),or?: (ObjectRecordFilterInput[] | null),id?: (UUIDFilter | null),createdAt?: (DateFilter | null),updatedAt?: (DateFilter | null),deletedAt?: (DateFilter | null)}

export interface UUIDFilter {eq?: (Scalars['UUID'] | null),gt?: (Scalars['UUID'] | null),gte?: (Scalars['UUID'] | null),in?: (Scalars['UUID'][] | null),lt?: (Scalars['UUID'] | null),lte?: (Scalars['UUID'] | null),neq?: (Scalars['UUID'] | null),is?: (FilterIs | null)}

export interface DateFilter {eq?: (Scalars['Date'] | null),gt?: (Scalars['Date'] | null),gte?: (Scalars['Date'] | null),in?: (Scalars['Date'][] | null),lt?: (Scalars['Date'] | null),lte?: (Scalars['Date'] | null),neq?: (Scalars['Date'] | null),is?: (FilterIs | null)}

export interface MutationGenqlSelection{
    createObjectEvent?: (AnalyticsGenqlSelection & { __args: {event: Scalars['String'], recordId: Scalars['UUID'], objectMetadataId: Scalars['UUID'], properties?: (Scalars['JSON'] | null)} })
    trackAnalytics?: (AnalyticsGenqlSelection & { __args: {type: AnalyticsType, name?: (Scalars['String'] | null), event?: (Scalars['String'] | null), properties?: (Scalars['JSON'] | null)} })
    deleteOneObject?: (ObjectGenqlSelection & { __args: {input: DeleteOneObjectInput} })
    updateOneObject?: (ObjectGenqlSelection & { __args: {input: UpdateOneObjectInput} })
    createOneObject?: (ObjectGenqlSelection & { __args: {input: CreateOneObjectInput} })
    updateCoreViewField?: (CoreViewFieldGenqlSelection & { __args: {input: UpdateViewFieldInput} })
    createCoreViewField?: (CoreViewFieldGenqlSelection & { __args: {input: CreateViewFieldInput} })
    deleteCoreViewField?: (CoreViewFieldGenqlSelection & { __args: {input: DeleteViewFieldInput} })
    destroyCoreViewField?: (CoreViewFieldGenqlSelection & { __args: {input: DestroyViewFieldInput} })
    createCoreView?: (CoreViewGenqlSelection & { __args: {input: CreateViewInput} })
    updateCoreView?: (CoreViewGenqlSelection & { __args: {id: Scalars['String'], input: UpdateViewInput} })
    deleteCoreView?: { __args: {id: Scalars['String']} }
    destroyCoreView?: { __args: {id: Scalars['String']} }
    createCoreViewSort?: (CoreViewSortGenqlSelection & { __args: {input: CreateViewSortInput} })
    updateCoreViewSort?: (CoreViewSortGenqlSelection & { __args: {id: Scalars['String'], input: UpdateViewSortInput} })
    deleteCoreViewSort?: { __args: {id: Scalars['String']} }
    destroyCoreViewSort?: { __args: {id: Scalars['String']} }
    createCoreViewGroup?: (CoreViewGroupGenqlSelection & { __args: {input: CreateViewGroupInput} })
    updateCoreViewGroup?: (CoreViewGroupGenqlSelection & { __args: {input: UpdateViewGroupInput} })
    deleteCoreViewGroup?: (CoreViewGroupGenqlSelection & { __args: {input: DeleteViewGroupInput} })
    destroyCoreViewGroup?: (CoreViewGroupGenqlSelection & { __args: {input: DestroyViewGroupInput} })
    createCoreViewFilterGroup?: (CoreViewFilterGroupGenqlSelection & { __args: {input: CreateViewFilterGroupInput} })
    updateCoreViewFilterGroup?: (CoreViewFilterGroupGenqlSelection & { __args: {id: Scalars['String'], input: UpdateViewFilterGroupInput} })
    deleteCoreViewFilterGroup?: { __args: {id: Scalars['String']} }
    destroyCoreViewFilterGroup?: { __args: {id: Scalars['String']} }
    createCoreViewFilter?: (CoreViewFilterGenqlSelection & { __args: {input: CreateViewFilterInput} })
    updateCoreViewFilter?: (CoreViewFilterGenqlSelection & { __args: {input: UpdateViewFilterInput} })
    deleteCoreViewFilter?: (CoreViewFilterGenqlSelection & { __args: {input: DeleteViewFilterInput} })
    destroyCoreViewFilter?: (CoreViewFilterGenqlSelection & { __args: {input: DestroyViewFilterInput} })
    deleteOneServerlessFunction?: (ServerlessFunctionGenqlSelection & { __args: {input: ServerlessFunctionIdInput} })
    updateOneServerlessFunction?: (ServerlessFunctionGenqlSelection & { __args: {input: UpdateServerlessFunctionInput} })
    createOneServerlessFunction?: (ServerlessFunctionGenqlSelection & { __args: {input: CreateServerlessFunctionInput} })
    executeOneServerlessFunction?: (ServerlessFunctionExecutionResultGenqlSelection & { __args: {input: ExecuteServerlessFunctionInput} })
    publishServerlessFunction?: (ServerlessFunctionGenqlSelection & { __args: {input: PublishServerlessFunctionInput} })
    createOneServerlessFunctionLayer?: (ServerlessFunctionLayerGenqlSelection & { __args: {packageJson: Scalars['JSON'], yarnLock: Scalars['String']} })
    createFile?: (FileGenqlSelection & { __args: {file: Scalars['Upload']} })
    deleteFile?: (FileGenqlSelection & { __args: {fileId: Scalars['UUID']} })
    uploadFile?: (SignedFileDTOGenqlSelection & { __args: {file: Scalars['Upload'], fileFolder?: (FileFolder | null)} })
    uploadImage?: (SignedFileDTOGenqlSelection & { __args: {file: Scalars['Upload'], fileFolder?: (FileFolder | null)} })
    deleteOneDatabaseEventTrigger?: (DatabaseEventTriggerGenqlSelection & { __args: {input: DatabaseEventTriggerIdInput} })
    updateOneDatabaseEventTrigger?: (DatabaseEventTriggerGenqlSelection & { __args: {input: UpdateDatabaseEventTriggerInput} })
    createOneDatabaseEventTrigger?: (DatabaseEventTriggerGenqlSelection & { __args: {input: CreateDatabaseEventTriggerInput} })
    deleteOneCronTrigger?: (CronTriggerGenqlSelection & { __args: {input: CronTriggerIdInput} })
    updateOneCronTrigger?: (CronTriggerGenqlSelection & { __args: {input: UpdateCronTriggerInput} })
    createOneCronTrigger?: (CronTriggerGenqlSelection & { __args: {input: CreateCronTriggerInput} })
    deleteOneRouteTrigger?: (RouteTriggerGenqlSelection & { __args: {input: RouteTriggerIdInput} })
    updateOneRouteTrigger?: (RouteTriggerGenqlSelection & { __args: {input: UpdateRouteTriggerInput} })
    createOneRouteTrigger?: (RouteTriggerGenqlSelection & { __args: {input: CreateRouteTriggerInput} })
    getAuthorizationUrlForSSO?: (GetAuthorizationUrlForSSOOutputGenqlSelection & { __args: {input: GetAuthorizationUrlForSSOInput} })
    getLoginTokenFromCredentials?: (LoginTokenGenqlSelection & { __args: {email: Scalars['String'], password: Scalars['String'], captchaToken?: (Scalars['String'] | null), locale?: (Scalars['String'] | null), verifyEmailRedirectPath?: (Scalars['String'] | null), origin: Scalars['String']} })
    signIn?: (AvailableWorkspacesAndAccessTokensOutputGenqlSelection & { __args: {email: Scalars['String'], password: Scalars['String'], captchaToken?: (Scalars['String'] | null), locale?: (Scalars['String'] | null), verifyEmailRedirectPath?: (Scalars['String'] | null)} })
    getLoginTokenFromEmailVerificationToken?: (GetLoginTokenFromEmailVerificationTokenOutputGenqlSelection & { __args: {emailVerificationToken: Scalars['String'], email: Scalars['String'], captchaToken?: (Scalars['String'] | null), origin: Scalars['String']} })
    getWorkspaceAgnosticTokenFromEmailVerificationToken?: (AvailableWorkspacesAndAccessTokensOutputGenqlSelection & { __args: {emailVerificationToken: Scalars['String'], email: Scalars['String'], captchaToken?: (Scalars['String'] | null)} })
    getAuthTokensFromOTP?: (AuthTokensGenqlSelection & { __args: {otp: Scalars['String'], loginToken: Scalars['String'], captchaToken?: (Scalars['String'] | null), origin: Scalars['String']} })
    signUp?: (AvailableWorkspacesAndAccessTokensOutputGenqlSelection & { __args: {email: Scalars['String'], password: Scalars['String'], captchaToken?: (Scalars['String'] | null), locale?: (Scalars['String'] | null), verifyEmailRedirectPath?: (Scalars['String'] | null)} })
    signUpInWorkspace?: (SignUpOutputGenqlSelection & { __args: {email: Scalars['String'], password: Scalars['String'], workspaceId?: (Scalars['UUID'] | null), workspaceInviteHash?: (Scalars['String'] | null), workspacePersonalInviteToken?: (Scalars['String'] | null), captchaToken?: (Scalars['String'] | null), locale?: (Scalars['String'] | null), verifyEmailRedirectPath?: (Scalars['String'] | null)} })
    signUpInNewWorkspace?: SignUpOutputGenqlSelection
    generateTransientToken?: TransientTokenGenqlSelection
    getAuthTokensFromLoginToken?: (AuthTokensGenqlSelection & { __args: {loginToken: Scalars['String'], origin: Scalars['String']} })
    authorizeApp?: (AuthorizeAppGenqlSelection & { __args: {clientId: Scalars['String'], codeChallenge?: (Scalars['String'] | null), redirectUrl: Scalars['String']} })
    renewToken?: (AuthTokensGenqlSelection & { __args: {appToken: Scalars['String']} })
    generateApiKeyToken?: (ApiKeyTokenGenqlSelection & { __args: {apiKeyId: Scalars['UUID'], expiresAt: Scalars['String']} })
    emailPasswordResetLink?: (EmailPasswordResetLinkGenqlSelection & { __args: {email: Scalars['String'], workspaceId: Scalars['UUID']} })
    updatePasswordViaResetToken?: (InvalidatePasswordGenqlSelection & { __args: {passwordResetToken: Scalars['String'], newPassword: Scalars['String']} })
    createApiKey?: (ApiKeyGenqlSelection & { __args: {input: CreateApiKeyDTO} })
    updateApiKey?: (ApiKeyGenqlSelection & { __args: {input: UpdateApiKeyDTO} })
    revokeApiKey?: (ApiKeyGenqlSelection & { __args: {input: RevokeApiKeyDTO} })
    assignRoleToApiKey?: { __args: {apiKeyId: Scalars['UUID'], roleId: Scalars['UUID']} }
    initiateOTPProvisioning?: (InitiateTwoFactorAuthenticationProvisioningOutputGenqlSelection & { __args: {loginToken: Scalars['String'], origin: Scalars['String']} })
    initiateOTPProvisioningForAuthenticatedUser?: InitiateTwoFactorAuthenticationProvisioningOutputGenqlSelection
    deleteTwoFactorAuthenticationMethod?: (DeleteTwoFactorAuthenticationMethodOutputGenqlSelection & { __args: {twoFactorAuthenticationMethodId: Scalars['UUID']} })
    verifyTwoFactorAuthenticationMethodForAuthenticatedUser?: (VerifyTwoFactorAuthenticationMethodOutputGenqlSelection & { __args: {otp: Scalars['String']} })
    uploadProfilePicture?: (SignedFileDTOGenqlSelection & { __args: {file: Scalars['Upload']} })
    deleteUser?: UserGenqlSelection
    deleteWorkspaceInvitation?: { __args: {appTokenId: Scalars['String']} }
    resendWorkspaceInvitation?: (SendInvitationsOutputGenqlSelection & { __args: {appTokenId: Scalars['String']} })
    sendInvitations?: (SendInvitationsOutputGenqlSelection & { __args: {emails: Scalars['String'][]} })
    skipSyncEmailOnboardingStep?: OnboardingStepSuccessGenqlSelection
    skipBookOnboardingStep?: OnboardingStepSuccessGenqlSelection
    checkoutSession?: (BillingSessionOutputGenqlSelection & { __args: {recurringInterval: SubscriptionInterval, plan?: BillingPlanKey, requirePaymentMethod?: Scalars['Boolean'], successUrlPath?: (Scalars['String'] | null)} })
    switchSubscriptionInterval?: BillingUpdateOutputGenqlSelection
    switchBillingPlan?: BillingUpdateOutputGenqlSelection
    cancelSwitchBillingPlan?: BillingUpdateOutputGenqlSelection
    cancelSwitchBillingInterval?: BillingUpdateOutputGenqlSelection
    setMeteredSubscriptionPrice?: (BillingUpdateOutputGenqlSelection & { __args: {priceId: Scalars['String']} })
    endSubscriptionTrialPeriod?: BillingEndTrialPeriodOutputGenqlSelection
    cancelSwitchMeteredPrice?: BillingUpdateOutputGenqlSelection
    createApprovedAccessDomain?: (ApprovedAccessDomainGenqlSelection & { __args: {input: CreateApprovedAccessDomainInput} })
    deleteApprovedAccessDomain?: { __args: {input: DeleteApprovedAccessDomainInput} }
    validateApprovedAccessDomain?: (ApprovedAccessDomainGenqlSelection & { __args: {input: ValidateApprovedAccessDomainInput} })
    activateWorkspace?: (WorkspaceGenqlSelection & { __args: {data: ActivateWorkspaceInput} })
    updateWorkspace?: (WorkspaceGenqlSelection & { __args: {data: UpdateWorkspaceInput} })
    uploadWorkspaceLogo?: (SignedFileDTOGenqlSelection & { __args: {file: Scalars['Upload']} })
    deleteCurrentWorkspace?: WorkspaceGenqlSelection
    checkCustomDomainValidRecords?: DomainValidRecordsGenqlSelection
    createOneAgent?: (AgentGenqlSelection & { __args: {input: CreateAgentInput} })
    updateOneAgent?: (AgentGenqlSelection & { __args: {input: UpdateAgentInput} })
    deleteOneAgent?: (AgentGenqlSelection & { __args: {input: AgentIdInput} })
    createAgentHandoff?: { __args: {input: CreateAgentHandoffInput} }
    removeAgentHandoff?: { __args: {input: RemoveAgentHandoffInput} }
    createAgentChatThread?: (AgentChatThreadGenqlSelection & { __args: {input: CreateAgentChatThreadInput} })
    updateWorkspaceMemberRole?: (WorkspaceMemberGenqlSelection & { __args: {workspaceMemberId: Scalars['UUID'], roleId: Scalars['UUID']} })
    createOneRole?: (RoleGenqlSelection & { __args: {createRoleInput: CreateRoleInput} })
    updateOneRole?: (RoleGenqlSelection & { __args: {updateRoleInput: UpdateRoleInput} })
    deleteOneRole?: { __args: {roleId: Scalars['UUID']} }
    upsertObjectPermissions?: (ObjectPermissionGenqlSelection & { __args: {upsertObjectPermissionsInput: UpsertObjectPermissionsInput} })
    upsertPermissionFlags?: (PermissionFlagGenqlSelection & { __args: {upsertPermissionFlagsInput: UpsertPermissionFlagsInput} })
    upsertFieldPermissions?: (FieldPermissionGenqlSelection & { __args: {upsertFieldPermissionsInput: UpsertFieldPermissionsInput} })
    assignRoleToAgent?: { __args: {agentId: Scalars['UUID'], roleId: Scalars['UUID']} }
    removeRoleFromAgent?: { __args: {agentId: Scalars['UUID']} }
    createOneField?: (FieldGenqlSelection & { __args: {input: CreateOneFieldMetadataInput} })
    updateOneField?: (FieldGenqlSelection & { __args: {input: UpdateOneFieldMetadataInput} })
    deleteOneField?: (FieldGenqlSelection & { __args: {input: DeleteOneFieldInput} })
    resendEmailVerificationToken?: (ResendEmailVerificationTokenOutputGenqlSelection & { __args: {email: Scalars['String'], origin: Scalars['String']} })
    createOIDCIdentityProvider?: (SetupSsoOutputGenqlSelection & { __args: {input: SetupOIDCSsoInput} })
    createSAMLIdentityProvider?: (SetupSsoOutputGenqlSelection & { __args: {input: SetupSAMLSsoInput} })
    deleteSSOIdentityProvider?: (DeleteSsoOutputGenqlSelection & { __args: {input: DeleteSsoInput} })
    editSSOIdentityProvider?: (EditSsoOutputGenqlSelection & { __args: {input: EditSsoInput} })
    createOneRemoteServer?: (RemoteServerGenqlSelection & { __args: {input: CreateRemoteServerInput} })
    updateOneRemoteServer?: (RemoteServerGenqlSelection & { __args: {input: UpdateRemoteServerInput} })
    deleteOneRemoteServer?: (RemoteServerGenqlSelection & { __args: {input: RemoteServerIdInput} })
    syncRemoteTable?: (RemoteTableGenqlSelection & { __args: {input: RemoteTableInput} })
    unsyncRemoteTable?: (RemoteTableGenqlSelection & { __args: {input: RemoteTableInput} })
    syncRemoteTableSchemaChanges?: (RemoteTableGenqlSelection & { __args: {input: RemoteTableInput} })
    impersonate?: (ImpersonateOutputGenqlSelection & { __args: {userId: Scalars['UUID'], workspaceId: Scalars['UUID']} })
    createPageLayout?: (PageLayoutGenqlSelection & { __args: {input: CreatePageLayoutInput} })
    updatePageLayout?: (PageLayoutGenqlSelection & { __args: {id: Scalars['String'], input: UpdatePageLayoutInput} })
    deletePageLayout?: (PageLayoutGenqlSelection & { __args: {id: Scalars['String']} })
    destroyPageLayout?: { __args: {id: Scalars['String']} }
    restorePageLayout?: (PageLayoutGenqlSelection & { __args: {id: Scalars['String']} })
    updatePageLayoutWithTabsAndWidgets?: (PageLayoutGenqlSelection & { __args: {id: Scalars['String'], input: UpdatePageLayoutWithTabsInput} })
    createPageLayoutTab?: (PageLayoutTabGenqlSelection & { __args: {input: CreatePageLayoutTabInput} })
    updatePageLayoutTab?: (PageLayoutTabGenqlSelection & { __args: {id: Scalars['String'], input: UpdatePageLayoutTabInput} })
    deletePageLayoutTab?: { __args: {id: Scalars['String']} }
    destroyPageLayoutTab?: { __args: {id: Scalars['String']} }
    restorePageLayoutTab?: (PageLayoutTabGenqlSelection & { __args: {id: Scalars['String']} })
    createPageLayoutWidget?: (PageLayoutWidgetGenqlSelection & { __args: {input: CreatePageLayoutWidgetInput} })
    updatePageLayoutWidget?: (PageLayoutWidgetGenqlSelection & { __args: {id: Scalars['String'], input: UpdatePageLayoutWidgetInput} })
    deletePageLayoutWidget?: (PageLayoutWidgetGenqlSelection & { __args: {id: Scalars['String']} })
    destroyPageLayoutWidget?: { __args: {id: Scalars['String']} }
    restorePageLayoutWidget?: (PageLayoutWidgetGenqlSelection & { __args: {id: Scalars['String']} })
    createWebhook?: (WebhookGenqlSelection & { __args: {input: CreateWebhookDTO} })
    updateWebhook?: (WebhookGenqlSelection & { __args: {input: UpdateWebhookDTO} })
    deleteWebhook?: { __args: {input: DeleteWebhookDTO} }
    startChannelSync?: (ChannelSyncSuccessGenqlSelection & { __args: {connectedAccountId: Scalars['UUID']} })
    saveImapSmtpCaldavAccount?: (ImapSmtpCaldavConnectionSuccessGenqlSelection & { __args: {accountOwnerId: Scalars['UUID'], handle: Scalars['String'], connectionParameters: EmailAccountConnectionParameters, id?: (Scalars['UUID'] | null)} })
    updateLabPublicFeatureFlag?: (FeatureFlagDTOGenqlSelection & { __args: {input: UpdateLabPublicFeatureFlagInput} })
    userLookupAdminPanel?: (UserLookupGenqlSelection & { __args: {userIdentifier: Scalars['String']} })
    updateWorkspaceFeatureFlag?: { __args: {workspaceId: Scalars['UUID'], featureFlag: Scalars['String'], value: Scalars['Boolean']} }
    createDatabaseConfigVariable?: { __args: {key: Scalars['String'], value: Scalars['JSON']} }
    updateDatabaseConfigVariable?: { __args: {key: Scalars['String'], value: Scalars['JSON']} }
    deleteDatabaseConfigVariable?: { __args: {key: Scalars['String']} }
    activateWorkflowVersion?: { __args: {workflowVersionId: Scalars['UUID']} }
    deactivateWorkflowVersion?: { __args: {workflowVersionId: Scalars['UUID']} }
    runWorkflowVersion?: (WorkflowRunGenqlSelection & { __args: {input: RunWorkflowVersionInput} })
    computeStepOutputSchema?: { __args: {input: ComputeStepOutputSchemaInput} }
    createWorkflowVersionStep?: (WorkflowVersionStepChangesGenqlSelection & { __args: {input: CreateWorkflowVersionStepInput} })
    updateWorkflowVersionStep?: (WorkflowActionGenqlSelection & { __args: {input: UpdateWorkflowVersionStepInput} })
    deleteWorkflowVersionStep?: (WorkflowVersionStepChangesGenqlSelection & { __args: {input: DeleteWorkflowVersionStepInput} })
    submitFormStep?: { __args: {input: SubmitFormStepInput} }
    updateWorkflowRunStep?: (WorkflowActionGenqlSelection & { __args: {input: UpdateWorkflowRunStepInput} })
    duplicateWorkflowVersionStep?: (WorkflowVersionStepChangesGenqlSelection & { __args: {input: DuplicateWorkflowVersionStepInput} })
    createWorkflowVersionEdge?: (WorkflowVersionStepChangesGenqlSelection & { __args: {input: CreateWorkflowVersionEdgeInput} })
    deleteWorkflowVersionEdge?: (WorkflowVersionStepChangesGenqlSelection & { __args: {input: CreateWorkflowVersionEdgeInput} })
    createDraftFromWorkflowVersion?: (WorkflowVersionDTOGenqlSelection & { __args: {input: CreateDraftFromWorkflowVersionInput} })
    updateWorkflowVersionPositions?: { __args: {input: UpdateWorkflowVersionPositionsInput} }
    enablePostgresProxy?: PostgresCredentialsGenqlSelection
    disablePostgresProxy?: PostgresCredentialsGenqlSelection
    createPublicDomain?: (PublicDomainGenqlSelection & { __args: {domain: Scalars['String']} })
    deletePublicDomain?: { __args: {domain: Scalars['String']} }
    checkPublicDomainValidRecords?: (DomainValidRecordsGenqlSelection & { __args: {domain: Scalars['String']} })
    createEmailingDomain?: (EmailingDomainGenqlSelection & { __args: {domain: Scalars['String'], driver: EmailingDomainDriver} })
    deleteEmailingDomain?: { __args: {id: Scalars['String']} }
    verifyEmailingDomain?: (EmailingDomainGenqlSelection & { __args: {id: Scalars['String']} })
    createOneAppToken?: (AppTokenGenqlSelection & { __args: {input: CreateOneAppTokenInput} })
    syncApplication?: { __args: {manifest: Scalars['JSON'], packageJson: Scalars['JSON'], yarnLock: Scalars['String']} }
    deleteApplication?: { __args: {packageJson: Scalars['JSON']} }
    updateOneApplicationVariable?: { __args: {key: Scalars['String'], value: Scalars['String'], applicationId: Scalars['UUID']} }
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DeleteOneObjectInput {
/** The id of the record to delete. */
id: Scalars['UUID']}

export interface UpdateOneObjectInput {update: UpdateObjectPayload,
/** The id of the object to update */
id: Scalars['UUID']}

export interface UpdateObjectPayload {labelSingular?: (Scalars['String'] | null),labelPlural?: (Scalars['String'] | null),nameSingular?: (Scalars['String'] | null),namePlural?: (Scalars['String'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),shortcut?: (Scalars['String'] | null),isActive?: (Scalars['Boolean'] | null),labelIdentifierFieldMetadataId?: (Scalars['UUID'] | null),imageIdentifierFieldMetadataId?: (Scalars['UUID'] | null),isLabelSyncedWithName?: (Scalars['Boolean'] | null)}

export interface CreateOneObjectInput {
/** The record to create */
object: CreateObjectInput}

export interface CreateObjectInput {nameSingular: Scalars['String'],namePlural: Scalars['String'],labelSingular: Scalars['String'],labelPlural: Scalars['String'],description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),shortcut?: (Scalars['String'] | null),isRemote?: (Scalars['Boolean'] | null),primaryKeyColumnType?: (Scalars['String'] | null),primaryKeyFieldMetadataSettings?: (Scalars['JSON'] | null),isLabelSyncedWithName?: (Scalars['Boolean'] | null)}

export interface UpdateViewFieldInput {
/** The id of the view field to update */
id: Scalars['UUID'],
/** The view field to update */
update: UpdateViewFieldInputUpdates}

export interface UpdateViewFieldInputUpdates {isVisible?: (Scalars['Boolean'] | null),size?: (Scalars['Float'] | null),position?: (Scalars['Float'] | null),aggregateOperation?: (AggregateOperations | null)}

export interface CreateViewFieldInput {id?: (Scalars['UUID'] | null),fieldMetadataId: Scalars['UUID'],viewId: Scalars['UUID'],isVisible?: (Scalars['Boolean'] | null),size?: (Scalars['Float'] | null),position?: (Scalars['Float'] | null),aggregateOperation?: (AggregateOperations | null)}

export interface DeleteViewFieldInput {
/** The id of the view field to delete. */
id: Scalars['UUID']}

export interface DestroyViewFieldInput {
/** The id of the view field to destroy. */
id: Scalars['UUID']}

export interface CreateViewInput {id?: (Scalars['UUID'] | null),name: Scalars['String'],objectMetadataId: Scalars['UUID'],type?: (ViewType | null),key?: (ViewKey | null),icon: Scalars['String'],position?: (Scalars['Float'] | null),isCompact?: (Scalars['Boolean'] | null),openRecordIn?: (ViewOpenRecordIn | null),kanbanAggregateOperation?: (AggregateOperations | null),kanbanAggregateOperationFieldMetadataId?: (Scalars['UUID'] | null),anyFieldFilterValue?: (Scalars['String'] | null),calendarLayout?: (ViewCalendarLayout | null),calendarFieldMetadataId?: (Scalars['UUID'] | null)}

export interface UpdateViewInput {id?: (Scalars['UUID'] | null),name?: (Scalars['String'] | null),type?: (ViewType | null),icon?: (Scalars['String'] | null),position?: (Scalars['Float'] | null),isCompact?: (Scalars['Boolean'] | null),openRecordIn?: (ViewOpenRecordIn | null),kanbanAggregateOperation?: (AggregateOperations | null),kanbanAggregateOperationFieldMetadataId?: (Scalars['UUID'] | null),anyFieldFilterValue?: (Scalars['String'] | null),calendarLayout?: (ViewCalendarLayout | null),calendarFieldMetadataId?: (Scalars['UUID'] | null)}

export interface CreateViewSortInput {id?: (Scalars['UUID'] | null),fieldMetadataId: Scalars['UUID'],direction?: (ViewSortDirection | null),viewId: Scalars['UUID']}

export interface UpdateViewSortInput {id?: (Scalars['UUID'] | null),fieldMetadataId?: (Scalars['UUID'] | null),direction?: (ViewSortDirection | null),viewId?: (Scalars['UUID'] | null)}

export interface CreateViewGroupInput {id?: (Scalars['UUID'] | null),fieldMetadataId: Scalars['UUID'],isVisible?: (Scalars['Boolean'] | null),fieldValue: Scalars['String'],position?: (Scalars['Float'] | null),viewId: Scalars['UUID']}

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

export interface UpdateServerlessFunctionInput {
/** Id of the serverless function to update */
id: Scalars['UUID'],
/** The serverless function updates */
update: UpdateServerlessFunctionInputUpdates}

export interface UpdateServerlessFunctionInputUpdates {name: Scalars['String'],description?: (Scalars['String'] | null),timeoutSeconds?: (Scalars['Float'] | null),code: Scalars['JSON']}

export interface CreateServerlessFunctionInput {name: Scalars['String'],description?: (Scalars['String'] | null),timeoutSeconds?: (Scalars['Float'] | null),code?: (Scalars['JSON'] | null)}

export interface ExecuteServerlessFunctionInput {
/** Id of the serverless function to execute */
id: Scalars['UUID'],
/** Payload in JSON format */
payload: Scalars['JSON'],
/** Version of the serverless function to execute */
version?: Scalars['String']}

export interface PublishServerlessFunctionInput {
/** The id of the function. */
id: Scalars['ID']}

export interface UpdateDatabaseEventTriggerInput {
/** The id of the database event trigger to update */
id: Scalars['String'],
/** The database event trigger updates */
update: UpdateDatabaseEventTriggerInputUpdates}

export interface UpdateDatabaseEventTriggerInputUpdates {settings: Scalars['JSON']}

export interface CreateDatabaseEventTriggerInput {settings: Scalars['JSON'],serverlessFunctionId: Scalars['String']}

export interface UpdateCronTriggerInput {
/** The id of the cron trigger to update */
id: Scalars['String'],
/** The cron trigger updates */
update: UpdateCronTriggerInputUpdates}

export interface UpdateCronTriggerInputUpdates {settings: Scalars['JSON']}

export interface CreateCronTriggerInput {settings: Scalars['JSON'],serverlessFunctionId: Scalars['String']}

export interface UpdateRouteTriggerInput {
/** The id of the route to update */
id: Scalars['String'],
/** The route updates */
update: UpdateRouteTriggerInputUpdates}

export interface UpdateRouteTriggerInputUpdates {path: Scalars['String'],isAuthRequired: Scalars['Boolean'],httpMethod: HTTPMethod}

export interface CreateRouteTriggerInput {path: Scalars['String'],isAuthRequired?: Scalars['Boolean'],httpMethod?: HTTPMethod,serverlessFunctionId: Scalars['String']}

export interface GetAuthorizationUrlForSSOInput {identityProviderId: Scalars['UUID'],workspaceInviteHash?: (Scalars['String'] | null)}

export interface CreateApiKeyDTO {name: Scalars['String'],expiresAt: Scalars['String'],revokedAt?: (Scalars['String'] | null),roleId: Scalars['UUID']}

export interface UpdateApiKeyDTO {id: Scalars['UUID'],name?: (Scalars['String'] | null),expiresAt?: (Scalars['String'] | null),revokedAt?: (Scalars['String'] | null)}

export interface RevokeApiKeyDTO {id: Scalars['UUID']}

export interface CreateApprovedAccessDomainInput {domain: Scalars['String'],email: Scalars['String']}

export interface DeleteApprovedAccessDomainInput {id: Scalars['UUID']}

export interface ValidateApprovedAccessDomainInput {validationToken: Scalars['String'],approvedAccessDomainId: Scalars['UUID']}

export interface ActivateWorkspaceInput {displayName?: (Scalars['String'] | null)}

export interface UpdateWorkspaceInput {subdomain?: (Scalars['String'] | null),customDomain?: (Scalars['String'] | null),displayName?: (Scalars['String'] | null),logo?: (Scalars['String'] | null),inviteHash?: (Scalars['String'] | null),isPublicInviteLinkEnabled?: (Scalars['Boolean'] | null),allowImpersonation?: (Scalars['Boolean'] | null),isGoogleAuthEnabled?: (Scalars['Boolean'] | null),isMicrosoftAuthEnabled?: (Scalars['Boolean'] | null),isPasswordAuthEnabled?: (Scalars['Boolean'] | null),defaultRoleId?: (Scalars['UUID'] | null),isTwoFactorAuthenticationEnforced?: (Scalars['Boolean'] | null),trashRetentionDays?: (Scalars['Float'] | null)}

export interface CreateAgentInput {name?: (Scalars['String'] | null),label: Scalars['String'],icon?: (Scalars['String'] | null),description?: (Scalars['String'] | null),prompt: Scalars['String'],modelId: Scalars['String'],roleId?: (Scalars['UUID'] | null),responseFormat?: (Scalars['JSON'] | null),modelConfiguration?: (Scalars['JSON'] | null)}

export interface UpdateAgentInput {id: Scalars['UUID'],name: Scalars['String'],label: Scalars['String'],icon?: (Scalars['String'] | null),description?: (Scalars['String'] | null),prompt: Scalars['String'],modelId: Scalars['String'],roleId?: (Scalars['UUID'] | null),responseFormat?: (Scalars['JSON'] | null),modelConfiguration?: (Scalars['JSON'] | null)}

export interface CreateAgentHandoffInput {fromAgentId: Scalars['UUID'],toAgentId: Scalars['UUID'],description?: (Scalars['String'] | null)}

export interface RemoveAgentHandoffInput {fromAgentId: Scalars['UUID'],toAgentId: Scalars['UUID']}

export interface CreateAgentChatThreadInput {agentId: Scalars['UUID']}

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

export interface CreateOneFieldMetadataInput {
/** The record to create */
field: CreateFieldInput}

export interface CreateFieldInput {type: FieldMetadataType,name: Scalars['String'],label: Scalars['String'],description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),isCustom?: (Scalars['Boolean'] | null),isActive?: (Scalars['Boolean'] | null),isSystem?: (Scalars['Boolean'] | null),isUIReadOnly?: (Scalars['Boolean'] | null),isNullable?: (Scalars['Boolean'] | null),isUnique?: (Scalars['Boolean'] | null),defaultValue?: (Scalars['JSON'] | null),options?: (Scalars['JSON'] | null),settings?: (Scalars['JSON'] | null),isLabelSyncedWithName?: (Scalars['Boolean'] | null),objectMetadataId: Scalars['UUID'],isRemoteCreation?: (Scalars['Boolean'] | null),relationCreationPayload?: (Scalars['JSON'] | null),morphRelationsCreationPayload?: (Scalars['JSON'][] | null)}

export interface UpdateOneFieldMetadataInput {
/** The id of the record to update */
id: Scalars['UUID'],
/** The record to update */
update: UpdateFieldInput}

export interface UpdateFieldInput {name?: (Scalars['String'] | null),label?: (Scalars['String'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),isActive?: (Scalars['Boolean'] | null),isSystem?: (Scalars['Boolean'] | null),isUIReadOnly?: (Scalars['Boolean'] | null),isNullable?: (Scalars['Boolean'] | null),isUnique?: (Scalars['Boolean'] | null),defaultValue?: (Scalars['JSON'] | null),options?: (Scalars['JSON'] | null),settings?: (Scalars['JSON'] | null),isLabelSyncedWithName?: (Scalars['Boolean'] | null)}

export interface DeleteOneFieldInput {
/** The id of the field to delete. */
id: Scalars['UUID']}

export interface SetupOIDCSsoInput {name: Scalars['String'],issuer: Scalars['String'],clientID: Scalars['String'],clientSecret: Scalars['String']}

export interface SetupSAMLSsoInput {name: Scalars['String'],issuer: Scalars['String'],id: Scalars['UUID'],ssoURL: Scalars['String'],certificate: Scalars['String'],fingerprint?: (Scalars['String'] | null)}

export interface DeleteSsoInput {identityProviderId: Scalars['UUID']}

export interface EditSsoInput {id: Scalars['UUID'],status: SSOIdentityProviderStatus}

export interface CreateRemoteServerInput {foreignDataWrapperType: Scalars['String'],foreignDataWrapperOptions: Scalars['JSON'],label: Scalars['String'],userMappingOptions?: (UserMappingOptions | null),schema?: (Scalars['String'] | null)}

export interface UserMappingOptions {user?: (Scalars['String'] | null),password?: (Scalars['String'] | null)}

export interface UpdateRemoteServerInput {id: Scalars['UUID'],foreignDataWrapperOptions?: (Scalars['JSON'] | null),label?: (Scalars['String'] | null),userMappingOptions?: (UserMappingOptionsUpdateInput | null),schema?: (Scalars['String'] | null)}

export interface UserMappingOptionsUpdateInput {user?: (Scalars['String'] | null),password?: (Scalars['String'] | null)}

export interface RemoteTableInput {remoteServerId: Scalars['UUID'],name: Scalars['String']}

export interface CreatePageLayoutInput {name: Scalars['String'],type?: (PageLayoutType | null),objectMetadataId?: (Scalars['UUID'] | null)}

export interface UpdatePageLayoutInput {name?: (Scalars['String'] | null),type?: (PageLayoutType | null),objectMetadataId?: (Scalars['UUID'] | null)}

export interface UpdatePageLayoutWithTabsInput {name: Scalars['String'],type: PageLayoutType,objectMetadataId?: (Scalars['UUID'] | null),tabs: UpdatePageLayoutTabWithWidgetsInput[]}

export interface UpdatePageLayoutTabWithWidgetsInput {id: Scalars['UUID'],title: Scalars['String'],position: Scalars['Float'],widgets: UpdatePageLayoutWidgetWithIdInput[]}

export interface UpdatePageLayoutWidgetWithIdInput {id: Scalars['UUID'],pageLayoutTabId: Scalars['UUID'],title: Scalars['String'],type: WidgetType,objectMetadataId?: (Scalars['UUID'] | null),gridPosition: GridPositionInput,configuration?: (Scalars['JSON'] | null)}

export interface GridPositionInput {row: Scalars['Float'],column: Scalars['Float'],rowSpan: Scalars['Float'],columnSpan: Scalars['Float']}

export interface CreatePageLayoutTabInput {title: Scalars['String'],position?: (Scalars['Float'] | null),pageLayoutId: Scalars['UUID']}

export interface UpdatePageLayoutTabInput {title?: (Scalars['String'] | null),position?: (Scalars['Float'] | null)}

export interface CreatePageLayoutWidgetInput {pageLayoutTabId: Scalars['UUID'],title: Scalars['String'],type?: (WidgetType | null),objectMetadataId?: (Scalars['UUID'] | null),gridPosition: GridPositionInput,configuration?: (Scalars['JSON'] | null)}

export interface UpdatePageLayoutWidgetInput {title?: (Scalars['String'] | null),type?: (WidgetType | null),objectMetadataId?: (Scalars['UUID'] | null),gridPosition?: (GridPositionInput | null),configuration?: (Scalars['JSON'] | null)}

export interface CreateWebhookDTO {targetUrl: Scalars['String'],operations: Scalars['String'][],description?: (Scalars['String'] | null),secret?: (Scalars['String'] | null)}

export interface UpdateWebhookDTO {id: Scalars['UUID'],targetUrl?: (Scalars['String'] | null),operations?: (Scalars['String'][] | null),description?: (Scalars['String'] | null),secret?: (Scalars['String'] | null)}

export interface DeleteWebhookDTO {id: Scalars['UUID']}

export interface EmailAccountConnectionParameters {IMAP?: (ConnectionParameters | null),SMTP?: (ConnectionParameters | null),CALDAV?: (ConnectionParameters | null)}

export interface ConnectionParameters {host: Scalars['String'],port: Scalars['Float'],username?: (Scalars['String'] | null),password: Scalars['String'],secure?: (Scalars['Boolean'] | null)}

export interface UpdateLabPublicFeatureFlagInput {publicFeatureFlag: Scalars['String'],value: Scalars['Boolean']}

export interface RunWorkflowVersionInput {
/** Workflow version ID */
workflowVersionId: Scalars['UUID'],
/** Workflow run ID */
workflowRunId?: (Scalars['UUID'] | null),
/** Execution result in JSON format */
payload?: (Scalars['JSON'] | null)}

export interface ComputeStepOutputSchemaInput {
/** Step JSON format */
step: Scalars['JSON'],
/** Workflow version ID */
workflowVersionId?: (Scalars['UUID'] | null)}

export interface CreateWorkflowVersionStepInput {
/** Workflow version ID */
workflowVersionId: Scalars['UUID'],
/** New step type */
stepType: Scalars['String'],
/** Parent step ID */
parentStepId?: (Scalars['String'] | null),
/** Parent step connection options */
parentStepConnectionOptions?: (Scalars['JSON'] | null),
/** Next step ID */
nextStepId?: (Scalars['UUID'] | null),
/** Step position */
position?: (WorkflowStepPositionInput | null),
/** Step ID */
id?: (Scalars['String'] | null)}

export interface WorkflowStepPositionInput {x: Scalars['Float'],y: Scalars['Float']}

export interface UpdateWorkflowVersionStepInput {
/** Workflow version ID */
workflowVersionId: Scalars['UUID'],
/** Step to update in JSON format */
step: Scalars['JSON']}

export interface DeleteWorkflowVersionStepInput {
/** Workflow version ID */
workflowVersionId: Scalars['UUID'],
/** Step to delete ID */
stepId: Scalars['String']}

export interface SubmitFormStepInput {
/** Workflow step ID */
stepId: Scalars['UUID'],
/** Workflow run ID */
workflowRunId: Scalars['UUID'],
/** Form response in JSON format */
response: Scalars['JSON']}

export interface UpdateWorkflowRunStepInput {
/** Workflow run ID */
workflowRunId: Scalars['UUID'],
/** Step to update in JSON format */
step: Scalars['JSON']}

export interface DuplicateWorkflowVersionStepInput {stepId: Scalars['String'],workflowVersionId: Scalars['String']}

export interface CreateWorkflowVersionEdgeInput {
/** Workflow version ID */
workflowVersionId: Scalars['String'],
/** Workflow version source step ID */
source: Scalars['String'],
/** Workflow version target step ID */
target: Scalars['String'],
/** Workflow version source step connection options */
sourceConnectionOptions?: (Scalars['JSON'] | null)}

export interface CreateDraftFromWorkflowVersionInput {
/** Workflow ID */
workflowId: Scalars['UUID'],
/** Workflow version ID */
workflowVersionIdToCopy: Scalars['UUID']}

export interface UpdateWorkflowVersionPositionsInput {
/** Workflow version ID */
workflowVersionId: Scalars['UUID'],
/** Workflow version updated positions */
positions: WorkflowStepPositionUpdateInput[]}

export interface WorkflowStepPositionUpdateInput {
/** Step or trigger ID */
id: Scalars['String'],
/** Position of the step or trigger */
position: WorkflowStepPositionInput}

export interface CreateOneAppTokenInput {
/** The record to create */
appToken: CreateAppTokenInput}

export interface CreateAppTokenInput {expiresAt: Scalars['DateTime']}

export interface SubscriptionGenqlSelection{
    onDbEvent?: (OnDbEventDTOGenqlSelection & { __args: {input: OnDbEventInput} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface OnDbEventInput {action?: (DatabaseEventAction | null),objectNameSingular?: (Scalars['String'] | null),recordId?: (Scalars['UUID'] | null)}


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
    


    const FeatureFlag_possibleTypes: string[] = ['FeatureFlag']
    export const isFeatureFlag = (obj?: { __typename?: any } | null): obj is FeatureFlag => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFeatureFlag"')
      return FeatureFlag_possibleTypes.includes(obj.__typename)
    }
    


    const TwoFactorAuthenticationMethodDTO_possibleTypes: string[] = ['TwoFactorAuthenticationMethodDTO']
    export const isTwoFactorAuthenticationMethodDTO = (obj?: { __typename?: any } | null): obj is TwoFactorAuthenticationMethodDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTwoFactorAuthenticationMethodDTO"')
      return TwoFactorAuthenticationMethodDTO_possibleTypes.includes(obj.__typename)
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
    


    const Webhook_possibleTypes: string[] = ['Webhook']
    export const isWebhook = (obj?: { __typename?: any } | null): obj is Webhook => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWebhook"')
      return Webhook_possibleTypes.includes(obj.__typename)
    }
    


    const Agent_possibleTypes: string[] = ['Agent']
    export const isAgent = (obj?: { __typename?: any } | null): obj is Agent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgent"')
      return Agent_possibleTypes.includes(obj.__typename)
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
    


    const CoreViewField_possibleTypes: string[] = ['CoreViewField']
    export const isCoreViewField = (obj?: { __typename?: any } | null): obj is CoreViewField => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCoreViewField"')
      return CoreViewField_possibleTypes.includes(obj.__typename)
    }
    


    const CoreViewFilterGroup_possibleTypes: string[] = ['CoreViewFilterGroup']
    export const isCoreViewFilterGroup = (obj?: { __typename?: any } | null): obj is CoreViewFilterGroup => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCoreViewFilterGroup"')
      return CoreViewFilterGroup_possibleTypes.includes(obj.__typename)
    }
    


    const CoreViewFilter_possibleTypes: string[] = ['CoreViewFilter']
    export const isCoreViewFilter = (obj?: { __typename?: any } | null): obj is CoreViewFilter => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCoreViewFilter"')
      return CoreViewFilter_possibleTypes.includes(obj.__typename)
    }
    


    const CoreViewGroup_possibleTypes: string[] = ['CoreViewGroup']
    export const isCoreViewGroup = (obj?: { __typename?: any } | null): obj is CoreViewGroup => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCoreViewGroup"')
      return CoreViewGroup_possibleTypes.includes(obj.__typename)
    }
    


    const CoreViewSort_possibleTypes: string[] = ['CoreViewSort']
    export const isCoreViewSort = (obj?: { __typename?: any } | null): obj is CoreViewSort => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCoreViewSort"')
      return CoreViewSort_possibleTypes.includes(obj.__typename)
    }
    


    const CoreView_possibleTypes: string[] = ['CoreView']
    export const isCoreView = (obj?: { __typename?: any } | null): obj is CoreView => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCoreView"')
      return CoreView_possibleTypes.includes(obj.__typename)
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
    


    const WidgetConfiguration_possibleTypes: string[] = ['BarChartConfiguration','LineChartConfiguration','PieChartConfiguration','NumberChartConfiguration','GaugeChartConfiguration','IframeConfiguration']
    export const isWidgetConfiguration = (obj?: { __typename?: any } | null): obj is WidgetConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWidgetConfiguration"')
      return WidgetConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const BarChartConfiguration_possibleTypes: string[] = ['BarChartConfiguration']
    export const isBarChartConfiguration = (obj?: { __typename?: any } | null): obj is BarChartConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBarChartConfiguration"')
      return BarChartConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const LineChartConfiguration_possibleTypes: string[] = ['LineChartConfiguration']
    export const isLineChartConfiguration = (obj?: { __typename?: any } | null): obj is LineChartConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLineChartConfiguration"')
      return LineChartConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const PieChartConfiguration_possibleTypes: string[] = ['PieChartConfiguration']
    export const isPieChartConfiguration = (obj?: { __typename?: any } | null): obj is PieChartConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPieChartConfiguration"')
      return PieChartConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const NumberChartConfiguration_possibleTypes: string[] = ['NumberChartConfiguration']
    export const isNumberChartConfiguration = (obj?: { __typename?: any } | null): obj is NumberChartConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNumberChartConfiguration"')
      return NumberChartConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const GaugeChartConfiguration_possibleTypes: string[] = ['GaugeChartConfiguration']
    export const isGaugeChartConfiguration = (obj?: { __typename?: any } | null): obj is GaugeChartConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isGaugeChartConfiguration"')
      return GaugeChartConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const IframeConfiguration_possibleTypes: string[] = ['IframeConfiguration']
    export const isIframeConfiguration = (obj?: { __typename?: any } | null): obj is IframeConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isIframeConfiguration"')
      return IframeConfiguration_possibleTypes.includes(obj.__typename)
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
    


    const StandardOverrides_possibleTypes: string[] = ['StandardOverrides']
    export const isStandardOverrides = (obj?: { __typename?: any } | null): obj is StandardOverrides => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isStandardOverrides"')
      return StandardOverrides_possibleTypes.includes(obj.__typename)
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
    


    const Analytics_possibleTypes: string[] = ['Analytics']
    export const isAnalytics = (obj?: { __typename?: any } | null): obj is Analytics => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAnalytics"')
      return Analytics_possibleTypes.includes(obj.__typename)
    }
    


    const BillingProductMetadata_possibleTypes: string[] = ['BillingProductMetadata']
    export const isBillingProductMetadata = (obj?: { __typename?: any } | null): obj is BillingProductMetadata => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingProductMetadata"')
      return BillingProductMetadata_possibleTypes.includes(obj.__typename)
    }
    


    const BillingPriceLicensedDTO_possibleTypes: string[] = ['BillingPriceLicensedDTO']
    export const isBillingPriceLicensedDTO = (obj?: { __typename?: any } | null): obj is BillingPriceLicensedDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingPriceLicensedDTO"')
      return BillingPriceLicensedDTO_possibleTypes.includes(obj.__typename)
    }
    


    const BillingPriceTierDTO_possibleTypes: string[] = ['BillingPriceTierDTO']
    export const isBillingPriceTierDTO = (obj?: { __typename?: any } | null): obj is BillingPriceTierDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingPriceTierDTO"')
      return BillingPriceTierDTO_possibleTypes.includes(obj.__typename)
    }
    


    const BillingPriceMeteredDTO_possibleTypes: string[] = ['BillingPriceMeteredDTO']
    export const isBillingPriceMeteredDTO = (obj?: { __typename?: any } | null): obj is BillingPriceMeteredDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingPriceMeteredDTO"')
      return BillingPriceMeteredDTO_possibleTypes.includes(obj.__typename)
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
    


    const BillingSubscriptionItemDTO_possibleTypes: string[] = ['BillingSubscriptionItemDTO']
    export const isBillingSubscriptionItemDTO = (obj?: { __typename?: any } | null): obj is BillingSubscriptionItemDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingSubscriptionItemDTO"')
      return BillingSubscriptionItemDTO_possibleTypes.includes(obj.__typename)
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
    


    const BillingSubscription_possibleTypes: string[] = ['BillingSubscription']
    export const isBillingSubscription = (obj?: { __typename?: any } | null): obj is BillingSubscription => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingSubscription"')
      return BillingSubscription_possibleTypes.includes(obj.__typename)
    }
    


    const ResendEmailVerificationTokenOutput_possibleTypes: string[] = ['ResendEmailVerificationTokenOutput']
    export const isResendEmailVerificationTokenOutput = (obj?: { __typename?: any } | null): obj is ResendEmailVerificationTokenOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isResendEmailVerificationTokenOutput"')
      return ResendEmailVerificationTokenOutput_possibleTypes.includes(obj.__typename)
    }
    


    const ApprovedAccessDomain_possibleTypes: string[] = ['ApprovedAccessDomain']
    export const isApprovedAccessDomain = (obj?: { __typename?: any } | null): obj is ApprovedAccessDomain => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApprovedAccessDomain"')
      return ApprovedAccessDomain_possibleTypes.includes(obj.__typename)
    }
    


    const File_possibleTypes: string[] = ['File']
    export const isFile = (obj?: { __typename?: any } | null): obj is File => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFile"')
      return File_possibleTypes.includes(obj.__typename)
    }
    


    const SignedFileDTO_possibleTypes: string[] = ['SignedFileDTO']
    export const isSignedFileDTO = (obj?: { __typename?: any } | null): obj is SignedFileDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSignedFileDTO"')
      return SignedFileDTO_possibleTypes.includes(obj.__typename)
    }
    


    const ServerlessFunctionLayer_possibleTypes: string[] = ['ServerlessFunctionLayer']
    export const isServerlessFunctionLayer = (obj?: { __typename?: any } | null): obj is ServerlessFunctionLayer => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isServerlessFunctionLayer"')
      return ServerlessFunctionLayer_possibleTypes.includes(obj.__typename)
    }
    


    const ServerlessFunctionExecutionResult_possibleTypes: string[] = ['ServerlessFunctionExecutionResult']
    export const isServerlessFunctionExecutionResult = (obj?: { __typename?: any } | null): obj is ServerlessFunctionExecutionResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isServerlessFunctionExecutionResult"')
      return ServerlessFunctionExecutionResult_possibleTypes.includes(obj.__typename)
    }
    


    const CronTrigger_possibleTypes: string[] = ['CronTrigger']
    export const isCronTrigger = (obj?: { __typename?: any } | null): obj is CronTrigger => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCronTrigger"')
      return CronTrigger_possibleTypes.includes(obj.__typename)
    }
    


    const DatabaseEventTrigger_possibleTypes: string[] = ['DatabaseEventTrigger']
    export const isDatabaseEventTrigger = (obj?: { __typename?: any } | null): obj is DatabaseEventTrigger => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDatabaseEventTrigger"')
      return DatabaseEventTrigger_possibleTypes.includes(obj.__typename)
    }
    


    const RouteTrigger_possibleTypes: string[] = ['RouteTrigger']
    export const isRouteTrigger = (obj?: { __typename?: any } | null): obj is RouteTrigger => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRouteTrigger"')
      return RouteTrigger_possibleTypes.includes(obj.__typename)
    }
    


    const ServerlessFunction_possibleTypes: string[] = ['ServerlessFunction']
    export const isServerlessFunction = (obj?: { __typename?: any } | null): obj is ServerlessFunction => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isServerlessFunction"')
      return ServerlessFunction_possibleTypes.includes(obj.__typename)
    }
    


    const BillingEndTrialPeriodOutput_possibleTypes: string[] = ['BillingEndTrialPeriodOutput']
    export const isBillingEndTrialPeriodOutput = (obj?: { __typename?: any } | null): obj is BillingEndTrialPeriodOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingEndTrialPeriodOutput"')
      return BillingEndTrialPeriodOutput_possibleTypes.includes(obj.__typename)
    }
    


    const BillingMeteredProductUsageOutput_possibleTypes: string[] = ['BillingMeteredProductUsageOutput']
    export const isBillingMeteredProductUsageOutput = (obj?: { __typename?: any } | null): obj is BillingMeteredProductUsageOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingMeteredProductUsageOutput"')
      return BillingMeteredProductUsageOutput_possibleTypes.includes(obj.__typename)
    }
    


    const BillingPlanOutput_possibleTypes: string[] = ['BillingPlanOutput']
    export const isBillingPlanOutput = (obj?: { __typename?: any } | null): obj is BillingPlanOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingPlanOutput"')
      return BillingPlanOutput_possibleTypes.includes(obj.__typename)
    }
    


    const BillingSessionOutput_possibleTypes: string[] = ['BillingSessionOutput']
    export const isBillingSessionOutput = (obj?: { __typename?: any } | null): obj is BillingSessionOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingSessionOutput"')
      return BillingSessionOutput_possibleTypes.includes(obj.__typename)
    }
    


    const BillingUpdateOutput_possibleTypes: string[] = ['BillingUpdateOutput']
    export const isBillingUpdateOutput = (obj?: { __typename?: any } | null): obj is BillingUpdateOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingUpdateOutput"')
      return BillingUpdateOutput_possibleTypes.includes(obj.__typename)
    }
    


    const OnboardingStepSuccess_possibleTypes: string[] = ['OnboardingStepSuccess']
    export const isOnboardingStepSuccess = (obj?: { __typename?: any } | null): obj is OnboardingStepSuccess => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOnboardingStepSuccess"')
      return OnboardingStepSuccess_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceInvitation_possibleTypes: string[] = ['WorkspaceInvitation']
    export const isWorkspaceInvitation = (obj?: { __typename?: any } | null): obj is WorkspaceInvitation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceInvitation"')
      return WorkspaceInvitation_possibleTypes.includes(obj.__typename)
    }
    


    const SendInvitationsOutput_possibleTypes: string[] = ['SendInvitationsOutput']
    export const isSendInvitationsOutput = (obj?: { __typename?: any } | null): obj is SendInvitationsOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSendInvitationsOutput"')
      return SendInvitationsOutput_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceUrls_possibleTypes: string[] = ['WorkspaceUrls']
    export const isWorkspaceUrls = (obj?: { __typename?: any } | null): obj is WorkspaceUrls => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceUrls"')
      return WorkspaceUrls_possibleTypes.includes(obj.__typename)
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
    


    const FeatureFlagDTO_possibleTypes: string[] = ['FeatureFlagDTO']
    export const isFeatureFlagDTO = (obj?: { __typename?: any } | null): obj is FeatureFlagDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFeatureFlagDTO"')
      return FeatureFlagDTO_possibleTypes.includes(obj.__typename)
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
    


    const PublicWorkspaceDataOutput_possibleTypes: string[] = ['PublicWorkspaceDataOutput']
    export const isPublicWorkspaceDataOutput = (obj?: { __typename?: any } | null): obj is PublicWorkspaceDataOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicWorkspaceDataOutput"')
      return PublicWorkspaceDataOutput_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatMessagePart_possibleTypes: string[] = ['AgentChatMessagePart']
    export const isAgentChatMessagePart = (obj?: { __typename?: any } | null): obj is AgentChatMessagePart => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatMessagePart"')
      return AgentChatMessagePart_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatMessage_possibleTypes: string[] = ['AgentChatMessage']
    export const isAgentChatMessage = (obj?: { __typename?: any } | null): obj is AgentChatMessage => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatMessage"')
      return AgentChatMessage_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatThread_possibleTypes: string[] = ['AgentChatThread']
    export const isAgentChatThread = (obj?: { __typename?: any } | null): obj is AgentChatThread => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatThread"')
      return AgentChatThread_possibleTypes.includes(obj.__typename)
    }
    


    const AgentHandoffDTO_possibleTypes: string[] = ['AgentHandoffDTO']
    export const isAgentHandoffDTO = (obj?: { __typename?: any } | null): obj is AgentHandoffDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentHandoffDTO"')
      return AgentHandoffDTO_possibleTypes.includes(obj.__typename)
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
    


    const WorkspaceEdge_possibleTypes: string[] = ['WorkspaceEdge']
    export const isWorkspaceEdge = (obj?: { __typename?: any } | null): obj is WorkspaceEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceEdge"')
      return WorkspaceEdge_possibleTypes.includes(obj.__typename)
    }
    


    const UserEdge_possibleTypes: string[] = ['UserEdge']
    export const isUserEdge = (obj?: { __typename?: any } | null): obj is UserEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUserEdge"')
      return UserEdge_possibleTypes.includes(obj.__typename)
    }
    


    const DeleteSsoOutput_possibleTypes: string[] = ['DeleteSsoOutput']
    export const isDeleteSsoOutput = (obj?: { __typename?: any } | null): obj is DeleteSsoOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDeleteSsoOutput"')
      return DeleteSsoOutput_possibleTypes.includes(obj.__typename)
    }
    


    const EditSsoOutput_possibleTypes: string[] = ['EditSsoOutput']
    export const isEditSsoOutput = (obj?: { __typename?: any } | null): obj is EditSsoOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEditSsoOutput"')
      return EditSsoOutput_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceNameAndId_possibleTypes: string[] = ['WorkspaceNameAndId']
    export const isWorkspaceNameAndId = (obj?: { __typename?: any } | null): obj is WorkspaceNameAndId => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceNameAndId"')
      return WorkspaceNameAndId_possibleTypes.includes(obj.__typename)
    }
    


    const FindAvailableSSOIDPOutput_possibleTypes: string[] = ['FindAvailableSSOIDPOutput']
    export const isFindAvailableSSOIDPOutput = (obj?: { __typename?: any } | null): obj is FindAvailableSSOIDPOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFindAvailableSSOIDPOutput"')
      return FindAvailableSSOIDPOutput_possibleTypes.includes(obj.__typename)
    }
    


    const SetupSsoOutput_possibleTypes: string[] = ['SetupSsoOutput']
    export const isSetupSsoOutput = (obj?: { __typename?: any } | null): obj is SetupSsoOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSetupSsoOutput"')
      return SetupSsoOutput_possibleTypes.includes(obj.__typename)
    }
    


    const DeleteTwoFactorAuthenticationMethodOutput_possibleTypes: string[] = ['DeleteTwoFactorAuthenticationMethodOutput']
    export const isDeleteTwoFactorAuthenticationMethodOutput = (obj?: { __typename?: any } | null): obj is DeleteTwoFactorAuthenticationMethodOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDeleteTwoFactorAuthenticationMethodOutput"')
      return DeleteTwoFactorAuthenticationMethodOutput_possibleTypes.includes(obj.__typename)
    }
    


    const InitiateTwoFactorAuthenticationProvisioningOutput_possibleTypes: string[] = ['InitiateTwoFactorAuthenticationProvisioningOutput']
    export const isInitiateTwoFactorAuthenticationProvisioningOutput = (obj?: { __typename?: any } | null): obj is InitiateTwoFactorAuthenticationProvisioningOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isInitiateTwoFactorAuthenticationProvisioningOutput"')
      return InitiateTwoFactorAuthenticationProvisioningOutput_possibleTypes.includes(obj.__typename)
    }
    


    const VerifyTwoFactorAuthenticationMethodOutput_possibleTypes: string[] = ['VerifyTwoFactorAuthenticationMethodOutput']
    export const isVerifyTwoFactorAuthenticationMethodOutput = (obj?: { __typename?: any } | null): obj is VerifyTwoFactorAuthenticationMethodOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isVerifyTwoFactorAuthenticationMethodOutput"')
      return VerifyTwoFactorAuthenticationMethodOutput_possibleTypes.includes(obj.__typename)
    }
    


    const AuthorizeApp_possibleTypes: string[] = ['AuthorizeApp']
    export const isAuthorizeApp = (obj?: { __typename?: any } | null): obj is AuthorizeApp => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAuthorizeApp"')
      return AuthorizeApp_possibleTypes.includes(obj.__typename)
    }
    


    const EmailPasswordResetLink_possibleTypes: string[] = ['EmailPasswordResetLink']
    export const isEmailPasswordResetLink = (obj?: { __typename?: any } | null): obj is EmailPasswordResetLink => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEmailPasswordResetLink"')
      return EmailPasswordResetLink_possibleTypes.includes(obj.__typename)
    }
    


    const InvalidatePassword_possibleTypes: string[] = ['InvalidatePassword']
    export const isInvalidatePassword = (obj?: { __typename?: any } | null): obj is InvalidatePassword => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isInvalidatePassword"')
      return InvalidatePassword_possibleTypes.includes(obj.__typename)
    }
    


    const AuthToken_possibleTypes: string[] = ['AuthToken']
    export const isAuthToken = (obj?: { __typename?: any } | null): obj is AuthToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAuthToken"')
      return AuthToken_possibleTypes.includes(obj.__typename)
    }
    


    const ApiKeyToken_possibleTypes: string[] = ['ApiKeyToken']
    export const isApiKeyToken = (obj?: { __typename?: any } | null): obj is ApiKeyToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApiKeyToken"')
      return ApiKeyToken_possibleTypes.includes(obj.__typename)
    }
    


    const AuthTokenPair_possibleTypes: string[] = ['AuthTokenPair']
    export const isAuthTokenPair = (obj?: { __typename?: any } | null): obj is AuthTokenPair => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAuthTokenPair"')
      return AuthTokenPair_possibleTypes.includes(obj.__typename)
    }
    


    const AuthTokens_possibleTypes: string[] = ['AuthTokens']
    export const isAuthTokens = (obj?: { __typename?: any } | null): obj is AuthTokens => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAuthTokens"')
      return AuthTokens_possibleTypes.includes(obj.__typename)
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
    


    const AvailableWorkspacesAndAccessTokensOutput_possibleTypes: string[] = ['AvailableWorkspacesAndAccessTokensOutput']
    export const isAvailableWorkspacesAndAccessTokensOutput = (obj?: { __typename?: any } | null): obj is AvailableWorkspacesAndAccessTokensOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAvailableWorkspacesAndAccessTokensOutput"')
      return AvailableWorkspacesAndAccessTokensOutput_possibleTypes.includes(obj.__typename)
    }
    


    const GetAuthorizationUrlForSSOOutput_possibleTypes: string[] = ['GetAuthorizationUrlForSSOOutput']
    export const isGetAuthorizationUrlForSSOOutput = (obj?: { __typename?: any } | null): obj is GetAuthorizationUrlForSSOOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isGetAuthorizationUrlForSSOOutput"')
      return GetAuthorizationUrlForSSOOutput_possibleTypes.includes(obj.__typename)
    }
    


    const GetLoginTokenFromEmailVerificationTokenOutput_possibleTypes: string[] = ['GetLoginTokenFromEmailVerificationTokenOutput']
    export const isGetLoginTokenFromEmailVerificationTokenOutput = (obj?: { __typename?: any } | null): obj is GetLoginTokenFromEmailVerificationTokenOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isGetLoginTokenFromEmailVerificationTokenOutput"')
      return GetLoginTokenFromEmailVerificationTokenOutput_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceUrlsAndId_possibleTypes: string[] = ['WorkspaceUrlsAndId']
    export const isWorkspaceUrlsAndId = (obj?: { __typename?: any } | null): obj is WorkspaceUrlsAndId => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceUrlsAndId"')
      return WorkspaceUrlsAndId_possibleTypes.includes(obj.__typename)
    }
    


    const SignUpOutput_possibleTypes: string[] = ['SignUpOutput']
    export const isSignUpOutput = (obj?: { __typename?: any } | null): obj is SignUpOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSignUpOutput"')
      return SignUpOutput_possibleTypes.includes(obj.__typename)
    }
    


    const LoginToken_possibleTypes: string[] = ['LoginToken']
    export const isLoginToken = (obj?: { __typename?: any } | null): obj is LoginToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLoginToken"')
      return LoginToken_possibleTypes.includes(obj.__typename)
    }
    


    const CheckUserExistOutput_possibleTypes: string[] = ['CheckUserExistOutput']
    export const isCheckUserExistOutput = (obj?: { __typename?: any } | null): obj is CheckUserExistOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCheckUserExistOutput"')
      return CheckUserExistOutput_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceInviteHashValid_possibleTypes: string[] = ['WorkspaceInviteHashValid']
    export const isWorkspaceInviteHashValid = (obj?: { __typename?: any } | null): obj is WorkspaceInviteHashValid => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceInviteHashValid"')
      return WorkspaceInviteHashValid_possibleTypes.includes(obj.__typename)
    }
    


    const OnDbEventDTO_possibleTypes: string[] = ['OnDbEventDTO']
    export const isOnDbEventDTO = (obj?: { __typename?: any } | null): obj is OnDbEventDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOnDbEventDTO"')
      return OnDbEventDTO_possibleTypes.includes(obj.__typename)
    }
    


    const UserMappingOptionsUser_possibleTypes: string[] = ['UserMappingOptionsUser']
    export const isUserMappingOptionsUser = (obj?: { __typename?: any } | null): obj is UserMappingOptionsUser => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUserMappingOptionsUser"')
      return UserMappingOptionsUser_possibleTypes.includes(obj.__typename)
    }
    


    const RemoteServer_possibleTypes: string[] = ['RemoteServer']
    export const isRemoteServer = (obj?: { __typename?: any } | null): obj is RemoteServer => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRemoteServer"')
      return RemoteServer_possibleTypes.includes(obj.__typename)
    }
    


    const RemoteTable_possibleTypes: string[] = ['RemoteTable']
    export const isRemoteTable = (obj?: { __typename?: any } | null): obj is RemoteTable => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRemoteTable"')
      return RemoteTable_possibleTypes.includes(obj.__typename)
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
    


    const ConfigVariablesOutput_possibleTypes: string[] = ['ConfigVariablesOutput']
    export const isConfigVariablesOutput = (obj?: { __typename?: any } | null): obj is ConfigVariablesOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConfigVariablesOutput"')
      return ConfigVariablesOutput_possibleTypes.includes(obj.__typename)
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
    


    const ImpersonateOutput_possibleTypes: string[] = ['ImpersonateOutput']
    export const isImpersonateOutput = (obj?: { __typename?: any } | null): obj is ImpersonateOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isImpersonateOutput"')
      return ImpersonateOutput_possibleTypes.includes(obj.__typename)
    }
    


    const AppTokenEdge_possibleTypes: string[] = ['AppTokenEdge']
    export const isAppTokenEdge = (obj?: { __typename?: any } | null): obj is AppTokenEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAppTokenEdge"')
      return AppTokenEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationVariable_possibleTypes: string[] = ['ApplicationVariable']
    export const isApplicationVariable = (obj?: { __typename?: any } | null): obj is ApplicationVariable => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationVariable"')
      return ApplicationVariable_possibleTypes.includes(obj.__typename)
    }
    


    const Application_possibleTypes: string[] = ['Application']
    export const isApplication = (obj?: { __typename?: any } | null): obj is Application => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplication"')
      return Application_possibleTypes.includes(obj.__typename)
    }
    


    const TimelineCalendarEventParticipant_possibleTypes: string[] = ['TimelineCalendarEventParticipant']
    export const isTimelineCalendarEventParticipant = (obj?: { __typename?: any } | null): obj is TimelineCalendarEventParticipant => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTimelineCalendarEventParticipant"')
      return TimelineCalendarEventParticipant_possibleTypes.includes(obj.__typename)
    }
    


    const LinkMetadata_possibleTypes: string[] = ['LinkMetadata']
    export const isLinkMetadata = (obj?: { __typename?: any } | null): obj is LinkMetadata => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLinkMetadata"')
      return LinkMetadata_possibleTypes.includes(obj.__typename)
    }
    


    const LinksMetadata_possibleTypes: string[] = ['LinksMetadata']
    export const isLinksMetadata = (obj?: { __typename?: any } | null): obj is LinksMetadata => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLinksMetadata"')
      return LinksMetadata_possibleTypes.includes(obj.__typename)
    }
    


    const TimelineCalendarEvent_possibleTypes: string[] = ['TimelineCalendarEvent']
    export const isTimelineCalendarEvent = (obj?: { __typename?: any } | null): obj is TimelineCalendarEvent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTimelineCalendarEvent"')
      return TimelineCalendarEvent_possibleTypes.includes(obj.__typename)
    }
    


    const TimelineCalendarEventsWithTotal_possibleTypes: string[] = ['TimelineCalendarEventsWithTotal']
    export const isTimelineCalendarEventsWithTotal = (obj?: { __typename?: any } | null): obj is TimelineCalendarEventsWithTotal => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTimelineCalendarEventsWithTotal"')
      return TimelineCalendarEventsWithTotal_possibleTypes.includes(obj.__typename)
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
    


    const AutocompleteResultDto_possibleTypes: string[] = ['AutocompleteResultDto']
    export const isAutocompleteResultDto = (obj?: { __typename?: any } | null): obj is AutocompleteResultDto => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAutocompleteResultDto"')
      return AutocompleteResultDto_possibleTypes.includes(obj.__typename)
    }
    


    const LocationDto_possibleTypes: string[] = ['LocationDto']
    export const isLocationDto = (obj?: { __typename?: any } | null): obj is LocationDto => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLocationDto"')
      return LocationDto_possibleTypes.includes(obj.__typename)
    }
    


    const PlaceDetailsResultDto_possibleTypes: string[] = ['PlaceDetailsResultDto']
    export const isPlaceDetailsResultDto = (obj?: { __typename?: any } | null): obj is PlaceDetailsResultDto => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPlaceDetailsResultDto"')
      return PlaceDetailsResultDto_possibleTypes.includes(obj.__typename)
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
    


    const TimelineThreadParticipant_possibleTypes: string[] = ['TimelineThreadParticipant']
    export const isTimelineThreadParticipant = (obj?: { __typename?: any } | null): obj is TimelineThreadParticipant => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTimelineThreadParticipant"')
      return TimelineThreadParticipant_possibleTypes.includes(obj.__typename)
    }
    


    const TimelineThread_possibleTypes: string[] = ['TimelineThread']
    export const isTimelineThread = (obj?: { __typename?: any } | null): obj is TimelineThread => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTimelineThread"')
      return TimelineThread_possibleTypes.includes(obj.__typename)
    }
    


    const TimelineThreadsWithTotal_possibleTypes: string[] = ['TimelineThreadsWithTotal']
    export const isTimelineThreadsWithTotal = (obj?: { __typename?: any } | null): obj is TimelineThreadsWithTotal => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTimelineThreadsWithTotal"')
      return TimelineThreadsWithTotal_possibleTypes.includes(obj.__typename)
    }
    


    const PostgresCredentials_possibleTypes: string[] = ['PostgresCredentials']
    export const isPostgresCredentials = (obj?: { __typename?: any } | null): obj is PostgresCredentials => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPostgresCredentials"')
      return PostgresCredentials_possibleTypes.includes(obj.__typename)
    }
    


    const SearchRecord_possibleTypes: string[] = ['SearchRecord']
    export const isSearchRecord = (obj?: { __typename?: any } | null): obj is SearchRecord => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSearchRecord"')
      return SearchRecord_possibleTypes.includes(obj.__typename)
    }
    


    const SearchResultEdge_possibleTypes: string[] = ['SearchResultEdge']
    export const isSearchResultEdge = (obj?: { __typename?: any } | null): obj is SearchResultEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSearchResultEdge"')
      return SearchResultEdge_possibleTypes.includes(obj.__typename)
    }
    


    const SearchResultPageInfo_possibleTypes: string[] = ['SearchResultPageInfo']
    export const isSearchResultPageInfo = (obj?: { __typename?: any } | null): obj is SearchResultPageInfo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSearchResultPageInfo"')
      return SearchResultPageInfo_possibleTypes.includes(obj.__typename)
    }
    


    const SearchResultConnection_possibleTypes: string[] = ['SearchResultConnection']
    export const isSearchResultConnection = (obj?: { __typename?: any } | null): obj is SearchResultConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSearchResultConnection"')
      return SearchResultConnection_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowRun_possibleTypes: string[] = ['WorkflowRun']
    export const isWorkflowRun = (obj?: { __typename?: any } | null): obj is WorkflowRun => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowRun"')
      return WorkflowRun_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowVersionStepChanges_possibleTypes: string[] = ['WorkflowVersionStepChanges']
    export const isWorkflowVersionStepChanges = (obj?: { __typename?: any } | null): obj is WorkflowVersionStepChanges => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowVersionStepChanges"')
      return WorkflowVersionStepChanges_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowStepPosition_possibleTypes: string[] = ['WorkflowStepPosition']
    export const isWorkflowStepPosition = (obj?: { __typename?: any } | null): obj is WorkflowStepPosition => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowStepPosition"')
      return WorkflowStepPosition_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowAction_possibleTypes: string[] = ['WorkflowAction']
    export const isWorkflowAction = (obj?: { __typename?: any } | null): obj is WorkflowAction => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowAction"')
      return WorkflowAction_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowVersionDTO_possibleTypes: string[] = ['WorkflowVersionDTO']
    export const isWorkflowVersionDTO = (obj?: { __typename?: any } | null): obj is WorkflowVersionDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowVersionDTO"')
      return WorkflowVersionDTO_possibleTypes.includes(obj.__typename)
    }
    


    const ChannelSyncSuccess_possibleTypes: string[] = ['ChannelSyncSuccess']
    export const isChannelSyncSuccess = (obj?: { __typename?: any } | null): obj is ChannelSyncSuccess => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isChannelSyncSuccess"')
      return ChannelSyncSuccess_possibleTypes.includes(obj.__typename)
    }
    


    const BillingTrialPeriodDTO_possibleTypes: string[] = ['BillingTrialPeriodDTO']
    export const isBillingTrialPeriodDTO = (obj?: { __typename?: any } | null): obj is BillingTrialPeriodDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingTrialPeriodDTO"')
      return BillingTrialPeriodDTO_possibleTypes.includes(obj.__typename)
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
    

export const enumFeatureFlagKey = {
   IS_AIRTABLE_INTEGRATION_ENABLED: 'IS_AIRTABLE_INTEGRATION_ENABLED' as const,
   IS_POSTGRESQL_INTEGRATION_ENABLED: 'IS_POSTGRESQL_INTEGRATION_ENABLED' as const,
   IS_STRIPE_INTEGRATION_ENABLED: 'IS_STRIPE_INTEGRATION_ENABLED' as const,
   IS_UNIQUE_INDEXES_ENABLED: 'IS_UNIQUE_INDEXES_ENABLED' as const,
   IS_JSON_FILTER_ENABLED: 'IS_JSON_FILTER_ENABLED' as const,
   IS_AI_ENABLED: 'IS_AI_ENABLED' as const,
   IS_APPLICATION_ENABLED: 'IS_APPLICATION_ENABLED' as const,
   IS_IMAP_SMTP_CALDAV_ENABLED: 'IS_IMAP_SMTP_CALDAV_ENABLED' as const,
   IS_MORPH_RELATION_ENABLED: 'IS_MORPH_RELATION_ENABLED' as const,
   IS_RELATION_CONNECT_ENABLED: 'IS_RELATION_CONNECT_ENABLED' as const,
   IS_CORE_VIEW_SYNCING_ENABLED: 'IS_CORE_VIEW_SYNCING_ENABLED' as const,
   IS_CORE_VIEW_ENABLED: 'IS_CORE_VIEW_ENABLED' as const,
   IS_WORKSPACE_MIGRATION_V2_ENABLED: 'IS_WORKSPACE_MIGRATION_V2_ENABLED' as const,
   IS_PAGE_LAYOUT_ENABLED: 'IS_PAGE_LAYOUT_ENABLED' as const,
   IS_RECORD_PAGE_LAYOUT_ENABLED: 'IS_RECORD_PAGE_LAYOUT_ENABLED' as const,
   IS_MESSAGE_FOLDER_CONTROL_ENABLED: 'IS_MESSAGE_FOLDER_CONTROL_ENABLED' as const,
   IS_CALENDAR_VIEW_ENABLED: 'IS_CALENDAR_VIEW_ENABLED' as const,
   IS_GROUP_BY_ENABLED: 'IS_GROUP_BY_ENABLED' as const,
   IS_PUBLIC_DOMAIN_ENABLED: 'IS_PUBLIC_DOMAIN_ENABLED' as const,
   IS_EMAILING_DOMAIN_ENABLED: 'IS_EMAILING_DOMAIN_ENABLED' as const,
   IS_DYNAMIC_SEARCH_FIELDS_ENABLED: 'IS_DYNAMIC_SEARCH_FIELDS_ENABLED' as const,
   IS_COMMON_API_ENABLED: 'IS_COMMON_API_ENABLED' as const
}

export const enumPermissionFlagType = {
   API_KEYS_AND_WEBHOOKS: 'API_KEYS_AND_WEBHOOKS' as const,
   WORKSPACE: 'WORKSPACE' as const,
   WORKSPACE_MEMBERS: 'WORKSPACE_MEMBERS' as const,
   ROLES: 'ROLES' as const,
   DATA_MODEL: 'DATA_MODEL' as const,
   ADMIN_PANEL: 'ADMIN_PANEL' as const,
   SECURITY: 'SECURITY' as const,
   WORKFLOWS: 'WORKFLOWS' as const,
   IMPERSONATE: 'IMPERSONATE' as const,
   SEND_EMAIL_TOOL: 'SEND_EMAIL_TOOL' as const,
   IMPORT_CSV: 'IMPORT_CSV' as const,
   EXPORT_CSV: 'EXPORT_CSV' as const
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
   CALENDAR: 'CALENDAR' as const
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
   FIELDS: 'FIELDS' as const,
   GRAPH: 'GRAPH' as const
}

export const enumGraphType = {
   NUMBER: 'NUMBER' as const,
   GAUGE: 'GAUGE' as const,
   PIE: 'PIE' as const,
   VERTICAL_BAR: 'VERTICAL_BAR' as const,
   HORIZONTAL_BAR: 'HORIZONTAL_BAR' as const,
   LINE: 'LINE' as const
}

export const enumExtendedAggregateOperations = {
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
   PERCENTAGE_NOT_EMPTY: 'PERCENTAGE_NOT_EMPTY' as const,
   EARLIEST: 'EARLIEST' as const,
   LATEST: 'LATEST' as const
}

export const enumGraphOrderBy = {
   FIELD_ASC: 'FIELD_ASC' as const,
   FIELD_DESC: 'FIELD_DESC' as const,
   VALUE_ASC: 'VALUE_ASC' as const,
   VALUE_DESC: 'VALUE_DESC' as const
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

export const enumPageLayoutType = {
   RECORD_INDEX: 'RECORD_INDEX' as const,
   RECORD_PAGE: 'RECORD_PAGE' as const,
   DASHBOARD: 'DASHBOARD' as const
}

export const enumFieldMetadataType = {
   UUID: 'UUID' as const,
   TEXT: 'TEXT' as const,
   PHONES: 'PHONES' as const,
   EMAILS: 'EMAILS' as const,
   DATE_TIME: 'DATE_TIME' as const,
   DATE: 'DATE' as const,
   BOOLEAN: 'BOOLEAN' as const,
   NUMBER: 'NUMBER' as const,
   NUMERIC: 'NUMERIC' as const,
   LINKS: 'LINKS' as const,
   CURRENCY: 'CURRENCY' as const,
   FULL_NAME: 'FULL_NAME' as const,
   RATING: 'RATING' as const,
   SELECT: 'SELECT' as const,
   MULTI_SELECT: 'MULTI_SELECT' as const,
   RELATION: 'RELATION' as const,
   MORPH_RELATION: 'MORPH_RELATION' as const,
   POSITION: 'POSITION' as const,
   ADDRESS: 'ADDRESS' as const,
   RAW_JSON: 'RAW_JSON' as const,
   RICH_TEXT: 'RICH_TEXT' as const,
   RICH_TEXT_V2: 'RICH_TEXT_V2' as const,
   ACTOR: 'ACTOR' as const,
   ARRAY: 'ARRAY' as const,
   TS_VECTOR: 'TS_VECTOR' as const
}

export const enumIndexType = {
   BTREE: 'BTREE' as const,
   GIN: 'GIN' as const
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

export const enumServerlessFunctionExecutionStatus = {
   IDLE: 'IDLE' as const,
   SUCCESS: 'SUCCESS' as const,
   ERROR: 'ERROR' as const
}

export const enumHttpMethod = {
   GET: 'GET' as const,
   POST: 'POST' as const,
   PUT: 'PUT' as const,
   PATCH: 'PATCH' as const,
   DELETE: 'DELETE' as const
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

export const enumRelationType = {
   ONE_TO_MANY: 'ONE_TO_MANY' as const,
   MANY_TO_ONE: 'MANY_TO_ONE' as const
}

export const enumDatabaseEventAction = {
   CREATED: 'CREATED' as const,
   UPDATED: 'UPDATED' as const,
   DELETED: 'DELETED' as const,
   DESTROYED: 'DESTROYED' as const,
   RESTORED: 'RESTORED' as const,
   UPSERTED: 'UPSERTED' as const
}

export const enumRemoteTableStatus = {
   SYNCED: 'SYNCED' as const,
   NOT_SYNCED: 'NOT_SYNCED' as const
}

export const enumDistantTableUpdate = {
   TABLE_DELETED: 'TABLE_DELETED' as const,
   COLUMNS_DELETED: 'COLUMNS_DELETED' as const,
   COLUMNS_ADDED: 'COLUMNS_ADDED' as const,
   COLUMNS_TYPE_CHANGED: 'COLUMNS_TYPE_CHANGED' as const
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
   ENUM: 'ENUM' as const
}

export const enumConfigVariablesGroup = {
   ServerConfig: 'ServerConfig' as const,
   RateLimiting: 'RateLimiting' as const,
   StorageConfig: 'StorageConfig' as const,
   GoogleAuth: 'GoogleAuth' as const,
   MicrosoftAuth: 'MicrosoftAuth' as const,
   EmailSettings: 'EmailSettings' as const,
   Logging: 'Logging' as const,
   Metering: 'Metering' as const,
   ExceptionHandler: 'ExceptionHandler' as const,
   Other: 'Other' as const,
   BillingConfig: 'BillingConfig' as const,
   CaptchaConfig: 'CaptchaConfig' as const,
   CloudflareConfig: 'CloudflareConfig' as const,
   LLM: 'LLM' as const,
   ServerlessConfig: 'ServerlessConfig' as const,
   SSL: 'SSL' as const,
   SupportChatConfig: 'SupportChatConfig' as const,
   AnalyticsConfig: 'AnalyticsConfig' as const,
   TokensDuration: 'TokensDuration' as const,
   TwoFactorAuthentication: 'TwoFactorAuthentication' as const,
   AwsSesSettings: 'AwsSesSettings' as const
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

export const enumCalendarChannelVisibility = {
   METADATA: 'METADATA' as const,
   SHARE_EVERYTHING: 'SHARE_EVERYTHING' as const
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

export const enumMessageChannelVisibility = {
   METADATA: 'METADATA' as const,
   SUBJECT: 'SUBJECT' as const,
   SHARE_EVERYTHING: 'SHARE_EVERYTHING' as const
}

export const enumModelProvider = {
   NONE: 'NONE' as const,
   OPENAI: 'OPENAI' as const,
   ANTHROPIC: 'ANTHROPIC' as const,
   OPENAI_COMPATIBLE: 'OPENAI_COMPATIBLE' as const,
   XAI: 'XAI' as const
}

export const enumSupportDriver = {
   NONE: 'NONE' as const,
   FRONT: 'FRONT' as const
}

export const enumCaptchaDriverType = {
   GOOGLE_RECAPTCHA: 'GOOGLE_RECAPTCHA' as const,
   TURNSTILE: 'TURNSTILE' as const
}

export const enumFilterIs = {
   NotNull: 'NotNull' as const,
   Null: 'Null' as const
}

export const enumAnalyticsType = {
   PAGEVIEW: 'PAGEVIEW' as const,
   TRACK: 'TRACK' as const
}

export const enumFileFolder = {
   ProfilePicture: 'ProfilePicture' as const,
   WorkspaceLogo: 'WorkspaceLogo' as const,
   Attachment: 'Attachment' as const,
   PersonPicture: 'PersonPicture' as const,
   ServerlessFunction: 'ServerlessFunction' as const,
   ServerlessFunctionToDelete: 'ServerlessFunctionToDelete' as const,
   File: 'File' as const,
   AgentChat: 'AgentChat' as const
}
