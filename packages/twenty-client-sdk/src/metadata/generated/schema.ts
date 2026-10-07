// @ts-nocheck
export type Scalars = {
    String: string,
    Boolean: boolean,
    Int: number,
    ID: string,
    Float: number,
    BigInt: any,
    ConnectionCursor: any,
    DateTime: string,
    JSON: Record<string, unknown>,
    JSONObject: any,
    UUID: string,
    Upload: File,
}

export interface Agent {
    applicationId?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    description?: Scalars['String']
    icon?: Scalars['String']
    id: Scalars['UUID']
    isCustom: Scalars['Boolean']
    isSystem: Scalars['Boolean']
    label: Scalars['String']
    modelConfiguration?: Scalars['JSON']
    modelId: Scalars['String']
    name: Scalars['String']
    prompt: Scalars['String']
    responseFormat?: Scalars['JSON']
    roleId?: Scalars['UUID']
    triggers: Scalars['JSON'][]
    updatedAt: Scalars['DateTime']
    __typename: 'Agent'
}

export interface AgentChatChannel {
    color?: Scalars['String']
    icon?: Scalars['String']
    id: Scalars['UUID']
    name: Scalars['String']
    visibility: AgentChatChannelVisibility
    __typename: 'AgentChatChannel'
}

export type AgentChatChannelAssignmentFilter = 'ANY' | 'ASSIGNED_TO_ME' | 'UNASSIGNED'

export interface AgentChatChannelListItem {
    canManage: Scalars['Boolean']
    color?: Scalars['String']
    icon?: Scalars['String']
    id: Scalars['UUID']
    isMember: Scalars['Boolean']
    memberCount: Scalars['Int']
    name: Scalars['String']
    visibility: AgentChatChannelVisibility
    __typename: 'AgentChatChannelListItem'
}

export type AgentChatChannelThreadStatus = 'DONE' | 'OPEN' | 'SNOOZED'

export type AgentChatChannelVisibility = 'PRIVATE' | 'PUBLIC'

export interface AgentChatEvent {
    event: Scalars['JSON']
    threadId: Scalars['String']
    __typename: 'AgentChatEvent'
}

export interface AgentChatInboxChannelSummary {
    channelId: Scalars['UUID']
    hasUnreadOpen: Scalars['Boolean']
    openCount: Scalars['Int']
    __typename: 'AgentChatInboxChannelSummary'
}

export interface AgentChatInboxSummary {
    channels: AgentChatInboxChannelSummary[]
    hasUnreadAssigned: Scalars['Boolean']
    hasUnreadMention: Scalars['Boolean']
    hasUnreadOpen: Scalars['Boolean']
    needsInputCount: Scalars['Int']
    openCount: Scalars['Int']
    __typename: 'AgentChatInboxSummary'
}

export interface AgentChatInboxThreadIds {
    endCursor?: Scalars['String']
    hasNextPage: Scalars['Boolean']
    threadIds: Scalars['UUID'][]
    __typename: 'AgentChatInboxThreadIds'
}

export type AgentChatInboxViewKind = 'ASSIGNED' | 'CHANNEL' | 'DONE' | 'MENTIONS' | 'NEEDS_INPUT' | 'OPEN' | 'RECENT' | 'SNOOZED'

export interface AgentChatThread {
    contextWindowTokens?: Scalars['Int']
    conversationSize: Scalars['Int']
    createdAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    id: Scalars['ID']
    title?: Scalars['String']
    totalCacheReadTokens: Scalars['Int']
    totalInputCredits: Scalars['Float']
    totalInputTokens: Scalars['Int']
    totalOutputCredits: Scalars['Float']
    totalOutputTokens: Scalars['Int']
    updatedAt: Scalars['DateTime']
    __typename: 'AgentChatThread'
}

export interface AgentChatThreadParticipant {
    archivedAt?: Scalars['DateTime']
    id: Scalars['UUID']
    isSubscribed: Scalars['Boolean']
    lastMentionedAt?: Scalars['DateTime']
    lastReadAt?: Scalars['DateTime']
    snoozedUntil?: Scalars['DateTime']
    threadId: Scalars['UUID']
    updatedAt: Scalars['DateTime']
    __typename: 'AgentChatThreadParticipant'
}

export interface AgentMessage {
    agentId?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    id: Scalars['UUID']
    parts: AgentMessagePart[]
    processedAt?: Scalars['DateTime']
    role: Scalars['String']
    senderUserWorkspaceId?: Scalars['UUID']
    status: Scalars['String']
    threadId: Scalars['UUID']
    turnId?: Scalars['UUID']
    __typename: 'AgentMessage'
}

export interface AgentMessagePart {
    createdAt: Scalars['DateTime']
    errorMessage?: Scalars['String']
    fileFilename?: Scalars['String']
    fileId?: Scalars['UUID']
    fileMediaType?: Scalars['String']
    fileUrl?: Scalars['String']
    id: Scalars['UUID']
    messageId: Scalars['UUID']
    orderIndex: Scalars['Int']
    providerExecuted?: Scalars['Boolean']
    providerMetadata?: Scalars['JSON']
    reasoningContent?: Scalars['String']
    sourceDocumentFilename?: Scalars['String']
    sourceDocumentMediaType?: Scalars['String']
    sourceDocumentSourceId?: Scalars['String']
    sourceDocumentTitle?: Scalars['String']
    sourceUrlSourceId?: Scalars['String']
    sourceUrlTitle?: Scalars['String']
    sourceUrlUrl?: Scalars['String']
    state?: Scalars['String']
    textContent?: Scalars['String']
    toolCallId?: Scalars['String']
    toolInput?: Scalars['JSON']
    toolName?: Scalars['String']
    toolOutput?: Scalars['JSON']
    type: Scalars['String']
    __typename: 'AgentMessagePart'
}

export interface AgentRun {
    createdAt: Scalars['DateTime']
    creatorName: Scalars['String']
    creatorSource: Scalars['String']
    credits?: Scalars['Float']
    endedAt?: Scalars['DateTime']
    errorMessage?: Scalars['String']
    id: Scalars['UUID']
    input?: Scalars['String']
    inputTokens?: Scalars['Int']
    modelId?: Scalars['String']
    outputTokens?: Scalars['Int']
    reply?: Scalars['String']
    startedAt?: Scalars['DateTime']
    status: AgentTurnStatus
    threadId: Scalars['UUID']
    threadTitle?: Scalars['String']
    toolNames: Scalars['String'][]
    __typename: 'AgentRun'
}

export type AgentTurnStatus = 'CANCELLED' | 'COMPLETED' | 'FAILED' | 'RUNNING' | 'WAITING_FOR_INPUT'

export interface AggregateChartConfiguration {
    aggregateFieldMetadataId: Scalars['UUID']
    aggregateOperation: AggregateOperations
    configurationType: WidgetConfigurationType
    description?: Scalars['String']
    displayDataLabel?: Scalars['Boolean']
    filter?: Scalars['JSON']
    firstDayOfTheWeek?: Scalars['Int']
    label?: Scalars['String']
    numberFormat?: ChartNumberFormat
    prefix?: Scalars['String']
    ratioAggregateConfig?: RatioAggregateConfig
    suffix?: Scalars['String']
    timezone?: Scalars['String']
    __typename: 'AggregateChartConfiguration'
}

export type AggregateOperations = 'AVG' | 'COUNT' | 'COUNT_EMPTY' | 'COUNT_FALSE' | 'COUNT_NOT_EMPTY' | 'COUNT_TRUE' | 'COUNT_UNIQUE_VALUES' | 'MAX' | 'MIN' | 'PERCENTAGE_EMPTY' | 'PERCENTAGE_NOT_EMPTY' | 'SUM'

export interface AiChatUsage {
    consumedValue?: Scalars['BigInt']
    kind: Scalars['String']
    limitValue: Scalars['BigInt']
    periodEnd?: Scalars['DateTime']
    __typename: 'AiChatUsage'
}

export type AiModelTier = 'balanced' | 'extraFast' | 'extraSmart' | 'fast' | 'smart'

export interface AiSystemPromptPreview {
    estimatedTokenCount: Scalars['Int']
    sections: AiSystemPromptSection[]
    __typename: 'AiSystemPromptPreview'
}

export interface AiSystemPromptSection {
    content: Scalars['String']
    estimatedTokenCount: Scalars['Int']
    title: Scalars['String']
    __typename: 'AiSystemPromptSection'
}

export type AllMetadataName = 'agent' | 'applicationVariable' | 'commandMenuItem' | 'connectionProvider' | 'fieldMetadata' | 'fieldPermission' | 'frontComponent' | 'index' | 'logicFunction' | 'navigationMenuItem' | 'objectMetadata' | 'objectPermission' | 'pageLayout' | 'pageLayoutTab' | 'pageLayoutWidget' | 'permissionFlag' | 'role' | 'rolePermissionFlag' | 'roleTarget' | 'rowLevelPermissionPredicate' | 'rowLevelPermissionPredicateGroup' | 'searchFieldMetadata' | 'settingsMenuItem' | 'skill' | 'timelineActivityType' | 'validationRule' | 'view' | 'viewField' | 'viewFieldGroup' | 'viewFilter' | 'viewFilterGroup' | 'viewGroup' | 'viewSort' | 'webhook' | 'workflow' | 'workflowVersion'

export interface Analytics {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'Analytics'
}

export type AnalyticsType = 'PAGEVIEW' | 'TRACK'

export interface ApiConfig {
    mutationMaximumAffectedRecords: Scalars['Float']
    __typename: 'ApiConfig'
}

export interface ApiKey {
    createdAt: Scalars['DateTime']
    expiresAt: Scalars['DateTime']
    id: Scalars['UUID']
    name: Scalars['String']
    revokedAt?: Scalars['DateTime']
    role: Role
    updatedAt: Scalars['DateTime']
    __typename: 'ApiKey'
}

export interface ApiKeyForRole {
    expiresAt: Scalars['DateTime']
    id: Scalars['UUID']
    name: Scalars['String']
    revokedAt?: Scalars['DateTime']
    __typename: 'ApiKeyForRole'
}

export interface ApiKeyToken {
    token: Scalars['String']
    __typename: 'ApiKeyToken'
}

export interface AppConnection {
    accessToken: Scalars['String']
    authFailedAt?: Scalars['String']
    authFailedReason?: Scalars['String']
    handle: Scalars['String']
    id: Scalars['ID']
    name: Scalars['String']
    providerName: Scalars['String']
    scopes: Scalars['String'][]
    userWorkspaceId: Scalars['String']
    visibility: Scalars['String']
    workspaceMemberId?: Scalars['String']
    __typename: 'AppConnection'
}

export interface AppKeyValue {
    key: Scalars['String']
    scope: AppKeyValueScope
    value?: Scalars['JSON']
    __typename: 'AppKeyValue'
}


/** WORKSPACE entries are private to one workspace install of the application. SERVER entries are shared across every install: the value is always the claiming workspaceId and only that workspace can overwrite or delete the key. */
export type AppKeyValueScope = 'SERVER' | 'WORKSPACE'

export interface Application {
    agents: Agent[]
    applicationRegistration?: ApplicationRegistrationSummary
    applicationRegistrationId?: Scalars['UUID']
    applicationVariables: ApplicationVariable[]
    autoUpgrade: Scalars['Boolean']
    availablePackages: Scalars['JSON']
    canBeUninstalled: Scalars['Boolean']
    commandMenuItems: CommandMenuItem[]
    defaultLogicFunctionRole?: Role
    defaultRoleId?: Scalars['String']
    description?: Scalars['String']
    frontComponents: FrontComponent[]
    healthCheckLogicFunctionId?: Scalars['UUID']
    id: Scalars['UUID']
    logicFunctions: LogicFunction[]
    logoFileId?: Scalars['UUID']
    logoUrl?: Scalars['String']
    name: Scalars['String']
    objects: Object[]
    packageJsonChecksum?: Scalars['String']
    packageJsonFileId?: Scalars['UUID']
    settingsCustomTabFrontComponentId?: Scalars['UUID']
    settingsMenuItems?: SettingsMenuItem[]
    universalIdentifier: Scalars['String']
    version?: Scalars['String']
    yarnLockChecksum?: Scalars['String']
    yarnLockFileId?: Scalars['UUID']
    __typename: 'Application'
}

export interface ApplicationAuthorization {
    applicationId: Scalars['UUID']
    applicationName: Scalars['String']
    applicationUniversalIdentifier?: Scalars['String']
    createdAt: Scalars['DateTime']
    id: Scalars['UUID']
    lastAuthorizedAt?: Scalars['DateTime']
    lastUsedAt: Scalars['DateTime']
    scopes?: Scalars['String'][]
    workspaceId: Scalars['UUID']
    __typename: 'ApplicationAuthorization'
}

export interface ApplicationCapabilityGrant {
    grantedCapabilities: Scalars['String'][]
    id: Scalars['UUID']
    __typename: 'ApplicationCapabilityGrant'
}

export interface ApplicationConnectedAccountDTO {
    applicationId?: Scalars['UUID']
    archivedAt?: Scalars['DateTime']
    authFailedAt?: Scalars['DateTime']
    authFailedReason?: Scalars['String']
    connectionParameters?: PublicImapSmtpCaldavConnectionParameters
    connectionProviderId?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    handle: Scalars['String']
    handleAliases?: Scalars['String'][]
    id: Scalars['UUID']
    /** @deprecated Ownership no longer gates connection actions, every application admin manages a workspace-shared connection */
    isOwnedByCurrentUser: Scalars['Boolean']
    lastCredentialsRefreshedAt?: Scalars['DateTime']
    lastSignedInAt?: Scalars['DateTime']
    name?: Scalars['String']
    provider: Scalars['String']
    scopes?: Scalars['String'][]
    updatedAt: Scalars['DateTime']
    userWorkspaceId: Scalars['UUID']
    visibility: Scalars['String']
    __typename: 'ApplicationConnectedAccountDTO'
}

export interface ApplicationConnectionProvider {
    applicationId: Scalars['String']
    displayName: Scalars['String']
    id: Scalars['UUID']
    logoUrl?: Scalars['String']
    name: Scalars['String']
    oauth?: ApplicationConnectionProviderOAuthConfig
    type: Scalars['String']
    __typename: 'ApplicationConnectionProvider'
}

export interface ApplicationConnectionProviderOAuthConfig {
    isClientCredentialsConfigured: Scalars['Boolean']
    scopes: Scalars['String'][]
    __typename: 'ApplicationConnectionProviderOAuthConfig'
}

export interface ApplicationExport {
    application: ApplicationExportApplication
    coverage: ApplicationExportCoverageEntry[]
    files: ApplicationExportFile[]
    manifest: Scalars['JSON']
    __typename: 'ApplicationExport'
}

export interface ApplicationExportApplication {
    displayName: Scalars['String']
    sourceType: ApplicationRegistrationSourceType
    universalIdentifier: Scalars['String']
    __typename: 'ApplicationExportApplication'
}

export interface ApplicationExportCoverageEntry {
    metadataName: Scalars['String']
    reason?: Scalars['String']
    status: ApplicationExportCoverageStatus
    universalIdentifier: Scalars['String']
    __typename: 'ApplicationExportCoverageEntry'
}

export type ApplicationExportCoverageStatus = 'ENGINE_DERIVED' | 'EXCLUDED' | 'EXPORTED' | 'FOREIGN_OWNED' | 'UNSUPPORTED'

export interface ApplicationExportFile {
    content: Scalars['String']
    folder: Scalars['String']
    path: Scalars['String']
    __typename: 'ApplicationExportFile'
}

export interface ApplicationFileCompletionError {
    fileId: Scalars['UUID']
    message: Scalars['String']
    __typename: 'ApplicationFileCompletionError'
}

export interface ApplicationFileUploadError {
    fileFolder: FileFolder
    filePath: Scalars['String']
    message: Scalars['String']
    __typename: 'ApplicationFileUploadError'
}

export interface ApplicationFileUploadTarget {
    contentType: Scalars['String']
    expiresAt: Scalars['DateTime']
    fileFolder: FileFolder
    fileId: Scalars['UUID']
    filePath: Scalars['String']
    uploadUrl: Scalars['String']
    __typename: 'ApplicationFileUploadTarget'
}

export interface ApplicationHealthCheckAction {
    label: Scalars['String']
    location?: Scalars['String']
    __typename: 'ApplicationHealthCheckAction'
}

export interface ApplicationHealthCheckResult {
    action?: ApplicationHealthCheckAction
    description?: Scalars['String']
    status: ApplicationHealthStatus
    title?: Scalars['String']
    __typename: 'ApplicationHealthCheckResult'
}

export type ApplicationHealthStatus = 'ERROR' | 'INFO' | 'NEUTRAL' | 'OK' | 'SUCCESS' | 'UNKNOWN' | 'WARNING'

export interface ApplicationRegistration {
    createdAt: Scalars['DateTime']
    galleryImagesUrls: Scalars['String'][]
    id: Scalars['UUID']
    isConfigured: Scalars['Boolean']
    isListed: Scalars['Boolean']
    isPreInstalled: Scalars['Boolean']
    isVetted: Scalars['Boolean']
    latestAvailableVersion?: Scalars['String']
    logoUrl?: Scalars['String']
    name: Scalars['String']
    oAuthClientId: Scalars['String']
    oAuthRedirectUris: Scalars['String'][]
    oAuthScopes: Scalars['String'][]
    ownerWorkspaceId?: Scalars['UUID']
    sourcePackage?: Scalars['String']
    sourceType: ApplicationRegistrationSourceType
    universalIdentifier: Scalars['String']
    updatedAt: Scalars['DateTime']
    __typename: 'ApplicationRegistration'
}

export type ApplicationRegistrationSourceType = 'LOCAL' | 'NPM' | 'OAUTH_ONLY' | 'TARBALL'

export interface ApplicationRegistrationStats {
    activeInstalls: Scalars['Int']
    mostInstalledVersion?: Scalars['String']
    suspendedInstalls: Scalars['Int']
    versionDistribution: VersionDistributionEntry[]
    __typename: 'ApplicationRegistrationStats'
}

export interface ApplicationRegistrationSummary {
    id: Scalars['UUID']
    latestAvailableVersion?: Scalars['String']
    logoUrl?: Scalars['String']
    sourceType: ApplicationRegistrationSourceType
    __typename: 'ApplicationRegistrationSummary'
}

export interface ApplicationRegistrationVariable {
    createdAt: Scalars['DateTime']
    description: Scalars['String']
    id: Scalars['UUID']
    isDeprecated: Scalars['Boolean']
    isFilled: Scalars['Boolean']
    isRequired: Scalars['Boolean']
    isSecret: Scalars['Boolean']
    key: Scalars['String']
    options?: Scalars['JSON']
    type: Scalars['String']
    updatedAt: Scalars['DateTime']
    value?: Scalars['String']
    __typename: 'ApplicationRegistrationVariable'
}

export interface ApplicationTokenPair {
    applicationAccessToken: AuthToken
    applicationRefreshToken: AuthToken
    __typename: 'ApplicationTokenPair'
}

export interface ApplicationVariable {
    description: Scalars['String']
    id: Scalars['UUID']
    isDeprecated: Scalars['Boolean']
    isRequired: Scalars['Boolean']
    isSecret: Scalars['Boolean']
    key: Scalars['String']
    label: Scalars['String']
    options?: Scalars['JSON']
    scope: ApplicationVariableScope
    type: Scalars['String']
    value: Scalars['String']
    __typename: 'ApplicationVariable'
}

export type ApplicationVariableScope = 'USER' | 'WORKSPACE'

export interface ApprovedAccessDomain {
    createdAt: Scalars['DateTime']
    domain: Scalars['String']
    id: Scalars['UUID']
    isValidated: Scalars['Boolean']
    __typename: 'ApprovedAccessDomain'
}

export interface AuthBypassProviders {
    google: Scalars['Boolean']
    microsoft: Scalars['Boolean']
    password: Scalars['Boolean']
    __typename: 'AuthBypassProviders'
}

export interface AuthProviders {
    google: Scalars['Boolean']
    magicLink: Scalars['Boolean']
    microsoft: Scalars['Boolean']
    password: Scalars['Boolean']
    sso: SSOIdentityProvider[]
    __typename: 'AuthProviders'
}

export interface AuthToken {
    expiresAt: Scalars['DateTime']
    token: Scalars['String']
    __typename: 'AuthToken'
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

export interface AuthorizeApp {
    redirectUrl: Scalars['String']
    __typename: 'AuthorizeApp'
}

export interface AutocompleteResult {
    placeId: Scalars['String']
    text: Scalars['String']
    __typename: 'AutocompleteResult'
}

export interface AvailableWorkspace {
    displayName?: Scalars['String']
    id: Scalars['UUID']
    inviteHash?: Scalars['String']
    loginToken?: Scalars['String']
    logo?: Scalars['String']
    personalInviteToken?: Scalars['String']
    sso: SSOConnection[]
    workspaceUrls: WorkspaceUrls
    __typename: 'AvailableWorkspace'
}

export interface AvailableWorkspaces {
    availableWorkspacesForSignIn: AvailableWorkspace[]
    availableWorkspacesForSignUp: AvailableWorkspace[]
    __typename: 'AvailableWorkspaces'
}

export interface AvailableWorkspacesAndAccessTokens {
    availableWorkspaces: AvailableWorkspaces
    tokens: AuthTokenPair
    __typename: 'AvailableWorkspacesAndAccessTokens'
}


/** Which axes should display labels */
export type AxisNameDisplay = 'BOTH' | 'NONE' | 'X' | 'Y'

export interface BarChartConfiguration {
    aggregateFieldMetadataId: Scalars['UUID']
    aggregateOperation: AggregateOperations
    axisNameDisplay?: AxisNameDisplay
    color?: Scalars['String']
    configurationType: WidgetConfigurationType
    description?: Scalars['String']
    displayDataLabel?: Scalars['Boolean']
    displayLegend?: Scalars['Boolean']
    filter?: Scalars['JSON']
    firstDayOfTheWeek?: Scalars['Int']
    groupMode?: BarChartGroupMode
    isCumulative?: Scalars['Boolean']
    layout: BarChartLayout
    numberFormat?: ChartNumberFormat
    omitNullValues?: Scalars['Boolean']
    primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity
    primaryAxisGroupByFieldMetadataId: Scalars['UUID']
    primaryAxisGroupBySubFieldName?: Scalars['String']
    primaryAxisManualSortOrder?: Scalars['String'][]
    primaryAxisOrderBy?: GraphOrderBy
    rangeMax?: Scalars['Float']
    rangeMin?: Scalars['Float']
    secondaryAxisGroupByDateGranularity?: ObjectRecordGroupByDateGranularity
    secondaryAxisGroupByFieldMetadataId?: Scalars['UUID']
    secondaryAxisGroupBySubFieldName?: Scalars['String']
    secondaryAxisManualSortOrder?: Scalars['String'][]
    secondaryAxisOrderBy?: GraphOrderBy
    splitMultiValueFields?: Scalars['Boolean']
    timezone?: Scalars['String']
    __typename: 'BarChartConfiguration'
}

export interface BarChartData {
    data: Scalars['JSON'][]
    formattedToRawLookup: Scalars['JSON']
    groupMode: BarChartGroupMode
    hasTooManyGroups: Scalars['Boolean']
    indexBy: Scalars['String']
    keys: Scalars['String'][]
    layout: BarChartLayout
    series: BarChartSeries[]
    showDataLabels: Scalars['Boolean']
    showLegend: Scalars['Boolean']
    xAxisLabel: Scalars['String']
    yAxisLabel: Scalars['String']
    __typename: 'BarChartData'
}


/** Display mode for bar charts with secondary grouping */
export type BarChartGroupMode = 'GROUPED' | 'STACKED'


/** Layout orientation for bar charts */
export type BarChartLayout = 'HORIZONTAL' | 'VERTICAL'

export interface BarChartSeries {
    key: Scalars['String']
    label: Scalars['String']
    __typename: 'BarChartSeries'
}

export interface Billing {
    billingUrl?: Scalars['String']
    isBillingEnabled: Scalars['Boolean']
    stripePublishableKey?: Scalars['String']
    trialPeriods: BillingTrialPeriod[]
    __typename: 'Billing'
}

export interface BillingCustomer {
    hasPaymentMethod?: Scalars['Boolean']
    id: Scalars['UUID']
    __typename: 'BillingCustomer'
}

export interface BillingEndTrialPeriod {
    /** Billing portal URL for payment method update (returned when no payment method exists) */
    billingPortalUrl?: Scalars['String']
    /** All billing subscriptions */
    billingSubscriptions?: BillingSubscription[]
    /** Updated current billing subscription */
    currentBillingSubscription?: BillingSubscription
    /** Boolean that confirms if a payment method was found */
    hasPaymentMethod: Scalars['Boolean']
    /** Updated subscription status */
    status?: SubscriptionStatus
    __typename: 'BillingEndTrialPeriod'
}

export interface BillingEntitlement {
    key: BillingEntitlementKey
    value: Scalars['Boolean']
    __typename: 'BillingEntitlement'
}

export type BillingEntitlementKey = 'AUDIT_LOGS' | 'CUSTOM_DOMAIN' | 'RECORD_SHARING' | 'RLS' | 'SSO' | 'USAGE_LIMIT'

export interface BillingLicensedProduct {
    description: Scalars['String']
    images?: Scalars['String'][]
    metadata: BillingProductMetadata
    name: Scalars['String']
    prices?: BillingPriceLicensed[]
    __typename: 'BillingLicensedProduct'
}

export interface BillingMeteredProduct {
    description: Scalars['String']
    images?: Scalars['String'][]
    metadata: BillingProductMetadata
    name: Scalars['String']
    prices?: BillingPriceMetered[]
    __typename: 'BillingMeteredProduct'
}

export interface BillingPaymentIntent {
    clientSecret: Scalars['String']
    paymentIntentType: Scalars['String']
    __typename: 'BillingPaymentIntent'
}

export interface BillingPlan {
    baseProducts: BillingLicensedProduct[]
    meteredProducts: BillingMeteredProduct[]
    planKey: BillingPlanKey
    resourceCreditProducts: BillingLicensedProduct[]
    __typename: 'BillingPlan'
}


/** The different billing plans available */
export type BillingPlanKey = 'ENTERPRISE' | 'PRO'

export interface BillingPriceLicensed {
    creditAmount?: Scalars['Float']
    isSellable: Scalars['Boolean']
    priceUsageType: BillingUsageType
    recurringInterval: SubscriptionInterval
    stripePriceId: Scalars['String']
    unitAmount: Scalars['Float']
    __typename: 'BillingPriceLicensed'
}

export interface BillingPriceMetered {
    priceUsageType: BillingUsageType
    recurringInterval: SubscriptionInterval
    stripePriceId: Scalars['String']
    tiers: BillingPriceTier[]
    __typename: 'BillingPriceMetered'
}

export interface BillingPriceTier {
    flatAmount?: Scalars['Float']
    unitAmount?: Scalars['Float']
    upTo?: Scalars['Float']
    __typename: 'BillingPriceTier'
}

export interface BillingProduct {
    description: Scalars['String']
    images?: Scalars['String'][]
    metadata: BillingProductMetadata
    name: Scalars['String']
    __typename: 'BillingProduct'
}

export type BillingProductDTO = (BillingLicensedProduct | BillingMeteredProduct) & { __isUnion?: true }


/** The different billing products available */
export type BillingProductKey = 'BASE_PRODUCT' | 'RESOURCE_CREDIT'

export interface BillingProductMetadata {
    isLegacy?: Scalars['String']
    planKey: BillingPlanKey
    priceUsageBased: BillingUsageType
    productKey: BillingProductKey
    __typename: 'BillingProductMetadata'
}

export interface BillingResourceCreditUsage {
    grantedCredits: Scalars['Float']
    periodEnd: Scalars['DateTime']
    periodStart: Scalars['DateTime']
    productKey: BillingProductKey
    rolloverCredits: Scalars['Float']
    totalGrantedCredits: Scalars['Float']
    unitPriceCents: Scalars['Float']
    usedCredits: Scalars['Float']
    __typename: 'BillingResourceCreditUsage'
}

export interface BillingSession {
    url?: Scalars['String']
    __typename: 'BillingSession'
}

export interface BillingSubscription {
    billingSubscriptionItems?: BillingSubscriptionItem[]
    cancelAt?: Scalars['DateTime']
    currentPeriodEnd?: Scalars['DateTime']
    id: Scalars['UUID']
    interval?: SubscriptionInterval
    metadata: Scalars['JSON']
    phases: BillingSubscriptionSchedulePhase[]
    status: SubscriptionStatus
    __typename: 'BillingSubscription'
}

export interface BillingSubscriptionItem {
    billingProduct: BillingProductDTO
    creditAmount?: Scalars['Float']
    hasReachedCurrentPeriodCap: Scalars['Boolean']
    id: Scalars['UUID']
    quantity?: Scalars['Float']
    stripePriceId: Scalars['String']
    unitAmount?: Scalars['Float']
    __typename: 'BillingSubscriptionItem'
}

export interface BillingSubscriptionSchedulePhase {
    end_date: Scalars['Float']
    items: BillingSubscriptionSchedulePhaseItem[]
    start_date: Scalars['Float']
    __typename: 'BillingSubscriptionSchedulePhase'
}

export interface BillingSubscriptionSchedulePhaseItem {
    price: Scalars['String']
    quantity?: Scalars['Float']
    __typename: 'BillingSubscriptionSchedulePhaseItem'
}

export interface BillingTrialPeriod {
    duration: Scalars['Float']
    isCreditCardRequired: Scalars['Boolean']
    __typename: 'BillingTrialPeriod'
}

export interface BillingUpdate {
    /** All billing subscriptions */
    billingSubscriptions: BillingSubscription[]
    /** Current billing subscription */
    currentBillingSubscription: BillingSubscription
    __typename: 'BillingUpdate'
}

export type BillingUsageType = 'LICENSED' | 'METERED'

export interface CalendarChannel {
    connectedAccountId: Scalars['UUID']
    contactAutoCreationPolicy: CalendarChannelContactAutoCreationPolicy
    createdAt: Scalars['DateTime']
    handle: Scalars['String']
    id: Scalars['UUID']
    isContactAutoCreationEnabled: Scalars['Boolean']
    isSyncEnabled: Scalars['Boolean']
    syncStage: CalendarChannelSyncStage
    syncStageStartedAt?: Scalars['DateTime']
    syncStatus: CalendarChannelSyncStatus
    syncedAt?: Scalars['DateTime']
    throttleFailureCount: Scalars['Float']
    updatedAt: Scalars['DateTime']
    visibility: CalendarChannelVisibility
    __typename: 'CalendarChannel'
}

export type CalendarChannelContactAutoCreationPolicy = 'AS_ORGANIZER' | 'AS_PARTICIPANT' | 'AS_PARTICIPANT_AND_ORGANIZER' | 'NONE'

export type CalendarChannelSyncStage = 'CALENDAR_EVENTS_IMPORT_ONGOING' | 'CALENDAR_EVENTS_IMPORT_PENDING' | 'CALENDAR_EVENTS_IMPORT_SCHEDULED' | 'CALENDAR_EVENT_LIST_FETCH_ONGOING' | 'CALENDAR_EVENT_LIST_FETCH_PENDING' | 'CALENDAR_EVENT_LIST_FETCH_SCHEDULED' | 'FAILED' | 'PENDING_CONFIGURATION'

export type CalendarChannelSyncStatus = 'ACTIVE' | 'FAILED_INSUFFICIENT_PERMISSIONS' | 'FAILED_UNKNOWN' | 'NOT_SYNCED' | 'ONGOING'

export type CalendarChannelVisibility = 'METADATA' | 'SHARE_EVERYTHING'

export interface CalendarConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'CalendarConfiguration'
}

export interface CallRecordingSummaryConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'CallRecordingSummaryConfiguration'
}

export interface CallRecordingTranscriptConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'CallRecordingTranscriptConfiguration'
}

export interface CampaignAudiencePreviewDTO {
    duplicateEmails: Scalars['Int']
    globallyUnsubscribed: Scalars['Int']
    hardSuppressed: Scalars['Int']
    sendable: Scalars['Int']
    topicUnsubscribed: Scalars['Int']
    totalMembers: Scalars['Int']
    trackingRefused: Scalars['Int']
    withoutEmail: Scalars['Int']
    __typename: 'CampaignAudiencePreviewDTO'
}

export interface CancelMessageCampaignOutputDTO {
    campaignId: Scalars['String']
    canceledMessageCount: Scalars['Int']
    __typename: 'CancelMessageCampaignOutputDTO'
}

export interface Captcha {
    provider?: CaptchaDriverType
    siteKey?: Scalars['String']
    __typename: 'Captcha'
}

export type CaptchaDriverType = 'GOOGLE_RECAPTCHA' | 'TURNSTILE'

export interface ChannelSyncSuccess {
    success: Scalars['Boolean']
    __typename: 'ChannelSyncSuccess'
}


/** Format used to display the chart value */
export type ChartNumberFormat = 'FULL' | 'SHORT'

export interface ChatConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'ChatConfiguration'
}

export interface ChatStreamCatchupChunks {
    chunks: Scalars['JSON'][]
    error?: ChatStreamError
    maxSeq: Scalars['Int']
    __typename: 'ChatStreamCatchupChunks'
}

export interface ChatStreamError {
    code: Scalars['String']
    message: Scalars['String']
    __typename: 'ChatStreamError'
}

export interface ChatThreadsConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'ChatThreadsConfiguration'
}

export interface CheckUserExist {
    availableWorkspacesCount: Scalars['Float']
    exists: Scalars['Boolean']
    isEmailVerified: Scalars['Boolean']
    __typename: 'CheckUserExist'
}

export interface ClaimableApplicationRegistration {
    author?: Scalars['String']
    description?: Scalars['String']
    id: Scalars['String']
    isOwned: Scalars['Boolean']
    logoUrl?: Scalars['String']
    name: Scalars['String']
    sourcePackage?: Scalars['String']
    universalIdentifier: Scalars['String']
    __typename: 'ClaimableApplicationRegistration'
}

export interface ClientAiEvaluationModelConfig {
    description?: Scalars['String']
    inputCostPerMillionTokens?: Scalars['Float']
    isAvailable: Scalars['Boolean']
    isDeprecated?: Scalars['Boolean']
    label: Scalars['String']
    maxCriteriaPerQuestion?: Scalars['Float']
    maxScoreLevels?: Scalars['Float']
    medianLatencyMs?: Scalars['Float']
    modelId: Scalars['String']
    outputCostPerMillionTokens?: Scalars['Float']
    providerLabel?: Scalars['String']
    supportedQuestionTypes: Scalars['String'][]
    __typename: 'ClientAiEvaluationModelConfig'
}

export interface ClientAiModelConfig {
    contextWindowTokens?: Scalars['Float']
    costPerTask?: Scalars['Float']
    dataResidency?: Scalars['String']
    effort?: Scalars['String']
    efforts?: Scalars['String'][]
    inputCostPerMillionTokens?: Scalars['Float']
    intelligenceIndex?: Scalars['Float']
    isBenchmarkInherited?: Scalars['Boolean']
    isDeprecated?: Scalars['Boolean']
    label: Scalars['String']
    maxOutputTokens?: Scalars['Float']
    modelFamily?: ModelFamily
    modelFamilyLabel?: Scalars['String']
    modelId: Scalars['String']
    nativeCapabilities?: NativeModelCapabilities
    outputCostPerMillionTokens?: Scalars['Float']
    outputTokensPerSecond?: Scalars['Float']
    providerLabel?: Scalars['String']
    providerName?: Scalars['String']
    sdkPackage?: Scalars['String']
    __typename: 'ClientAiModelConfig'
}

export interface ClientAiModelTierConfig {
    modelId: Scalars['String']
    tier: AiModelTier
    __typename: 'ClientAiModelTierConfig'
}

export interface ClientConfig {
    aiEvaluationModels: ClientAiEvaluationModelConfig[]
    aiModelTiers: ClientAiModelTierConfig[]
    aiModels: ClientAiModelConfig[]
    allowRequestsToTwentyIcons: Scalars['Boolean']
    analyticsEnabled: Scalars['Boolean']
    api: ApiConfig
    appVersion?: Scalars['String']
    authProviders: AuthProviders
    billing: Billing
    calendarBookingPageId?: Scalars['String']
    canManageFeatureFlags: Scalars['Boolean']
    captcha: Captcha
    defaultSubdomain?: Scalars['String']
    enterpriseInstanceType: Scalars['String']
    frontDomain: Scalars['String']
    isAttachmentPreviewEnabled: Scalars['Boolean']
    isBookCallOnboardingStepEnabled: Scalars['Boolean']
    isClickHouseConfigured: Scalars['Boolean']
    isCloudflareIntegrationEnabled: Scalars['Boolean']
    isCompanyEnrichmentEnabled: Scalars['Boolean']
    isConfigVariablesInDbEnabled: Scalars['Boolean']
    isCookieSessionEnabled: Scalars['Boolean']
    isEmailVerificationRequired: Scalars['Boolean']
    isEmailingDomainInDemoMode: Scalars['Boolean']
    isGoogleCalendarEnabled: Scalars['Boolean']
    isGoogleMessagingEnabled: Scalars['Boolean']
    isImapSmtpCaldavEnabled: Scalars['Boolean']
    isMicrosoftCalendarEnabled: Scalars['Boolean']
    isMicrosoftMessagingEnabled: Scalars['Boolean']
    isMultiWorkspaceEnabled: Scalars['Boolean']
    isOnboardingAiChatEnabled: Scalars['Boolean']
    isWorkspaceSchemaDDLLocked: Scalars['Boolean']
    maintenance?: ClientConfigMaintenanceMode
    publicFeatureFlags: PublicFeatureFlag[]
    publicFunctionDomain?: Scalars['String']
    sentry: Sentry
    signInPrefilled: Scalars['Boolean']
    support: Support
    __typename: 'ClientConfig'
}

export interface ClientConfigMaintenanceMode {
    endAt: Scalars['DateTime']
    link?: Scalars['String']
    startAt: Scalars['DateTime']
    __typename: 'ClientConfigMaintenanceMode'
}

export interface CollectionHash {
    collectionName: AllMetadataName
    hash: Scalars['String']
    __typename: 'CollectionHash'
}

export interface CommandMenuItem {
    applicationId?: Scalars['UUID']
    availabilityObjectMetadataId?: Scalars['UUID']
    availabilityType: CommandMenuItemAvailabilityType
    conditionalAvailabilityExpression?: Scalars['String']
    conditionalPinnedExpression?: Scalars['String']
    coreWorkflowVersionId?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    engineComponentKey: EngineComponentKey
    frontComponent?: FrontComponent
    frontComponentId?: Scalars['UUID']
    hotKeys?: Scalars['String'][]
    icon?: Scalars['String']
    id: Scalars['UUID']
    isActive: Scalars['Boolean']
    isPinned: Scalars['Boolean']
    label: Scalars['String']
    navigationTargetObjectMetadataId?: Scalars['UUID']
    pageLayoutId?: Scalars['UUID']
    payload?: CommandMenuItemPayload
    position: Scalars['Float']
    shortLabel?: Scalars['String']
    universalIdentifier?: Scalars['UUID']
    updatedAt: Scalars['DateTime']
    workflowVersionId?: Scalars['UUID']
    __typename: 'CommandMenuItem'
}

export type CommandMenuItemAvailabilityType = 'FALLBACK' | 'GLOBAL' | 'GLOBAL_OBJECT_CONTEXT' | 'RECORD_SELECTION'

export type CommandMenuItemPayload = (ObjectMetadataCommandMenuItemPayload | PathCommandMenuItemPayload) & { __isUnion?: true }

export interface CompleteApplicationFileUploadsResult {
    errors: ApplicationFileCompletionError[]
    files: File[]
    __typename: 'CompleteApplicationFileUploadsResult'
}

export interface ConnectedAccountPublicDTO {
    applicationId?: Scalars['UUID']
    archivedAt?: Scalars['DateTime']
    authFailedAt?: Scalars['DateTime']
    authFailedReason?: Scalars['String']
    connectionParameters?: PublicImapSmtpCaldavConnectionParameters
    connectionProviderId?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    handle: Scalars['String']
    handleAliases?: Scalars['String'][]
    id: Scalars['UUID']
    lastCredentialsRefreshedAt?: Scalars['DateTime']
    lastSignedInAt?: Scalars['DateTime']
    name?: Scalars['String']
    provider: Scalars['String']
    scopes?: Scalars['String'][]
    updatedAt: Scalars['DateTime']
    userWorkspaceId: Scalars['UUID']
    visibility: Scalars['String']
    __typename: 'ConnectedAccountPublicDTO'
}

export interface ConnectedImapSmtpCaldavAccount {
    connectionParameters?: ImapSmtpCaldavPublicConnectionParameters
    handle: Scalars['String']
    id: Scalars['UUID']
    provider: Scalars['String']
    userWorkspaceId: Scalars['UUID']
    __typename: 'ConnectedImapSmtpCaldavAccount'
}

export interface CreateApplicationFileUploadsResult {
    errors: ApplicationFileUploadError[]
    targets: ApplicationFileUploadTarget[]
    __typename: 'CreateApplicationFileUploadsResult'
}

export interface CreateApplicationRegistration {
    applicationRegistration: ApplicationRegistration
    clientSecret: Scalars['String']
    __typename: 'CreateApplicationRegistration'
}

export interface CreateCalendarEventOutput {
    calendarEventId?: Scalars['String']
    conferenceLink?: Scalars['String']
    error?: Scalars['String']
    iCalUid?: Scalars['String']
    success: Scalars['Boolean']
    __typename: 'CreateCalendarEventOutput'
}

export interface CreateEmailGroupChannelOutput {
    forwardingAddress: Scalars['String']
    messageChannel: MessageChannel
    __typename: 'CreateEmailGroupChannelOutput'
}


/** Database Event Action */
export type DatabaseEventAction = 'CREATED' | 'DELETED' | 'DESTROYED' | 'RESTORED' | 'UPDATED' | 'UPSERTED'

export interface DeleteSso {
    identityProviderId: Scalars['UUID']
    __typename: 'DeleteSso'
}

export interface DeleteTwoFactorAuthenticationMethod {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'DeleteTwoFactorAuthenticationMethod'
}

export interface DeletedWorkspaceMember {
    avatarUrl?: Scalars['String']
    id: Scalars['UUID']
    name: FullName
    userEmail: Scalars['String']
    userWorkspaceId?: Scalars['UUID']
    __typename: 'DeletedWorkspaceMember'
}

export interface DevelopmentApplication {
    id: Scalars['String']
    universalIdentifier: Scalars['String']
    __typename: 'DevelopmentApplication'
}

export interface DomainRecord {
    key: Scalars['String']
    status: Scalars['String']
    type: Scalars['String']
    validationType: Scalars['String']
    value: Scalars['String']
    __typename: 'DomainRecord'
}

export interface DomainValidRecords {
    domain: Scalars['String']
    id: Scalars['UUID']
    isCustomDomainEnabled?: Scalars['Boolean']
    records: DomainRecord[]
    __typename: 'DomainValidRecords'
}

export interface DuplicatedDashboard {
    createdAt: Scalars['String']
    id: Scalars['UUID']
    pageLayoutId?: Scalars['UUID']
    position: Scalars['Float']
    title?: Scalars['String']
    updatedAt: Scalars['String']
    __typename: 'DuplicatedDashboard'
}

export interface DuplicatedMessageList {
    createdAt: Scalars['String']
    description?: Scalars['String']
    id: Scalars['UUID']
    memberCount: Scalars['Float']
    name?: Scalars['String']
    position: Scalars['Float']
    updatedAt: Scalars['String']
    __typename: 'DuplicatedMessageList'
}

export interface EditSso {
    id: Scalars['UUID']
    issuer: Scalars['String']
    name: Scalars['String']
    status: SSOIdentityProviderStatus
    type: IdentityProviderType
    __typename: 'EditSso'
}

export type EmailConnectionSecurity = 'NONE' | 'SSL_TLS' | 'STARTTLS'

export interface EmailPasswordResetLink {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'EmailPasswordResetLink'
}

export interface EmailThreadConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'EmailThreadConfiguration'
}

export interface EmailingDomain {
    createdAt: Scalars['DateTime']
    domain: Scalars['String']
    id: Scalars['UUID']
    status: EmailingDomainStatus
    tenantStatus: EmailingDomainTenantStatus
    unsubscribeHostnameStatus?: UnsubscribeHostnameStatus
    updatedAt: Scalars['DateTime']
    verificationRecords?: VerificationRecord[]
    verifiedAt?: Scalars['DateTime']
    __typename: 'EmailingDomain'
}

export type EmailingDomainStatus = 'FAILED' | 'PENDING' | 'TEMPORARY_FAILURE' | 'VERIFIED'

export type EmailingDomainTenantStatus = 'ACTIVE' | 'PAUSED' | 'SANDBOX'

export interface EmailsConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'EmailsConfiguration'
}

export type EngineComponentKey = 'ACTIVATE_WORKFLOW' | 'ADD_NODE_WORKFLOW' | 'ADD_TO_FAVORITES' | 'ASK_AI' | 'ASSIGN_AI_CHAT' | 'CANCEL_DASHBOARD_LAYOUT' | 'CANCEL_MESSAGE_CAMPAIGN' | 'COMPOSE_CAMPAIGN' | 'COMPOSE_EMAIL' | 'CREATE_NEW_RECORD' | 'CREATE_NEW_VIEW' | 'DEACTIVATE_WORKFLOW' | 'DELETE_MULTIPLE_RECORDS' | 'DELETE_RECORDS' | 'DELETE_SINGLE_RECORD' | 'DESTROY_MULTIPLE_RECORDS' | 'DESTROY_RECORDS' | 'DESTROY_SINGLE_RECORD' | 'DISCARD_DRAFT_WORKFLOW' | 'DUPLICATE_DASHBOARD' | 'DUPLICATE_MESSAGE_CAMPAIGN' | 'DUPLICATE_MESSAGE_LIST' | 'DUPLICATE_WORKFLOW' | 'EDIT_DASHBOARD_LAYOUT' | 'EDIT_RECORD_PAGE_LAYOUT' | 'EMAIL_BLOCK_SETTINGS' | 'EXPORT_FROM_RECORD_INDEX' | 'EXPORT_FROM_RECORD_SHOW' | 'EXPORT_MULTIPLE_RECORDS' | 'EXPORT_NOTE_TO_PDF' | 'EXPORT_RECORDS' | 'EXPORT_VIEW' | 'FRONT_COMPONENT_RENDERER' | 'GO_TO_COMPANIES' | 'GO_TO_DASHBOARDS' | 'GO_TO_NOTES' | 'GO_TO_OPPORTUNITIES' | 'GO_TO_PEOPLE' | 'GO_TO_RUNS' | 'GO_TO_SETTINGS' | 'GO_TO_TASKS' | 'GO_TO_WORKFLOWS' | 'HIDE_DELETED_RECORDS' | 'IMPORT_RECORDS' | 'MARK_AI_CHAT_AS_DONE' | 'MARK_AI_CHAT_AS_READ' | 'MARK_AI_CHAT_AS_UNREAD' | 'MERGE_MULTIPLE_RECORDS' | 'NAVIGATE_TO_NEXT_RECORD' | 'NAVIGATE_TO_PREVIOUS_RECORD' | 'NAVIGATION' | 'NEW_AI_CHAT' | 'REMOVE_FROM_FAVORITES' | 'REOPEN_AI_CHAT' | 'REPLY_TO_EMAIL_THREAD' | 'RESTORE_MULTIPLE_RECORDS' | 'RESTORE_RECORDS' | 'RESTORE_SINGLE_RECORD' | 'RETRY_WORKFLOW_RUN' | 'SAVE_DASHBOARD_LAYOUT' | 'SEARCH_RECORDS' | 'SEARCH_RECORDS_FALLBACK' | 'SEE_ACTIVE_VERSION_WORKFLOW' | 'SEE_DELETED_RECORDS' | 'SEE_RUNS_WORKFLOW' | 'SEE_RUNS_WORKFLOW_VERSION' | 'SEE_VERSIONS_WORKFLOW' | 'SEE_VERSIONS_WORKFLOW_VERSION' | 'SEE_VERSION_WORKFLOW_RUN' | 'SEE_WORKFLOW_WORKFLOW_RUN' | 'SEE_WORKFLOW_WORKFLOW_VERSION' | 'SEND_MESSAGE_CAMPAIGN' | 'SEND_MESSAGE_CAMPAIGN_TEST' | 'SHARE_RECORD' | 'SNOOZE_AI_CHAT' | 'STOP_WORKFLOW_RUN' | 'SUBSCRIBE_TO_AI_CHAT' | 'TEST_WORKFLOW' | 'TIDY_UP_WORKFLOW' | 'TOGGLE_WORKFLOW_VISIBILITY' | 'TRIGGER_WORKFLOW_VERSION' | 'UNSUBSCRIBE_FROM_AI_CHAT' | 'UPDATE_MULTIPLE_RECORDS' | 'USE_AS_DRAFT_WORKFLOW_VERSION' | 'VIEW_PREVIOUS_AI_CHATS'

export interface EnqueueJobResult {
    enqueued: Scalars['Boolean']
    jobId: Scalars['String']
    logicFunctionUniversalIdentifier: Scalars['String']
    __typename: 'EnqueueJobResult'
}

export interface EnqueueJobsResult {
    enqueued: Scalars['Boolean']
    enqueuedJobsCount: Scalars['Int']
    jobIds: Scalars['String'][]
    logicFunctionUniversalIdentifier: Scalars['String']
    __typename: 'EnqueueJobsResult'
}

export interface EnterpriseLicenseInfoDTO {
    expiresAt?: Scalars['DateTime']
    isValid: Scalars['Boolean']
    licensee?: Scalars['String']
    subscriptionId?: Scalars['String']
    __typename: 'EnterpriseLicenseInfoDTO'
}

export interface EnterpriseSubscriptionStatusDTO {
    cancelAt?: Scalars['DateTime']
    currentPeriodEnd?: Scalars['DateTime']
    expiresAt?: Scalars['DateTime']
    isCancellationScheduled: Scalars['Boolean']
    licensee?: Scalars['String']
    status: Scalars['String']
    __typename: 'EnterpriseSubscriptionStatusDTO'
}

export type EventLogFilterOperand = 'IS' | 'IS_NOT'

export interface EventLogPageInfo {
    endCursor?: Scalars['String']
    hasNextPage: Scalars['Boolean']
    __typename: 'EventLogPageInfo'
}

export interface EventLogQueryResult {
    pageInfo: EventLogPageInfo
    records: EventLogRecord[]
    totalCount: Scalars['Int']
    __typename: 'EventLogQueryResult'
}

export interface EventLogRecord {
    event: Scalars['String']
    isCustom?: Scalars['Boolean']
    objectMetadataId?: Scalars['String']
    properties?: Scalars['JSON']
    recordId?: Scalars['String']
    timestamp: Scalars['DateTime']
    userId?: Scalars['String']
    __typename: 'EventLogRecord'
}

export type EventLogTable = 'APPLICATION_LOG' | 'OBJECT_EVENT' | 'PAGEVIEW' | 'USAGE_EVENT' | 'WORKSPACE_EVENT'

export interface EventSubscription {
    eventStreamId: Scalars['String']
    metadataEvents: MetadataEvent[]
    objectRecordEventsWithQueryIds: ObjectRecordEventWithQueryIds[]
    queueJobEvents: JobStatus[]
    __typename: 'EventSubscription'
}

export interface FeatureFlag {
    key: FeatureFlagKey
    value: Scalars['Boolean']
    __typename: 'FeatureFlag'
}

export type FeatureFlagKey = 'IS_AI_CHAT_SHARING_DROPDOWN_ENABLED' | 'IS_APPLICATION_WORKFLOWS_ENABLED' | 'IS_ASYNC_CSV_EXPORT_ENABLED' | 'IS_CALENDAR_SYNC_SKIP_UNCHANGED_RECORDS_ENABLED' | 'IS_CONFIGURABLE_SEARCH_FIELDS_ENABLED' | 'IS_CONVERSATIONS_TAB_ENABLED' | 'IS_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_ENABLED' | 'IS_INITIAL_OBJECT_VIEW_ENABLED' | 'IS_JSON_FILTER_ENABLED' | 'IS_LOGS_SETTINGS_SECTION_ENABLED' | 'IS_MESSAGE_CAMPAIGN_ENABLED' | 'IS_RECORD_CREATION_FORM_ENABLED' | 'IS_RECORD_LEVEL_SHARING_ENABLED' | 'IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED' | 'IS_REST_METADATA_API_NEW_FORMAT_DIRECT' | 'IS_VALIDATION_RULES_ENABLED' | 'IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED' | 'IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED'

export interface Field {
    applicationId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    defaultValue?: Scalars['JSON']
    description?: Scalars['String']
    icon?: Scalars['String']
    id: Scalars['UUID']
    isActive?: Scalars['Boolean']
    isAuditLogged?: Scalars['Boolean']
    isLabelSyncedWithName?: Scalars['Boolean']
    isNullable?: Scalars['Boolean']
    isSearchable?: Scalars['Boolean']
    isSystem?: Scalars['Boolean']
    isUIEditable?: Scalars['Boolean']
    /** @deprecated Use isUIEditable */
    isUIReadOnly?: Scalars['Boolean']
    isUnique?: Scalars['Boolean']
    label: Scalars['String']
    morphId?: Scalars['UUID']
    morphRelations?: Relation[]
    name: Scalars['String']
    object?: Object
    objectMetadataId: Scalars['UUID']
    options?: Scalars['JSON']
    relation?: Relation
    settings?: Scalars['JSON']
    type: FieldMetadataType
    universalIdentifier: Scalars['String']
    updatedAt: Scalars['DateTime']
    writability?: MetadataWritability
    __typename: 'Field'
}

export interface FieldConfiguration {
    configurationType: WidgetConfigurationType
    fieldDisplayMode: FieldDisplayMode
    fieldMetadataId: Scalars['String']
    isUIEditable?: Scalars['Boolean']
    nestedRelationFieldMetadataId?: Scalars['String']
    viewId?: Scalars['String']
    __typename: 'FieldConfiguration'
}

export interface FieldConnection {
    /** Array of edges. */
    edges: FieldEdge[]
    /** Paging information */
    pageInfo: PageInfo
    __typename: 'FieldConnection'
}


/** Display mode for field configuration widgets */
export type FieldDisplayMode = 'CARD' | 'EDITOR' | 'FIELD' | 'TABLE' | 'VIEW'

export interface FieldEdge {
    /** Cursor for this node. */
    cursor: Scalars['ConnectionCursor']
    /** The node containing the Field */
    node: Field
    __typename: 'FieldEdge'
}


/** Type of the field */
export type FieldMetadataType = 'ACTOR' | 'ADDRESS' | 'ARRAY' | 'BOOLEAN' | 'CURRENCY' | 'DATE' | 'DATE_TIME' | 'EMAILS' | 'FILES' | 'FULL_NAME' | 'LINKS' | 'MORPH_RELATION' | 'MULTI_SELECT' | 'NUMBER' | 'NUMERIC' | 'PHONES' | 'POSITION' | 'RATING' | 'RAW_JSON' | 'RELATION' | 'RICH_TEXT' | 'SELECT' | 'TEXT' | 'TS_VECTOR' | 'UUID'

export interface FieldPermission {
    canReadFieldValue?: Scalars['Boolean']
    canUpdateFieldValue?: Scalars['Boolean']
    fieldMetadataId: Scalars['UUID']
    id: Scalars['UUID']
    objectMetadataId: Scalars['UUID']
    roleId: Scalars['UUID']
    __typename: 'FieldPermission'
}

export interface FieldRichTextConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'FieldRichTextConfiguration'
}

export interface FieldsConfiguration {
    configurationType: WidgetConfigurationType
    newFieldDefaultVisibility?: Scalars['Boolean']
    shouldAllowUserToSeeHiddenFields?: Scalars['Boolean']
    viewId?: Scalars['String']
    __typename: 'FieldsConfiguration'
}

export interface File {
    createdAt: Scalars['DateTime']
    id: Scalars['UUID']
    path: Scalars['String']
    size: Scalars['Float']
    __typename: 'File'
}

export type FileFolder = 'AgentChat' | 'AppTarball' | 'BuiltFrontComponent' | 'BuiltLogicFunction' | 'CorePicture' | 'Dependencies' | 'Dpa' | 'EmailAttachment' | 'EmailImage' | 'FilesField' | 'GeneratedSdkClient' | 'PublicAsset' | 'RecordExport' | 'Source' | 'Workflow'

export interface FileUploadTarget {
    contentType: Scalars['String']
    expiresAt: Scalars['DateTime']
    fileId: Scalars['UUID']
    uploadUrl: Scalars['String']
    __typename: 'FileUploadTarget'
}

export interface FileWithSignedUrl {
    createdAt: Scalars['DateTime']
    id: Scalars['UUID']
    path: Scalars['String']
    size: Scalars['Float']
    url: Scalars['String']
    __typename: 'FileWithSignedUrl'
}

export interface FilesConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'FilesConfiguration'
}

export interface FindAvailableSSOIDP {
    id: Scalars['UUID']
    issuer: Scalars['String']
    name: Scalars['String']
    status: SSOIdentityProviderStatus
    type: IdentityProviderType
    workspace: WorkspaceNameAndId
    __typename: 'FindAvailableSSOIDP'
}

export interface FormFieldConfiguration {
    configurationType: WidgetConfigurationType
    fieldMetadataId: Scalars['String']
    __typename: 'FormFieldConfiguration'
}

export interface FrontComponent {
    applicationGrantedCapabilities?: Scalars['String'][]
    applicationId: Scalars['UUID']
    applicationName?: Scalars['String']
    /** @deprecated Use generateFrontComponentApplicationTokenPair */
    applicationTokenPair?: ApplicationTokenPair
    applicationVariables?: Scalars['JSON']
    builtComponentChecksum: Scalars['String']
    builtComponentPath: Scalars['String']
    componentName: Scalars['String']
    createdAt: Scalars['DateTime']
    description?: Scalars['String']
    frontComponentSharedDependenciesChecksum?: Scalars['String']
    id: Scalars['UUID']
    isHeadless: Scalars['Boolean']
    name: Scalars['String']
    sourceComponentPath: Scalars['String']
    universalIdentifier?: Scalars['UUID']
    updatedAt: Scalars['DateTime']
    usesSdkClient: Scalars['Boolean']
    __typename: 'FrontComponent'
}

export interface FrontComponentConfiguration {
    configurationType: WidgetConfigurationType
    frontComponentId: Scalars['UUID']
    headerCommandMenuItemUniversalIdentifiers?: Scalars['UUID'][]
    __typename: 'FrontComponentConfiguration'
}

export interface FullName {
    firstName: Scalars['String']
    lastName: Scalars['String']
    __typename: 'FullName'
}

export interface GetAuthorizationUrlForSSO {
    authorizationURL: Scalars['String']
    id: Scalars['UUID']
    type: Scalars['String']
    __typename: 'GetAuthorizationUrlForSSO'
}


/** Order by options for graph widgets */
export type GraphOrderBy = 'FIELD_ASC' | 'FIELD_DESC' | 'FIELD_POSITION_ASC' | 'FIELD_POSITION_DESC' | 'MANUAL' | 'VALUE_ASC' | 'VALUE_DESC'

export interface GridPosition {
    column: Scalars['Float']
    columnSpan: Scalars['Float']
    row: Scalars['Float']
    rowSpan: Scalars['Float']
    __typename: 'GridPosition'
}

export type IdentityProviderType = 'OIDC' | 'SAML'

export interface IframeConfiguration {
    configurationType: WidgetConfigurationType
    url?: Scalars['String']
    __typename: 'IframeConfiguration'
}

export interface ImapSmtpCaldavConnectionSuccess {
    connectedAccountId: Scalars['String']
    success: Scalars['Boolean']
    __typename: 'ImapSmtpCaldavConnectionSuccess'
}

export interface ImapSmtpCaldavPublicConnectionParameters {
    CALDAV?: ImapSmtpCaldavPublicConnectionParams
    IMAP?: ImapSmtpCaldavPublicConnectionParams
    SMTP?: ImapSmtpCaldavPublicConnectionParams
    name?: Scalars['String']
    __typename: 'ImapSmtpCaldavPublicConnectionParameters'
}

export interface ImapSmtpCaldavPublicConnectionParams {
    connectionSecurity?: EmailConnectionSecurity
    host: Scalars['String']
    port: Scalars['Float']
    username?: Scalars['String']
    __typename: 'ImapSmtpCaldavPublicConnectionParams'
}

export interface Impersonate {
    loginToken: AuthToken
    workspace: WorkspaceUrlsAndId
    __typename: 'Impersonate'
}

export interface Index {
    createdAt: Scalars['DateTime']
    id: Scalars['UUID']
    indexFieldMetadataList: IndexField[]
    indexType: IndexType
    indexWhereClause?: Scalars['String']
    isCustom?: Scalars['Boolean']
    isUnique: Scalars['Boolean']
    name: Scalars['String']
    updatedAt: Scalars['DateTime']
    __typename: 'Index'
}

export interface IndexEdge {
    /** Cursor for this node. */
    cursor: Scalars['ConnectionCursor']
    /** The node containing the Index */
    node: Index
    __typename: 'IndexEdge'
}

export interface IndexField {
    createdAt: Scalars['DateTime']
    fieldMetadataId: Scalars['UUID']
    id: Scalars['UUID']
    order: Scalars['Float']
    subFieldName?: Scalars['String']
    updatedAt: Scalars['DateTime']
    __typename: 'IndexField'
}


/** Type of the index */
export type IndexType = 'BTREE' | 'GIN'

export interface IngestAppMessagesOutput {
    messages: IngestedAppMessage[]
    __typename: 'IngestAppMessagesOutput'
}

export interface IngestedAppMessage {
    externalId: Scalars['String']
    messageId: Scalars['UUID']
    messageThreadId: Scalars['UUID']
    __typename: 'IngestedAppMessage'
}

export interface InitiateTwoFactorAuthenticationProvisioning {
    uri: Scalars['String']
    __typename: 'InitiateTwoFactorAuthenticationProvisioning'
}

export interface InvalidatePassword {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'InvalidatePassword'
}

export interface InviteSuggestion {
    displayName?: Scalars['String']
    email: Scalars['String']
    __typename: 'InviteSuggestion'
}


/** Job state in the queue */
export type JobState = 'ACTIVE' | 'COMPLETED' | 'DELAYED' | 'FAILED' | 'PRIORITIZED' | 'WAITING' | 'WAITING_CHILDREN'

export interface JobStatus {
    attemptsMade: Scalars['Int']
    enqueuedAt: Scalars['Float']
    failedReason?: Scalars['String']
    finishedAt?: Scalars['Float']
    jobId: Scalars['String']
    progress?: Scalars['Int']
    startedAt?: Scalars['Float']
    state: JobState
    __typename: 'JobStatus'
}

export interface LineChartConfiguration {
    aggregateFieldMetadataId: Scalars['UUID']
    aggregateOperation: AggregateOperations
    axisNameDisplay?: AxisNameDisplay
    color?: Scalars['String']
    configurationType: WidgetConfigurationType
    description?: Scalars['String']
    displayDataLabel?: Scalars['Boolean']
    displayLegend?: Scalars['Boolean']
    filter?: Scalars['JSON']
    firstDayOfTheWeek?: Scalars['Int']
    isCumulative?: Scalars['Boolean']
    isStacked?: Scalars['Boolean']
    numberFormat?: ChartNumberFormat
    omitNullValues?: Scalars['Boolean']
    primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity
    primaryAxisGroupByFieldMetadataId: Scalars['UUID']
    primaryAxisGroupBySubFieldName?: Scalars['String']
    primaryAxisManualSortOrder?: Scalars['String'][]
    primaryAxisOrderBy?: GraphOrderBy
    rangeMax?: Scalars['Float']
    rangeMin?: Scalars['Float']
    secondaryAxisGroupByDateGranularity?: ObjectRecordGroupByDateGranularity
    secondaryAxisGroupByFieldMetadataId?: Scalars['UUID']
    secondaryAxisGroupBySubFieldName?: Scalars['String']
    secondaryAxisManualSortOrder?: Scalars['String'][]
    secondaryAxisOrderBy?: GraphOrderBy
    splitMultiValueFields?: Scalars['Boolean']
    timezone?: Scalars['String']
    __typename: 'LineChartConfiguration'
}

export interface LineChartData {
    formattedToRawLookup: Scalars['JSON']
    hasTooManyGroups: Scalars['Boolean']
    series: LineChartSeries[]
    showDataLabels: Scalars['Boolean']
    showLegend: Scalars['Boolean']
    xAxisLabel: Scalars['String']
    yAxisLabel: Scalars['String']
    __typename: 'LineChartData'
}

export interface LineChartDataPoint {
    x: Scalars['String']
    y: Scalars['Float']
    __typename: 'LineChartDataPoint'
}

export interface LineChartSeries {
    data: LineChartDataPoint[]
    key: Scalars['String']
    label: Scalars['String']
    __typename: 'LineChartSeries'
}

export interface Location {
    lat?: Scalars['Float']
    lng?: Scalars['Float']
    __typename: 'Location'
}

export interface LogicFunction {
    applicationId?: Scalars['UUID']
    canRunOnDemand?: Scalars['Boolean']
    createdAt: Scalars['DateTime']
    cronTriggerSettings?: Scalars['JSON']
    databaseEventTriggerSettings?: Scalars['JSON']
    description?: Scalars['String']
    executionMode: LogicFunctionExecutionMode
    handlerName: Scalars['String']
    httpRouteTriggerSettings?: Scalars['JSON']
    id: Scalars['UUID']
    name: Scalars['String']
    runtime: Scalars['String']
    sourceHandlerPath: Scalars['String']
    timeoutSeconds: Scalars['Float']
    toolTriggerSettings?: Scalars['JSON']
    universalIdentifier?: Scalars['UUID']
    updatedAt: Scalars['DateTime']
    workflowActionTriggerSettings?: Scalars['JSON']
    __typename: 'LogicFunction'
}

export type LogicFunctionExecutionMode = 'LIVE' | 'PREBUILT'

export interface LogicFunctionExecutionResult {
    /** Execution result in JSON format */
    data?: Scalars['JSON']
    /** Execution duration in milliseconds */
    duration: Scalars['Float']
    /** Execution error in JSON format */
    error?: Scalars['JSON']
    /** Execution Logs */
    logs: Scalars['String']
    /** Execution status */
    status: LogicFunctionExecutionStatus
    __typename: 'LogicFunctionExecutionResult'
}


/** Status of the logic function execution */
export type LogicFunctionExecutionStatus = 'ERROR' | 'IDLE' | 'SUCCESS'

export interface LogicFunctionLogs {
    /** Execution Logs */
    logs: Scalars['String']
    name?: Scalars['String']
    universalIdentifier?: Scalars['UUID']
    __typename: 'LogicFunctionLogs'
}

export interface LoginToken {
    loginToken: AuthToken
    __typename: 'LoginToken'
}

export interface MarketplaceApp {
    author: Scalars['String']
    category: Scalars['String']
    description: Scalars['String']
    id: Scalars['String']
    isVetted: Scalars['Boolean']
    logoUrl?: Scalars['String']
    name: Scalars['String']
    sourcePackage?: Scalars['String']
    __typename: 'MarketplaceApp'
}

export interface MarketplaceAppDetail {
    aboutDescription?: Scalars['String']
    author?: Scalars['String']
    category?: Scalars['String']
    defaultRoleUniversalIdentifier?: Scalars['String']
    description?: Scalars['String']
    emailSupport?: Scalars['String']
    galleryImages: Scalars['String'][]
    id: Scalars['String']
    installCount: Scalars['Int']
    isListed: Scalars['Boolean']
    isVetted: Scalars['Boolean']
    issueReportUrl?: Scalars['String']
    latestAvailableVersion?: Scalars['String']
    logoUrl?: Scalars['String']
    /** @deprecated Use the explicit MarketplaceAppDetail fields (description, author, roles, ...) instead */
    manifest?: Scalars['JSON']
    name: Scalars['String']
    pricingDescription?: Scalars['String']
    requestedCapabilities: Scalars['String'][]
    roles?: MarketplaceAppRole[]
    /** @deprecated Use galleryImages instead */
    screenshots: Scalars['String'][]
    sourcePackage?: Scalars['String']
    sourceType: ApplicationRegistrationSourceType
    termsUrl?: Scalars['String']
    universalIdentifier: Scalars['String']
    websiteUrl?: Scalars['String']
    __typename: 'MarketplaceAppDetail'
}

export interface MarketplaceAppRole {
    canAccessAllTools?: Scalars['Boolean']
    canDestroyAllObjectRecords?: Scalars['Boolean']
    canReadAllObjectRecords?: Scalars['Boolean']
    canSoftDeleteAllObjectRecords?: Scalars['Boolean']
    canUpdateAllObjectRecords?: Scalars['Boolean']
    canUpdateAllSettings?: Scalars['Boolean']
    description?: Scalars['String']
    fieldPermissions?: MarketplaceAppRoleFieldPermission[]
    icon?: Scalars['String']
    label: Scalars['String']
    objectPermissions?: MarketplaceAppRoleObjectPermission[]
    permissionFlagUniversalIdentifiers?: Scalars['String'][]
    universalIdentifier: Scalars['String']
    __typename: 'MarketplaceAppRole'
}

export interface MarketplaceAppRoleFieldPermission {
    canReadFieldValue?: Scalars['Boolean']
    canUpdateFieldValue?: Scalars['Boolean']
    fieldUniversalIdentifier: Scalars['String']
    objectUniversalIdentifier: Scalars['String']
    universalIdentifier: Scalars['String']
    __typename: 'MarketplaceAppRoleFieldPermission'
}

export interface MarketplaceAppRoleObjectPermission {
    canDestroyObjectRecords?: Scalars['Boolean']
    canReadObjectRecords?: Scalars['Boolean']
    canSoftDeleteObjectRecords?: Scalars['Boolean']
    canUpdateObjectRecords?: Scalars['Boolean']
    objectUniversalIdentifier: Scalars['String']
    universalIdentifier: Scalars['String']
    __typename: 'MarketplaceAppRoleObjectPermission'
}

export interface MessageCampaignBodyConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'MessageCampaignBodyConfiguration'
}

export interface MessageCampaignDetailsConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'MessageCampaignDetailsConfiguration'
}

export interface MessageChannel {
    connectedAccount?: ConnectedAccountPublicDTO
    connectedAccountId: Scalars['UUID']
    contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy
    createdAt: Scalars['DateTime']
    displayName?: Scalars['String']
    excludeGroupEmails: Scalars['Boolean']
    excludeNonProfessionalEmails: Scalars['Boolean']
    handle: Scalars['String']
    id: Scalars['UUID']
    isContactAutoCreationEnabled: Scalars['Boolean']
    isSyncEnabled: Scalars['Boolean']
    messageFolderImportPolicy: MessageFolderImportPolicy
    pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction
    syncStage: MessageChannelSyncStage
    syncStageStartedAt?: Scalars['DateTime']
    syncStatus: MessageChannelSyncStatus
    syncedAt?: Scalars['DateTime']
    throttleFailureCount: Scalars['Float']
    throttleRetryAfter?: Scalars['DateTime']
    type: MessageChannelType
    updatedAt: Scalars['DateTime']
    visibility: MessageChannelVisibility
    __typename: 'MessageChannel'
}

export type MessageChannelContactAutoCreationPolicy = 'NONE' | 'SENT' | 'SENT_AND_RECEIVED'

export type MessageChannelPendingGroupEmailsAction = 'GROUP_EMAILS_DELETION' | 'GROUP_EMAILS_IMPORT' | 'NONE'

export type MessageChannelSyncStage = 'FAILED' | 'MESSAGES_IMPORT_ONGOING' | 'MESSAGES_IMPORT_PENDING' | 'MESSAGES_IMPORT_SCHEDULED' | 'MESSAGE_LIST_FETCH_ONGOING' | 'MESSAGE_LIST_FETCH_PENDING' | 'MESSAGE_LIST_FETCH_SCHEDULED' | 'PENDING_CONFIGURATION'

export type MessageChannelSyncStatus = 'ACTIVE' | 'FAILED_INSUFFICIENT_PERMISSIONS' | 'FAILED_UNKNOWN' | 'NOT_SYNCED' | 'ONGOING'

export type MessageChannelType = 'APP' | 'EMAIL' | 'EMAIL_GROUP' | 'SMS'

export type MessageChannelVisibility = 'METADATA' | 'SHARE_EVERYTHING' | 'SUBJECT'

export interface MessageFolder {
    createdAt: Scalars['DateTime']
    externalId?: Scalars['String']
    id: Scalars['UUID']
    isSentFolder: Scalars['Boolean']
    isSynced: Scalars['Boolean']
    messageChannelId: Scalars['UUID']
    name?: Scalars['String']
    parentFolderId?: Scalars['String']
    pendingSyncAction: MessageFolderPendingSyncAction
    updatedAt: Scalars['DateTime']
    __typename: 'MessageFolder'
}

export type MessageFolderImportPolicy = 'ALL_FOLDERS' | 'SELECTED_FOLDERS'

export type MessageFolderPendingSyncAction = 'FOLDER_DELETION' | 'FOLDER_IMPORT' | 'NONE'

export type MessageParticipantRole = 'BCC' | 'CC' | 'FROM' | 'REPLY_TO' | 'TO'

export interface MessageSuppression {
    createdAt: Scalars['DateTime']
    emailAddress: Scalars['String']
    id: Scalars['UUID']
    reason: MessageSuppressionReason
    source: MessageSuppressionSource
    unsubscribeTopicId?: Scalars['UUID']
    __typename: 'MessageSuppression'
}

export interface MessageSuppressionList {
    records: MessageSuppression[]
    totalCount: Scalars['Int']
    __typename: 'MessageSuppressionList'
}

export type MessageSuppressionReason = 'BOUNCE' | 'COMPLAINT' | 'TRACKING' | 'UNSUBSCRIBE'

export type MessageSuppressionSource = 'SYSTEM' | 'WEBHOOK'

export interface MetadataEvent {
    metadataName: Scalars['String']
    properties: ObjectRecordEventProperties
    recordId: Scalars['String']
    type: MetadataEventAction
    updatedCollectionHash?: Scalars['String']
    __typename: 'MetadataEvent'
}


/** Metadata Event Action */
export type MetadataEventAction = 'CREATED' | 'DELETED' | 'UPDATED'

export type MetadataReadability = 'APPLICATION' | 'INHERITED' | 'OPEN' | 'PRIVATE' | 'SYSTEM'

export interface MetadataTranslation {
    canonicalValue: Scalars['String']
    locale: Scalars['String']
    metadataName: Scalars['String']
    objectMetadataId?: Scalars['UUID']
    property: Scalars['String']
    provenance: MetadataTranslationProvenance
    recordId: Scalars['UUID']
    sourceValue: Scalars['String']
    value: Scalars['String']
    __typename: 'MetadataTranslation'
}


/** Where a resolved metadata label comes from: a workspace-authored translation, a shipped application catalog, or inheritance from the canonical value */
export type MetadataTranslationProvenance = 'INHERITED' | 'SHIPPED' | 'WORKSPACE'

export type MetadataWritability = 'APPLICATION' | 'OPEN' | 'SYSTEM'

export interface MinimalMetadata {
    collectionHashes: CollectionHash[]
    objectMetadataItems: MinimalObjectMetadata[]
    views: MinimalView[]
    __typename: 'MinimalMetadata'
}

export interface MinimalObjectMetadata {
    color?: Scalars['String']
    icon?: Scalars['String']
    id: Scalars['UUID']
    isActive: Scalars['Boolean']
    isRemote: Scalars['Boolean']
    isSystem: Scalars['Boolean']
    labelPlural: Scalars['String']
    labelSingular: Scalars['String']
    namePlural: Scalars['String']
    nameSingular: Scalars['String']
    __typename: 'MinimalObjectMetadata'
}

export interface MinimalView {
    id: Scalars['UUID']
    key?: ViewKey
    objectMetadataId: Scalars['UUID']
    type: ViewType
    __typename: 'MinimalView'
}

export type ModelFamily = 'CLAUDE' | 'GEMINI' | 'GPT' | 'GROK' | 'MISTRAL'

export interface Mutation {
    activateSkill: Skill
    activateWorkspace: Workspace
    addAgentChatChannelMembers: Scalars['Boolean']
    addAgentChatThreadParticipants: Scalars['UUID'][]
    addQueryToEventStream: Scalars['Boolean']
    archiveAgentChatThread: AgentChatThreadParticipant
    assignAgentChatThread: Scalars['Boolean']
    assignRoleToAgent: Scalars['Boolean']
    assignRoleToApiKey: Scalars['Boolean']
    authorizeApp: AuthorizeApp
    cancelMessageCampaign: CancelMessageCampaignOutputDTO
    cancelSwitchBillingInterval: BillingUpdate
    cancelSwitchBillingPlan: BillingUpdate
    cancelSwitchResourceCreditPrice: BillingUpdate
    checkCustomDomainValidRecords?: DomainValidRecords
    checkPublicDomainValidRecords?: DomainValidRecords
    checkoutSession: BillingSession
    claimApplicationRegistrationOwnership: ApplicationRegistration
    completeAppTarballUpload: ApplicationRegistration
    completeApplicationFileUploads: CompleteApplicationFileUploadsResult
    completeBookCallOnboardingStep: OnboardingStepSuccess
    completeFileUpload: FileWithSignedUrl
    completeNewWorkspaceLogoUpload: FileWithSignedUrl
    completeWorkspaceLogoUpload: FileWithSignedUrl
    completeWorkspaceMemberProfilePictureUpload: FileWithSignedUrl
    createAgentChatChannel: AgentChatChannel
    createApiKey: ApiKey
    createAppMessageChannel: MessageChannel
    createApplicationFileUploads: CreateApplicationFileUploadsResult
    createApplicationRegistration: CreateApplicationRegistration
    createApprovedAccessDomain: ApprovedAccessDomain
    createBillingPaymentMethodSetupIntent: BillingPaymentIntent
    createCalendarEvent: CreateCalendarEventOutput
    createChatThread: AgentChatThread
    createCommandMenuItem: CommandMenuItem
    createDevelopmentApplication: DevelopmentApplication
    createEmailGroupChannel: CreateEmailGroupChannelOutput
    createEmailingDomain: EmailingDomain
    createFileUpload: FileUploadTarget
    createFrontComponent: FrontComponent
    createManyNavigationMenuItems: NavigationMenuItem[]
    createManyViewFieldGroups: ViewFieldGroup[]
    createManyViewFields: ViewField[]
    createManyViewGroups: ViewGroup[]
    createMessageSuppression: MessageSuppression
    createNavigationMenuItem: NavigationMenuItem
    createNewWorkspaceLogoUpload: FileUploadTarget
    createOIDCIdentityProvider: SetupSso
    createObjectEvent: Analytics
    createOneAgent: Agent
    createOneField: Field
    createOneIndex: Index
    createOneLogicFunction: LogicFunction
    createOneObject: Object
    createOneRole: Role
    createPageLayout: PageLayout
    createPageLayoutTab: PageLayoutTab
    createPageLayoutWidget: PageLayoutWidget
    createPublicDomain: PublicDomain
    createSAMLIdentityProvider: SetupSso
    createSkill: Skill
    createSubscriptionPaymentIntent: BillingPaymentIntent
    createUnsubscribeTopic: UnsubscribeTopic
    createUsageLimit: UsageLimit
    createValidationRule: ValidationRule
    createView: View
    createViewField: ViewField
    createViewFieldGroup: ViewFieldGroup
    createViewFilter: ViewFilter
    createViewFilterGroup: ViewFilterGroup
    createViewGroup: ViewGroup
    createViewSort: ViewSort
    createWebhook: Webhook
    deactivateSkill: Skill
    deleteAgentChatChannel: Scalars['Boolean']
    deleteAppKeyValue: Scalars['Boolean']
    deleteAppMessageChannel: MessageChannel
    deleteApplicationRegistration: Scalars['Boolean']
    deleteApprovedAccessDomain: Scalars['Boolean']
    deleteCommandMenuItem: CommandMenuItem
    deleteConnectedAccount: ConnectedAccountPublicDTO
    deleteCurrentWorkspace: Workspace
    deleteEmailGroupChannel: MessageChannel
    deleteEmailingDomain: Scalars['Boolean']
    deleteFrontComponent: FrontComponent
    deleteManyNavigationMenuItems: NavigationMenuItem[]
    deleteMessageSuppression: Scalars['Boolean']
    deleteNavigationMenuItem: NavigationMenuItem
    deleteOneAgent: Agent
    deleteOneField: Field
    deleteOneIndex: Index
    deleteOneLogicFunction: LogicFunction
    deleteOneObject: Object
    deleteOneRole: Scalars['String']
    deletePublicDomain: Scalars['Boolean']
    deleteQueuedChatMessage: Scalars['Boolean']
    deleteSSOIdentityProvider: DeleteSso
    deleteSkill: Skill
    deleteTwoFactorAuthenticationMethod: DeleteTwoFactorAuthenticationMethod
    deleteUnsubscribeTopic: Scalars['Boolean']
    deleteUsageLimit: Scalars['Boolean']
    deleteUser: User
    deleteUserFromWorkspace: UserWorkspace
    deleteValidationRule: ValidationRule
    deleteView: Scalars['Boolean']
    deleteViewField: ViewField
    deleteViewFieldGroup: ViewFieldGroup
    deleteViewFilter: ViewFilter
    deleteViewFilterGroup: Scalars['Boolean']
    deleteViewGroup: ViewGroup
    deleteViewSort: Scalars['Boolean']
    deleteWebhook: Webhook
    deleteWorkspaceInvitation: Scalars['String']
    destroyPageLayout: Scalars['Boolean']
    destroyPageLayoutTab: Scalars['Boolean']
    destroyPageLayoutWidget: Scalars['Boolean']
    destroyView: Scalars['Boolean']
    destroyViewField: ViewField
    destroyViewFieldGroup: ViewFieldGroup
    destroyViewFilter: ViewFilter
    destroyViewFilterGroup: Scalars['Boolean']
    destroyViewGroup: ViewGroup
    destroyViewSort: Scalars['Boolean']
    disconnectConnectedAccount: ConnectedAccountPublicDTO
    duplicateDashboard: DuplicatedDashboard
    duplicateMessageList: DuplicatedMessageList
    editSSOIdentityProvider: EditSso
    emailPasswordResetLink: EmailPasswordResetLink
    endSubscriptionTrialPeriod: BillingEndTrialPeriod
    /** @deprecated Use enqueueJobs instead. */
    enqueueJob: EnqueueJobResult
    enqueueJobs: EnqueueJobsResult
    enrichWorkspaceCompany: WorkspaceCompanyEnrichmentResult
    executeOneLogicFunction: LogicFunctionExecutionResult
    generateApiKeyToken: ApiKeyToken
    generateFrontComponentApplicationTokenPair: ApplicationTokenPair
    generatePlaygroundToken: AuthToken
    generateTransientToken: TransientToken
    generateTwoFactorAuthenticationRecoveryCode: TwoFactorAuthenticationRecoveryCode
    getAuthTokensFromLoginToken: AuthTokens
    getAuthTokensFromOTP: AuthTokens
    getAuthTokensFromSSOExchangeToken: AuthTokens
    getAuthTokensFromTwoFactorAuthenticationRecoveryCode: TwoFactorAuthenticationRecoveryCodeRedemption
    getAuthorizationUrlForSSO: GetAuthorizationUrlForSSO
    getLoginTokenFromCredentials: LoginToken
    goBackToPreviousOnboardingStep: OnboardingStepNavigation
    grantApplicationCapabilities: ApplicationCapabilityGrant
    impersonate: Impersonate
    ingestAppMessages: IngestAppMessagesOutput
    initiateOTPProvisioning: InitiateTwoFactorAuthenticationProvisioning
    initiateOTPProvisioningForAuthenticatedUser: InitiateTwoFactorAuthenticationProvisioning
    installApplication: Application
    /** @deprecated Use installApplication instead */
    installMarketplaceApp: Scalars['Boolean']
    joinAgentChatChannel: Scalars['Boolean']
    leaveAgentChatChannel: Scalars['Boolean']
    markAgentChatThreadAsDoneInChannel: Scalars['Boolean']
    markAgentChatThreadAsRead: AgentChatThreadParticipant
    markAgentChatThreadAsUnread: AgentChatThreadParticipant
    moveAgentChatThreadToChannel: Scalars['Boolean']
    moveAgentChatThreadToInbox: AgentChatThreadParticipant
    refreshEnterpriseValidityToken: Scalars['Boolean']
    releaseEnterpriseServerBinding: EnterpriseLicenseInfoDTO
    removeAgentChatChannelMember: Scalars['Boolean']
    removeQueryFromEventStream: Scalars['Boolean']
    removeRecordShare: RecordSharingDTO
    removeRoleFromAgent: Scalars['Boolean']
    renewApplicationToken: ApplicationTokenPair
    renewToken: AuthTokens
    reopenAgentChatThreadInChannel: Scalars['Boolean']
    reportAppConnectionAuthFailure: Scalars['Boolean']
    resendEmailVerificationToken: ResendEmailVerificationToken
    resendWorkspaceInvitation: SendInvitations
    resetCommandMenuItem: CommandMenuItem
    resetPageLayoutTabToDefault: PageLayoutTab
    resetPageLayoutToDefault: PageLayout
    resetPageLayoutWidgetToDefault: PageLayoutWidget
    resetTimelineActivityType: TimelineActivityType
    retryChatMessage: SendChatMessageResult
    revokeAllOtherUserSessions: Scalars['Int']
    revokeApiKey?: ApiKey
    revokeApplicationAuthorization: Scalars['Boolean']
    revokeTwoFactorAuthenticationRecoveryCode: Scalars['Boolean']
    revokeUserSession: Scalars['Boolean']
    rotateApplicationRegistrationClientSecret: RotateClientSecret
    runAgent: RunAgentResult
    runApplicationHealthCheck?: ApplicationHealthCheckResult
    saveImapSmtpCaldavAccount: ImapSmtpCaldavConnectionSuccess
    sendChatMessage: SendChatMessageResult
    sendEmail: SendEmailOutput
    sendInboxMessage: SendInboxMessageResult
    sendInvitations: SendInvitations
    sendMessageCampaign: SendMessageCampaignOutputDTO
    sendMessageCampaignTest: SendEmailViaDomainOutput
    setAppKeyValue: AppKeyValue
    setEnterpriseKey: EnterpriseLicenseInfoDTO
    setRecordGeneralAccess: RecordSharingDTO
    setRecordShare: RecordSharingDTO
    setResourceCreditSubscriptionPrice: BillingUpdate
    signIn: AvailableWorkspacesAndAccessTokens
    signOut: Scalars['Boolean']
    signUp: AvailableWorkspacesAndAccessTokens
    signUpInNewWorkspace: SignUp
    signUpInWorkspace: SignUp
    skipSyncEmailOnboardingStep: OnboardingStepSuccess
    snoozeAgentChatThread: AgentChatThreadParticipant
    snoozeAgentChatThreadInChannel: Scalars['Boolean']
    startChannelSync: ChannelSyncSuccess
    startWorkspaceSetupChat: StartWorkspaceSetupChatResult
    stopAgentChatStream: Scalars['Boolean']
    stopImpersonation: StopImpersonation
    subscribeToAgentChatThread: AgentChatThreadParticipant
    switchBillingPlan: BillingUpdate
    switchSubscriptionInterval: BillingUpdate
    syncApplication: WorkspaceMigration
    syncMarketplaceCatalog: Scalars['Boolean']
    trackAnalytics: Analytics
    transferApplicationRegistrationOwnership: ApplicationRegistration
    triggerInstallApplicationJob: TriggerInstallApplicationJobResult
    triggerUninstallApplicationJob: TriggerUninstallApplicationJobResult
    uninstallApplication: Scalars['Boolean']
    unsubscribeFromAgentChatThread: AgentChatThreadParticipant
    updateAgentChatChannel: AgentChatChannel
    updateApiKey?: ApiKey
    updateAppMessageChannel: MessageChannel
    updateApplication: Application
    updateApplicationRegistration: ApplicationRegistration
    updateApplicationRegistrationVariable: ApplicationRegistrationVariable
    updateCalendarChannel: CalendarChannel
    updateCommandMenuItem: CommandMenuItem
    updateEmailGroupChannel: MessageChannel
    updateFrontComponent: FrontComponent
    updateLabPublicFeatureFlag: FeatureFlag
    updateManyNavigationMenuItems: NavigationMenuItem[]
    updateManyObjects: Object[]
    updateManyViewGroups: ViewGroup[]
    updateMessageChannel: MessageChannel
    updateMessageFolder: MessageFolder
    updateMessageFolders: MessageFolder[]
    updateMyUserApplicationVariable: Scalars['Boolean']
    updateNavigationMenuItem: NavigationMenuItem
    updateOneAgent: Agent
    updateOneApplicationVariable: Scalars['Boolean']
    updateOneField: Field
    updateOneLogicFunction: Scalars['Boolean']
    updateOneObject: Object
    updateOneRole: Role
    updatePageLayout: PageLayout
    updatePageLayoutTab: PageLayoutTab
    updatePageLayoutWidget: PageLayoutWidget
    updatePageLayoutWithTabsAndWidgets: PageLayout
    updatePasswordViaResetToken: InvalidatePassword
    updateSkill: Skill
    updateTimelineActivityType: TimelineActivityType
    updateUnsubscribeTopic: UnsubscribeTopic
    updateUsageLimit: UsageLimit
    updateUserEmail: Scalars['Boolean']
    updateValidationRule: ValidationRule
    updateView: View
    updateViewField: ViewField
    updateViewFieldGroup: ViewFieldGroup
    updateViewFilter: ViewFilter
    updateViewFilterGroup: ViewFilterGroup
    updateViewGroup: ViewGroup
    updateViewSort: ViewSort
    updateWebhook: Webhook
    updateWorkspace: Workspace
    updateWorkspaceAllowedIframeOrigins: Workspace
    updateWorkspaceMemberRole: WorkspaceMember
    updateWorkspaceMemberSettings: Scalars['Boolean']
    upgradeApplication: Scalars['Boolean']
    /** @deprecated Use createFileUpload with the AppTarball folder and completeAppTarballUpload, which send the tarball straight to file storage. */
    uploadAppTarball: ApplicationRegistration
    /** @deprecated Use createApplicationFileUploads and completeApplicationFileUploads, which send the files straight to file storage. */
    uploadApplicationFile: File
    /** @deprecated Use createFileUpload with the FilesField folder and the fieldMetadataUniversalIdentifier, then completeFileUpload, which send the file straight to file storage. */
    uploadFilesFieldFileByUniversalIdentifier: FileWithSignedUrl
    /** @deprecated Use createNewWorkspaceLogoUpload and completeNewWorkspaceLogoUpload, which send the logo straight to file storage. */
    uploadNewWorkspaceLogo: FileWithSignedUrl
    /** @deprecated Use createFileUpload with the CorePicture folder and completeWorkspaceLogoUpload, which send the logo straight to file storage. */
    uploadWorkspaceLogo: FileWithSignedUrl
    /** @deprecated Use createFileUpload with the CorePicture folder and completeWorkspaceMemberProfilePictureUpload, which send the picture straight to file storage. */
    uploadWorkspaceMemberProfilePicture: FileWithSignedUrl
    upsertFieldPermissions: FieldPermission[]
    upsertFieldsWidget: View
    upsertObjectPermissions: ObjectPermission[]
    upsertPermissionFlags: RolePermissionFlag[]
    upsertRowLevelPermissionPredicates: UpsertRowLevelPermissionPredicatesResult
    upsertViewWidget: View
    validateApprovedAccessDomain: ApprovedAccessDomain
    verifyEmailAndGetLoginToken: VerifyEmailAndGetLoginToken
    verifyEmailAndGetWorkspaceAgnosticToken: AvailableWorkspacesAndAccessTokens
    verifyEmailingDomain: EmailingDomain
    verifyTwoFactorAuthenticationMethodForAuthenticatedUser: VerifyTwoFactorAuthenticationMethod
    __typename: 'Mutation'
}

export interface NativeModelCapabilities {
    twitterSearch?: Scalars['Boolean']
    webSearch?: Scalars['Boolean']
    __typename: 'NativeModelCapabilities'
}

export interface NavigationMenuItem {
    applicationId?: Scalars['UUID']
    color?: Scalars['String']
    createdAt: Scalars['DateTime']
    folderId?: Scalars['UUID']
    icon?: Scalars['String']
    id: Scalars['UUID']
    link?: Scalars['String']
    name?: Scalars['String']
    pageLayoutId?: Scalars['UUID']
    position: Scalars['Float']
    targetObjectMetadataId?: Scalars['UUID']
    targetRecordId?: Scalars['UUID']
    targetRecordIdentifier?: RecordIdentifier
    type: NavigationMenuItemType
    updatedAt: Scalars['DateTime']
    userWorkspaceId?: Scalars['UUID']
    viewId?: Scalars['UUID']
    __typename: 'NavigationMenuItem'
}

export type NavigationMenuItemType = 'FOLDER' | 'LINK' | 'OBJECT' | 'PAGE_LAYOUT' | 'RECORD' | 'VIEW'

export interface NotesConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'NotesConfiguration'
}

export interface Object {
    applicationId: Scalars['UUID']
    color?: Scalars['String']
    createdAt: Scalars['DateTime']
    description?: Scalars['String']
    duplicateCriteria?: Scalars['String'][][]
    fields: ObjectFieldsConnection
    fieldsList: Field[]
    icon?: Scalars['String']
    id: Scalars['UUID']
    imageIdentifierFieldMetadataId?: Scalars['UUID']
    indexMetadataList: Index[]
    indexMetadatas: ObjectIndexMetadatasConnection
    isActive: Scalars['Boolean']
    isLabelSyncedWithName: Scalars['Boolean']
    isRemote: Scalars['Boolean']
    isSearchable: Scalars['Boolean']
    isSystem: Scalars['Boolean']
    isUICreatable: Scalars['Boolean']
    isUIEditable: Scalars['Boolean']
    /** @deprecated Use isUIEditable */
    isUIReadOnly: Scalars['Boolean']
    labelIdentifierFieldMetadataId?: Scalars['UUID']
    labelPlural: Scalars['String']
    labelSingular: Scalars['String']
    namePlural: Scalars['String']
    nameSingular: Scalars['String']
    openRecordIn: ObjectOpenRecordIn
    readability: MetadataReadability
    readabilityParentFieldUniversalIdentifiers?: Scalars['UUID'][]
    searchFieldMetadataList: SearchField[]
    sharingReach: ObjectSharingReach
    shortcut?: Scalars['String']
    universalIdentifier: Scalars['String']
    updatedAt: Scalars['DateTime']
    writability: MetadataWritability
    __typename: 'Object'
}

export interface ObjectConnection {
    /** Array of edges. */
    edges: ObjectEdge[]
    /** Paging information */
    pageInfo: PageInfo
    __typename: 'ObjectConnection'
}

export interface ObjectEdge {
    /** Cursor for this node. */
    cursor: Scalars['ConnectionCursor']
    /** The node containing the Object */
    node: Object
    __typename: 'ObjectEdge'
}

export interface ObjectFieldsConnection {
    /** Array of edges. */
    edges: FieldEdge[]
    /** Paging information */
    pageInfo: PageInfo
    __typename: 'ObjectFieldsConnection'
}

export interface ObjectIndexMetadatasConnection {
    /** Array of edges. */
    edges: IndexEdge[]
    /** Paging information */
    pageInfo: PageInfo
    __typename: 'ObjectIndexMetadatasConnection'
}

export interface ObjectMetadataCommandMenuItemPayload {
    /** @deprecated Never returned anymore: navigation targets moved to CommandMenuItem.navigationTargetObjectMetadataId. This variant only remains one release so frontends deployed after the server keep validating; it will be removed in the next release. */
    objectMetadataItemId: Scalars['UUID']
    __typename: 'ObjectMetadataCommandMenuItemPayload'
}

export type ObjectOpenRecordIn = 'RECORD_PAGE' | 'SIDE_PANEL' | 'USER_CHOICE'

export interface ObjectPermission {
    canDestroyObjectRecords?: Scalars['Boolean']
    canReadObjectRecords?: Scalars['Boolean']
    canSoftDeleteObjectRecords?: Scalars['Boolean']
    canUpdateObjectRecords?: Scalars['Boolean']
    objectMetadataId: Scalars['UUID']
    restrictedFields?: Scalars['JSON']
    rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroup[]
    rowLevelPermissionPredicates?: RowLevelPermissionPredicate[]
    __typename: 'ObjectPermission'
}

export interface ObjectRecordCount {
    objectNamePlural: Scalars['String']
    totalCount: Scalars['Int']
    __typename: 'ObjectRecordCount'
}

export interface ObjectRecordEvent {
    action: DatabaseEventAction
    objectNameSingular: Scalars['String']
    properties: ObjectRecordEventProperties
    recordId: Scalars['String']
    userId?: Scalars['String']
    workspaceMemberId?: Scalars['String']
    __typename: 'ObjectRecordEvent'
}

export interface ObjectRecordEventProperties {
    after?: Scalars['JSON']
    before?: Scalars['JSON']
    diff?: Scalars['JSON']
    updatedFields?: Scalars['String'][]
    __typename: 'ObjectRecordEventProperties'
}

export interface ObjectRecordEventWithQueryIds {
    objectRecordEvent: ObjectRecordEvent
    queryIds: Scalars['String'][]
    __typename: 'ObjectRecordEventWithQueryIds'
}


/** Date granularity options (e.g. DAY, MONTH, QUARTER, YEAR, WEEK, DAY_OF_THE_WEEK, MONTH_OF_THE_YEAR, QUARTER_OF_THE_YEAR) */
export type ObjectRecordGroupByDateGranularity = 'DAY' | 'DAY_OF_THE_WEEK' | 'MONTH' | 'MONTH_OF_THE_YEAR' | 'NONE' | 'QUARTER' | 'QUARTER_OF_THE_YEAR' | 'WEEK' | 'YEAR'

export type ObjectSharingReach = 'ROLE_ACCESS' | 'WORKSPACE'


/** Onboarding status */
export type OnboardingStatus = 'BOOK_CALL' | 'COMPLETED' | 'INVITE_TEAM' | 'PLAN_REQUIRED' | 'PROFILE_CREATION' | 'SYNC_EMAIL' | 'WORKSPACE_ACTIVATION'

export interface OnboardingStepNavigation {
    /** Onboarding status the user landed on */
    onboardingStatus?: OnboardingStatus
    /** Step the user can go back to from there, if any */
    previousOnboardingStatus?: OnboardingStatus
    __typename: 'OnboardingStepNavigation'
}

export interface OnboardingStepSuccess {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'OnboardingStepSuccess'
}

export type OpenRecordIn = 'RECORD_PAGE' | 'SIDE_PANEL'

export interface PageInfo {
    /** The cursor of the last returned record. */
    endCursor?: Scalars['ConnectionCursor']
    /** true if paging forward and there are more records. */
    hasNextPage?: Scalars['Boolean']
    /** true if paging backwards and there are more records. */
    hasPreviousPage?: Scalars['Boolean']
    /** The cursor of the first returned record. */
    startCursor?: Scalars['ConnectionCursor']
    __typename: 'PageInfo'
}

export interface PageLayout {
    applicationId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    defaultTabToFocusOnMobileAndSidePanelId?: Scalars['UUID']
    deletedAt?: Scalars['DateTime']
    id: Scalars['UUID']
    isFirstTabPinned: Scalars['Boolean']
    isSystemSideEffect: Scalars['Boolean']
    name: Scalars['String']
    objectMetadataId?: Scalars['UUID']
    tabs?: PageLayoutTab[]
    type: PageLayoutType
    universalIdentifier: Scalars['UUID']
    updatedAt: Scalars['DateTime']
    __typename: 'PageLayout'
}

export interface PageLayoutTab {
    applicationId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    icon?: Scalars['String']
    id: Scalars['UUID']
    isActive: Scalars['Boolean']
    /** @deprecated isOverridden is deprecated */
    isOverridden?: Scalars['Boolean']
    isSystemSideEffect: Scalars['Boolean']
    layoutMode?: PageLayoutTabLayoutMode
    pageLayoutId: Scalars['UUID']
    position: Scalars['Float']
    title: Scalars['String']
    universalIdentifier: Scalars['UUID']
    updatedAt: Scalars['DateTime']
    widgets?: PageLayoutWidget[]
    __typename: 'PageLayoutTab'
}

export type PageLayoutTabLayoutMode = 'CANVAS' | 'GRID' | 'VERTICAL_LIST'

export type PageLayoutType = 'DASHBOARD' | 'RECORD_FORM' | 'RECORD_INDEX' | 'RECORD_PAGE' | 'STANDALONE_PAGE'

export interface PageLayoutWidget {
    applicationId: Scalars['UUID']
    conditionalAvailabilityExpression?: Scalars['String']
    conditionalDisplay?: Scalars['JSON']
    configuration: WidgetConfiguration
    createdAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    /** @deprecated Use `position` instead. */
    gridPosition?: GridPosition
    id: Scalars['UUID']
    isActive: Scalars['Boolean']
    /** @deprecated isOverridden is deprecated */
    isOverridden?: Scalars['Boolean']
    isSystemSideEffect: Scalars['Boolean']
    objectMetadataId?: Scalars['UUID']
    pageLayoutTabId: Scalars['UUID']
    position?: PageLayoutWidgetPosition
    title: Scalars['String']
    type: WidgetType
    universalIdentifier: Scalars['UUID']
    updatedAt: Scalars['DateTime']
    __typename: 'PageLayoutWidget'
}

export interface PageLayoutWidgetCanvasPosition {
    layoutMode: PageLayoutTabLayoutMode
    __typename: 'PageLayoutWidgetCanvasPosition'
}

export interface PageLayoutWidgetGridPosition {
    column: Scalars['Int']
    columnSpan: Scalars['Int']
    layoutMode: PageLayoutTabLayoutMode
    row: Scalars['Int']
    rowSpan: Scalars['Int']
    __typename: 'PageLayoutWidgetGridPosition'
}

export type PageLayoutWidgetPosition = (PageLayoutWidgetCanvasPosition | PageLayoutWidgetGridPosition | PageLayoutWidgetVerticalListPosition) & { __isUnion?: true }

export type PageLayoutWidgetVerticalListHeightBehavior = 'FIT_CONTENT' | 'TAB_VIEWPORT'

export interface PageLayoutWidgetVerticalListPosition {
    heightBehavior?: PageLayoutWidgetVerticalListHeightBehavior
    index: Scalars['Int']
    layoutMode: PageLayoutTabLayoutMode
    __typename: 'PageLayoutWidgetVerticalListPosition'
}

export interface PathCommandMenuItemPayload {
    path: Scalars['String']
    __typename: 'PathCommandMenuItemPayload'
}

export interface PermissionFlag {
    applicationId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    description?: Scalars['String']
    icon?: Scalars['String']
    id: Scalars['UUID']
    key: Scalars['String']
    label: Scalars['String']
    permissionType: Scalars['String']
    universalIdentifier: Scalars['UUID']
    updatedAt: Scalars['DateTime']
    __typename: 'PermissionFlag'
}

export type PermissionFlagType = 'AI' | 'AI_SETTINGS' | 'API_KEYS_AND_WEBHOOKS' | 'APPLICATIONS' | 'BILLING' | 'CODE_INTERPRETER_TOOL' | 'CONNECTED_ACCOUNTS' | 'CREATE_CALENDAR_EVENT_TOOL' | 'DATA_MODEL' | 'DOWNLOAD_FILE' | 'EXPORT_CSV' | 'HTTP_REQUEST_TOOL' | 'IMPERSONATE' | 'IMPORT_CSV' | 'LAYOUTS' | 'MARKETPLACE_APPS' | 'PROFILE_INFORMATION' | 'ROLES' | 'SECURITY' | 'SEND_EMAIL_TOOL' | 'SSO_BYPASS' | 'UPLOAD_FILE' | 'VIEWS' | 'WORKFLOWS' | 'WORKSPACE' | 'WORKSPACE_MEMBERS'

export interface PieChartConfiguration {
    aggregateFieldMetadataId: Scalars['UUID']
    aggregateOperation: AggregateOperations
    color?: Scalars['String']
    configurationType: WidgetConfigurationType
    dateGranularity?: ObjectRecordGroupByDateGranularity
    description?: Scalars['String']
    displayDataLabel?: Scalars['Boolean']
    displayLegend?: Scalars['Boolean']
    filter?: Scalars['JSON']
    firstDayOfTheWeek?: Scalars['Int']
    groupByFieldMetadataId: Scalars['UUID']
    groupBySubFieldName?: Scalars['String']
    hideEmptyCategory?: Scalars['Boolean']
    manualSortOrder?: Scalars['String'][]
    numberFormat?: ChartNumberFormat
    orderBy?: GraphOrderBy
    showCenterMetric?: Scalars['Boolean']
    splitMultiValueFields?: Scalars['Boolean']
    timezone?: Scalars['String']
    __typename: 'PieChartConfiguration'
}

export interface PieChartData {
    data: PieChartDataItem[]
    formattedToRawLookup: Scalars['JSON']
    hasTooManyGroups: Scalars['Boolean']
    showCenterMetric: Scalars['Boolean']
    showDataLabels: Scalars['Boolean']
    showLegend: Scalars['Boolean']
    __typename: 'PieChartData'
}

export interface PieChartDataItem {
    key: Scalars['String']
    value: Scalars['Float']
    __typename: 'PieChartDataItem'
}

export interface PlaceDetailsResult {
    city?: Scalars['String']
    country?: Scalars['String']
    location?: Location
    postcode?: Scalars['String']
    state?: Scalars['String']
    street?: Scalars['String']
    __typename: 'PlaceDetailsResult'
}

export interface PublicApplicationRegistration {
    id: Scalars['UUID']
    logoUrl?: Scalars['String']
    name: Scalars['String']
    oAuthScopes: Scalars['String'][]
    websiteUrl?: Scalars['String']
    __typename: 'PublicApplicationRegistration'
}

export interface PublicConnectionParametersOutput {
    connectionSecurity?: EmailConnectionSecurity
    host: Scalars['String']
    port: Scalars['Float']
    username?: Scalars['String']
    __typename: 'PublicConnectionParametersOutput'
}

export interface PublicDomain {
    applicationId?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    domain: Scalars['String']
    id: Scalars['UUID']
    isValidated: Scalars['Boolean']
    __typename: 'PublicDomain'
}

export interface PublicFeatureFlag {
    key: FeatureFlagKey
    metadata: PublicFeatureFlagMetadata
    __typename: 'PublicFeatureFlag'
}

export interface PublicFeatureFlagMetadata {
    description: Scalars['String']
    icon: Scalars['String']
    imagePath?: Scalars['String']
    label: Scalars['String']
    __typename: 'PublicFeatureFlagMetadata'
}

export interface PublicImapSmtpCaldavConnectionParameters {
    CALDAV?: PublicConnectionParametersOutput
    IMAP?: PublicConnectionParametersOutput
    SMTP?: PublicConnectionParametersOutput
    __typename: 'PublicImapSmtpCaldavConnectionParameters'
}

export interface PublicWorkspaceData {
    authBypassProviders?: AuthBypassProviders
    authProviders: AuthProviders
    displayName?: Scalars['String']
    id: Scalars['UUID']
    logo?: Scalars['String']
    workspaceUrls: WorkspaceUrls
    __typename: 'PublicWorkspaceData'
}

export interface PublicWorkspaceDataSummary {
    displayName?: Scalars['String']
    id: Scalars['UUID']
    logo?: Scalars['String']
    __typename: 'PublicWorkspaceDataSummary'
}

export interface Query {
    agentChatChannels: AgentChatChannelListItem[]
    agentChatInboxSummary: AgentChatInboxSummary
    agentChatInboxThreadIds: AgentChatInboxThreadIds
    agentRuns: AgentRun[]
    aiChatUsage?: AiChatUsage
    apiKey?: ApiKey
    apiKeys: ApiKey[]
    appConnection: AppConnection
    appConnections: AppConnection[]
    appKeyValue?: AppKeyValue
    appMessageChannels: MessageChannel[]
    applicationConnectedAccounts: ApplicationConnectedAccountDTO[]
    applicationConnectionProviders: ApplicationConnectionProvider[]
    applicationCoreGraphqlSchema: Scalars['String']
    applicationRegistrationTarballUrl?: Scalars['String']
    applicationSdkClientChecksums?: SdkClientChecksums
    barChartData: BarChartData
    billingPortalSession: BillingSession
    callRecordingIdForCalendarEvent?: Scalars['UUID']
    chatMessages: AgentMessage[]
    chatStreamCatchupChunks: ChatStreamCatchupChunks
    chatThread: AgentChatThread
    checkUserExists: CheckUserExist
    checkWorkspaceInviteHashIsValid: WorkspaceInviteHashValid
    checkWorkspaceSubdomainAvailability: SubdomainAvailabilityDTO
    commandMenuItem?: CommandMenuItem
    commandMenuItems: CommandMenuItem[]
    currentUser: User
    currentUserApplicationAuthorizations: ApplicationAuthorization[]
    currentUserSessions: UserSession[]
    currentWorkspace: Workspace
    enterpriseCheckoutSession?: Scalars['String']
    enterprisePortalSession?: Scalars['String']
    enterpriseSubscriptionStatus?: EnterpriseSubscriptionStatusDTO
    eventLogs: EventLogQueryResult
    exportApplication: ApplicationExport
    field: Field
    fields: FieldConnection
    findApplicationRegistrationByClientId?: PublicApplicationRegistration
    findApplicationRegistrationByUniversalIdentifier?: ApplicationRegistration
    findApplicationRegistrationStats: ApplicationRegistrationStats
    findApplicationRegistrationVariables: ApplicationRegistrationVariable[]
    findClaimableApplicationRegistration?: ClaimableApplicationRegistration
    findInstallApplicationJobStatus?: JobStatus
    findManyAgents: Agent[]
    findManyApplicationRegistrations: ApplicationRegistration[]
    findManyApplications: Application[]
    findManyLogicFunctions: LogicFunction[]
    findManyMarketplaceApps: MarketplaceApp[]
    findManyPublicDomains: PublicDomain[]
    findMarketplaceAppDetail: MarketplaceAppDetail
    findOneAgent: Agent
    findOneApplication: Application
    findOneApplicationRegistration: ApplicationRegistration
    findOneLogicFunction: LogicFunction
    findUninstallApplicationJobStatus?: JobStatus
    findWorkspaceAiStats: WorkspaceAiStats
    findWorkspaceFromInviteHash: Workspace
    findWorkspaceInvitations: WorkspaceInvitation[]
    frontComponent?: FrontComponent
    frontComponents: FrontComponent[]
    getAddressDetails: PlaceDetailsResult
    getAiSystemPromptPreview: AiSystemPromptPreview
    getApiKeyRoles: Role[]
    getApprovedAccessDomains: ApprovedAccessDomain[]
    getAutoCompleteAddress: AutocompleteResult[]
    getAvailablePackages: Scalars['JSON']
    getConnectedImapSmtpCaldavAccount: ConnectedImapSmtpCaldavAccount
    getEmailingDomains: EmailingDomain[]
    getInviteSuggestions: InviteSuggestion[]
    getJobs: JobStatus[]
    getLogicFunctionSourceCode?: Scalars['String']
    getPageLayout?: PageLayout
    getPageLayoutTab: PageLayoutTab
    getPageLayoutTabs: PageLayoutTab[]
    getPageLayoutWidget: PageLayoutWidget
    getPageLayoutWidgets: PageLayoutWidget[]
    getPageLayouts: PageLayout[]
    getPermissionFlags: PermissionFlag[]
    getPublicWorkspaceDataByDomain: PublicWorkspaceData
    getPublicWorkspaceDataById: PublicWorkspaceDataSummary
    getResourceCreditUsage: BillingResourceCreditUsage[]
    getRole: Role
    getRoles: Role[]
    getSSOIdentityProviders: FindAvailableSSOIDP[]
    getToolIndex: ToolIndexEntry[]
    getToolInputSchema?: Scalars['JSON']
    getUsageAnalytics: UsageAnalytics
    getView?: View
    getViewField?: ViewField
    getViewFieldGroup?: ViewFieldGroup
    getViewFieldGroups: ViewFieldGroup[]
    getViewFields: ViewField[]
    getViewFilter?: ViewFilter
    getViewFilterGroup?: ViewFilterGroup
    getViewFilterGroups: ViewFilterGroup[]
    getViewFilters: ViewFilter[]
    getViewGroup?: ViewGroup
    getViewGroups: ViewGroup[]
    getViewSort?: ViewSort
    getViewSorts: ViewSort[]
    getViews: View[]
    getWorkspaceCreationDefaults: WorkspaceCreationDefaultsDTO
    githubClaimAuthorizationUrl: Scalars['String']
    isApplicationStopped: Scalars['Boolean']
    lineChartData: LineChartData
    listPlans: BillingPlan[]
    messageSuppressions: MessageSuppressionList
    metadataTranslations: MetadataTranslation[]
    minimalMetadata: MinimalMetadata
    mostlyEmptyFieldMetadataIds: Scalars['UUID'][]
    myCalendarChannels: CalendarChannel[]
    myConnectedAccounts: ConnectedAccountPublicDTO[]
    myMessageChannels: MessageChannel[]
    myMessageFolders: MessageFolder[]
    myUserApplicationVariables: WorkspaceMemberApplicationVariables[]
    navigationMenuItem?: NavigationMenuItem
    navigationMenuItems: NavigationMenuItem[]
    object: Object
    objectRecordCounts: ObjectRecordCount[]
    objects: ObjectConnection
    pieChartData: PieChartData
    previewMessageCampaignAudience: CampaignAudiencePreviewDTO
    publicMarketplaceAppDetail: MarketplaceAppDetail
    publicMarketplaceApps: MarketplaceApp[]
    recordPermissions: RecordPermissionsResult[]
    recordSharing: RecordSharingDTO
    skill?: Skill
    skills: Skill[]
    timelineActivityTypes: TimelineActivityType[]
    twoFactorAuthenticationRecoveryStatus: TwoFactorAuthenticationRecoveryStatus
    unsubscribeTopics: UnsubscribeTopic[]
    usageLimits: UsageLimit[]
    usageQuotaDefinitions: UsageQuotaDefinitions
    usageQuotaScopeConsumption?: UsageQuotaScopeConsumption
    usageQuotasWithConsumption: UsageQuotaWithConsumption[]
    validatePasswordResetToken: ValidatePasswordResetToken
    validationRules: ValidationRule[]
    webhook?: Webhook
    webhooks: Webhook[]
    __typename: 'Query'
}

export interface RatioAggregateConfig {
    fieldMetadataId: Scalars['UUID']
    optionValue: Scalars['String']
    __typename: 'RatioAggregateConfig'
}

export interface RecordExport {
    downloadPath?: Scalars['String']
    errorMessage?: Scalars['String']
    filename: Scalars['String']
    id: Scalars['UUID']
    progress: Scalars['Int']
    __typename: 'RecordExport'
}

export interface RecordIdentifier {
    id: Scalars['UUID']
    imageIdentifier?: Scalars['String']
    labelIdentifier: Scalars['String']
    __typename: 'RecordIdentifier'
}

export interface RecordPermissionsDTO {
    canDelete: Scalars['Boolean']
    canRead: Scalars['Boolean']
    canSoftDelete: Scalars['Boolean']
    canUpdate: Scalars['Boolean']
    __typename: 'RecordPermissionsDTO'
}

export interface RecordPermissionsResult {
    objectMetadataId: Scalars['UUID']
    permissions: RecordPermissionsDTO
    recordId: Scalars['UUID']
    __typename: 'RecordPermissionsResult'
}

export type RecordShareAccessLevel = 'FULL' | 'NONE' | 'READ' | 'READ_WRITE'

export type RecordSharePrincipalType = 'EVERYONE' | 'ROLE' | 'WORKSPACE_MEMBER'

export type RecordShareRowCause = 'APPLICATION' | 'MANUAL' | 'OWNER' | 'RULE'

export interface RecordSharingDTO {
    canManageSharing: Scalars['Boolean']
    defaultGeneralAccessLevel?: RecordShareAccessLevel
    generalAccessLevel?: RecordShareAccessLevel
    hasManagedGeneralAccess: Scalars['Boolean']
    permissions: RecordPermissionsDTO
    roles: RecordSharingRoleDTO[]
    shares: RecordSharingGrantDTO[]
    sharingMode: RecordSharingMode
    __typename: 'RecordSharingDTO'
}

export interface RecordSharingGrantDTO {
    accessLevel: RecordShareAccessLevel
    id: Scalars['ID']
    principalId: Scalars['UUID']
    principalRoleId?: Scalars['UUID']
    principalType: RecordSharePrincipalType
    rowCause: RecordShareRowCause
    __typename: 'RecordSharingGrantDTO'
}


/** How records of an object are shared: only through roles, private until shared, readable through linked records, or open by default with per-record exceptions */
export type RecordSharingMode = 'INHERITED' | 'OPEN_BY_DEFAULT' | 'PRIVATE' | 'ROLE_ONLY'

export interface RecordSharingRoleDTO {
    canRead?: Scalars['Boolean']
    canUpdate?: Scalars['Boolean']
    id: Scalars['UUID']
    label: Scalars['String']
    __typename: 'RecordSharingRoleDTO'
}

export interface RecordTableConfiguration {
    configurationType: WidgetConfigurationType
    isUIEditable?: Scalars['Boolean']
    recordLimit?: Scalars['Int']
    viewId?: Scalars['String']
    __typename: 'RecordTableConfiguration'
}

export interface Relation {
    sourceFieldMetadata: Field
    sourceObjectMetadata: Object
    targetFieldMetadata: Field
    targetObjectMetadata: Object
    type: RelationType
    __typename: 'Relation'
}


/** Relation type */
export type RelationType = 'MANY_TO_ONE' | 'ONE_TO_MANY'

export interface ResendEmailVerificationToken {
    success: Scalars['Boolean']
    __typename: 'ResendEmailVerificationToken'
}

export interface RichTextBody {
    blocknote?: Scalars['String']
    markdown?: Scalars['String']
    __typename: 'RichTextBody'
}

export interface Role {
    agents: Agent[]
    apiKeys: ApiKeyForRole[]
    canAccessAllTools: Scalars['Boolean']
    canBeAssignedToAgents: Scalars['Boolean']
    canBeAssignedToApiKeys: Scalars['Boolean']
    canBeAssignedToUsers: Scalars['Boolean']
    canDestroyAllObjectRecords: Scalars['Boolean']
    canReadAllObjectRecords: Scalars['Boolean']
    canSoftDeleteAllObjectRecords: Scalars['Boolean']
    canUpdateAllObjectRecords: Scalars['Boolean']
    canUpdateAllSettings: Scalars['Boolean']
    description?: Scalars['String']
    fieldPermissions?: FieldPermission[]
    icon?: Scalars['String']
    id: Scalars['UUID']
    isEditable: Scalars['Boolean']
    label: Scalars['String']
    objectPermissions?: ObjectPermission[]
    permissionFlags?: RolePermissionFlag[]
    rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroup[]
    rowLevelPermissionPredicates?: RowLevelPermissionPredicate[]
    universalIdentifier?: Scalars['UUID']
    workspaceMembers: WorkspaceMember[]
    __typename: 'Role'
}

export interface RolePermissionFlag {
    flag: Scalars['String']
    id: Scalars['UUID']
    roleId: Scalars['UUID']
    __typename: 'RolePermissionFlag'
}

export interface RotateClientSecret {
    clientSecret: Scalars['String']
    __typename: 'RotateClientSecret'
}

export interface RowLevelPermissionPredicate {
    fieldMetadataId: Scalars['String']
    id: Scalars['String']
    objectMetadataId: Scalars['String']
    operand: RowLevelPermissionPredicateOperand
    positionInRowLevelPermissionPredicateGroup?: Scalars['Float']
    roleId: Scalars['String']
    rowLevelPermissionPredicateGroupId?: Scalars['String']
    subFieldName?: Scalars['String']
    value?: Scalars['JSON']
    workspaceMemberFieldMetadataId?: Scalars['String']
    workspaceMemberSubFieldName?: Scalars['String']
    __typename: 'RowLevelPermissionPredicate'
}

export interface RowLevelPermissionPredicateGroup {
    id: Scalars['String']
    logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator
    objectMetadataId: Scalars['String']
    parentRowLevelPermissionPredicateGroupId?: Scalars['String']
    positionInRowLevelPermissionPredicateGroup?: Scalars['Float']
    roleId: Scalars['String']
    __typename: 'RowLevelPermissionPredicateGroup'
}

export type RowLevelPermissionPredicateGroupLogicalOperator = 'AND' | 'OR'

export type RowLevelPermissionPredicateOperand = 'CONTAINS' | 'DOES_NOT_CONTAIN' | 'GREATER_THAN_OR_EQUAL' | 'IS' | 'IS_AFTER' | 'IS_BEFORE' | 'IS_EMPTY' | 'IS_IN_FUTURE' | 'IS_IN_PAST' | 'IS_NOT' | 'IS_NOT_EMPTY' | 'IS_NOT_NULL' | 'IS_RELATIVE' | 'IS_TODAY' | 'LESS_THAN_OR_EQUAL' | 'VECTOR_SEARCH'

export type RunAgentMessageRole = 'assistant' | 'user'

export interface RunAgentResult {
    error?: Scalars['String']
    isWaiting: Scalars['Boolean']
    result?: Scalars['JSON']
    success: Scalars['Boolean']
    threadId?: Scalars['UUID']
    __typename: 'RunAgentResult'
}

export interface SSOConnection {
    id: Scalars['UUID']
    issuer: Scalars['String']
    name: Scalars['String']
    status: SSOIdentityProviderStatus
    type: IdentityProviderType
    __typename: 'SSOConnection'
}

export interface SSOIdentityProvider {
    id: Scalars['UUID']
    issuer: Scalars['String']
    name: Scalars['String']
    status: SSOIdentityProviderStatus
    type: IdentityProviderType
    __typename: 'SSOIdentityProvider'
}

export type SSOIdentityProviderStatus = 'Active' | 'Error' | 'Inactive'

export interface SdkClientChecksums {
    core?: Scalars['String']
    metadata: Scalars['String']
    __typename: 'SdkClientChecksums'
}

export interface SearchField {
    createdAt: Scalars['DateTime']
    fieldMetadataId: Scalars['UUID']
    id: Scalars['UUID']
    position: Scalars['Float']
    tsVectorFieldMetadataId: Scalars['UUID']
    updatedAt: Scalars['DateTime']
    __typename: 'SearchField'
}

export interface SendChatMessageResult {
    mentionedParticipantWorkspaceMemberIds?: Scalars['UUID'][]
    messageId?: Scalars['String']
    queued: Scalars['Boolean']
    streamId?: Scalars['String']
    __typename: 'SendChatMessageResult'
}

export interface SendEmailOutput {
    error?: Scalars['String']
    messageThreadId?: Scalars['String']
    success: Scalars['Boolean']
    __typename: 'SendEmailOutput'
}

export interface SendEmailViaDomainOutput {
    messageId: Scalars['String']
    __typename: 'SendEmailViaDomainOutput'
}

export interface SendInboxMessageResult {
    threadId: Scalars['UUID']
    __typename: 'SendInboxMessageResult'
}

export interface SendInvitations {
    errors: Scalars['String'][]
    result: WorkspaceInvitation[]
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'SendInvitations'
}

export interface SendMessageCampaignOutputDTO {
    audience: CampaignAudiencePreviewDTO
    campaignId: Scalars['String']
    queuedCount: Scalars['Int']
    __typename: 'SendMessageCampaignOutputDTO'
}

export interface Sentry {
    dsn?: Scalars['String']
    environment?: Scalars['String']
    release?: Scalars['String']
    tracesSampleRate?: Scalars['Float']
    __typename: 'Sentry'
}

export interface SettingsMenuItem {
    applicationId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    frontComponentId: Scalars['UUID']
    icon?: Scalars['String']
    id: Scalars['UUID']
    position: Scalars['Float']
    scope: SettingsMenuItemScope
    title: Scalars['String']
    universalIdentifier: Scalars['UUID']
    updatedAt: Scalars['DateTime']
    __typename: 'SettingsMenuItem'
}

export type SettingsMenuItemScope = 'USER' | 'WORKSPACE'

export interface SetupSso {
    id: Scalars['UUID']
    issuer: Scalars['String']
    name: Scalars['String']
    status: SSOIdentityProviderStatus
    type: IdentityProviderType
    __typename: 'SetupSso'
}

export interface SignUp {
    loginToken: AuthToken
    workspace: WorkspaceUrlsAndId
    __typename: 'SignUp'
}

export interface Skill {
    applicationId?: Scalars['UUID']
    content: Scalars['String']
    createdAt: Scalars['DateTime']
    description?: Scalars['String']
    icon?: Scalars['String']
    id: Scalars['UUID']
    isActive: Scalars['Boolean']
    isCustom: Scalars['Boolean']
    isSystem: Scalars['Boolean']
    label: Scalars['String']
    name: Scalars['String']
    updatedAt: Scalars['DateTime']
    __typename: 'Skill'
}

export interface StandaloneRichTextConfiguration {
    body: RichTextBody
    configurationType: WidgetConfigurationType
    __typename: 'StandaloneRichTextConfiguration'
}

export interface StartWorkspaceSetupChatResult {
    outcome: WorkspaceSetupChatOutcome
    thread?: AgentChatThread
    __typename: 'StartWorkspaceSetupChatResult'
}

export interface StopImpersonation {
    canRestoreImpersonatorSession: Scalars['Boolean']
    __typename: 'StopImpersonation'
}

export interface SubdomainAvailabilityDTO {
    available: Scalars['Boolean']
    isValid: Scalars['Boolean']
    suggestedSubdomain: Scalars['String']
    suggestedSubdomains: Scalars['String'][]
    __typename: 'SubdomainAvailabilityDTO'
}

export interface Subscription {
    eventLogsLive?: EventLogRecord[]
    exportRecords: RecordExport
    logicFunctionLogs: LogicFunctionLogs
    onAgentChatEvent: AgentChatEvent
    onEventSubscription?: EventSubscription
    __typename: 'Subscription'
}

export type SubscriptionInterval = 'Month' | 'Year'

export type SubscriptionStatus = 'Active' | 'Canceled' | 'Incomplete' | 'IncompleteExpired' | 'PastDue' | 'Paused' | 'Trialing' | 'Unpaid'

export interface Support {
    supportDriver: SupportDriver
    supportFrontChatId?: Scalars['String']
    __typename: 'Support'
}

export type SupportDriver = 'FRONT' | 'NONE'

export interface TasksConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'TasksConfiguration'
}

export interface TimelineActivityType {
    /** @deprecated Use emit.on */
    action?: Scalars['String']
    applicationId?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    emit?: TimelineActivityTypeEmit
    frontComponentUniversalIdentifier?: Scalars['UUID']
    icon?: Scalars['String']
    id: Scalars['UUID']
    isActive: Scalars['Boolean']
    label: Scalars['String']
    name: Scalars['String']
    /** @deprecated Use emit.objectUniversalIdentifier */
    objectUniversalIdentifier?: Scalars['UUID']
    replacesTimelineActivityTypeUniversalIdentifier?: Scalars['UUID']
    universalIdentifier: Scalars['UUID']
    updatedAt: Scalars['DateTime']
    __typename: 'TimelineActivityType'
}

export interface TimelineActivityTypeEmit {
    objectUniversalIdentifier?: Scalars['UUID']
    on: Scalars['String']
    through?: TimelineActivityTypeEmitThrough
    __typename: 'TimelineActivityTypeEmit'
}

export interface TimelineActivityTypeEmitThrough {
    happensAtFieldUniversalIdentifier?: Scalars['UUID']
    relationFieldUniversalIdentifier: Scalars['UUID']
    triggerFieldUniversalIdentifiers?: Scalars['UUID'][]
    __typename: 'TimelineActivityTypeEmitThrough'
}

export interface TimelineConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'TimelineConfiguration'
}

export interface ToolIndexEntry {
    category: Scalars['String']
    description: Scalars['String']
    frontComponentId?: Scalars['String']
    icon?: Scalars['String']
    inputSchema?: Scalars['JSON']
    label: Scalars['String']
    name: Scalars['String']
    objectName?: Scalars['String']
    widgetName?: Scalars['String']
    __typename: 'ToolIndexEntry'
}

export interface TransientToken {
    transientToken: AuthToken
    __typename: 'TransientToken'
}

export interface TriggerInstallApplicationJobResult {
    jobId: Scalars['String']
    __typename: 'TriggerInstallApplicationJobResult'
}

export interface TriggerUninstallApplicationJobResult {
    jobId: Scalars['String']
    __typename: 'TriggerUninstallApplicationJobResult'
}

export interface TwoFactorAuthenticationMethodSummary {
    status: Scalars['String']
    strategy: Scalars['String']
    twoFactorAuthenticationMethodId: Scalars['UUID']
    __typename: 'TwoFactorAuthenticationMethodSummary'
}

export interface TwoFactorAuthenticationRecoveryCode {
    expiresAt: Scalars['DateTime']
    recoveryCode: Scalars['String']
    __typename: 'TwoFactorAuthenticationRecoveryCode'
}

export interface TwoFactorAuthenticationRecoveryCodeRedemption {
    provisioningUri?: Scalars['String']
    tokens?: AuthTokenPair
    __typename: 'TwoFactorAuthenticationRecoveryCodeRedemption'
}

export interface TwoFactorAuthenticationRecoveryStatus {
    hasVerifiedTwoFactorAuthenticationMethod: Scalars['Boolean']
    isAwaitingRecoveryEnrollment: Scalars['Boolean']
    pendingRecoveryCodeExpiresAt?: Scalars['DateTime']
    __typename: 'TwoFactorAuthenticationRecoveryStatus'
}

export type UnsubscribeHostnameStatus = 'ACTIVE' | 'FAILED' | 'PENDING'

export interface UnsubscribeTopic {
    createdAt: Scalars['DateTime']
    description?: Scalars['String']
    id: Scalars['UUID']
    name?: Scalars['String']
    updatedAt: Scalars['DateTime']
    visibility: UnsubscribeTopicVisibility
    __typename: 'UnsubscribeTopic'
}

export type UnsubscribeTopicVisibility = 'PRIVATE' | 'PUBLIC'

export interface UpsertRowLevelPermissionPredicatesResult {
    predicateGroups: RowLevelPermissionPredicateGroup[]
    predicates: RowLevelPermissionPredicate[]
    __typename: 'UpsertRowLevelPermissionPredicatesResult'
}

export interface UsageAnalytics {
    periodEnd: Scalars['DateTime']
    periodStart: Scalars['DateTime']
    timeSeries: UsageTimeSeries[]
    usageByApplication: UsageBreakdownItem[]
    usageByModel: UsageBreakdownItem[]
    usageByOperationType: UsageBreakdownItem[]
    usageByUser: UsageBreakdownItem[]
    userDailyUsage?: UsageUserDaily
    __typename: 'UsageAnalytics'
}

export interface UsageBreakdownItem {
    creditsUsed: Scalars['Float']
    key: Scalars['String']
    label?: Scalars['String']
    __typename: 'UsageBreakdownItem'
}

export interface UsageLimit {
    burstValue?: Scalars['BigInt']
    createdAt: Scalars['DateTime']
    id: Scalars['UUID']
    limitKind: Scalars['String']
    limitValue: Scalars['BigInt']
    operationType: UsageOperationType
    periodCount: Scalars['Int']
    periodUnit: Scalars['String']
    resourceType: UsageResourceType
    spenderId?: Scalars['String']
    spenderType: Scalars['String']
    unit: UsageUnit
    updatedAt: Scalars['DateTime']
    __typename: 'UsageLimit'
}

export interface UsageLimitOperationDefinition {
    allowedUnits: UsageUnit[]
    operationType: UsageOperationType
    __typename: 'UsageLimitOperationDefinition'
}

export type UsageOperationType = 'AI_CHAT_TOKEN' | 'AI_WORKFLOW_TOKEN' | 'ALL' | 'API_REQUEST' | 'CALL_RECORDING' | 'CODE_EXECUTION' | 'EMAIL_SEND' | 'MESSAGE_CAMPAIGN_SEND' | 'RECORD_WRITE' | 'STORAGE_FILE' | 'SUBSCRIPTION' | 'WEBHOOK_CALL' | 'WEB_SEARCH' | 'WORKFLOW_EXECUTION'

export interface UsageQuotaDefinition {
    allowedOperations: UsageLimitOperationDefinition[]
    allowedSpenderTypes: Scalars['String'][]
    limitKind: Scalars['String']
    operatorOnlyScopes: UsageQuotaOperatorOnlyScope[]
    resourceType: UsageResourceType
    __typename: 'UsageQuotaDefinition'
}

export interface UsageQuotaDefinitions {
    definitions: UsageQuotaDefinition[]
    hasAllowancePeriod: Scalars['Boolean']
    isIntraWorkspaceLimitEntitled: Scalars['Boolean']
    __typename: 'UsageQuotaDefinitions'
}

export interface UsageQuotaOperatorOnlyScope {
    operationType: UsageOperationType
    periodUnit: Scalars['String']
    spenderType: Scalars['String']
    unit: UsageUnit
    __typename: 'UsageQuotaOperatorOnlyScope'
}

export interface UsageQuotaScopeConsumption {
    consumedValue?: Scalars['BigInt']
    periodEnd: Scalars['DateTime']
    periodStart: Scalars['DateTime']
    __typename: 'UsageQuotaScopeConsumption'
}

export interface UsageQuotaWithConsumption {
    consumedValue?: Scalars['BigInt']
    id: Scalars['UUID']
    isEnforced: Scalars['Boolean']
    limitValue: Scalars['BigInt']
    operationType: UsageOperationType
    periodEnd?: Scalars['DateTime']
    periodStart?: Scalars['DateTime']
    periodUnit: Scalars['String']
    remainingValue?: Scalars['BigInt']
    resourceType: UsageResourceType
    spenderId?: Scalars['String']
    spenderLabel?: Scalars['String']
    spenderType: Scalars['String']
    unit: UsageUnit
    __typename: 'UsageQuotaWithConsumption'
}

export type UsageResourceType = 'AI' | 'API' | 'APP' | 'EMAIL' | 'LOGIC_FUNCTION' | 'RECORD' | 'STORAGE' | 'WEBHOOK' | 'WORKFLOW'

export interface UsageTimeSeries {
    creditsUsed: Scalars['Float']
    date: Scalars['String']
    __typename: 'UsageTimeSeries'
}

export type UsageUnit = 'BYTE' | 'COMPLEXITY' | 'CREDIT' | 'FILE' | 'INVOCATION' | 'MILLISECOND' | 'MINUTE' | 'RECORD' | 'REQUEST' | 'SEAT' | 'TOKEN'

export interface UsageUserDaily {
    dailyUsage: UsageTimeSeries[]
    userWorkspaceId: Scalars['String']
    __typename: 'UsageUserDaily'
}

export interface User {
    availableWorkspaces: AvailableWorkspaces
    canAccessFullAdminPanel: Scalars['Boolean']
    canImpersonate: Scalars['Boolean']
    createdAt: Scalars['DateTime']
    currentUserWorkspace?: UserWorkspace
    currentWorkspace?: Workspace
    deletedAt?: Scalars['DateTime']
    deletedWorkspaceMembers?: DeletedWorkspaceMember[]
    disabled?: Scalars['Boolean']
    email: Scalars['String']
    firstName: Scalars['String']
    hasPassword: Scalars['Boolean']
    id: Scalars['UUID']
    isEmailVerified: Scalars['Boolean']
    isWorkspaceCreator?: Scalars['Boolean']
    lastName: Scalars['String']
    locale: Scalars['String']
    onboardingStatus?: OnboardingStatus
    previousOnboardingStatus?: OnboardingStatus
    supportUserHash?: Scalars['String']
    updatedAt: Scalars['DateTime']
    userVars?: Scalars['JSONObject']
    userWorkspaces: UserWorkspace[]
    workspaceMember?: WorkspaceMember
    workspaceMembers?: WorkspaceMember[]
    workspaces: UserWorkspace[]
    __typename: 'User'
}

export interface UserApplicationVariableValue {
    description: Scalars['String']
    isDeprecated: Scalars['Boolean']
    isRequired: Scalars['Boolean']
    isSecret: Scalars['Boolean']
    key: Scalars['String']
    label: Scalars['String']
    options?: Scalars['JSON']
    type: Scalars['String']
    value: Scalars['String']
    __typename: 'UserApplicationVariableValue'
}

export interface UserSession {
    authProvider: Scalars['String']
    createdAt: Scalars['DateTime']
    expiresAt: Scalars['DateTime']
    id: Scalars['UUID']
    ipAddress?: Scalars['String']
    isCurrent: Scalars['Boolean']
    isImpersonating: Scalars['Boolean']
    lastActiveAt: Scalars['DateTime']
    userAgent?: Scalars['String']
    workspaceId?: Scalars['UUID']
    __typename: 'UserSession'
}

export interface UserWorkspace {
    createdAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    id: Scalars['UUID']
    isImpersonating?: Scalars['Boolean']
    locale: Scalars['String']
    objectPermissions?: ObjectPermission[]
    objectsPermissions?: ObjectPermission[]
    permissionFlags?: PermissionFlagType[]
    twoFactorAuthenticationMethodSummary?: TwoFactorAuthenticationMethodSummary[]
    updatedAt: Scalars['DateTime']
    user: User
    userId: Scalars['UUID']
    __typename: 'UserWorkspace'
}

export interface ValidatePasswordResetToken {
    email: Scalars['String']
    hasPassword: Scalars['Boolean']
    id: Scalars['UUID']
    __typename: 'ValidatePasswordResetToken'
}

export interface ValidationRule {
    description?: Scalars['String']
    errorFieldMetadataId?: Scalars['UUID']
    expression: Scalars['String']
    icon?: Scalars['String']
    id: Scalars['UUID']
    isActive: Scalars['Boolean']
    message: Scalars['String']
    name: Scalars['String']
    objectMetadataId: Scalars['UUID']
    __typename: 'ValidationRule'
}

export interface VerificationRecord {
    key: Scalars['String']
    priority?: Scalars['Float']
    status?: Scalars['String']
    type: Scalars['String']
    value: Scalars['String']
    __typename: 'VerificationRecord'
}

export interface VerifyEmailAndGetLoginToken {
    loginToken: AuthToken
    workspaceUrls: WorkspaceUrls
    __typename: 'VerifyEmailAndGetLoginToken'
}

export interface VerifyTwoFactorAuthenticationMethod {
    success: Scalars['Boolean']
    __typename: 'VerifyTwoFactorAuthenticationMethod'
}

export interface VersionDistributionEntry {
    count: Scalars['Int']
    version: Scalars['String']
    __typename: 'VersionDistributionEntry'
}

export interface View {
    anyFieldFilterValue?: Scalars['String']
    applicationId: Scalars['UUID']
    calendarEndFieldMetadataId?: Scalars['UUID']
    calendarFieldMetadataId?: Scalars['UUID']
    calendarLayout?: ViewCalendarLayout
    createdAt: Scalars['DateTime']
    createdByUserWorkspaceId?: Scalars['UUID']
    deletedAt?: Scalars['DateTime']
    groupLoadLimit?: Scalars['Int']
    icon: Scalars['String']
    id: Scalars['UUID']
    isActive: Scalars['Boolean']
    isCompact: Scalars['Boolean']
    isCustom: Scalars['Boolean']
    isSystemSideEffect: Scalars['Boolean']
    kanbanAggregateOperation?: AggregateOperations
    kanbanAggregateOperationFieldMetadataId?: Scalars['UUID']
    kanbanColumnWidth?: Scalars['Int']
    key?: ViewKey
    mainGroupByFieldMetadataId?: Scalars['UUID']
    name: Scalars['String']
    objectMetadataId: Scalars['UUID']
    /** @deprecated Superseded by objectMetadata.openRecordIn and the workspace member preference; kept one release for API compatibility, no longer read by the frontend. */
    openRecordIn: ViewOpenRecordIn
    position: Scalars['Float']
    shouldHideEmptyGroups: Scalars['Boolean']
    type: ViewType
    universalIdentifier: Scalars['UUID']
    updatedAt: Scalars['DateTime']
    viewFieldGroups: ViewFieldGroup[]
    viewFields: ViewField[]
    viewFilterGroups: ViewFilterGroup[]
    viewFilters: ViewFilter[]
    viewGroups: ViewGroup[]
    viewSorts: ViewSort[]
    visibility: ViewVisibility
    workspaceId: Scalars['UUID']
    __typename: 'View'
}

export type ViewCalendarLayout = 'DAY' | 'MONTH' | 'WEEK'

export interface ViewConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'ViewConfiguration'
}

export interface ViewField {
    aggregateOperation?: AggregateOperations
    applicationId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    fieldMetadataId: Scalars['UUID']
    id: Scalars['UUID']
    isActive: Scalars['Boolean']
    /** @deprecated isOverridden is deprecated */
    isOverridden?: Scalars['Boolean']
    isSystemSideEffect: Scalars['Boolean']
    isVisible: Scalars['Boolean']
    position: Scalars['Float']
    size: Scalars['Float']
    universalIdentifier: Scalars['UUID']
    updatedAt: Scalars['DateTime']
    viewFieldGroupId?: Scalars['UUID']
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    __typename: 'ViewField'
}

export interface ViewFieldGroup {
    createdAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    id: Scalars['UUID']
    isActive: Scalars['Boolean']
    /** @deprecated isOverridden is deprecated */
    isOverridden: Scalars['Boolean']
    isVisible: Scalars['Boolean']
    name: Scalars['String']
    position: Scalars['Float']
    updatedAt: Scalars['DateTime']
    viewFields: ViewField[]
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    __typename: 'ViewFieldGroup'
}

export interface ViewFilter {
    createdAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    fieldMetadataId: Scalars['UUID']
    id: Scalars['UUID']
    operand: ViewFilterOperand
    positionInViewFilterGroup?: Scalars['Float']
    relationTargetFieldMetadataId?: Scalars['UUID']
    subFieldName?: Scalars['String']
    updatedAt: Scalars['DateTime']
    value: Scalars['JSON']
    viewFilterGroupId?: Scalars['UUID']
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    __typename: 'ViewFilter'
}

export interface ViewFilterGroup {
    createdAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    id: Scalars['UUID']
    logicalOperator: ViewFilterGroupLogicalOperator
    parentViewFilterGroupId?: Scalars['UUID']
    positionInViewFilterGroup?: Scalars['Float']
    updatedAt: Scalars['DateTime']
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    __typename: 'ViewFilterGroup'
}

export type ViewFilterGroupLogicalOperator = 'AND' | 'NOT' | 'OR'

export type ViewFilterOperand = 'CONTAINS' | 'DOES_NOT_CONTAIN' | 'GREATER_THAN_OR_EQUAL' | 'IS' | 'IS_AFTER' | 'IS_BEFORE' | 'IS_EMPTY' | 'IS_IN_FUTURE' | 'IS_IN_PAST' | 'IS_NOT' | 'IS_NOT_EMPTY' | 'IS_NOT_NULL' | 'IS_RELATIVE' | 'IS_TODAY' | 'LESS_THAN_OR_EQUAL' | 'VECTOR_SEARCH'

export interface ViewGroup {
    createdAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    fieldValue: Scalars['String']
    id: Scalars['UUID']
    isVisible: Scalars['Boolean']
    position: Scalars['Float']
    updatedAt: Scalars['DateTime']
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    __typename: 'ViewGroup'
}

export type ViewKey = 'INDEX'

export type ViewOpenRecordIn = 'RECORD_PAGE' | 'SIDE_PANEL'

export interface ViewSort {
    createdAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    direction: ViewSortDirection
    fieldMetadataId: Scalars['UUID']
    id: Scalars['UUID']
    subFieldName?: Scalars['String']
    updatedAt: Scalars['DateTime']
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    __typename: 'ViewSort'
}

export type ViewSortDirection = 'ASC' | 'DESC'

export type ViewType = 'CALENDAR' | 'CALENDAR_WIDGET' | 'FIELDS_WIDGET' | 'KANBAN' | 'KANBAN_WIDGET' | 'LIST' | 'LIST_WIDGET' | 'TABLE' | 'TABLE_WIDGET'

export type ViewVisibility = 'UNLISTED' | 'WORKSPACE'

export interface Webhook {
    applicationId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    description?: Scalars['String']
    id: Scalars['UUID']
    operations: Scalars['String'][]
    secret: Scalars['String']
    targetUrl: Scalars['String']
    updatedAt: Scalars['DateTime']
    __typename: 'Webhook'
}

export type WidgetConfiguration = (AggregateChartConfiguration | BarChartConfiguration | CalendarConfiguration | CallRecordingSummaryConfiguration | CallRecordingTranscriptConfiguration | ChatConfiguration | ChatThreadsConfiguration | EmailThreadConfiguration | EmailsConfiguration | FieldConfiguration | FieldRichTextConfiguration | FieldsConfiguration | FilesConfiguration | FormFieldConfiguration | FrontComponentConfiguration | IframeConfiguration | LineChartConfiguration | MessageCampaignBodyConfiguration | MessageCampaignDetailsConfiguration | NotesConfiguration | PieChartConfiguration | RecordTableConfiguration | StandaloneRichTextConfiguration | TasksConfiguration | TimelineConfiguration | ViewConfiguration | WorkflowConfiguration | WorkflowRunConfiguration | WorkflowVersionConfiguration) & { __isUnion?: true }

export type WidgetConfigurationType = 'AGGREGATE_CHART' | 'BAR_CHART' | 'CALENDAR' | 'CALL_RECORDING_SUMMARY' | 'CALL_RECORDING_TRANSCRIPT' | 'CHAT' | 'CHAT_THREADS' | 'EMAILS' | 'EMAIL_THREAD' | 'FIELD' | 'FIELDS' | 'FIELD_RICH_TEXT' | 'FILES' | 'FORM_FIELD' | 'FRONT_COMPONENT' | 'IFRAME' | 'LINE_CHART' | 'MESSAGE_CAMPAIGN_BODY' | 'MESSAGE_CAMPAIGN_DETAILS' | 'NOTES' | 'PIE_CHART' | 'RECORD_TABLE' | 'STANDALONE_RICH_TEXT' | 'TASKS' | 'TIMELINE' | 'VIEW' | 'WORKFLOW' | 'WORKFLOW_RUN' | 'WORKFLOW_VERSION'

export type WidgetType = 'CALENDAR' | 'CALL_RECORDING_SUMMARY' | 'CALL_RECORDING_TRANSCRIPT' | 'CHAT' | 'CHAT_THREADS' | 'EMAILS' | 'EMAIL_THREAD' | 'FIELD' | 'FIELDS' | 'FIELD_RICH_TEXT' | 'FILES' | 'FORM_FIELD' | 'FRONT_COMPONENT' | 'GRAPH' | 'IFRAME' | 'MESSAGE_CAMPAIGN_BODY' | 'MESSAGE_CAMPAIGN_DETAILS' | 'NOTES' | 'RECORD_TABLE' | 'STANDALONE_RICH_TEXT' | 'TASKS' | 'TIMELINE' | 'VIEW' | 'WORKFLOW' | 'WORKFLOW_RUN' | 'WORKFLOW_VERSION'

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

export interface Workspace {
    activationStatus: WorkspaceActivationStatus
    aiAdditionalInstructions?: Scalars['String']
    aiAgentModelTier: AiModelTier
    aiChatModelTier: AiModelTier
    aiEvaluationModelId?: Scalars['String']
    aiModelIdByTier: Scalars['JSON']
    allowImpersonation: Scalars['Boolean']
    allowedIframeOrigins?: Scalars['String'][]
    billingCustomer?: BillingCustomer
    billingEntitlements: BillingEntitlement[]
    billingSubscriptions: BillingSubscription[]
    createdAt: Scalars['DateTime']
    currentBillingSubscription?: BillingSubscription
    customDomain?: Scalars['String']
    databaseSchema?: Scalars['String']
    defaultRole?: Role
    deletedAt?: Scalars['DateTime']
    displayName?: Scalars['String']
    editableProfileFields?: Scalars['String'][]
    eventLogRetentionDays: Scalars['Float']
    featureFlags?: FeatureFlag[]
    hasValidEnterpriseValidityToken: Scalars['Boolean']
    hasValidSignedEnterpriseKey: Scalars['Boolean']
    id: Scalars['UUID']
    installedApplications: Application[]
    inviteHash?: Scalars['String']
    isAutoModelSelectionEnabled: Scalars['Boolean']
    isCampaignClickTrackingEnabled: Scalars['Boolean']
    isCampaignOpenTrackingEnabled: Scalars['Boolean']
    isCustomDomainEnabled: Scalars['Boolean']
    isGoogleAuthBypassEnabled: Scalars['Boolean']
    isGoogleAuthEnabled: Scalars['Boolean']
    isInternalMessagesImportEnabled: Scalars['Boolean']
    isMicrosoftAuthBypassEnabled: Scalars['Boolean']
    isMicrosoftAuthEnabled: Scalars['Boolean']
    isPasswordAuthBypassEnabled: Scalars['Boolean']
    isPasswordAuthEnabled: Scalars['Boolean']
    isPublicInviteLinkEnabled: Scalars['Boolean']
    isTwoFactorAuthenticationEnforced: Scalars['Boolean']
    logo?: Scalars['String']
    logoFileId?: Scalars['UUID']
    /** @deprecated No longer used for metadata cache invalidation, will be removed */
    metadataVersion: Scalars['Float']
    subdomain: Scalars['String']
    trashRetentionDays: Scalars['Float']
    updatedAt: Scalars['DateTime']
    viewFields?: ViewField[]
    viewFilterGroups?: ViewFilterGroup[]
    viewFilters?: ViewFilter[]
    viewGroups?: ViewGroup[]
    viewSorts?: ViewSort[]
    views?: View[]
    workspaceCustomApplication?: Application
    workspaceCustomApplicationId: Scalars['String']
    workspaceDiscoverability: WorkspaceDiscoverability
    workspaceMembersCount?: Scalars['Float']
    workspaceUrls: WorkspaceUrls
    __typename: 'Workspace'
}

export type WorkspaceActivationStatus = 'ACTIVE' | 'CREATED' | 'INACTIVE' | 'ONGOING_CREATION' | 'PENDING_CREATION' | 'SUSPENDED'

export interface WorkspaceAiStats {
    conversationsCount: Scalars['Int']
    skillsCount: Scalars['Int']
    toolsCount: Scalars['Int']
    __typename: 'WorkspaceAiStats'
}

export type WorkspaceCompanyEnrichmentOutcome = 'matched' | 'transientError' | 'unavailable'

export interface WorkspaceCompanyEnrichmentResult {
    enrichment?: Scalars['JSON']
    isBookCallOnboardingStepPending: Scalars['Boolean']
    outcome: WorkspaceCompanyEnrichmentOutcome
    personEnrichment?: Scalars['JSON']
    personOutcome: WorkspacePersonEnrichmentOutcome
    __typename: 'WorkspaceCompanyEnrichmentResult'
}

export interface WorkspaceCreationDefaultsDTO {
    displayName: Scalars['String']
    subdomain: Scalars['String']
    __typename: 'WorkspaceCreationDefaultsDTO'
}

export type WorkspaceDiscoverability = 'HIDDEN' | 'MEMBERS_AND_INVITEES' | 'PUBLIC'

export interface WorkspaceInvitation {
    email: Scalars['String']
    expiresAt: Scalars['DateTime']
    id: Scalars['UUID']
    roleId?: Scalars['UUID']
    __typename: 'WorkspaceInvitation'
}

export interface WorkspaceInviteHashValid {
    isValid: Scalars['Boolean']
    __typename: 'WorkspaceInviteHashValid'
}

export interface WorkspaceMember {
    avatarUrl?: Scalars['String']
    calendarStartDay?: Scalars['Int']
    colorScheme: Scalars['String']
    dateFormat?: WorkspaceMemberDateFormatEnum
    id: Scalars['UUID']
    locale?: Scalars['String']
    name: FullName
    numberFormat?: WorkspaceMemberNumberFormatEnum
    openRecordIn: OpenRecordIn
    roles?: Role[]
    timeFormat?: WorkspaceMemberTimeFormatEnum
    timeZone?: Scalars['String']
    uiScale: Scalars['String']
    userEmail: Scalars['String']
    userId: Scalars['UUID']
    userWorkspaceId?: Scalars['UUID']
    __typename: 'WorkspaceMember'
}

export interface WorkspaceMemberApplicationVariables {
    userWorkspaceId: Scalars['UUID']
    variables: UserApplicationVariableValue[]
    workspaceMemberId: Scalars['UUID']
    __typename: 'WorkspaceMemberApplicationVariables'
}


/** Date format as Month first, Day first, Year first or system as default */
export type WorkspaceMemberDateFormatEnum = 'DAY_FIRST' | 'MONTH_FIRST' | 'SYSTEM' | 'YEAR_FIRST'


/** Number format for displaying numbers */
export type WorkspaceMemberNumberFormatEnum = 'APOSTROPHE_AND_DOT' | 'COMMAS_AND_DOT' | 'DOTS_AND_COMMA' | 'SPACES_AND_COMMA' | 'SYSTEM'


/** Time time as Military, Standard or system as default */
export type WorkspaceMemberTimeFormatEnum = 'HOUR_12' | 'HOUR_24' | 'SYSTEM'

export interface WorkspaceMigration {
    actions: Scalars['JSON']
    applicationUniversalIdentifier: Scalars['String']
    __typename: 'WorkspaceMigration'
}

export interface WorkspaceNameAndId {
    displayName?: Scalars['String']
    id: Scalars['UUID']
    __typename: 'WorkspaceNameAndId'
}

export type WorkspacePersonEnrichmentOutcome = 'matched' | 'transientError' | 'unavailable'

export type WorkspaceSetupChatOutcome = 'ALREADY_STARTED' | 'STARTED' | 'UNAVAILABLE'

export interface WorkspaceUrls {
    customUrl?: Scalars['String']
    subdomainUrl: Scalars['String']
    __typename: 'WorkspaceUrls'
}

export interface WorkspaceUrlsAndId {
    id: Scalars['UUID']
    workspaceUrls: WorkspaceUrls
    __typename: 'WorkspaceUrlsAndId'
}

export interface ActivateWorkspaceInput {
/** Deprecated: the workspace name is set at creation (signUpInNewWorkspace) and this field is ignored during activation. Kept for backward compatibility. */
displayName?: (Scalars['String'] | null)}

export interface AddQuerySubscriptionInput {eventStreamId: Scalars['String'],operationSignature: Scalars['JSON'],queryId: Scalars['String']}

export interface AgentGenqlSelection{
    applicationId?: boolean | number
    createdAt?: boolean | number
    description?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    isCustom?: boolean | number
    isSystem?: boolean | number
    label?: boolean | number
    modelConfiguration?: boolean | number
    modelId?: boolean | number
    name?: boolean | number
    prompt?: boolean | number
    responseFormat?: boolean | number
    roleId?: boolean | number
    triggers?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatChannelGenqlSelection{
    color?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    name?: boolean | number
    visibility?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatChannelListItemGenqlSelection{
    canManage?: boolean | number
    color?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    isMember?: boolean | number
    memberCount?: boolean | number
    name?: boolean | number
    visibility?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatEventGenqlSelection{
    event?: boolean | number
    threadId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatInboxChannelSummaryGenqlSelection{
    channelId?: boolean | number
    hasUnreadOpen?: boolean | number
    openCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatInboxSummaryGenqlSelection{
    channels?: AgentChatInboxChannelSummaryGenqlSelection
    hasUnreadAssigned?: boolean | number
    hasUnreadMention?: boolean | number
    hasUnreadOpen?: boolean | number
    needsInputCount?: boolean | number
    openCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatInboxThreadIdsGenqlSelection{
    endCursor?: boolean | number
    hasNextPage?: boolean | number
    threadIds?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatInboxViewInput {assignment?: (AgentChatChannelAssignmentFilter | null),channelId?: (Scalars['UUID'] | null),channelStatus?: (AgentChatChannelThreadStatus | null),kind: AgentChatInboxViewKind}

export interface AgentChatThreadGenqlSelection{
    contextWindowTokens?: boolean | number
    conversationSize?: boolean | number
    createdAt?: boolean | number
    deletedAt?: boolean | number
    id?: boolean | number
    title?: boolean | number
    totalCacheReadTokens?: boolean | number
    totalInputCredits?: boolean | number
    totalInputTokens?: boolean | number
    totalOutputCredits?: boolean | number
    totalOutputTokens?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatThreadParticipantGenqlSelection{
    archivedAt?: boolean | number
    id?: boolean | number
    isSubscribed?: boolean | number
    lastMentionedAt?: boolean | number
    lastReadAt?: boolean | number
    snoozedUntil?: boolean | number
    threadId?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentIdInput {
/** The id of the agent. */
id: Scalars['UUID']}

export interface AgentMessageGenqlSelection{
    agentId?: boolean | number
    createdAt?: boolean | number
    id?: boolean | number
    parts?: AgentMessagePartGenqlSelection
    processedAt?: boolean | number
    role?: boolean | number
    senderUserWorkspaceId?: boolean | number
    status?: boolean | number
    threadId?: boolean | number
    turnId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentMessagePartGenqlSelection{
    createdAt?: boolean | number
    errorMessage?: boolean | number
    fileFilename?: boolean | number
    fileId?: boolean | number
    fileMediaType?: boolean | number
    fileUrl?: boolean | number
    id?: boolean | number
    messageId?: boolean | number
    orderIndex?: boolean | number
    providerExecuted?: boolean | number
    providerMetadata?: boolean | number
    reasoningContent?: boolean | number
    sourceDocumentFilename?: boolean | number
    sourceDocumentMediaType?: boolean | number
    sourceDocumentSourceId?: boolean | number
    sourceDocumentTitle?: boolean | number
    sourceUrlSourceId?: boolean | number
    sourceUrlTitle?: boolean | number
    sourceUrlUrl?: boolean | number
    state?: boolean | number
    textContent?: boolean | number
    toolCallId?: boolean | number
    toolInput?: boolean | number
    toolName?: boolean | number
    toolOutput?: boolean | number
    type?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentRunGenqlSelection{
    createdAt?: boolean | number
    creatorName?: boolean | number
    creatorSource?: boolean | number
    credits?: boolean | number
    endedAt?: boolean | number
    errorMessage?: boolean | number
    id?: boolean | number
    input?: boolean | number
    inputTokens?: boolean | number
    modelId?: boolean | number
    outputTokens?: boolean | number
    reply?: boolean | number
    startedAt?: boolean | number
    status?: boolean | number
    threadId?: boolean | number
    threadTitle?: boolean | number
    toolNames?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AggregateChartConfigurationGenqlSelection{
    aggregateFieldMetadataId?: boolean | number
    aggregateOperation?: boolean | number
    configurationType?: boolean | number
    description?: boolean | number
    displayDataLabel?: boolean | number
    filter?: boolean | number
    firstDayOfTheWeek?: boolean | number
    label?: boolean | number
    numberFormat?: boolean | number
    prefix?: boolean | number
    ratioAggregateConfig?: RatioAggregateConfigGenqlSelection
    suffix?: boolean | number
    timezone?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AiChatUsageGenqlSelection{
    consumedValue?: boolean | number
    kind?: boolean | number
    limitValue?: boolean | number
    periodEnd?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AiSystemPromptPreviewGenqlSelection{
    estimatedTokenCount?: boolean | number
    sections?: AiSystemPromptSectionGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AiSystemPromptSectionGenqlSelection{
    content?: boolean | number
    estimatedTokenCount?: boolean | number
    title?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AnalyticsGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApiConfigGenqlSelection{
    mutationMaximumAffectedRecords?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApiKeyGenqlSelection{
    createdAt?: boolean | number
    expiresAt?: boolean | number
    id?: boolean | number
    name?: boolean | number
    revokedAt?: boolean | number
    role?: RoleGenqlSelection
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApiKeyForRoleGenqlSelection{
    expiresAt?: boolean | number
    id?: boolean | number
    name?: boolean | number
    revokedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApiKeyTokenGenqlSelection{
    token?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AppConnectionGenqlSelection{
    accessToken?: boolean | number
    authFailedAt?: boolean | number
    authFailedReason?: boolean | number
    handle?: boolean | number
    id?: boolean | number
    name?: boolean | number
    providerName?: boolean | number
    scopes?: boolean | number
    userWorkspaceId?: boolean | number
    visibility?: boolean | number
    workspaceMemberId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AppKeyValueGenqlSelection{
    key?: boolean | number
    scope?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AppMessageInput {externalId: Scalars['String'],participants: AppMessageParticipantInput[],receivedAt: Scalars['DateTime'],subject?: (Scalars['String'] | null),text: Scalars['String'],threadExternalId: Scalars['String']}

export interface AppMessageParticipantInput {displayName?: (Scalars['String'] | null),handle: Scalars['String'],personId?: (Scalars['UUID'] | null),role: MessageParticipantRole,workspaceMemberId?: (Scalars['UUID'] | null)}

export interface ApplicationGenqlSelection{
    agents?: AgentGenqlSelection
    applicationRegistration?: ApplicationRegistrationSummaryGenqlSelection
    applicationRegistrationId?: boolean | number
    applicationVariables?: ApplicationVariableGenqlSelection
    autoUpgrade?: boolean | number
    availablePackages?: boolean | number
    canBeUninstalled?: boolean | number
    commandMenuItems?: CommandMenuItemGenqlSelection
    defaultLogicFunctionRole?: RoleGenqlSelection
    defaultRoleId?: boolean | number
    description?: boolean | number
    frontComponents?: FrontComponentGenqlSelection
    healthCheckLogicFunctionId?: boolean | number
    id?: boolean | number
    logicFunctions?: LogicFunctionGenqlSelection
    logoFileId?: boolean | number
    logoUrl?: boolean | number
    name?: boolean | number
    objects?: ObjectGenqlSelection
    packageJsonChecksum?: boolean | number
    packageJsonFileId?: boolean | number
    settingsCustomTabFrontComponentId?: boolean | number
    settingsMenuItems?: SettingsMenuItemGenqlSelection
    universalIdentifier?: boolean | number
    version?: boolean | number
    yarnLockChecksum?: boolean | number
    yarnLockFileId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationAuthorizationGenqlSelection{
    applicationId?: boolean | number
    applicationName?: boolean | number
    applicationUniversalIdentifier?: boolean | number
    createdAt?: boolean | number
    id?: boolean | number
    lastAuthorizedAt?: boolean | number
    lastUsedAt?: boolean | number
    scopes?: boolean | number
    workspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationCapabilityGrantGenqlSelection{
    grantedCapabilities?: boolean | number
    id?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationConnectedAccountDTOGenqlSelection{
    applicationId?: boolean | number
    archivedAt?: boolean | number
    authFailedAt?: boolean | number
    authFailedReason?: boolean | number
    connectionParameters?: PublicImapSmtpCaldavConnectionParametersGenqlSelection
    connectionProviderId?: boolean | number
    createdAt?: boolean | number
    handle?: boolean | number
    handleAliases?: boolean | number
    id?: boolean | number
    /** @deprecated Ownership no longer gates connection actions, every application admin manages a workspace-shared connection */
    isOwnedByCurrentUser?: boolean | number
    lastCredentialsRefreshedAt?: boolean | number
    lastSignedInAt?: boolean | number
    name?: boolean | number
    provider?: boolean | number
    scopes?: boolean | number
    updatedAt?: boolean | number
    userWorkspaceId?: boolean | number
    visibility?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationConnectionProviderGenqlSelection{
    applicationId?: boolean | number
    displayName?: boolean | number
    id?: boolean | number
    logoUrl?: boolean | number
    name?: boolean | number
    oauth?: ApplicationConnectionProviderOAuthConfigGenqlSelection
    type?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationConnectionProviderOAuthConfigGenqlSelection{
    isClientCredentialsConfigured?: boolean | number
    scopes?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationExportGenqlSelection{
    application?: ApplicationExportApplicationGenqlSelection
    coverage?: ApplicationExportCoverageEntryGenqlSelection
    files?: ApplicationExportFileGenqlSelection
    manifest?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationExportApplicationGenqlSelection{
    displayName?: boolean | number
    sourceType?: boolean | number
    universalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationExportCoverageEntryGenqlSelection{
    metadataName?: boolean | number
    reason?: boolean | number
    status?: boolean | number
    universalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationExportFileGenqlSelection{
    content?: boolean | number
    folder?: boolean | number
    path?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationFileCompletionErrorGenqlSelection{
    fileId?: boolean | number
    message?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationFileUploadErrorGenqlSelection{
    fileFolder?: boolean | number
    filePath?: boolean | number
    message?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationFileUploadRequestInput {fileFolder: FileFolder,filePath: Scalars['String'],size: Scalars['Int']}

export interface ApplicationFileUploadTargetGenqlSelection{
    contentType?: boolean | number
    expiresAt?: boolean | number
    fileFolder?: boolean | number
    fileId?: boolean | number
    filePath?: boolean | number
    uploadUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationHealthCheckActionGenqlSelection{
    label?: boolean | number
    location?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationHealthCheckResultGenqlSelection{
    action?: ApplicationHealthCheckActionGenqlSelection
    description?: boolean | number
    status?: boolean | number
    title?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationRegistrationGenqlSelection{
    createdAt?: boolean | number
    galleryImagesUrls?: boolean | number
    id?: boolean | number
    isConfigured?: boolean | number
    isListed?: boolean | number
    isPreInstalled?: boolean | number
    isVetted?: boolean | number
    latestAvailableVersion?: boolean | number
    logoUrl?: boolean | number
    name?: boolean | number
    oAuthClientId?: boolean | number
    oAuthRedirectUris?: boolean | number
    oAuthScopes?: boolean | number
    ownerWorkspaceId?: boolean | number
    sourcePackage?: boolean | number
    sourceType?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationRegistrationStatsGenqlSelection{
    activeInstalls?: boolean | number
    mostInstalledVersion?: boolean | number
    suspendedInstalls?: boolean | number
    versionDistribution?: VersionDistributionEntryGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationRegistrationSummaryGenqlSelection{
    id?: boolean | number
    latestAvailableVersion?: boolean | number
    logoUrl?: boolean | number
    sourceType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationRegistrationVariableGenqlSelection{
    createdAt?: boolean | number
    description?: boolean | number
    id?: boolean | number
    isDeprecated?: boolean | number
    isFilled?: boolean | number
    isRequired?: boolean | number
    isSecret?: boolean | number
    key?: boolean | number
    options?: boolean | number
    type?: boolean | number
    updatedAt?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationTokenPairGenqlSelection{
    applicationAccessToken?: AuthTokenGenqlSelection
    applicationRefreshToken?: AuthTokenGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationVariableGenqlSelection{
    description?: boolean | number
    id?: boolean | number
    isDeprecated?: boolean | number
    isRequired?: boolean | number
    isSecret?: boolean | number
    key?: boolean | number
    label?: boolean | number
    options?: boolean | number
    scope?: boolean | number
    type?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApprovedAccessDomainGenqlSelection{
    createdAt?: boolean | number
    domain?: boolean | number
    id?: boolean | number
    isValidated?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AuthBypassProvidersGenqlSelection{
    google?: boolean | number
    microsoft?: boolean | number
    password?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AuthProvidersGenqlSelection{
    google?: boolean | number
    magicLink?: boolean | number
    microsoft?: boolean | number
    password?: boolean | number
    sso?: SSOIdentityProviderGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AuthTokenGenqlSelection{
    expiresAt?: boolean | number
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

export interface AuthorizeAppGenqlSelection{
    redirectUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AutocompleteResultGenqlSelection{
    placeId?: boolean | number
    text?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AvailableWorkspaceGenqlSelection{
    displayName?: boolean | number
    id?: boolean | number
    inviteHash?: boolean | number
    loginToken?: boolean | number
    logo?: boolean | number
    personalInviteToken?: boolean | number
    sso?: SSOConnectionGenqlSelection
    workspaceUrls?: WorkspaceUrlsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AvailableWorkspacesGenqlSelection{
    availableWorkspacesForSignIn?: AvailableWorkspaceGenqlSelection
    availableWorkspacesForSignUp?: AvailableWorkspaceGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AvailableWorkspacesAndAccessTokensGenqlSelection{
    availableWorkspaces?: AvailableWorkspacesGenqlSelection
    tokens?: AuthTokenPairGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BarChartConfigurationGenqlSelection{
    aggregateFieldMetadataId?: boolean | number
    aggregateOperation?: boolean | number
    axisNameDisplay?: boolean | number
    color?: boolean | number
    configurationType?: boolean | number
    description?: boolean | number
    displayDataLabel?: boolean | number
    displayLegend?: boolean | number
    filter?: boolean | number
    firstDayOfTheWeek?: boolean | number
    groupMode?: boolean | number
    isCumulative?: boolean | number
    layout?: boolean | number
    numberFormat?: boolean | number
    omitNullValues?: boolean | number
    primaryAxisDateGranularity?: boolean | number
    primaryAxisGroupByFieldMetadataId?: boolean | number
    primaryAxisGroupBySubFieldName?: boolean | number
    primaryAxisManualSortOrder?: boolean | number
    primaryAxisOrderBy?: boolean | number
    rangeMax?: boolean | number
    rangeMin?: boolean | number
    secondaryAxisGroupByDateGranularity?: boolean | number
    secondaryAxisGroupByFieldMetadataId?: boolean | number
    secondaryAxisGroupBySubFieldName?: boolean | number
    secondaryAxisManualSortOrder?: boolean | number
    secondaryAxisOrderBy?: boolean | number
    splitMultiValueFields?: boolean | number
    timezone?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BarChartDataGenqlSelection{
    data?: boolean | number
    formattedToRawLookup?: boolean | number
    groupMode?: boolean | number
    hasTooManyGroups?: boolean | number
    indexBy?: boolean | number
    keys?: boolean | number
    layout?: boolean | number
    series?: BarChartSeriesGenqlSelection
    showDataLabels?: boolean | number
    showLegend?: boolean | number
    xAxisLabel?: boolean | number
    yAxisLabel?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BarChartDataInput {configuration: Scalars['JSON'],objectMetadataId: Scalars['UUID']}

export interface BarChartSeriesGenqlSelection{
    key?: boolean | number
    label?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingGenqlSelection{
    billingUrl?: boolean | number
    isBillingEnabled?: boolean | number
    stripePublishableKey?: boolean | number
    trialPeriods?: BillingTrialPeriodGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingCustomerGenqlSelection{
    hasPaymentMethod?: boolean | number
    id?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingEndTrialPeriodGenqlSelection{
    /** Billing portal URL for payment method update (returned when no payment method exists) */
    billingPortalUrl?: boolean | number
    /** All billing subscriptions */
    billingSubscriptions?: BillingSubscriptionGenqlSelection
    /** Updated current billing subscription */
    currentBillingSubscription?: BillingSubscriptionGenqlSelection
    /** Boolean that confirms if a payment method was found */
    hasPaymentMethod?: boolean | number
    /** Updated subscription status */
    status?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingEntitlementGenqlSelection{
    key?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingLicensedProductGenqlSelection{
    description?: boolean | number
    images?: boolean | number
    metadata?: BillingProductMetadataGenqlSelection
    name?: boolean | number
    prices?: BillingPriceLicensedGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingMeteredProductGenqlSelection{
    description?: boolean | number
    images?: boolean | number
    metadata?: BillingProductMetadataGenqlSelection
    name?: boolean | number
    prices?: BillingPriceMeteredGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingPaymentIntentGenqlSelection{
    clientSecret?: boolean | number
    paymentIntentType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingPlanGenqlSelection{
    baseProducts?: BillingLicensedProductGenqlSelection
    meteredProducts?: BillingMeteredProductGenqlSelection
    planKey?: boolean | number
    resourceCreditProducts?: BillingLicensedProductGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingPriceLicensedGenqlSelection{
    creditAmount?: boolean | number
    isSellable?: boolean | number
    priceUsageType?: boolean | number
    recurringInterval?: boolean | number
    stripePriceId?: boolean | number
    unitAmount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingPriceMeteredGenqlSelection{
    priceUsageType?: boolean | number
    recurringInterval?: boolean | number
    stripePriceId?: boolean | number
    tiers?: BillingPriceTierGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingPriceTierGenqlSelection{
    flatAmount?: boolean | number
    unitAmount?: boolean | number
    upTo?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingProductGenqlSelection{
    description?: boolean | number
    images?: boolean | number
    metadata?: BillingProductMetadataGenqlSelection
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingProductDTOGenqlSelection{
    description?: boolean | number
    images?: boolean | number
    metadata?: BillingProductMetadataGenqlSelection
    name?: boolean | number
    on_BillingLicensedProduct?: BillingLicensedProductGenqlSelection
    on_BillingMeteredProduct?: BillingMeteredProductGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingProductMetadataGenqlSelection{
    isLegacy?: boolean | number
    planKey?: boolean | number
    priceUsageBased?: boolean | number
    productKey?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingResourceCreditUsageGenqlSelection{
    grantedCredits?: boolean | number
    periodEnd?: boolean | number
    periodStart?: boolean | number
    productKey?: boolean | number
    rolloverCredits?: boolean | number
    totalGrantedCredits?: boolean | number
    unitPriceCents?: boolean | number
    usedCredits?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingSessionGenqlSelection{
    url?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingSubscriptionGenqlSelection{
    billingSubscriptionItems?: BillingSubscriptionItemGenqlSelection
    cancelAt?: boolean | number
    currentPeriodEnd?: boolean | number
    id?: boolean | number
    interval?: boolean | number
    metadata?: boolean | number
    phases?: BillingSubscriptionSchedulePhaseGenqlSelection
    status?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingSubscriptionItemGenqlSelection{
    billingProduct?: BillingProductDTOGenqlSelection
    creditAmount?: boolean | number
    hasReachedCurrentPeriodCap?: boolean | number
    id?: boolean | number
    quantity?: boolean | number
    stripePriceId?: boolean | number
    unitAmount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingSubscriptionSchedulePhaseGenqlSelection{
    end_date?: boolean | number
    items?: BillingSubscriptionSchedulePhaseItemGenqlSelection
    start_date?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingSubscriptionSchedulePhaseItemGenqlSelection{
    price?: boolean | number
    quantity?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingTrialPeriodGenqlSelection{
    duration?: boolean | number
    isCreditCardRequired?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingUpdateGenqlSelection{
    /** All billing subscriptions */
    billingSubscriptions?: BillingSubscriptionGenqlSelection
    /** Current billing subscription */
    currentBillingSubscription?: BillingSubscriptionGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BooleanFieldComparison {is?: (Scalars['Boolean'] | null),isNot?: (Scalars['Boolean'] | null)}

export interface CalendarChannelGenqlSelection{
    connectedAccountId?: boolean | number
    contactAutoCreationPolicy?: boolean | number
    createdAt?: boolean | number
    handle?: boolean | number
    id?: boolean | number
    isContactAutoCreationEnabled?: boolean | number
    isSyncEnabled?: boolean | number
    syncStage?: boolean | number
    syncStageStartedAt?: boolean | number
    syncStatus?: boolean | number
    syncedAt?: boolean | number
    throttleFailureCount?: boolean | number
    updatedAt?: boolean | number
    visibility?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CalendarConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CallRecordingSummaryConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CallRecordingTranscriptConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CampaignAudiencePreviewDTOGenqlSelection{
    duplicateEmails?: boolean | number
    globallyUnsubscribed?: boolean | number
    hardSuppressed?: boolean | number
    sendable?: boolean | number
    topicUnsubscribed?: boolean | number
    totalMembers?: boolean | number
    trackingRefused?: boolean | number
    withoutEmail?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CancelMessageCampaignInput {campaignId: Scalars['String']}

export interface CancelMessageCampaignOutputDTOGenqlSelection{
    campaignId?: boolean | number
    canceledMessageCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CaptchaGenqlSelection{
    provider?: boolean | number
    siteKey?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ChannelSyncSuccessGenqlSelection{
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ChatConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ChatStreamCatchupChunksGenqlSelection{
    chunks?: boolean | number
    error?: ChatStreamErrorGenqlSelection
    maxSeq?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ChatStreamErrorGenqlSelection{
    code?: boolean | number
    message?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ChatThreadsConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CheckUserExistGenqlSelection{
    availableWorkspacesCount?: boolean | number
    exists?: boolean | number
    isEmailVerified?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ClaimableApplicationRegistrationGenqlSelection{
    author?: boolean | number
    description?: boolean | number
    id?: boolean | number
    isOwned?: boolean | number
    logoUrl?: boolean | number
    name?: boolean | number
    sourcePackage?: boolean | number
    universalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ClientAiEvaluationModelConfigGenqlSelection{
    description?: boolean | number
    inputCostPerMillionTokens?: boolean | number
    isAvailable?: boolean | number
    isDeprecated?: boolean | number
    label?: boolean | number
    maxCriteriaPerQuestion?: boolean | number
    maxScoreLevels?: boolean | number
    medianLatencyMs?: boolean | number
    modelId?: boolean | number
    outputCostPerMillionTokens?: boolean | number
    providerLabel?: boolean | number
    supportedQuestionTypes?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ClientAiModelConfigGenqlSelection{
    contextWindowTokens?: boolean | number
    costPerTask?: boolean | number
    dataResidency?: boolean | number
    effort?: boolean | number
    efforts?: boolean | number
    inputCostPerMillionTokens?: boolean | number
    intelligenceIndex?: boolean | number
    isBenchmarkInherited?: boolean | number
    isDeprecated?: boolean | number
    label?: boolean | number
    maxOutputTokens?: boolean | number
    modelFamily?: boolean | number
    modelFamilyLabel?: boolean | number
    modelId?: boolean | number
    nativeCapabilities?: NativeModelCapabilitiesGenqlSelection
    outputCostPerMillionTokens?: boolean | number
    outputTokensPerSecond?: boolean | number
    providerLabel?: boolean | number
    providerName?: boolean | number
    sdkPackage?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ClientAiModelTierConfigGenqlSelection{
    modelId?: boolean | number
    tier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ClientConfigGenqlSelection{
    aiEvaluationModels?: ClientAiEvaluationModelConfigGenqlSelection
    aiModelTiers?: ClientAiModelTierConfigGenqlSelection
    aiModels?: ClientAiModelConfigGenqlSelection
    allowRequestsToTwentyIcons?: boolean | number
    analyticsEnabled?: boolean | number
    api?: ApiConfigGenqlSelection
    appVersion?: boolean | number
    authProviders?: AuthProvidersGenqlSelection
    billing?: BillingGenqlSelection
    calendarBookingPageId?: boolean | number
    canManageFeatureFlags?: boolean | number
    captcha?: CaptchaGenqlSelection
    defaultSubdomain?: boolean | number
    enterpriseInstanceType?: boolean | number
    frontDomain?: boolean | number
    isAttachmentPreviewEnabled?: boolean | number
    isBookCallOnboardingStepEnabled?: boolean | number
    isClickHouseConfigured?: boolean | number
    isCloudflareIntegrationEnabled?: boolean | number
    isCompanyEnrichmentEnabled?: boolean | number
    isConfigVariablesInDbEnabled?: boolean | number
    isCookieSessionEnabled?: boolean | number
    isEmailVerificationRequired?: boolean | number
    isEmailingDomainInDemoMode?: boolean | number
    isGoogleCalendarEnabled?: boolean | number
    isGoogleMessagingEnabled?: boolean | number
    isImapSmtpCaldavEnabled?: boolean | number
    isMicrosoftCalendarEnabled?: boolean | number
    isMicrosoftMessagingEnabled?: boolean | number
    isMultiWorkspaceEnabled?: boolean | number
    isOnboardingAiChatEnabled?: boolean | number
    isWorkspaceSchemaDDLLocked?: boolean | number
    maintenance?: ClientConfigMaintenanceModeGenqlSelection
    publicFeatureFlags?: PublicFeatureFlagGenqlSelection
    publicFunctionDomain?: boolean | number
    sentry?: SentryGenqlSelection
    signInPrefilled?: boolean | number
    support?: SupportGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ClientConfigMaintenanceModeGenqlSelection{
    endAt?: boolean | number
    link?: boolean | number
    startAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CollectionHashGenqlSelection{
    collectionName?: boolean | number
    hash?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CommandMenuItemGenqlSelection{
    applicationId?: boolean | number
    availabilityObjectMetadataId?: boolean | number
    availabilityType?: boolean | number
    conditionalAvailabilityExpression?: boolean | number
    conditionalPinnedExpression?: boolean | number
    coreWorkflowVersionId?: boolean | number
    createdAt?: boolean | number
    engineComponentKey?: boolean | number
    frontComponent?: FrontComponentGenqlSelection
    frontComponentId?: boolean | number
    hotKeys?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    isActive?: boolean | number
    isPinned?: boolean | number
    label?: boolean | number
    navigationTargetObjectMetadataId?: boolean | number
    pageLayoutId?: boolean | number
    payload?: CommandMenuItemPayloadGenqlSelection
    position?: boolean | number
    shortLabel?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    workflowVersionId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CommandMenuItemPayloadGenqlSelection{
    on_ObjectMetadataCommandMenuItemPayload?:ObjectMetadataCommandMenuItemPayloadGenqlSelection,
    on_PathCommandMenuItemPayload?:PathCommandMenuItemPayloadGenqlSelection,
    __typename?: boolean | number
}

export interface CompleteApplicationFileUploadsResultGenqlSelection{
    errors?: ApplicationFileCompletionErrorGenqlSelection
    files?: FileGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ConnectedAccountPublicDTOGenqlSelection{
    applicationId?: boolean | number
    archivedAt?: boolean | number
    authFailedAt?: boolean | number
    authFailedReason?: boolean | number
    connectionParameters?: PublicImapSmtpCaldavConnectionParametersGenqlSelection
    connectionProviderId?: boolean | number
    createdAt?: boolean | number
    handle?: boolean | number
    handleAliases?: boolean | number
    id?: boolean | number
    lastCredentialsRefreshedAt?: boolean | number
    lastSignedInAt?: boolean | number
    name?: boolean | number
    provider?: boolean | number
    scopes?: boolean | number
    updatedAt?: boolean | number
    userWorkspaceId?: boolean | number
    visibility?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ConnectedImapSmtpCaldavAccountGenqlSelection{
    connectionParameters?: ImapSmtpCaldavPublicConnectionParametersGenqlSelection
    handle?: boolean | number
    id?: boolean | number
    provider?: boolean | number
    userWorkspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ConnectionParametersInput {connectionSecurity?: (EmailConnectionSecurity | null),host: Scalars['String'],password?: (Scalars['String'] | null),port: Scalars['Float'],username?: (Scalars['String'] | null)}

export interface CreateAgentChatChannelInput {color?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),memberIds: Scalars['UUID'][],name: Scalars['String'],visibility: AgentChatChannelVisibility}

export interface CreateAgentInput {description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),label: Scalars['String'],modelConfiguration?: (Scalars['JSON'] | null),modelId: Scalars['String'],name?: (Scalars['String'] | null),prompt: Scalars['String'],responseFormat?: (Scalars['JSON'] | null),roleId?: (Scalars['UUID'] | null),triggers?: (Scalars['JSON'][] | null)}

export interface CreateApiKeyInput {expiresAt: Scalars['String'],name: Scalars['String'],revokedAt?: (Scalars['String'] | null),roleId: Scalars['UUID']}

export interface CreateAppMessageChannelInput {connectedAccountId: Scalars['UUID'],displayName?: (Scalars['String'] | null),handle: Scalars['String'],visibility: MessageChannelVisibility}

export interface CreateApplicationFileUploadsResultGenqlSelection{
    errors?: ApplicationFileUploadErrorGenqlSelection
    targets?: ApplicationFileUploadTargetGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CreateApplicationRegistrationGenqlSelection{
    applicationRegistration?: ApplicationRegistrationGenqlSelection
    clientSecret?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CreateApplicationRegistrationInput {name: Scalars['String'],oAuthRedirectUris?: (Scalars['String'][] | null),oAuthScopes?: (Scalars['String'][] | null),universalIdentifier?: (Scalars['String'] | null)}

export interface CreateApprovedAccessDomainInput {domain: Scalars['String'],email: Scalars['String']}

export interface CreateCalendarEventInput {addConferencing?: (Scalars['Boolean'] | null),attendees?: (Scalars['String'] | null),connectedAccountId: Scalars['String'],description?: (Scalars['String'] | null),endsAt: Scalars['String'],isFullDay?: (Scalars['Boolean'] | null),location?: (Scalars['String'] | null),sendInvitations?: (Scalars['Boolean'] | null),startsAt: Scalars['String'],timeZone?: (Scalars['String'] | null),title: Scalars['String']}

export interface CreateCalendarEventOutputGenqlSelection{
    calendarEventId?: boolean | number
    conferenceLink?: boolean | number
    error?: boolean | number
    iCalUid?: boolean | number
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CreateCommandMenuItemInput {availabilityObjectMetadataId?: (Scalars['UUID'] | null),availabilityType?: (CommandMenuItemAvailabilityType | null),conditionalAvailabilityExpression?: (Scalars['String'] | null),conditionalPinnedExpression?: (Scalars['String'] | null),coreWorkflowVersionId?: (Scalars['UUID'] | null),engineComponentKey: EngineComponentKey,frontComponentId?: (Scalars['UUID'] | null),hotKeys?: (Scalars['String'][] | null),icon?: (Scalars['String'] | null),isPinned?: (Scalars['Boolean'] | null),label: Scalars['String'],navigationTargetObjectMetadataId?: (Scalars['UUID'] | null),pageLayoutId?: (Scalars['UUID'] | null),payload?: (Scalars['JSON'] | null),position?: (Scalars['Float'] | null),shortLabel?: (Scalars['String'] | null),workflowVersionId?: (Scalars['UUID'] | null)}

export interface CreateEmailGroupChannelInput {displayName?: (Scalars['String'] | null),handle: Scalars['String']}

export interface CreateEmailGroupChannelOutputGenqlSelection{
    forwardingAddress?: boolean | number
    messageChannel?: MessageChannelGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CreateEmailingDomainInput {domain: Scalars['String']}

export interface CreateFieldInput {defaultValue?: (Scalars['JSON'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),isActive?: (Scalars['Boolean'] | null),isAuditLogged?: (Scalars['Boolean'] | null),isLabelSyncedWithName?: (Scalars['Boolean'] | null),isNullable?: (Scalars['Boolean'] | null),isRemoteCreation?: (Scalars['Boolean'] | null),isSearchable?: (Scalars['Boolean'] | null),isSystem?: (Scalars['Boolean'] | null),isUIEditable?: (Scalars['Boolean'] | null),isUIReadOnly?: (Scalars['Boolean'] | null),isUnique?: (Scalars['Boolean'] | null),label: Scalars['String'],morphRelationsCreationPayload?: (Scalars['JSON'][] | null),name: Scalars['String'],objectMetadataId: Scalars['UUID'],options?: (Scalars['JSON'] | null),relationCreationPayload?: (Scalars['JSON'] | null),settings?: (Scalars['JSON'] | null),type: FieldMetadataType}

export interface CreateFrontComponentInput {builtComponentChecksum: Scalars['String'],builtComponentPath: Scalars['String'],componentName: Scalars['String'],description?: (Scalars['String'] | null),id?: (Scalars['UUID'] | null),name: Scalars['String'],sourceComponentPath: Scalars['String']}

export interface CreateIndexFieldInput {fieldMetadataId: Scalars['UUID'],subFieldName?: (Scalars['String'] | null)}

export interface CreateIndexInput {fields: CreateIndexFieldInput[],indexType: IndexType,objectMetadataId: Scalars['UUID']}

export interface CreateLogicFunctionFromSourceInput {cronTriggerSettings?: (Scalars['JSON'] | null),databaseEventTriggerSettings?: (Scalars['JSON'] | null),description?: (Scalars['String'] | null),httpRouteTriggerSettings?: (Scalars['JSON'] | null),id?: (Scalars['UUID'] | null),name: Scalars['String'],serverRouteTriggerSettings?: (Scalars['JSON'] | null),source?: (Scalars['JSON'] | null),timeoutSeconds?: (Scalars['Float'] | null),toolTriggerSettings?: (Scalars['JSON'] | null),universalIdentifier?: (Scalars['UUID'] | null),workflowActionTriggerSettings?: (Scalars['JSON'] | null)}

export interface CreateMessageSuppressionInput {emailAddress: Scalars['String'],unsubscribeTopicId?: (Scalars['UUID'] | null)}

export interface CreateNavigationMenuItemInput {color?: (Scalars['String'] | null),folderId?: (Scalars['UUID'] | null),icon?: (Scalars['String'] | null),id?: (Scalars['UUID'] | null),link?: (Scalars['String'] | null),name?: (Scalars['String'] | null),pageLayoutId?: (Scalars['UUID'] | null),position?: (Scalars['Float'] | null),targetObjectMetadataId?: (Scalars['UUID'] | null),targetRecordId?: (Scalars['UUID'] | null),type: NavigationMenuItemType,userWorkspaceId?: (Scalars['UUID'] | null),viewId?: (Scalars['UUID'] | null)}

export interface CreateObjectInput {color?: (Scalars['String'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),isLabelSyncedWithName?: (Scalars['Boolean'] | null),isRemote?: (Scalars['Boolean'] | null),labelPlural: Scalars['String'],labelSingular: Scalars['String'],namePlural: Scalars['String'],nameSingular: Scalars['String'],primaryKeyColumnType?: (Scalars['String'] | null),primaryKeyFieldMetadataSettings?: (Scalars['JSON'] | null),shortcut?: (Scalars['String'] | null),skipNameField?: (Scalars['Boolean'] | null)}

export interface CreateOneFieldMetadataInput {
/** The record to create */
field: CreateFieldInput}

export interface CreateOneIndexInput {
/** The custom index to create */
index: CreateIndexInput}

export interface CreateOneObjectInput {
/** The object to create */
object: CreateObjectInput}

export interface CreatePageLayoutInput {name: Scalars['String'],objectMetadataId?: (Scalars['UUID'] | null),type?: (PageLayoutType | null)}

export interface CreatePageLayoutTabInput {layoutMode?: (PageLayoutTabLayoutMode | null),pageLayoutId: Scalars['UUID'],position?: (Scalars['Float'] | null),title: Scalars['String']}

export interface CreatePageLayoutWidgetInput {configuration: Scalars['JSON'],objectMetadataId?: (Scalars['UUID'] | null),pageLayoutTabId: Scalars['UUID'],position?: (Scalars['JSON'] | null),title: Scalars['String'],type: WidgetType}

export interface CreateRecordExportInput {fieldMetadataIds: Scalars['UUID'][],filter?: (Scalars['JSON'] | null),objectMetadataId: Scalars['UUID'],orderBy?: (Scalars['JSON'] | null)}

export interface CreateRoleInput {canAccessAllTools?: (Scalars['Boolean'] | null),canBeAssignedToAgents?: (Scalars['Boolean'] | null),canBeAssignedToApiKeys?: (Scalars['Boolean'] | null),canBeAssignedToUsers?: (Scalars['Boolean'] | null),canDestroyAllObjectRecords?: (Scalars['Boolean'] | null),canReadAllObjectRecords?: (Scalars['Boolean'] | null),canSoftDeleteAllObjectRecords?: (Scalars['Boolean'] | null),canUpdateAllObjectRecords?: (Scalars['Boolean'] | null),canUpdateAllSettings?: (Scalars['Boolean'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),id?: (Scalars['String'] | null),label: Scalars['String']}

export interface CreateSkillInput {content: Scalars['String'],description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),id?: (Scalars['UUID'] | null),label: Scalars['String'],name: Scalars['String']}

export interface CreateUnsubscribeTopicInput {description?: (Scalars['String'] | null),name: Scalars['String'],visibility?: (UnsubscribeTopicVisibility | null)}

export interface CreateUsageLimitInput {burstValue?: (Scalars['BigInt'] | null),limitKind: Scalars['String'],limitValue: Scalars['BigInt'],operationType: UsageOperationType,periodCount: Scalars['Int'],periodUnit: Scalars['String'],resourceType: UsageResourceType,spenderId?: (Scalars['String'] | null),spenderType: Scalars['String'],unit: UsageUnit}

export interface CreateValidationRuleInput {description?: (Scalars['String'] | null),errorFieldMetadataId?: (Scalars['UUID'] | null),expression: Scalars['String'],icon?: (Scalars['String'] | null),isActive?: (Scalars['Boolean'] | null),message: Scalars['String'],name: Scalars['String'],objectMetadataId: Scalars['UUID']}

export interface CreateViewFieldGroupInput {id?: (Scalars['UUID'] | null),isVisible?: (Scalars['Boolean'] | null),name: Scalars['String'],position?: (Scalars['Float'] | null),viewId: Scalars['UUID']}

export interface CreateViewFieldInput {aggregateOperation?: (AggregateOperations | null),fieldMetadataId: Scalars['UUID'],id?: (Scalars['UUID'] | null),isVisible?: (Scalars['Boolean'] | null),position?: (Scalars['Float'] | null),size?: (Scalars['Float'] | null),viewFieldGroupId?: (Scalars['UUID'] | null),viewId: Scalars['UUID']}

export interface CreateViewFilterGroupInput {id?: (Scalars['UUID'] | null),logicalOperator?: (ViewFilterGroupLogicalOperator | null),parentViewFilterGroupId?: (Scalars['UUID'] | null),positionInViewFilterGroup?: (Scalars['Float'] | null),viewId: Scalars['UUID']}

export interface CreateViewFilterInput {fieldMetadataId: Scalars['UUID'],id?: (Scalars['UUID'] | null),operand?: (ViewFilterOperand | null),positionInViewFilterGroup?: (Scalars['Float'] | null),relationTargetFieldMetadataId?: (Scalars['UUID'] | null),subFieldName?: (Scalars['String'] | null),value: Scalars['JSON'],viewFilterGroupId?: (Scalars['UUID'] | null),viewId: Scalars['UUID']}

export interface CreateViewGroupInput {fieldValue: Scalars['String'],id?: (Scalars['UUID'] | null),isVisible?: (Scalars['Boolean'] | null),position?: (Scalars['Float'] | null),viewId: Scalars['UUID']}

export interface CreateViewInput {anyFieldFilterValue?: (Scalars['String'] | null),calendarEndFieldMetadataId?: (Scalars['UUID'] | null),calendarFieldMetadataId?: (Scalars['UUID'] | null),calendarLayout?: (ViewCalendarLayout | null),groupLoadLimit?: (Scalars['Int'] | null),icon: Scalars['String'],id?: (Scalars['UUID'] | null),isCompact?: (Scalars['Boolean'] | null),kanbanAggregateOperation?: (AggregateOperations | null),kanbanAggregateOperationFieldMetadataId?: (Scalars['UUID'] | null),kanbanColumnWidth?: (Scalars['Int'] | null),key?: (ViewKey | null),mainGroupByFieldMetadataId?: (Scalars['UUID'] | null),name: Scalars['String'],objectMetadataId: Scalars['UUID'],
/** Deprecated: Superseded by objectMetadata.openRecordIn and the workspace member preference; kept one release for API compatibility, no longer read by the frontend. */
openRecordIn?: (ViewOpenRecordIn | null),position?: (Scalars['Float'] | null),shouldHideEmptyGroups?: (Scalars['Boolean'] | null),type?: (ViewType | null),visibility?: (ViewVisibility | null)}

export interface CreateViewSortInput {direction?: (ViewSortDirection | null),fieldMetadataId: Scalars['UUID'],id?: (Scalars['UUID'] | null),subFieldName?: (Scalars['String'] | null),viewId: Scalars['UUID']}

export interface CreateWebhookInput {description?: (Scalars['String'] | null),id?: (Scalars['UUID'] | null),operations: Scalars['String'][],secret?: (Scalars['String'] | null),targetUrl: Scalars['String']}

export interface CursorPaging {
/** Paginate after opaque cursor */
after?: (Scalars['ConnectionCursor'] | null),
/** Paginate before opaque cursor */
before?: (Scalars['ConnectionCursor'] | null),
/** Paginate first */
first?: (Scalars['Int'] | null),
/** Paginate last */
last?: (Scalars['Int'] | null)}

export interface DeleteApprovedAccessDomainInput {id: Scalars['UUID']}

export interface DeleteOneFieldInput {
/** The id of the field to delete. */
id: Scalars['UUID']}

export interface DeleteOneIndexInput {
/** The id of the custom index to delete. */
id: Scalars['UUID']}

export interface DeleteOneObjectInput {
/** The id of the record to delete. */
id: Scalars['UUID']}

export interface DeleteSsoGenqlSelection{
    identityProviderId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DeleteSsoInput {identityProviderId: Scalars['UUID']}

export interface DeleteTwoFactorAuthenticationMethodGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DeleteViewFieldGroupInput {
/** The id of the view field group to delete. */
id: Scalars['UUID']}

export interface DeleteViewFieldInput {
/** The id of the view field to delete. */
id: Scalars['UUID']}

export interface DeleteViewFilterInput {
/** The id of the view filter to delete. */
id: Scalars['UUID']}

export interface DeleteViewGroupInput {
/** The id of the view group to delete. */
id: Scalars['UUID']}

export interface DeleteViewSortInput {
/** The id of the view sort to delete. */
id: Scalars['UUID']}

export interface DeletedWorkspaceMemberGenqlSelection{
    avatarUrl?: boolean | number
    id?: boolean | number
    name?: FullNameGenqlSelection
    userEmail?: boolean | number
    userWorkspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DestroyViewFieldGroupInput {
/** The id of the view field group to destroy. */
id: Scalars['UUID']}

export interface DestroyViewFieldInput {
/** The id of the view field to destroy. */
id: Scalars['UUID']}

export interface DestroyViewFilterInput {
/** The id of the view filter to destroy. */
id: Scalars['UUID']}

export interface DestroyViewGroupInput {
/** The id of the view group to destroy. */
id: Scalars['UUID']}

export interface DestroyViewSortInput {
/** The id of the view sort to destroy. */
id: Scalars['UUID']}

export interface DevelopmentApplicationGenqlSelection{
    id?: boolean | number
    universalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DomainRecordGenqlSelection{
    key?: boolean | number
    status?: boolean | number
    type?: boolean | number
    validationType?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DomainValidRecordsGenqlSelection{
    domain?: boolean | number
    id?: boolean | number
    isCustomDomainEnabled?: boolean | number
    records?: DomainRecordGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DuplicatedDashboardGenqlSelection{
    createdAt?: boolean | number
    id?: boolean | number
    pageLayoutId?: boolean | number
    position?: boolean | number
    title?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DuplicatedMessageListGenqlSelection{
    createdAt?: boolean | number
    description?: boolean | number
    id?: boolean | number
    memberCount?: boolean | number
    name?: boolean | number
    position?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EditSsoGenqlSelection{
    id?: boolean | number
    issuer?: boolean | number
    name?: boolean | number
    status?: boolean | number
    type?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EditSsoInput {id: Scalars['UUID'],status: SSOIdentityProviderStatus}

export interface EmailAccountConnectionParameters {CALDAV?: (ConnectionParametersInput | null),IMAP?: (ConnectionParametersInput | null),SMTP?: (ConnectionParametersInput | null),name?: (Scalars['String'] | null)}

export interface EmailPasswordResetLinkGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EmailThreadConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EmailingDomainGenqlSelection{
    createdAt?: boolean | number
    domain?: boolean | number
    id?: boolean | number
    status?: boolean | number
    tenantStatus?: boolean | number
    unsubscribeHostnameStatus?: boolean | number
    updatedAt?: boolean | number
    verificationRecords?: VerificationRecordGenqlSelection
    verifiedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EmailsConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EnqueueJobInput {delayMs?: (Scalars['Int'] | null),jobId?: (Scalars['String'] | null),logicFunctionUniversalIdentifier: Scalars['String'],payload?: (Scalars['JSON'] | null),retryLimit?: (Scalars['Int'] | null)}

export interface EnqueueJobItemInput {jobId?: (Scalars['String'] | null),payload?: (Scalars['JSON'] | null)}

export interface EnqueueJobResultGenqlSelection{
    enqueued?: boolean | number
    jobId?: boolean | number
    logicFunctionUniversalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EnqueueJobsInput {delayMs?: (Scalars['Int'] | null),jobs?: (EnqueueJobItemInput[] | null),logicFunctionUniversalIdentifier: Scalars['String'],payloads?: (Scalars['JSON'][] | null),retryLimit?: (Scalars['Int'] | null)}

export interface EnqueueJobsResultGenqlSelection{
    enqueued?: boolean | number
    enqueuedJobsCount?: boolean | number
    jobIds?: boolean | number
    logicFunctionUniversalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EnterpriseLicenseInfoDTOGenqlSelection{
    expiresAt?: boolean | number
    isValid?: boolean | number
    licensee?: boolean | number
    subscriptionId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EnterpriseSubscriptionStatusDTOGenqlSelection{
    cancelAt?: boolean | number
    currentPeriodEnd?: boolean | number
    expiresAt?: boolean | number
    isCancellationScheduled?: boolean | number
    licensee?: boolean | number
    status?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EventLogDateRangeInput {end?: (Scalars['DateTime'] | null),start?: (Scalars['DateTime'] | null)}

export interface EventLogFieldFilterInput {field: Scalars['String'],operand: EventLogFilterOperand,values: Scalars['String'][]}

export interface EventLogFiltersInput {dateRange?: (EventLogDateRangeInput | null),eventType?: (Scalars['String'] | null),fieldFilters?: (EventLogFieldFilterInput[] | null),objectMetadataId?: (Scalars['String'] | null),recordId?: (Scalars['String'] | null),userWorkspaceId?: (Scalars['String'] | null)}

export interface EventLogPageInfoGenqlSelection{
    endCursor?: boolean | number
    hasNextPage?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EventLogQueryInput {after?: (Scalars['String'] | null),filters?: (EventLogFiltersInput | null),first?: (Scalars['Int'] | null),table: EventLogTable}

export interface EventLogQueryResultGenqlSelection{
    pageInfo?: EventLogPageInfoGenqlSelection
    records?: EventLogRecordGenqlSelection
    totalCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EventLogRecordGenqlSelection{
    event?: boolean | number
    isCustom?: boolean | number
    objectMetadataId?: boolean | number
    properties?: boolean | number
    recordId?: boolean | number
    timestamp?: boolean | number
    userId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EventSubscriptionGenqlSelection{
    eventStreamId?: boolean | number
    metadataEvents?: MetadataEventGenqlSelection
    objectRecordEventsWithQueryIds?: ObjectRecordEventWithQueryIdsGenqlSelection
    queueJobEvents?: JobStatusGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ExecuteOneLogicFunctionInput {
/** Id of the logic function to execute */
id: Scalars['UUID'],
/** Payload in JSON format */
payload: Scalars['JSON']}

export interface FeatureFlagGenqlSelection{
    key?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FieldGenqlSelection{
    applicationId?: boolean | number
    createdAt?: boolean | number
    defaultValue?: boolean | number
    description?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    isActive?: boolean | number
    isAuditLogged?: boolean | number
    isLabelSyncedWithName?: boolean | number
    isNullable?: boolean | number
    isSearchable?: boolean | number
    isSystem?: boolean | number
    isUIEditable?: boolean | number
    /** @deprecated Use isUIEditable */
    isUIReadOnly?: boolean | number
    isUnique?: boolean | number
    label?: boolean | number
    morphId?: boolean | number
    morphRelations?: RelationGenqlSelection
    name?: boolean | number
    object?: ObjectGenqlSelection
    objectMetadataId?: boolean | number
    options?: boolean | number
    relation?: RelationGenqlSelection
    settings?: boolean | number
    type?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    writability?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FieldConfigurationGenqlSelection{
    configurationType?: boolean | number
    fieldDisplayMode?: boolean | number
    fieldMetadataId?: boolean | number
    isUIEditable?: boolean | number
    nestedRelationFieldMetadataId?: boolean | number
    viewId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FieldConnectionGenqlSelection{
    /** Array of edges. */
    edges?: FieldEdgeGenqlSelection
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FieldEdgeGenqlSelection{
    /** Cursor for this node. */
    cursor?: boolean | number
    /** The node containing the Field */
    node?: FieldGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FieldFilter {and?: (FieldFilter[] | null),id?: (UUIDFilterComparison | null),isActive?: (BooleanFieldComparison | null),isSystem?: (BooleanFieldComparison | null),isUIEditable?: (BooleanFieldComparison | null),isUIReadOnly?: (BooleanFieldComparison | null),objectMetadataId?: (UUIDFilterComparison | null),or?: (FieldFilter[] | null)}

export interface FieldPermissionGenqlSelection{
    canReadFieldValue?: boolean | number
    canUpdateFieldValue?: boolean | number
    fieldMetadataId?: boolean | number
    id?: boolean | number
    objectMetadataId?: boolean | number
    roleId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FieldPermissionInput {canReadFieldValue?: (Scalars['Boolean'] | null),canUpdateFieldValue?: (Scalars['Boolean'] | null),fieldMetadataId: Scalars['UUID'],objectMetadataId: Scalars['UUID']}

export interface FieldRichTextConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FieldsConfigurationGenqlSelection{
    configurationType?: boolean | number
    newFieldDefaultVisibility?: boolean | number
    shouldAllowUserToSeeHiddenFields?: boolean | number
    viewId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FileGenqlSelection{
    createdAt?: boolean | number
    id?: boolean | number
    path?: boolean | number
    size?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FileAttachmentInput {filename: Scalars['String'],id: Scalars['UUID']}

export interface FileUploadTargetGenqlSelection{
    contentType?: boolean | number
    expiresAt?: boolean | number
    fileId?: boolean | number
    uploadUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FileWithSignedUrlGenqlSelection{
    createdAt?: boolean | number
    id?: boolean | number
    path?: boolean | number
    size?: boolean | number
    url?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FilesConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FindAvailableSSOIDPGenqlSelection{
    id?: boolean | number
    issuer?: boolean | number
    name?: boolean | number
    status?: boolean | number
    type?: boolean | number
    workspace?: WorkspaceNameAndIdGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FindMessageSuppressionsInput {limit: Scalars['Int'],offset: Scalars['Int'],reason?: (MessageSuppressionReason | null),searchTerm?: (Scalars['String'] | null),unsubscribeTopicId?: (Scalars['UUID'] | null)}

export interface FormFieldConfigurationGenqlSelection{
    configurationType?: boolean | number
    fieldMetadataId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FrontComponentGenqlSelection{
    applicationGrantedCapabilities?: boolean | number
    applicationId?: boolean | number
    applicationName?: boolean | number
    /** @deprecated Use generateFrontComponentApplicationTokenPair */
    applicationTokenPair?: ApplicationTokenPairGenqlSelection
    applicationVariables?: boolean | number
    builtComponentChecksum?: boolean | number
    builtComponentPath?: boolean | number
    componentName?: boolean | number
    createdAt?: boolean | number
    description?: boolean | number
    frontComponentSharedDependenciesChecksum?: boolean | number
    id?: boolean | number
    isHeadless?: boolean | number
    name?: boolean | number
    sourceComponentPath?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    usesSdkClient?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FrontComponentConfigurationGenqlSelection{
    configurationType?: boolean | number
    frontComponentId?: boolean | number
    headerCommandMenuItemUniversalIdentifiers?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FullNameGenqlSelection{
    firstName?: boolean | number
    lastName?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface GetApiKeyInput {id: Scalars['UUID']}

export interface GetAuthorizationUrlForSSOGenqlSelection{
    authorizationURL?: boolean | number
    id?: boolean | number
    type?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface GetAuthorizationUrlForSSOInput {identityProviderId: Scalars['UUID'],workspaceInviteHash?: (Scalars['String'] | null)}

export interface GrantApplicationCapabilitiesInput {applicationId: Scalars['UUID'],capabilities: Scalars['String'][]}

export interface GridPositionGenqlSelection{
    column?: boolean | number
    columnSpan?: boolean | number
    row?: boolean | number
    rowSpan?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IframeConfigurationGenqlSelection{
    configurationType?: boolean | number
    url?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ImapSmtpCaldavConnectionSuccessGenqlSelection{
    connectedAccountId?: boolean | number
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ImapSmtpCaldavPublicConnectionParametersGenqlSelection{
    CALDAV?: ImapSmtpCaldavPublicConnectionParamsGenqlSelection
    IMAP?: ImapSmtpCaldavPublicConnectionParamsGenqlSelection
    SMTP?: ImapSmtpCaldavPublicConnectionParamsGenqlSelection
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ImapSmtpCaldavPublicConnectionParamsGenqlSelection{
    connectionSecurity?: boolean | number
    host?: boolean | number
    port?: boolean | number
    username?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ImpersonateGenqlSelection{
    loginToken?: AuthTokenGenqlSelection
    workspace?: WorkspaceUrlsAndIdGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IndexGenqlSelection{
    createdAt?: boolean | number
    id?: boolean | number
    indexFieldMetadataList?: IndexFieldGenqlSelection
    indexType?: boolean | number
    indexWhereClause?: boolean | number
    isCustom?: boolean | number
    isUnique?: boolean | number
    name?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IndexEdgeGenqlSelection{
    /** Cursor for this node. */
    cursor?: boolean | number
    /** The node containing the Index */
    node?: IndexGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IndexFieldGenqlSelection{
    createdAt?: boolean | number
    fieldMetadataId?: boolean | number
    id?: boolean | number
    order?: boolean | number
    subFieldName?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IndexFilter {and?: (IndexFilter[] | null),id?: (UUIDFilterComparison | null),isCustom?: (BooleanFieldComparison | null),or?: (IndexFilter[] | null)}

export interface IngestAppMessagesInput {messageChannelId: Scalars['UUID'],messages: AppMessageInput[]}

export interface IngestAppMessagesOutputGenqlSelection{
    messages?: IngestedAppMessageGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IngestedAppMessageGenqlSelection{
    externalId?: boolean | number
    messageId?: boolean | number
    messageThreadId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface InitiateTwoFactorAuthenticationProvisioningGenqlSelection{
    uri?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface InvalidatePasswordGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface InviteSuggestionGenqlSelection{
    displayName?: boolean | number
    email?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface JobStatusGenqlSelection{
    attemptsMade?: boolean | number
    enqueuedAt?: boolean | number
    failedReason?: boolean | number
    finishedAt?: boolean | number
    jobId?: boolean | number
    progress?: boolean | number
    startedAt?: boolean | number
    state?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LineChartConfigurationGenqlSelection{
    aggregateFieldMetadataId?: boolean | number
    aggregateOperation?: boolean | number
    axisNameDisplay?: boolean | number
    color?: boolean | number
    configurationType?: boolean | number
    description?: boolean | number
    displayDataLabel?: boolean | number
    displayLegend?: boolean | number
    filter?: boolean | number
    firstDayOfTheWeek?: boolean | number
    isCumulative?: boolean | number
    isStacked?: boolean | number
    numberFormat?: boolean | number
    omitNullValues?: boolean | number
    primaryAxisDateGranularity?: boolean | number
    primaryAxisGroupByFieldMetadataId?: boolean | number
    primaryAxisGroupBySubFieldName?: boolean | number
    primaryAxisManualSortOrder?: boolean | number
    primaryAxisOrderBy?: boolean | number
    rangeMax?: boolean | number
    rangeMin?: boolean | number
    secondaryAxisGroupByDateGranularity?: boolean | number
    secondaryAxisGroupByFieldMetadataId?: boolean | number
    secondaryAxisGroupBySubFieldName?: boolean | number
    secondaryAxisManualSortOrder?: boolean | number
    secondaryAxisOrderBy?: boolean | number
    splitMultiValueFields?: boolean | number
    timezone?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LineChartDataGenqlSelection{
    formattedToRawLookup?: boolean | number
    hasTooManyGroups?: boolean | number
    series?: LineChartSeriesGenqlSelection
    showDataLabels?: boolean | number
    showLegend?: boolean | number
    xAxisLabel?: boolean | number
    yAxisLabel?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LineChartDataInput {configuration: Scalars['JSON'],objectMetadataId: Scalars['UUID']}

export interface LineChartDataPointGenqlSelection{
    x?: boolean | number
    y?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LineChartSeriesGenqlSelection{
    data?: LineChartDataPointGenqlSelection
    key?: boolean | number
    label?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ListAppConnectionsInput {providerName?: (Scalars['String'] | null),userWorkspaceId?: (Scalars['String'] | null),visibility?: (Scalars['String'] | null)}

export interface ListAppMessageChannelsInput {connectedAccountId?: (Scalars['UUID'] | null)}

export interface LocationGenqlSelection{
    lat?: boolean | number
    lng?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LogicFunctionGenqlSelection{
    applicationId?: boolean | number
    canRunOnDemand?: boolean | number
    createdAt?: boolean | number
    cronTriggerSettings?: boolean | number
    databaseEventTriggerSettings?: boolean | number
    description?: boolean | number
    executionMode?: boolean | number
    handlerName?: boolean | number
    httpRouteTriggerSettings?: boolean | number
    id?: boolean | number
    name?: boolean | number
    runtime?: boolean | number
    sourceHandlerPath?: boolean | number
    timeoutSeconds?: boolean | number
    toolTriggerSettings?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    workflowActionTriggerSettings?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LogicFunctionExecutionResultGenqlSelection{
    /** Execution result in JSON format */
    data?: boolean | number
    /** Execution duration in milliseconds */
    duration?: boolean | number
    /** Execution error in JSON format */
    error?: boolean | number
    /** Execution Logs */
    logs?: boolean | number
    /** Execution status */
    status?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LogicFunctionIdInput {
/** The id of the function. */
id: Scalars['ID']}

export interface LogicFunctionLogsGenqlSelection{
    /** Execution Logs */
    logs?: boolean | number
    name?: boolean | number
    universalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LogicFunctionLogsInput {applicationId?: (Scalars['UUID'] | null),applicationUniversalIdentifier?: (Scalars['UUID'] | null),id?: (Scalars['UUID'] | null),name?: (Scalars['String'] | null),universalIdentifier?: (Scalars['UUID'] | null)}

export interface LoginTokenGenqlSelection{
    loginToken?: AuthTokenGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MarketplaceAppGenqlSelection{
    author?: boolean | number
    category?: boolean | number
    description?: boolean | number
    id?: boolean | number
    isVetted?: boolean | number
    logoUrl?: boolean | number
    name?: boolean | number
    sourcePackage?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MarketplaceAppDetailGenqlSelection{
    aboutDescription?: boolean | number
    author?: boolean | number
    category?: boolean | number
    defaultRoleUniversalIdentifier?: boolean | number
    description?: boolean | number
    emailSupport?: boolean | number
    galleryImages?: boolean | number
    id?: boolean | number
    installCount?: boolean | number
    isListed?: boolean | number
    isVetted?: boolean | number
    issueReportUrl?: boolean | number
    latestAvailableVersion?: boolean | number
    logoUrl?: boolean | number
    /** @deprecated Use the explicit MarketplaceAppDetail fields (description, author, roles, ...) instead */
    manifest?: boolean | number
    name?: boolean | number
    pricingDescription?: boolean | number
    requestedCapabilities?: boolean | number
    roles?: MarketplaceAppRoleGenqlSelection
    /** @deprecated Use galleryImages instead */
    screenshots?: boolean | number
    sourcePackage?: boolean | number
    sourceType?: boolean | number
    termsUrl?: boolean | number
    universalIdentifier?: boolean | number
    websiteUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MarketplaceAppRoleGenqlSelection{
    canAccessAllTools?: boolean | number
    canDestroyAllObjectRecords?: boolean | number
    canReadAllObjectRecords?: boolean | number
    canSoftDeleteAllObjectRecords?: boolean | number
    canUpdateAllObjectRecords?: boolean | number
    canUpdateAllSettings?: boolean | number
    description?: boolean | number
    fieldPermissions?: MarketplaceAppRoleFieldPermissionGenqlSelection
    icon?: boolean | number
    label?: boolean | number
    objectPermissions?: MarketplaceAppRoleObjectPermissionGenqlSelection
    permissionFlagUniversalIdentifiers?: boolean | number
    universalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MarketplaceAppRoleFieldPermissionGenqlSelection{
    canReadFieldValue?: boolean | number
    canUpdateFieldValue?: boolean | number
    fieldUniversalIdentifier?: boolean | number
    objectUniversalIdentifier?: boolean | number
    universalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MarketplaceAppRoleObjectPermissionGenqlSelection{
    canDestroyObjectRecords?: boolean | number
    canReadObjectRecords?: boolean | number
    canSoftDeleteObjectRecords?: boolean | number
    canUpdateObjectRecords?: boolean | number
    objectUniversalIdentifier?: boolean | number
    universalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MessageCampaignBodyConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MessageCampaignDetailsConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MessageChannelGenqlSelection{
    connectedAccount?: ConnectedAccountPublicDTOGenqlSelection
    connectedAccountId?: boolean | number
    contactAutoCreationPolicy?: boolean | number
    createdAt?: boolean | number
    displayName?: boolean | number
    excludeGroupEmails?: boolean | number
    excludeNonProfessionalEmails?: boolean | number
    handle?: boolean | number
    id?: boolean | number
    isContactAutoCreationEnabled?: boolean | number
    isSyncEnabled?: boolean | number
    messageFolderImportPolicy?: boolean | number
    pendingGroupEmailsAction?: boolean | number
    syncStage?: boolean | number
    syncStageStartedAt?: boolean | number
    syncStatus?: boolean | number
    syncedAt?: boolean | number
    throttleFailureCount?: boolean | number
    throttleRetryAfter?: boolean | number
    type?: boolean | number
    updatedAt?: boolean | number
    visibility?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MessageFolderGenqlSelection{
    createdAt?: boolean | number
    externalId?: boolean | number
    id?: boolean | number
    isSentFolder?: boolean | number
    isSynced?: boolean | number
    messageChannelId?: boolean | number
    name?: boolean | number
    parentFolderId?: boolean | number
    pendingSyncAction?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MessageSuppressionGenqlSelection{
    createdAt?: boolean | number
    emailAddress?: boolean | number
    id?: boolean | number
    reason?: boolean | number
    source?: boolean | number
    unsubscribeTopicId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MessageSuppressionListGenqlSelection{
    records?: MessageSuppressionGenqlSelection
    totalCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MetadataEventGenqlSelection{
    metadataName?: boolean | number
    properties?: ObjectRecordEventPropertiesGenqlSelection
    recordId?: boolean | number
    type?: boolean | number
    updatedCollectionHash?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MetadataTranslationGenqlSelection{
    canonicalValue?: boolean | number
    locale?: boolean | number
    metadataName?: boolean | number
    objectMetadataId?: boolean | number
    property?: boolean | number
    provenance?: boolean | number
    recordId?: boolean | number
    sourceValue?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MetadataTranslationOverrideInput {locale: Scalars['String'],property: Scalars['String'],value?: (Scalars['String'] | null)}

export interface MetadataTranslationsInput {fieldMetadataId?: (Scalars['UUID'] | null),locale?: (Scalars['String'] | null),objectMetadataId?: (Scalars['UUID'] | null)}

export interface MinimalMetadataGenqlSelection{
    collectionHashes?: CollectionHashGenqlSelection
    objectMetadataItems?: MinimalObjectMetadataGenqlSelection
    views?: MinimalViewGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MinimalObjectMetadataGenqlSelection{
    color?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    isActive?: boolean | number
    isRemote?: boolean | number
    isSystem?: boolean | number
    labelPlural?: boolean | number
    labelSingular?: boolean | number
    namePlural?: boolean | number
    nameSingular?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MinimalViewGenqlSelection{
    id?: boolean | number
    key?: boolean | number
    objectMetadataId?: boolean | number
    type?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MutationGenqlSelection{
    activateSkill?: (SkillGenqlSelection & { __args: {id: Scalars['UUID']} })
    activateWorkspace?: (WorkspaceGenqlSelection & { __args: {data: ActivateWorkspaceInput} })
    addAgentChatChannelMembers?: { __args: {channelId: Scalars['UUID'], workspaceMemberIds: Scalars['UUID'][]} }
    addAgentChatThreadParticipants?: { __args: {threadId: Scalars['UUID'], workspaceMemberIds: Scalars['UUID'][]} }
    addQueryToEventStream?: { __args: {input: AddQuerySubscriptionInput} }
    archiveAgentChatThread?: (AgentChatThreadParticipantGenqlSelection & { __args: {threadId: Scalars['UUID']} })
    assignAgentChatThread?: { __args: {assigneeWorkspaceMemberId?: (Scalars['UUID'] | null), threadId: Scalars['UUID']} }
    assignRoleToAgent?: { __args: {agentId: Scalars['UUID'], roleId: Scalars['UUID']} }
    assignRoleToApiKey?: { __args: {apiKeyId: Scalars['UUID'], roleId: Scalars['UUID']} }
    authorizeApp?: (AuthorizeAppGenqlSelection & { __args: {clientId: Scalars['String'], codeChallenge?: (Scalars['String'] | null), issuer?: (Scalars['String'] | null), redirectUrl: Scalars['String'], scope?: (Scalars['String'] | null), state?: (Scalars['String'] | null)} })
    cancelMessageCampaign?: (CancelMessageCampaignOutputDTOGenqlSelection & { __args: {input: CancelMessageCampaignInput} })
    cancelSwitchBillingInterval?: BillingUpdateGenqlSelection
    cancelSwitchBillingPlan?: BillingUpdateGenqlSelection
    cancelSwitchResourceCreditPrice?: BillingUpdateGenqlSelection
    checkCustomDomainValidRecords?: DomainValidRecordsGenqlSelection
    checkPublicDomainValidRecords?: (DomainValidRecordsGenqlSelection & { __args: {domain: Scalars['String']} })
    checkoutSession?: (BillingSessionGenqlSelection & { __args: {plan: BillingPlanKey, recurringInterval: SubscriptionInterval, requirePaymentMethod: Scalars['Boolean'], successUrlPath?: (Scalars['String'] | null)} })
    claimApplicationRegistrationOwnership?: (ApplicationRegistrationGenqlSelection & { __args: {applicationRegistrationId: Scalars['String']} })
    completeAppTarballUpload?: (ApplicationRegistrationGenqlSelection & { __args: {fileId: Scalars['UUID']} })
    completeApplicationFileUploads?: (CompleteApplicationFileUploadsResultGenqlSelection & { __args: {applicationUniversalIdentifier: Scalars['String'], fileIds: Scalars['UUID'][]} })
    completeBookCallOnboardingStep?: (OnboardingStepSuccessGenqlSelection & { __args: {hasBookedCall: Scalars['Boolean'], isAutoSkipped: Scalars['Boolean']} })
    completeFileUpload?: (FileWithSignedUrlGenqlSelection & { __args: {fileId: Scalars['String']} })
    completeNewWorkspaceLogoUpload?: (FileWithSignedUrlGenqlSelection & { __args: {fileId: Scalars['String'], workspaceId: Scalars['String']} })
    completeWorkspaceLogoUpload?: (FileWithSignedUrlGenqlSelection & { __args: {fileId: Scalars['String']} })
    completeWorkspaceMemberProfilePictureUpload?: (FileWithSignedUrlGenqlSelection & { __args: {fileId: Scalars['String']} })
    createAgentChatChannel?: (AgentChatChannelGenqlSelection & { __args: {input: CreateAgentChatChannelInput} })
    createApiKey?: (ApiKeyGenqlSelection & { __args: {input: CreateApiKeyInput} })
    createAppMessageChannel?: (MessageChannelGenqlSelection & { __args: {input: CreateAppMessageChannelInput} })
    createApplicationFileUploads?: (CreateApplicationFileUploadsResultGenqlSelection & { __args: {applicationUniversalIdentifier: Scalars['String'], files: ApplicationFileUploadRequestInput[]} })
    createApplicationRegistration?: (CreateApplicationRegistrationGenqlSelection & { __args: {input: CreateApplicationRegistrationInput} })
    createApprovedAccessDomain?: (ApprovedAccessDomainGenqlSelection & { __args: {input: CreateApprovedAccessDomainInput} })
    createBillingPaymentMethodSetupIntent?: BillingPaymentIntentGenqlSelection
    createCalendarEvent?: (CreateCalendarEventOutputGenqlSelection & { __args: {input: CreateCalendarEventInput} })
    createChatThread?: (AgentChatThreadGenqlSelection & { __args?: {channelId?: (Scalars['UUID'] | null)} })
    createCommandMenuItem?: (CommandMenuItemGenqlSelection & { __args: {input: CreateCommandMenuItemInput} })
    createDevelopmentApplication?: (DevelopmentApplicationGenqlSelection & { __args: {name: Scalars['String'], universalIdentifier: Scalars['String']} })
    createEmailGroupChannel?: (CreateEmailGroupChannelOutputGenqlSelection & { __args: {input: CreateEmailGroupChannelInput} })
    createEmailingDomain?: (EmailingDomainGenqlSelection & { __args: {input: CreateEmailingDomainInput} })
    createFileUpload?: (FileUploadTargetGenqlSelection & { __args: {fieldMetadataId?: (Scalars['String'] | null), fieldMetadataUniversalIdentifier?: (Scalars['String'] | null), fileFolder: FileFolder, filename: Scalars['String'], size: Scalars['Float']} })
    createFrontComponent?: (FrontComponentGenqlSelection & { __args: {input: CreateFrontComponentInput} })
    createManyNavigationMenuItems?: (NavigationMenuItemGenqlSelection & { __args: {inputs: CreateNavigationMenuItemInput[]} })
    createManyViewFieldGroups?: (ViewFieldGroupGenqlSelection & { __args: {inputs: CreateViewFieldGroupInput[]} })
    createManyViewFields?: (ViewFieldGenqlSelection & { __args: {inputs: CreateViewFieldInput[]} })
    createManyViewGroups?: (ViewGroupGenqlSelection & { __args: {inputs: CreateViewGroupInput[]} })
    createMessageSuppression?: (MessageSuppressionGenqlSelection & { __args: {input: CreateMessageSuppressionInput} })
    createNavigationMenuItem?: (NavigationMenuItemGenqlSelection & { __args: {input: CreateNavigationMenuItemInput} })
    createNewWorkspaceLogoUpload?: (FileUploadTargetGenqlSelection & { __args: {filename: Scalars['String'], size: Scalars['Float'], workspaceId: Scalars['String']} })
    createOIDCIdentityProvider?: (SetupSsoGenqlSelection & { __args: {input: SetupOIDCSsoInput} })
    createObjectEvent?: (AnalyticsGenqlSelection & { __args: {event: Scalars['String'], objectMetadataId: Scalars['UUID'], properties?: (Scalars['JSON'] | null), recordId: Scalars['UUID']} })
    createOneAgent?: (AgentGenqlSelection & { __args: {input: CreateAgentInput} })
    createOneField?: (FieldGenqlSelection & { __args: {input: CreateOneFieldMetadataInput} })
    createOneIndex?: (IndexGenqlSelection & { __args: {input: CreateOneIndexInput} })
    createOneLogicFunction?: (LogicFunctionGenqlSelection & { __args: {input: CreateLogicFunctionFromSourceInput} })
    createOneObject?: (ObjectGenqlSelection & { __args: {input: CreateOneObjectInput} })
    createOneRole?: (RoleGenqlSelection & { __args: {createRoleInput: CreateRoleInput} })
    createPageLayout?: (PageLayoutGenqlSelection & { __args: {input: CreatePageLayoutInput} })
    createPageLayoutTab?: (PageLayoutTabGenqlSelection & { __args: {input: CreatePageLayoutTabInput} })
    createPageLayoutWidget?: (PageLayoutWidgetGenqlSelection & { __args: {input: CreatePageLayoutWidgetInput} })
    createPublicDomain?: (PublicDomainGenqlSelection & { __args: {applicationId: Scalars['String'], domain: Scalars['String']} })
    createSAMLIdentityProvider?: (SetupSsoGenqlSelection & { __args: {input: SetupSAMLSsoInput} })
    createSkill?: (SkillGenqlSelection & { __args: {input: CreateSkillInput} })
    createSubscriptionPaymentIntent?: (BillingPaymentIntentGenqlSelection & { __args: {idempotencyKey: Scalars['String'], plan: BillingPlanKey, recurringInterval: SubscriptionInterval, requirePaymentMethod: Scalars['Boolean'], successUrlPath?: (Scalars['String'] | null)} })
    createUnsubscribeTopic?: (UnsubscribeTopicGenqlSelection & { __args: {input: CreateUnsubscribeTopicInput} })
    createUsageLimit?: (UsageLimitGenqlSelection & { __args: {input: CreateUsageLimitInput} })
    createValidationRule?: (ValidationRuleGenqlSelection & { __args: {input: CreateValidationRuleInput} })
    createView?: (ViewGenqlSelection & { __args: {input: CreateViewInput} })
    createViewField?: (ViewFieldGenqlSelection & { __args: {input: CreateViewFieldInput} })
    createViewFieldGroup?: (ViewFieldGroupGenqlSelection & { __args: {input: CreateViewFieldGroupInput} })
    createViewFilter?: (ViewFilterGenqlSelection & { __args: {input: CreateViewFilterInput} })
    createViewFilterGroup?: (ViewFilterGroupGenqlSelection & { __args: {input: CreateViewFilterGroupInput} })
    createViewGroup?: (ViewGroupGenqlSelection & { __args: {input: CreateViewGroupInput} })
    createViewSort?: (ViewSortGenqlSelection & { __args: {input: CreateViewSortInput} })
    createWebhook?: (WebhookGenqlSelection & { __args: {input: CreateWebhookInput} })
    deactivateSkill?: (SkillGenqlSelection & { __args: {id: Scalars['UUID']} })
    deleteAgentChatChannel?: { __args: {channelId: Scalars['UUID'], destinationChannelId?: (Scalars['UUID'] | null)} }
    deleteAppKeyValue?: { __args: {key: Scalars['String'], scope?: (AppKeyValueScope | null)} }
    deleteAppMessageChannel?: (MessageChannelGenqlSelection & { __args: {id: Scalars['UUID']} })
    deleteApplicationRegistration?: { __args: {id: Scalars['String']} }
    deleteApprovedAccessDomain?: { __args: {input: DeleteApprovedAccessDomainInput} }
    deleteCommandMenuItem?: (CommandMenuItemGenqlSelection & { __args: {id: Scalars['UUID']} })
    deleteConnectedAccount?: (ConnectedAccountPublicDTOGenqlSelection & { __args: {id: Scalars['UUID']} })
    deleteCurrentWorkspace?: WorkspaceGenqlSelection
    deleteEmailGroupChannel?: (MessageChannelGenqlSelection & { __args: {id: Scalars['UUID']} })
    deleteEmailingDomain?: { __args: {id: Scalars['String']} }
    deleteFrontComponent?: (FrontComponentGenqlSelection & { __args: {id: Scalars['UUID']} })
    deleteManyNavigationMenuItems?: (NavigationMenuItemGenqlSelection & { __args: {ids: Scalars['UUID'][]} })
    deleteMessageSuppression?: { __args: {id: Scalars['UUID']} }
    deleteNavigationMenuItem?: (NavigationMenuItemGenqlSelection & { __args: {id: Scalars['UUID']} })
    deleteOneAgent?: (AgentGenqlSelection & { __args: {input: AgentIdInput} })
    deleteOneField?: (FieldGenqlSelection & { __args: {input: DeleteOneFieldInput} })
    deleteOneIndex?: (IndexGenqlSelection & { __args: {input: DeleteOneIndexInput} })
    deleteOneLogicFunction?: (LogicFunctionGenqlSelection & { __args: {input: LogicFunctionIdInput} })
    deleteOneObject?: (ObjectGenqlSelection & { __args: {input: DeleteOneObjectInput} })
    deleteOneRole?: { __args: {roleId: Scalars['UUID']} }
    deletePublicDomain?: { __args: {domain: Scalars['String']} }
    deleteQueuedChatMessage?: { __args: {messageId: Scalars['UUID']} }
    deleteSSOIdentityProvider?: (DeleteSsoGenqlSelection & { __args: {input: DeleteSsoInput} })
    deleteSkill?: (SkillGenqlSelection & { __args: {id: Scalars['UUID']} })
    deleteTwoFactorAuthenticationMethod?: (DeleteTwoFactorAuthenticationMethodGenqlSelection & { __args: {twoFactorAuthenticationMethodId: Scalars['UUID']} })
    deleteUnsubscribeTopic?: { __args: {id: Scalars['String']} }
    deleteUsageLimit?: { __args: {usageLimitId: Scalars['UUID']} }
    deleteUser?: UserGenqlSelection
    deleteUserFromWorkspace?: (UserWorkspaceGenqlSelection & { __args: {workspaceMemberIdToDelete: Scalars['String']} })
    deleteValidationRule?: (ValidationRuleGenqlSelection & { __args: {id: Scalars['UUID']} })
    deleteView?: { __args: {id: Scalars['String']} }
    deleteViewField?: (ViewFieldGenqlSelection & { __args: {input: DeleteViewFieldInput} })
    deleteViewFieldGroup?: (ViewFieldGroupGenqlSelection & { __args: {input: DeleteViewFieldGroupInput} })
    deleteViewFilter?: (ViewFilterGenqlSelection & { __args: {input: DeleteViewFilterInput} })
    deleteViewFilterGroup?: { __args: {id: Scalars['String']} }
    deleteViewGroup?: (ViewGroupGenqlSelection & { __args: {input: DeleteViewGroupInput} })
    deleteViewSort?: { __args: {input: DeleteViewSortInput} }
    deleteWebhook?: (WebhookGenqlSelection & { __args: {id: Scalars['UUID']} })
    deleteWorkspaceInvitation?: { __args: {appTokenId: Scalars['String']} }
    destroyPageLayout?: { __args: {id: Scalars['String']} }
    destroyPageLayoutTab?: { __args: {id: Scalars['String']} }
    destroyPageLayoutWidget?: { __args: {id: Scalars['String']} }
    destroyView?: { __args: {id: Scalars['String']} }
    destroyViewField?: (ViewFieldGenqlSelection & { __args: {input: DestroyViewFieldInput} })
    destroyViewFieldGroup?: (ViewFieldGroupGenqlSelection & { __args: {input: DestroyViewFieldGroupInput} })
    destroyViewFilter?: (ViewFilterGenqlSelection & { __args: {input: DestroyViewFilterInput} })
    destroyViewFilterGroup?: { __args: {id: Scalars['String']} }
    destroyViewGroup?: (ViewGroupGenqlSelection & { __args: {input: DestroyViewGroupInput} })
    destroyViewSort?: { __args: {input: DestroyViewSortInput} }
    disconnectConnectedAccount?: (ConnectedAccountPublicDTOGenqlSelection & { __args: {id: Scalars['UUID']} })
    duplicateDashboard?: (DuplicatedDashboardGenqlSelection & { __args: {id: Scalars['UUID']} })
    duplicateMessageList?: (DuplicatedMessageListGenqlSelection & { __args: {id: Scalars['UUID']} })
    editSSOIdentityProvider?: (EditSsoGenqlSelection & { __args: {input: EditSsoInput} })
    emailPasswordResetLink?: (EmailPasswordResetLinkGenqlSelection & { __args: {captchaToken?: (Scalars['String'] | null), email: Scalars['String'], workspaceId?: (Scalars['UUID'] | null)} })
    endSubscriptionTrialPeriod?: BillingEndTrialPeriodGenqlSelection
    /** @deprecated Use enqueueJobs instead. */
    enqueueJob?: (EnqueueJobResultGenqlSelection & { __args: {input: EnqueueJobInput} })
    enqueueJobs?: (EnqueueJobsResultGenqlSelection & { __args: {input: EnqueueJobsInput} })
    enrichWorkspaceCompany?: WorkspaceCompanyEnrichmentResultGenqlSelection
    executeOneLogicFunction?: (LogicFunctionExecutionResultGenqlSelection & { __args: {input: ExecuteOneLogicFunctionInput} })
    generateApiKeyToken?: (ApiKeyTokenGenqlSelection & { __args: {apiKeyId: Scalars['UUID'], expiresAt: Scalars['String']} })
    generateFrontComponentApplicationTokenPair?: (ApplicationTokenPairGenqlSelection & { __args: {applicationId: Scalars['UUID']} })
    generatePlaygroundToken?: AuthTokenGenqlSelection
    generateTransientToken?: TransientTokenGenqlSelection
    generateTwoFactorAuthenticationRecoveryCode?: (TwoFactorAuthenticationRecoveryCodeGenqlSelection & { __args: {otp?: (Scalars['String'] | null), userId: Scalars['UUID']} })
    getAuthTokensFromLoginToken?: (AuthTokensGenqlSelection & { __args: {loginToken: Scalars['String'], origin: Scalars['String']} })
    getAuthTokensFromOTP?: (AuthTokensGenqlSelection & { __args: {captchaToken?: (Scalars['String'] | null), loginToken: Scalars['String'], origin: Scalars['String'], otp: Scalars['String']} })
    getAuthTokensFromSSOExchangeToken?: (AuthTokensGenqlSelection & { __args: {ssoExchangeToken: Scalars['String']} })
    getAuthTokensFromTwoFactorAuthenticationRecoveryCode?: (TwoFactorAuthenticationRecoveryCodeRedemptionGenqlSelection & { __args: {captchaToken?: (Scalars['String'] | null), loginToken: Scalars['String'], origin: Scalars['String'], recoveryCode: Scalars['String']} })
    getAuthorizationUrlForSSO?: (GetAuthorizationUrlForSSOGenqlSelection & { __args: {input: GetAuthorizationUrlForSSOInput} })
    getLoginTokenFromCredentials?: (LoginTokenGenqlSelection & { __args: {captchaToken?: (Scalars['String'] | null), email: Scalars['String'], locale?: (Scalars['String'] | null), origin: Scalars['String'], password: Scalars['String'], verifyEmailRedirectPath?: (Scalars['String'] | null)} })
    goBackToPreviousOnboardingStep?: OnboardingStepNavigationGenqlSelection
    grantApplicationCapabilities?: (ApplicationCapabilityGrantGenqlSelection & { __args: {input: GrantApplicationCapabilitiesInput} })
    impersonate?: (ImpersonateGenqlSelection & { __args: {userId: Scalars['UUID'], workspaceId: Scalars['UUID']} })
    ingestAppMessages?: (IngestAppMessagesOutputGenqlSelection & { __args: {input: IngestAppMessagesInput} })
    initiateOTPProvisioning?: (InitiateTwoFactorAuthenticationProvisioningGenqlSelection & { __args: {loginToken: Scalars['String'], origin: Scalars['String']} })
    initiateOTPProvisioningForAuthenticatedUser?: InitiateTwoFactorAuthenticationProvisioningGenqlSelection
    installApplication?: (ApplicationGenqlSelection & { __args: {universalIdentifier: Scalars['String'], version?: (Scalars['String'] | null)} })
    /** @deprecated Use installApplication instead */
    installMarketplaceApp?: { __args: {universalIdentifier: Scalars['String'], version?: (Scalars['String'] | null)} }
    joinAgentChatChannel?: { __args: {channelId: Scalars['UUID']} }
    leaveAgentChatChannel?: { __args: {channelId: Scalars['UUID']} }
    markAgentChatThreadAsDoneInChannel?: { __args: {threadId: Scalars['UUID']} }
    markAgentChatThreadAsRead?: (AgentChatThreadParticipantGenqlSelection & { __args: {threadId: Scalars['UUID']} })
    markAgentChatThreadAsUnread?: (AgentChatThreadParticipantGenqlSelection & { __args: {threadId: Scalars['UUID']} })
    moveAgentChatThreadToChannel?: { __args: {channelId?: (Scalars['UUID'] | null), threadId: Scalars['UUID']} }
    moveAgentChatThreadToInbox?: (AgentChatThreadParticipantGenqlSelection & { __args: {threadId: Scalars['UUID']} })
    refreshEnterpriseValidityToken?: boolean | number
    releaseEnterpriseServerBinding?: EnterpriseLicenseInfoDTOGenqlSelection
    removeAgentChatChannelMember?: { __args: {channelId: Scalars['UUID'], memberWorkspaceMemberId: Scalars['UUID']} }
    removeQueryFromEventStream?: { __args: {input: RemoveQueryFromEventStreamInput} }
    removeRecordShare?: (RecordSharingDTOGenqlSelection & { __args: {principal: RecordSharePrincipalInput, target: RecordTargetInput} })
    removeRoleFromAgent?: { __args: {agentId: Scalars['UUID']} }
    renewApplicationToken?: (ApplicationTokenPairGenqlSelection & { __args: {applicationRefreshToken: Scalars['String']} })
    renewToken?: (AuthTokensGenqlSelection & { __args: {appToken: Scalars['String']} })
    reopenAgentChatThreadInChannel?: { __args: {threadId: Scalars['UUID']} }
    reportAppConnectionAuthFailure?: { __args: {input: ReportAppConnectionAuthFailureInput} }
    resendEmailVerificationToken?: (ResendEmailVerificationTokenGenqlSelection & { __args: {email: Scalars['String'], origin: Scalars['String']} })
    resendWorkspaceInvitation?: (SendInvitationsGenqlSelection & { __args: {appTokenId: Scalars['String']} })
    resetCommandMenuItem?: (CommandMenuItemGenqlSelection & { __args: {id: Scalars['UUID']} })
    resetPageLayoutTabToDefault?: (PageLayoutTabGenqlSelection & { __args: {id: Scalars['String']} })
    resetPageLayoutToDefault?: (PageLayoutGenqlSelection & { __args: {id: Scalars['String']} })
    resetPageLayoutWidgetToDefault?: (PageLayoutWidgetGenqlSelection & { __args: {id: Scalars['String']} })
    resetTimelineActivityType?: (TimelineActivityTypeGenqlSelection & { __args: {id: Scalars['UUID']} })
    retryChatMessage?: (SendChatMessageResultGenqlSelection & { __args: {modelId?: (Scalars['String'] | null), threadId: Scalars['UUID']} })
    revokeAllOtherUserSessions?: boolean | number
    revokeApiKey?: (ApiKeyGenqlSelection & { __args: {input: RevokeApiKeyInput} })
    revokeApplicationAuthorization?: { __args: {applicationAuthorizationId: Scalars['UUID']} }
    revokeTwoFactorAuthenticationRecoveryCode?: { __args: {userId: Scalars['UUID']} }
    revokeUserSession?: { __args: {userSessionId: Scalars['UUID']} }
    rotateApplicationRegistrationClientSecret?: (RotateClientSecretGenqlSelection & { __args: {id: Scalars['String']} })
    runAgent?: (RunAgentResultGenqlSelection & { __args: {input: RunAgentInput} })
    runApplicationHealthCheck?: (ApplicationHealthCheckResultGenqlSelection & { __args: {applicationId: Scalars['UUID']} })
    saveImapSmtpCaldavAccount?: (ImapSmtpCaldavConnectionSuccessGenqlSelection & { __args: {connectionParameters: EmailAccountConnectionParameters, handle: Scalars['String'], id?: (Scalars['UUID'] | null)} })
    sendChatMessage?: (SendChatMessageResultGenqlSelection & { __args: {browsingContext?: (Scalars['JSON'] | null), fileAttachments?: (FileAttachmentInput[] | null), mentionedWorkspaceMemberIds?: (Scalars['UUID'][] | null), messageId: Scalars['UUID'], modelId?: (Scalars['String'] | null), text: Scalars['String'], threadId: Scalars['UUID']} })
    sendEmail?: (SendEmailOutputGenqlSelection & { __args: {input: SendEmailInput} })
    sendInboxMessage?: (SendInboxMessageResultGenqlSelection & { __args: {input: SendInboxMessageInput} })
    sendInvitations?: (SendInvitationsGenqlSelection & { __args: {emails: Scalars['String'][], roleId?: (Scalars['UUID'] | null)} })
    sendMessageCampaign?: (SendMessageCampaignOutputDTOGenqlSelection & { __args: {input: SendMessageCampaignInput} })
    sendMessageCampaignTest?: (SendEmailViaDomainOutputGenqlSelection & { __args: {input: SendMessageCampaignTestInput} })
    setAppKeyValue?: (AppKeyValueGenqlSelection & { __args: {input: SetAppKeyValueInput} })
    setEnterpriseKey?: (EnterpriseLicenseInfoDTOGenqlSelection & { __args: {enterpriseKey: Scalars['String']} })
    setRecordGeneralAccess?: (RecordSharingDTOGenqlSelection & { __args: {accessLevel: RecordShareAccessLevel, target: RecordTargetInput} })
    setRecordShare?: (RecordSharingDTOGenqlSelection & { __args: {accessLevel: RecordShareAccessLevel, principal: RecordSharePrincipalInput, target: RecordTargetInput} })
    setResourceCreditSubscriptionPrice?: (BillingUpdateGenqlSelection & { __args: {priceId: Scalars['String']} })
    signIn?: (AvailableWorkspacesAndAccessTokensGenqlSelection & { __args: {captchaToken?: (Scalars['String'] | null), email: Scalars['String'], locale?: (Scalars['String'] | null), password: Scalars['String'], verifyEmailRedirectPath?: (Scalars['String'] | null)} })
    signOut?: { __args: {refreshToken?: (Scalars['String'] | null)} } | boolean | number
    signUp?: (AvailableWorkspacesAndAccessTokensGenqlSelection & { __args: {captchaToken?: (Scalars['String'] | null), email: Scalars['String'], locale?: (Scalars['String'] | null), password: Scalars['String'], verifyEmailRedirectPath?: (Scalars['String'] | null)} })
    signUpInNewWorkspace?: (SignUpGenqlSelection & { __args?: {input?: (SignUpInNewWorkspaceInput | null)} })
    signUpInWorkspace?: (SignUpGenqlSelection & { __args: {captchaToken?: (Scalars['String'] | null), email: Scalars['String'], locale?: (Scalars['String'] | null), password: Scalars['String'], verifyEmailRedirectPath?: (Scalars['String'] | null), workspaceId?: (Scalars['UUID'] | null), workspaceInviteHash?: (Scalars['String'] | null), workspacePersonalInviteToken?: (Scalars['String'] | null)} })
    skipSyncEmailOnboardingStep?: (OnboardingStepSuccessGenqlSelection & { __args: {isAutoSkipped: Scalars['Boolean']} })
    snoozeAgentChatThread?: (AgentChatThreadParticipantGenqlSelection & { __args: {snoozedUntil: Scalars['DateTime'], threadId: Scalars['UUID']} })
    snoozeAgentChatThreadInChannel?: { __args: {snoozedUntil: Scalars['DateTime'], threadId: Scalars['UUID']} }
    startChannelSync?: (ChannelSyncSuccessGenqlSelection & { __args: {connectedAccountId: Scalars['UUID']} })
    startWorkspaceSetupChat?: (StartWorkspaceSetupChatResultGenqlSelection & { __args?: {companyContext?: (Scalars['JSON'] | null), personContext?: (Scalars['JSON'] | null)} })
    stopAgentChatStream?: { __args: {threadId: Scalars['UUID']} }
    stopImpersonation?: StopImpersonationGenqlSelection
    subscribeToAgentChatThread?: (AgentChatThreadParticipantGenqlSelection & { __args: {threadId: Scalars['UUID']} })
    switchBillingPlan?: BillingUpdateGenqlSelection
    switchSubscriptionInterval?: BillingUpdateGenqlSelection
    syncApplication?: (WorkspaceMigrationGenqlSelection & { __args: {dryRun?: (Scalars['Boolean'] | null), inferDeletionFromMissingEntities?: (Scalars['Boolean'] | null), manifest: Scalars['JSON']} })
    syncMarketplaceCatalog?: boolean | number
    trackAnalytics?: (AnalyticsGenqlSelection & { __args: {event?: (Scalars['String'] | null), name?: (Scalars['String'] | null), properties?: (Scalars['JSON'] | null), type: AnalyticsType} })
    transferApplicationRegistrationOwnership?: (ApplicationRegistrationGenqlSelection & { __args: {applicationRegistrationId: Scalars['String'], targetWorkspaceSubdomain: Scalars['String']} })
    triggerInstallApplicationJob?: (TriggerInstallApplicationJobResultGenqlSelection & { __args: {input: TriggerInstallApplicationJobInput} })
    triggerUninstallApplicationJob?: (TriggerUninstallApplicationJobResultGenqlSelection & { __args: {input: TriggerUninstallApplicationJobInput} })
    uninstallApplication?: { __args: {universalIdentifier: Scalars['String']} }
    unsubscribeFromAgentChatThread?: (AgentChatThreadParticipantGenqlSelection & { __args: {threadId: Scalars['UUID']} })
    updateAgentChatChannel?: (AgentChatChannelGenqlSelection & { __args: {channelId: Scalars['UUID'], input: UpdateAgentChatChannelInput} })
    updateApiKey?: (ApiKeyGenqlSelection & { __args: {input: UpdateApiKeyInput} })
    updateAppMessageChannel?: (MessageChannelGenqlSelection & { __args: {input: UpdateAppMessageChannelInput} })
    updateApplication?: (ApplicationGenqlSelection & { __args: {id: Scalars['UUID'], input: UpdateApplicationInput} })
    updateApplicationRegistration?: (ApplicationRegistrationGenqlSelection & { __args: {input: UpdateApplicationRegistrationInput} })
    updateApplicationRegistrationVariable?: (ApplicationRegistrationVariableGenqlSelection & { __args: {input: UpdateApplicationRegistrationVariableInput} })
    updateCalendarChannel?: (CalendarChannelGenqlSelection & { __args: {input: UpdateCalendarChannelInput} })
    updateCommandMenuItem?: (CommandMenuItemGenqlSelection & { __args: {input: UpdateCommandMenuItemInput} })
    updateEmailGroupChannel?: (MessageChannelGenqlSelection & { __args: {input: UpdateEmailGroupChannelInput} })
    updateFrontComponent?: (FrontComponentGenqlSelection & { __args: {input: UpdateFrontComponentInput} })
    updateLabPublicFeatureFlag?: (FeatureFlagGenqlSelection & { __args: {input: UpdateLabPublicFeatureFlagInput} })
    updateManyNavigationMenuItems?: (NavigationMenuItemGenqlSelection & { __args: {inputs: UpdateOneNavigationMenuItemInput[]} })
    updateManyObjects?: (ObjectGenqlSelection & { __args: {inputs: UpdateOneObjectInput[]} })
    updateManyViewGroups?: (ViewGroupGenqlSelection & { __args: {inputs: UpdateViewGroupInput[]} })
    updateMessageChannel?: (MessageChannelGenqlSelection & { __args: {input: UpdateMessageChannelInput} })
    updateMessageFolder?: (MessageFolderGenqlSelection & { __args: {input: UpdateMessageFolderInput} })
    updateMessageFolders?: (MessageFolderGenqlSelection & { __args: {input: UpdateMessageFoldersInput} })
    updateMyUserApplicationVariable?: { __args: {applicationUniversalIdentifier: Scalars['String'], key: Scalars['String'], value: Scalars['String']} }
    updateNavigationMenuItem?: (NavigationMenuItemGenqlSelection & { __args: {input: UpdateOneNavigationMenuItemInput} })
    updateOneAgent?: (AgentGenqlSelection & { __args: {input: UpdateAgentInput} })
    updateOneApplicationVariable?: { __args: {applicationId?: (Scalars['UUID'] | null), key: Scalars['String'], value: Scalars['String']} }
    updateOneField?: (FieldGenqlSelection & { __args: {input: UpdateOneFieldMetadataInput} })
    updateOneLogicFunction?: { __args: {input: UpdateLogicFunctionFromSourceInput} }
    updateOneObject?: (ObjectGenqlSelection & { __args: {input: UpdateOneObjectInput} })
    updateOneRole?: (RoleGenqlSelection & { __args: {updateRoleInput: UpdateRoleInput} })
    updatePageLayout?: (PageLayoutGenqlSelection & { __args: {id: Scalars['String'], input: UpdatePageLayoutInput} })
    updatePageLayoutTab?: (PageLayoutTabGenqlSelection & { __args: {id: Scalars['String'], input: UpdatePageLayoutTabInput} })
    updatePageLayoutWidget?: (PageLayoutWidgetGenqlSelection & { __args: {id: Scalars['String'], input: UpdatePageLayoutWidgetInput} })
    updatePageLayoutWithTabsAndWidgets?: (PageLayoutGenqlSelection & { __args: {id: Scalars['String'], input: UpdatePageLayoutWithTabsInput} })
    updatePasswordViaResetToken?: (InvalidatePasswordGenqlSelection & { __args: {newPassword: Scalars['String'], passwordResetToken: Scalars['String']} })
    updateSkill?: (SkillGenqlSelection & { __args: {input: UpdateSkillInput} })
    updateTimelineActivityType?: (TimelineActivityTypeGenqlSelection & { __args: {input: UpdateTimelineActivityTypeInput} })
    updateUnsubscribeTopic?: (UnsubscribeTopicGenqlSelection & { __args: {input: UpdateUnsubscribeTopicInput} })
    updateUsageLimit?: (UsageLimitGenqlSelection & { __args: {input: UpdateUsageLimitInput} })
    updateUserEmail?: { __args: {newEmail: Scalars['String'], verifyEmailRedirectPath?: (Scalars['String'] | null)} }
    updateValidationRule?: (ValidationRuleGenqlSelection & { __args: {input: UpdateValidationRuleInput} })
    updateView?: (ViewGenqlSelection & { __args: {id: Scalars['String'], input: UpdateViewInput} })
    updateViewField?: (ViewFieldGenqlSelection & { __args: {input: UpdateViewFieldInput} })
    updateViewFieldGroup?: (ViewFieldGroupGenqlSelection & { __args: {input: UpdateViewFieldGroupInput} })
    updateViewFilter?: (ViewFilterGenqlSelection & { __args: {input: UpdateViewFilterInput} })
    updateViewFilterGroup?: (ViewFilterGroupGenqlSelection & { __args: {id: Scalars['String'], input: UpdateViewFilterGroupInput} })
    updateViewGroup?: (ViewGroupGenqlSelection & { __args: {input: UpdateViewGroupInput} })
    updateViewSort?: (ViewSortGenqlSelection & { __args: {input: UpdateViewSortInput} })
    updateWebhook?: (WebhookGenqlSelection & { __args: {input: UpdateWebhookInput} })
    updateWorkspace?: (WorkspaceGenqlSelection & { __args: {data: UpdateWorkspaceInput} })
    updateWorkspaceAllowedIframeOrigins?: (WorkspaceGenqlSelection & { __args: {data: UpdateWorkspaceAllowedIframeOriginsInput} })
    updateWorkspaceMemberRole?: (WorkspaceMemberGenqlSelection & { __args: {roleId: Scalars['UUID'], workspaceMemberId: Scalars['UUID']} })
    updateWorkspaceMemberSettings?: { __args: {input: UpdateWorkspaceMemberSettingsInput} }
    upgradeApplication?: { __args: {appRegistrationId: Scalars['String'], targetVersion: Scalars['String']} }
    /** @deprecated Use createFileUpload with the AppTarball folder and completeAppTarballUpload, which send the tarball straight to file storage. */
    uploadAppTarball?: (ApplicationRegistrationGenqlSelection & { __args: {file: Scalars['Upload'], universalIdentifier?: (Scalars['String'] | null)} })
    /** @deprecated Use createApplicationFileUploads and completeApplicationFileUploads, which send the files straight to file storage. */
    uploadApplicationFile?: (FileGenqlSelection & { __args: {applicationUniversalIdentifier: Scalars['String'], file: Scalars['Upload'], fileFolder: FileFolder, filePath: Scalars['String']} })
    /** @deprecated Use createFileUpload with the FilesField folder and the fieldMetadataUniversalIdentifier, then completeFileUpload, which send the file straight to file storage. */
    uploadFilesFieldFileByUniversalIdentifier?: (FileWithSignedUrlGenqlSelection & { __args: {fieldMetadataUniversalIdentifier: Scalars['String'], file: Scalars['Upload']} })
    /** @deprecated Use createNewWorkspaceLogoUpload and completeNewWorkspaceLogoUpload, which send the logo straight to file storage. */
    uploadNewWorkspaceLogo?: (FileWithSignedUrlGenqlSelection & { __args: {file: Scalars['Upload'], workspaceId: Scalars['String']} })
    /** @deprecated Use createFileUpload with the CorePicture folder and completeWorkspaceLogoUpload, which send the logo straight to file storage. */
    uploadWorkspaceLogo?: (FileWithSignedUrlGenqlSelection & { __args: {file: Scalars['Upload']} })
    /** @deprecated Use createFileUpload with the CorePicture folder and completeWorkspaceMemberProfilePictureUpload, which send the picture straight to file storage. */
    uploadWorkspaceMemberProfilePicture?: (FileWithSignedUrlGenqlSelection & { __args: {file: Scalars['Upload']} })
    upsertFieldPermissions?: (FieldPermissionGenqlSelection & { __args: {upsertFieldPermissionsInput: UpsertFieldPermissionsInput} })
    upsertFieldsWidget?: (ViewGenqlSelection & { __args: {input: UpsertFieldsWidgetInput} })
    upsertObjectPermissions?: (ObjectPermissionGenqlSelection & { __args: {upsertObjectPermissionsInput: UpsertObjectPermissionsInput} })
    upsertPermissionFlags?: (RolePermissionFlagGenqlSelection & { __args: {upsertPermissionFlagsInput: UpsertPermissionFlagsInput} })
    upsertRowLevelPermissionPredicates?: (UpsertRowLevelPermissionPredicatesResultGenqlSelection & { __args: {input: UpsertRowLevelPermissionPredicatesInput} })
    upsertViewWidget?: (ViewGenqlSelection & { __args: {input: UpsertViewWidgetInput} })
    validateApprovedAccessDomain?: (ApprovedAccessDomainGenqlSelection & { __args: {input: ValidateApprovedAccessDomainInput} })
    verifyEmailAndGetLoginToken?: (VerifyEmailAndGetLoginTokenGenqlSelection & { __args: {captchaToken?: (Scalars['String'] | null), email: Scalars['String'], emailVerificationToken: Scalars['String'], origin: Scalars['String']} })
    verifyEmailAndGetWorkspaceAgnosticToken?: (AvailableWorkspacesAndAccessTokensGenqlSelection & { __args: {captchaToken?: (Scalars['String'] | null), email: Scalars['String'], emailVerificationToken: Scalars['String']} })
    verifyEmailingDomain?: (EmailingDomainGenqlSelection & { __args: {id: Scalars['String']} })
    verifyTwoFactorAuthenticationMethodForAuthenticatedUser?: (VerifyTwoFactorAuthenticationMethodGenqlSelection & { __args: {otp: Scalars['String']} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface NativeModelCapabilitiesGenqlSelection{
    twitterSearch?: boolean | number
    webSearch?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface NavigationMenuItemGenqlSelection{
    applicationId?: boolean | number
    color?: boolean | number
    createdAt?: boolean | number
    folderId?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    link?: boolean | number
    name?: boolean | number
    pageLayoutId?: boolean | number
    position?: boolean | number
    targetObjectMetadataId?: boolean | number
    targetRecordId?: boolean | number
    targetRecordIdentifier?: RecordIdentifierGenqlSelection
    type?: boolean | number
    updatedAt?: boolean | number
    userWorkspaceId?: boolean | number
    viewId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface NotesConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectGenqlSelection{
    applicationId?: boolean | number
    color?: boolean | number
    createdAt?: boolean | number
    description?: boolean | number
    duplicateCriteria?: boolean | number
    fields?: (ObjectFieldsConnectionGenqlSelection & { __args: {
    /** Specify to filter the records returned. */
    filter: FieldFilter, 
    /** Limit or page results. */
    paging: CursorPaging} })
    fieldsList?: FieldGenqlSelection
    icon?: boolean | number
    id?: boolean | number
    imageIdentifierFieldMetadataId?: boolean | number
    indexMetadataList?: IndexGenqlSelection
    indexMetadatas?: (ObjectIndexMetadatasConnectionGenqlSelection & { __args: {
    /** Specify to filter the records returned. */
    filter: IndexFilter, 
    /** Limit or page results. */
    paging: CursorPaging} })
    isActive?: boolean | number
    isLabelSyncedWithName?: boolean | number
    isRemote?: boolean | number
    isSearchable?: boolean | number
    isSystem?: boolean | number
    isUICreatable?: boolean | number
    isUIEditable?: boolean | number
    /** @deprecated Use isUIEditable */
    isUIReadOnly?: boolean | number
    labelIdentifierFieldMetadataId?: boolean | number
    labelPlural?: boolean | number
    labelSingular?: boolean | number
    namePlural?: boolean | number
    nameSingular?: boolean | number
    openRecordIn?: boolean | number
    readability?: boolean | number
    readabilityParentFieldUniversalIdentifiers?: boolean | number
    searchFieldMetadataList?: SearchFieldGenqlSelection
    sharingReach?: boolean | number
    shortcut?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    writability?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectConnectionGenqlSelection{
    /** Array of edges. */
    edges?: ObjectEdgeGenqlSelection
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectEdgeGenqlSelection{
    /** Cursor for this node. */
    cursor?: boolean | number
    /** The node containing the Object */
    node?: ObjectGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectFieldsConnectionGenqlSelection{
    /** Array of edges. */
    edges?: FieldEdgeGenqlSelection
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectFilter {and?: (ObjectFilter[] | null),id?: (UUIDFilterComparison | null),isActive?: (BooleanFieldComparison | null),isRemote?: (BooleanFieldComparison | null),isSearchable?: (BooleanFieldComparison | null),isSystem?: (BooleanFieldComparison | null),isUICreatable?: (BooleanFieldComparison | null),isUIEditable?: (BooleanFieldComparison | null),isUIReadOnly?: (BooleanFieldComparison | null),or?: (ObjectFilter[] | null),universalIdentifier?: (UUIDFilterComparison | null)}

export interface ObjectIndexMetadatasConnectionGenqlSelection{
    /** Array of edges. */
    edges?: IndexEdgeGenqlSelection
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectMetadataCommandMenuItemPayloadGenqlSelection{
    /** @deprecated Never returned anymore: navigation targets moved to CommandMenuItem.navigationTargetObjectMetadataId. This variant only remains one release so frontends deployed after the server keep validating; it will be removed in the next release. */
    objectMetadataItemId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectPermissionGenqlSelection{
    canDestroyObjectRecords?: boolean | number
    canReadObjectRecords?: boolean | number
    canSoftDeleteObjectRecords?: boolean | number
    canUpdateObjectRecords?: boolean | number
    objectMetadataId?: boolean | number
    restrictedFields?: boolean | number
    rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroupGenqlSelection
    rowLevelPermissionPredicates?: RowLevelPermissionPredicateGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectPermissionInput {canDestroyObjectRecords?: (Scalars['Boolean'] | null),canReadObjectRecords?: (Scalars['Boolean'] | null),canSoftDeleteObjectRecords?: (Scalars['Boolean'] | null),canUpdateObjectRecords?: (Scalars['Boolean'] | null),objectMetadataId: Scalars['UUID']}

export interface ObjectRecordCountGenqlSelection{
    objectNamePlural?: boolean | number
    totalCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectRecordEventGenqlSelection{
    action?: boolean | number
    objectNameSingular?: boolean | number
    properties?: ObjectRecordEventPropertiesGenqlSelection
    recordId?: boolean | number
    userId?: boolean | number
    workspaceMemberId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectRecordEventPropertiesGenqlSelection{
    after?: boolean | number
    before?: boolean | number
    diff?: boolean | number
    updatedFields?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ObjectRecordEventWithQueryIdsGenqlSelection{
    objectRecordEvent?: ObjectRecordEventGenqlSelection
    queryIds?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface OnboardingStepNavigationGenqlSelection{
    /** Onboarding status the user landed on */
    onboardingStatus?: boolean | number
    /** Step the user can go back to from there, if any */
    previousOnboardingStatus?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface OnboardingStepSuccessGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageInfoGenqlSelection{
    /** The cursor of the last returned record. */
    endCursor?: boolean | number
    /** true if paging forward and there are more records. */
    hasNextPage?: boolean | number
    /** true if paging backwards and there are more records. */
    hasPreviousPage?: boolean | number
    /** The cursor of the first returned record. */
    startCursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageLayoutGenqlSelection{
    applicationId?: boolean | number
    createdAt?: boolean | number
    defaultTabToFocusOnMobileAndSidePanelId?: boolean | number
    deletedAt?: boolean | number
    id?: boolean | number
    isFirstTabPinned?: boolean | number
    isSystemSideEffect?: boolean | number
    name?: boolean | number
    objectMetadataId?: boolean | number
    tabs?: PageLayoutTabGenqlSelection
    type?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageLayoutTabGenqlSelection{
    applicationId?: boolean | number
    createdAt?: boolean | number
    deletedAt?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    isActive?: boolean | number
    /** @deprecated isOverridden is deprecated */
    isOverridden?: boolean | number
    isSystemSideEffect?: boolean | number
    layoutMode?: boolean | number
    pageLayoutId?: boolean | number
    position?: boolean | number
    title?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    widgets?: PageLayoutWidgetGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageLayoutWidgetGenqlSelection{
    applicationId?: boolean | number
    conditionalAvailabilityExpression?: boolean | number
    conditionalDisplay?: boolean | number
    configuration?: WidgetConfigurationGenqlSelection
    createdAt?: boolean | number
    deletedAt?: boolean | number
    /** @deprecated Use `position` instead. */
    gridPosition?: GridPositionGenqlSelection
    id?: boolean | number
    isActive?: boolean | number
    /** @deprecated isOverridden is deprecated */
    isOverridden?: boolean | number
    isSystemSideEffect?: boolean | number
    objectMetadataId?: boolean | number
    pageLayoutTabId?: boolean | number
    position?: PageLayoutWidgetPositionGenqlSelection
    title?: boolean | number
    type?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageLayoutWidgetCanvasPositionGenqlSelection{
    layoutMode?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageLayoutWidgetGridPositionGenqlSelection{
    column?: boolean | number
    columnSpan?: boolean | number
    layoutMode?: boolean | number
    row?: boolean | number
    rowSpan?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageLayoutWidgetPositionGenqlSelection{
    on_PageLayoutWidgetCanvasPosition?:PageLayoutWidgetCanvasPositionGenqlSelection,
    on_PageLayoutWidgetGridPosition?:PageLayoutWidgetGridPositionGenqlSelection,
    on_PageLayoutWidgetVerticalListPosition?:PageLayoutWidgetVerticalListPositionGenqlSelection,
    __typename?: boolean | number
}

export interface PageLayoutWidgetVerticalListPositionGenqlSelection{
    heightBehavior?: boolean | number
    index?: boolean | number
    layoutMode?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PathCommandMenuItemPayloadGenqlSelection{
    path?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PermissionFlagGenqlSelection{
    applicationId?: boolean | number
    createdAt?: boolean | number
    description?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    key?: boolean | number
    label?: boolean | number
    permissionType?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PieChartConfigurationGenqlSelection{
    aggregateFieldMetadataId?: boolean | number
    aggregateOperation?: boolean | number
    color?: boolean | number
    configurationType?: boolean | number
    dateGranularity?: boolean | number
    description?: boolean | number
    displayDataLabel?: boolean | number
    displayLegend?: boolean | number
    filter?: boolean | number
    firstDayOfTheWeek?: boolean | number
    groupByFieldMetadataId?: boolean | number
    groupBySubFieldName?: boolean | number
    hideEmptyCategory?: boolean | number
    manualSortOrder?: boolean | number
    numberFormat?: boolean | number
    orderBy?: boolean | number
    showCenterMetric?: boolean | number
    splitMultiValueFields?: boolean | number
    timezone?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PieChartDataGenqlSelection{
    data?: PieChartDataItemGenqlSelection
    formattedToRawLookup?: boolean | number
    hasTooManyGroups?: boolean | number
    showCenterMetric?: boolean | number
    showDataLabels?: boolean | number
    showLegend?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PieChartDataInput {configuration: Scalars['JSON'],objectMetadataId: Scalars['UUID']}

export interface PieChartDataItemGenqlSelection{
    key?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PlaceDetailsResultGenqlSelection{
    city?: boolean | number
    country?: boolean | number
    location?: LocationGenqlSelection
    postcode?: boolean | number
    state?: boolean | number
    street?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PreviewMessageCampaignAudienceInput {listId: Scalars['String'],unsubscribeTopicId?: (Scalars['String'] | null)}

export interface PublicApplicationRegistrationGenqlSelection{
    id?: boolean | number
    logoUrl?: boolean | number
    name?: boolean | number
    oAuthScopes?: boolean | number
    websiteUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PublicConnectionParametersOutputGenqlSelection{
    connectionSecurity?: boolean | number
    host?: boolean | number
    port?: boolean | number
    username?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PublicDomainGenqlSelection{
    applicationId?: boolean | number
    createdAt?: boolean | number
    domain?: boolean | number
    id?: boolean | number
    isValidated?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PublicFeatureFlagGenqlSelection{
    key?: boolean | number
    metadata?: PublicFeatureFlagMetadataGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PublicFeatureFlagMetadataGenqlSelection{
    description?: boolean | number
    icon?: boolean | number
    imagePath?: boolean | number
    label?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PublicImapSmtpCaldavConnectionParametersGenqlSelection{
    CALDAV?: PublicConnectionParametersOutputGenqlSelection
    IMAP?: PublicConnectionParametersOutputGenqlSelection
    SMTP?: PublicConnectionParametersOutputGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PublicWorkspaceDataGenqlSelection{
    authBypassProviders?: AuthBypassProvidersGenqlSelection
    authProviders?: AuthProvidersGenqlSelection
    displayName?: boolean | number
    id?: boolean | number
    logo?: boolean | number
    workspaceUrls?: WorkspaceUrlsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PublicWorkspaceDataSummaryGenqlSelection{
    displayName?: boolean | number
    id?: boolean | number
    logo?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryGenqlSelection{
    agentChatChannels?: AgentChatChannelListItemGenqlSelection
    agentChatInboxSummary?: AgentChatInboxSummaryGenqlSelection
    agentChatInboxThreadIds?: (AgentChatInboxThreadIdsGenqlSelection & { __args: {after?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), view: AgentChatInboxViewInput} })
    agentRuns?: (AgentRunGenqlSelection & { __args: {agentId: Scalars['UUID'], limit: Scalars['Int']} })
    aiChatUsage?: AiChatUsageGenqlSelection
    apiKey?: (ApiKeyGenqlSelection & { __args: {input: GetApiKeyInput} })
    apiKeys?: ApiKeyGenqlSelection
    appConnection?: (AppConnectionGenqlSelection & { __args: {id: Scalars['ID']} })
    appConnections?: (AppConnectionGenqlSelection & { __args?: {filter?: (ListAppConnectionsInput | null)} })
    appKeyValue?: (AppKeyValueGenqlSelection & { __args: {key: Scalars['String'], scope?: (AppKeyValueScope | null)} })
    appMessageChannels?: (MessageChannelGenqlSelection & { __args?: {filter?: (ListAppMessageChannelsInput | null)} })
    applicationConnectedAccounts?: (ApplicationConnectedAccountDTOGenqlSelection & { __args: {applicationId: Scalars['UUID']} })
    applicationConnectionProviders?: (ApplicationConnectionProviderGenqlSelection & { __args: {applicationId: Scalars['UUID']} })
    applicationCoreGraphqlSchema?: { __args: {applicationUniversalIdentifier: Scalars['String']} }
    applicationRegistrationTarballUrl?: { __args: {id: Scalars['String']} }
    applicationSdkClientChecksums?: (SdkClientChecksumsGenqlSelection & { __args: {applicationId: Scalars['UUID']} })
    barChartData?: (BarChartDataGenqlSelection & { __args: {input: BarChartDataInput} })
    billingPortalSession?: (BillingSessionGenqlSelection & { __args?: {forPaymentMethodUpdate?: (Scalars['Boolean'] | null), returnUrlPath?: (Scalars['String'] | null)} })
    callRecordingIdForCalendarEvent?: { __args: {calendarEventId: Scalars['UUID']} }
    chatMessages?: (AgentMessageGenqlSelection & { __args: {threadId: Scalars['UUID']} })
    chatStreamCatchupChunks?: (ChatStreamCatchupChunksGenqlSelection & { __args: {threadId: Scalars['UUID']} })
    chatThread?: (AgentChatThreadGenqlSelection & { __args: {id: Scalars['UUID']} })
    checkUserExists?: (CheckUserExistGenqlSelection & { __args: {captchaToken?: (Scalars['String'] | null), email: Scalars['String']} })
    checkWorkspaceInviteHashIsValid?: (WorkspaceInviteHashValidGenqlSelection & { __args: {inviteHash: Scalars['String']} })
    checkWorkspaceSubdomainAvailability?: (SubdomainAvailabilityDTOGenqlSelection & { __args: {subdomain: Scalars['String']} })
    commandMenuItem?: (CommandMenuItemGenqlSelection & { __args: {id: Scalars['UUID']} })
    commandMenuItems?: CommandMenuItemGenqlSelection
    currentUser?: UserGenqlSelection
    currentUserApplicationAuthorizations?: ApplicationAuthorizationGenqlSelection
    currentUserSessions?: UserSessionGenqlSelection
    currentWorkspace?: WorkspaceGenqlSelection
    enterpriseCheckoutSession?: { __args: {billingInterval?: (Scalars['String'] | null)} } | boolean | number
    enterprisePortalSession?: { __args: {returnUrlPath?: (Scalars['String'] | null)} } | boolean | number
    enterpriseSubscriptionStatus?: EnterpriseSubscriptionStatusDTOGenqlSelection
    eventLogs?: (EventLogQueryResultGenqlSelection & { __args: {input: EventLogQueryInput} })
    exportApplication?: (ApplicationExportGenqlSelection & { __args: {universalIdentifier: Scalars['UUID']} })
    field?: (FieldGenqlSelection & { __args: {
    /** The id of the record to find. */
    id: Scalars['UUID']} })
    fields?: (FieldConnectionGenqlSelection & { __args: {
    /** Specify to filter the records returned. */
    filter: FieldFilter, 
    /** Limit or page results. */
    paging: CursorPaging} })
    findApplicationRegistrationByClientId?: (PublicApplicationRegistrationGenqlSelection & { __args: {clientId: Scalars['String']} })
    findApplicationRegistrationByUniversalIdentifier?: (ApplicationRegistrationGenqlSelection & { __args: {universalIdentifier: Scalars['String']} })
    findApplicationRegistrationStats?: (ApplicationRegistrationStatsGenqlSelection & { __args: {id: Scalars['String']} })
    findApplicationRegistrationVariables?: (ApplicationRegistrationVariableGenqlSelection & { __args: {applicationRegistrationId: Scalars['String']} })
    findClaimableApplicationRegistration?: (ClaimableApplicationRegistrationGenqlSelection & { __args?: {sourcePackage?: (Scalars['String'] | null), universalIdentifier?: (Scalars['String'] | null)} })
    findInstallApplicationJobStatus?: (JobStatusGenqlSelection & { __args: {universalIdentifier: Scalars['String']} })
    findManyAgents?: AgentGenqlSelection
    findManyApplicationRegistrations?: ApplicationRegistrationGenqlSelection
    findManyApplications?: ApplicationGenqlSelection
    findManyLogicFunctions?: LogicFunctionGenqlSelection
    findManyMarketplaceApps?: (MarketplaceAppGenqlSelection & { __args?: {universalIdentifiers?: (Scalars['String'][] | null)} })
    findManyPublicDomains?: PublicDomainGenqlSelection
    findMarketplaceAppDetail?: (MarketplaceAppDetailGenqlSelection & { __args: {universalIdentifier: Scalars['String']} })
    findOneAgent?: (AgentGenqlSelection & { __args: {input: AgentIdInput} })
    findOneApplication?: (ApplicationGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), universalIdentifier?: (Scalars['UUID'] | null)} })
    findOneApplicationRegistration?: (ApplicationRegistrationGenqlSelection & { __args: {id: Scalars['String']} })
    findOneLogicFunction?: (LogicFunctionGenqlSelection & { __args: {input: LogicFunctionIdInput} })
    findUninstallApplicationJobStatus?: (JobStatusGenqlSelection & { __args: {universalIdentifier: Scalars['String']} })
    findWorkspaceAiStats?: WorkspaceAiStatsGenqlSelection
    findWorkspaceFromInviteHash?: (WorkspaceGenqlSelection & { __args: {inviteHash: Scalars['String']} })
    findWorkspaceInvitations?: WorkspaceInvitationGenqlSelection
    frontComponent?: (FrontComponentGenqlSelection & { __args: {id: Scalars['UUID']} })
    frontComponents?: FrontComponentGenqlSelection
    getAddressDetails?: (PlaceDetailsResultGenqlSelection & { __args: {placeId: Scalars['String'], token: Scalars['String']} })
    getAiSystemPromptPreview?: AiSystemPromptPreviewGenqlSelection
    getApiKeyRoles?: RoleGenqlSelection
    getApprovedAccessDomains?: ApprovedAccessDomainGenqlSelection
    getAutoCompleteAddress?: (AutocompleteResultGenqlSelection & { __args: {address: Scalars['String'], country?: (Scalars['String'] | null), isFieldCity?: (Scalars['Boolean'] | null), token: Scalars['String']} })
    getAvailablePackages?: { __args: {input: LogicFunctionIdInput} }
    getConnectedImapSmtpCaldavAccount?: (ConnectedImapSmtpCaldavAccountGenqlSelection & { __args: {id: Scalars['UUID']} })
    getEmailingDomains?: EmailingDomainGenqlSelection
    getInviteSuggestions?: InviteSuggestionGenqlSelection
    getJobs?: (JobStatusGenqlSelection & { __args: {jobIds: Scalars['String'][]} })
    getLogicFunctionSourceCode?: { __args: {input: LogicFunctionIdInput} }
    getPageLayout?: (PageLayoutGenqlSelection & { __args: {id: Scalars['String']} })
    getPageLayoutTab?: (PageLayoutTabGenqlSelection & { __args: {id: Scalars['String']} })
    getPageLayoutTabs?: (PageLayoutTabGenqlSelection & { __args: {pageLayoutId: Scalars['String']} })
    getPageLayoutWidget?: (PageLayoutWidgetGenqlSelection & { __args: {id: Scalars['String']} })
    getPageLayoutWidgets?: (PageLayoutWidgetGenqlSelection & { __args: {pageLayoutTabId: Scalars['String']} })
    getPageLayouts?: (PageLayoutGenqlSelection & { __args?: {objectMetadataId?: (Scalars['String'] | null), pageLayoutType?: (PageLayoutType | null)} })
    getPermissionFlags?: PermissionFlagGenqlSelection
    getPublicWorkspaceDataByDomain?: (PublicWorkspaceDataGenqlSelection & { __args?: {origin?: (Scalars['String'] | null)} })
    getPublicWorkspaceDataById?: (PublicWorkspaceDataSummaryGenqlSelection & { __args: {id: Scalars['UUID']} })
    getResourceCreditUsage?: BillingResourceCreditUsageGenqlSelection
    getRole?: (RoleGenqlSelection & { __args: {id: Scalars['UUID']} })
    getRoles?: RoleGenqlSelection
    getSSOIdentityProviders?: FindAvailableSSOIDPGenqlSelection
    getToolIndex?: ToolIndexEntryGenqlSelection
    getToolInputSchema?: { __args: {toolName: Scalars['String']} }
    getUsageAnalytics?: (UsageAnalyticsGenqlSelection & { __args?: {input?: (UsageAnalyticsInput | null)} })
    getView?: (ViewGenqlSelection & { __args: {id: Scalars['String']} })
    getViewField?: (ViewFieldGenqlSelection & { __args: {id: Scalars['String']} })
    getViewFieldGroup?: (ViewFieldGroupGenqlSelection & { __args: {id: Scalars['String']} })
    getViewFieldGroups?: (ViewFieldGroupGenqlSelection & { __args: {viewId: Scalars['String']} })
    getViewFields?: (ViewFieldGenqlSelection & { __args: {viewId: Scalars['String']} })
    getViewFilter?: (ViewFilterGenqlSelection & { __args: {id: Scalars['String']} })
    getViewFilterGroup?: (ViewFilterGroupGenqlSelection & { __args: {id: Scalars['String']} })
    getViewFilterGroups?: (ViewFilterGroupGenqlSelection & { __args?: {viewId?: (Scalars['String'] | null)} })
    getViewFilters?: (ViewFilterGenqlSelection & { __args?: {viewId?: (Scalars['String'] | null)} })
    getViewGroup?: (ViewGroupGenqlSelection & { __args: {id: Scalars['String']} })
    getViewGroups?: (ViewGroupGenqlSelection & { __args?: {viewId?: (Scalars['String'] | null)} })
    getViewSort?: (ViewSortGenqlSelection & { __args: {id: Scalars['String']} })
    getViewSorts?: (ViewSortGenqlSelection & { __args?: {viewId?: (Scalars['String'] | null)} })
    getViews?: (ViewGenqlSelection & { __args?: {objectMetadataId?: (Scalars['String'] | null), viewTypes?: (ViewType[] | null)} })
    getWorkspaceCreationDefaults?: WorkspaceCreationDefaultsDTOGenqlSelection
    githubClaimAuthorizationUrl?: { __args: {applicationRegistrationId: Scalars['String']} }
    isApplicationStopped?: { __args: {applicationUniversalIdentifier: Scalars['String']} }
    lineChartData?: (LineChartDataGenqlSelection & { __args: {input: LineChartDataInput} })
    listPlans?: BillingPlanGenqlSelection
    messageSuppressions?: (MessageSuppressionListGenqlSelection & { __args: {input: FindMessageSuppressionsInput} })
    metadataTranslations?: (MetadataTranslationGenqlSelection & { __args: {input: MetadataTranslationsInput} })
    minimalMetadata?: MinimalMetadataGenqlSelection
    mostlyEmptyFieldMetadataIds?: { __args: {objectMetadataId: Scalars['UUID']} }
    myCalendarChannels?: (CalendarChannelGenqlSelection & { __args?: {connectedAccountId?: (Scalars['UUID'] | null)} })
    myConnectedAccounts?: ConnectedAccountPublicDTOGenqlSelection
    myMessageChannels?: (MessageChannelGenqlSelection & { __args?: {connectedAccountId?: (Scalars['UUID'] | null)} })
    myMessageFolders?: (MessageFolderGenqlSelection & { __args?: {messageChannelId?: (Scalars['UUID'] | null)} })
    myUserApplicationVariables?: WorkspaceMemberApplicationVariablesGenqlSelection
    navigationMenuItem?: (NavigationMenuItemGenqlSelection & { __args: {id: Scalars['UUID']} })
    navigationMenuItems?: NavigationMenuItemGenqlSelection
    object?: (ObjectGenqlSelection & { __args: {
    /** The id of the record to find. */
    id: Scalars['UUID']} })
    objectRecordCounts?: ObjectRecordCountGenqlSelection
    objects?: (ObjectConnectionGenqlSelection & { __args: {
    /** Specify to filter the records returned. */
    filter: ObjectFilter, 
    /** Limit or page results. */
    paging: CursorPaging} })
    pieChartData?: (PieChartDataGenqlSelection & { __args: {input: PieChartDataInput} })
    previewMessageCampaignAudience?: (CampaignAudiencePreviewDTOGenqlSelection & { __args: {input: PreviewMessageCampaignAudienceInput} })
    publicMarketplaceAppDetail?: (MarketplaceAppDetailGenqlSelection & { __args: {universalIdentifier: Scalars['String']} })
    publicMarketplaceApps?: (MarketplaceAppGenqlSelection & { __args: {isVetted: Scalars['Boolean']} })
    recordPermissions?: (RecordPermissionsResultGenqlSelection & { __args: {targets: RecordTargetInput[]} })
    recordSharing?: (RecordSharingDTOGenqlSelection & { __args: {target: RecordTargetInput} })
    skill?: (SkillGenqlSelection & { __args: {id: Scalars['UUID']} })
    skills?: SkillGenqlSelection
    timelineActivityTypes?: TimelineActivityTypeGenqlSelection
    twoFactorAuthenticationRecoveryStatus?: (TwoFactorAuthenticationRecoveryStatusGenqlSelection & { __args: {userId: Scalars['UUID']} })
    unsubscribeTopics?: UnsubscribeTopicGenqlSelection
    usageLimits?: UsageLimitGenqlSelection
    usageQuotaDefinitions?: UsageQuotaDefinitionsGenqlSelection
    usageQuotaScopeConsumption?: (UsageQuotaScopeConsumptionGenqlSelection & { __args: {input: UsageQuotaScopeInput} })
    usageQuotasWithConsumption?: UsageQuotaWithConsumptionGenqlSelection
    validatePasswordResetToken?: (ValidatePasswordResetTokenGenqlSelection & { __args: {passwordResetToken: Scalars['String']} })
    validationRules?: (ValidationRuleGenqlSelection & { __args: {objectMetadataId: Scalars['UUID']} })
    webhook?: (WebhookGenqlSelection & { __args: {id: Scalars['UUID']} })
    webhooks?: WebhookGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RatioAggregateConfigGenqlSelection{
    fieldMetadataId?: boolean | number
    optionValue?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RecordExportGenqlSelection{
    downloadPath?: boolean | number
    errorMessage?: boolean | number
    filename?: boolean | number
    id?: boolean | number
    progress?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RecordIdentifierGenqlSelection{
    id?: boolean | number
    imageIdentifier?: boolean | number
    labelIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RecordPermissionsDTOGenqlSelection{
    canDelete?: boolean | number
    canRead?: boolean | number
    canSoftDelete?: boolean | number
    canUpdate?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RecordPermissionsResultGenqlSelection{
    objectMetadataId?: boolean | number
    permissions?: RecordPermissionsDTOGenqlSelection
    recordId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RecordSharePrincipalInput {roleId?: (Scalars['UUID'] | null),workspaceMemberId?: (Scalars['UUID'] | null)}

export interface RecordSharingDTOGenqlSelection{
    canManageSharing?: boolean | number
    defaultGeneralAccessLevel?: boolean | number
    generalAccessLevel?: boolean | number
    hasManagedGeneralAccess?: boolean | number
    permissions?: RecordPermissionsDTOGenqlSelection
    roles?: RecordSharingRoleDTOGenqlSelection
    shares?: RecordSharingGrantDTOGenqlSelection
    sharingMode?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RecordSharingGrantDTOGenqlSelection{
    accessLevel?: boolean | number
    id?: boolean | number
    principalId?: boolean | number
    principalRoleId?: boolean | number
    principalType?: boolean | number
    rowCause?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RecordSharingRoleDTOGenqlSelection{
    canRead?: boolean | number
    canUpdate?: boolean | number
    id?: boolean | number
    label?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RecordTableConfigurationGenqlSelection{
    configurationType?: boolean | number
    isUIEditable?: boolean | number
    recordLimit?: boolean | number
    viewId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RecordTargetInput {objectMetadataId: Scalars['UUID'],recordId: Scalars['UUID']}

export interface RelationGenqlSelection{
    sourceFieldMetadata?: FieldGenqlSelection
    sourceObjectMetadata?: ObjectGenqlSelection
    targetFieldMetadata?: FieldGenqlSelection
    targetObjectMetadata?: ObjectGenqlSelection
    type?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RemoveQueryFromEventStreamInput {eventStreamId: Scalars['String'],queryId: Scalars['String']}

export interface ReportAppConnectionAuthFailureInput {id: Scalars['ID'],reason?: (Scalars['String'] | null)}

export interface ResendEmailVerificationTokenGenqlSelection{
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RevokeApiKeyInput {id: Scalars['UUID']}

export interface RichTextBodyGenqlSelection{
    blocknote?: boolean | number
    markdown?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RoleGenqlSelection{
    agents?: AgentGenqlSelection
    apiKeys?: ApiKeyForRoleGenqlSelection
    canAccessAllTools?: boolean | number
    canBeAssignedToAgents?: boolean | number
    canBeAssignedToApiKeys?: boolean | number
    canBeAssignedToUsers?: boolean | number
    canDestroyAllObjectRecords?: boolean | number
    canReadAllObjectRecords?: boolean | number
    canSoftDeleteAllObjectRecords?: boolean | number
    canUpdateAllObjectRecords?: boolean | number
    canUpdateAllSettings?: boolean | number
    description?: boolean | number
    fieldPermissions?: FieldPermissionGenqlSelection
    icon?: boolean | number
    id?: boolean | number
    isEditable?: boolean | number
    label?: boolean | number
    objectPermissions?: ObjectPermissionGenqlSelection
    permissionFlags?: RolePermissionFlagGenqlSelection
    rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroupGenqlSelection
    rowLevelPermissionPredicates?: RowLevelPermissionPredicateGenqlSelection
    universalIdentifier?: boolean | number
    workspaceMembers?: WorkspaceMemberGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RolePermissionFlagGenqlSelection{
    flag?: boolean | number
    id?: boolean | number
    roleId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RotateClientSecretGenqlSelection{
    clientSecret?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RowLevelPermissionPredicateGenqlSelection{
    fieldMetadataId?: boolean | number
    id?: boolean | number
    objectMetadataId?: boolean | number
    operand?: boolean | number
    positionInRowLevelPermissionPredicateGroup?: boolean | number
    roleId?: boolean | number
    rowLevelPermissionPredicateGroupId?: boolean | number
    subFieldName?: boolean | number
    value?: boolean | number
    workspaceMemberFieldMetadataId?: boolean | number
    workspaceMemberSubFieldName?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RowLevelPermissionPredicateGroupGenqlSelection{
    id?: boolean | number
    logicalOperator?: boolean | number
    objectMetadataId?: boolean | number
    parentRowLevelPermissionPredicateGroupId?: boolean | number
    positionInRowLevelPermissionPredicateGroup?: boolean | number
    roleId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RowLevelPermissionPredicateGroupInput {id?: (Scalars['UUID'] | null),logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator,objectMetadataId: Scalars['UUID'],parentRowLevelPermissionPredicateGroupId?: (Scalars['UUID'] | null),positionInRowLevelPermissionPredicateGroup?: (Scalars['Float'] | null)}

export interface RowLevelPermissionPredicateInput {fieldMetadataId: Scalars['UUID'],id?: (Scalars['UUID'] | null),operand: RowLevelPermissionPredicateOperand,positionInRowLevelPermissionPredicateGroup?: (Scalars['Float'] | null),rowLevelPermissionPredicateGroupId?: (Scalars['UUID'] | null),subFieldName?: (Scalars['String'] | null),value?: (Scalars['JSON'] | null),workspaceMemberFieldMetadataId?: (Scalars['String'] | null),workspaceMemberSubFieldName?: (Scalars['String'] | null)}

export interface RunAgentInput {additionalInstructions?: (Scalars['String'] | null),agentUniversalIdentifier: Scalars['String'],input?: (RunAgentMessageInput[] | null),messages?: (RunAgentMessageInput[] | null),prompt?: (Scalars['String'] | null),runAsWorkspaceMemberId?: (Scalars['UUID'] | null),thread?: (RunAgentThreadInput | null)}

export interface RunAgentMessageAttachmentInput {fileId: Scalars['UUID'],filename?: (Scalars['String'] | null)}

export interface RunAgentMessageInput {attachments?: (RunAgentMessageAttachmentInput[] | null),content: Scalars['String'],role: RunAgentMessageRole}

export interface RunAgentResultGenqlSelection{
    error?: boolean | number
    isWaiting?: boolean | number
    result?: boolean | number
    success?: boolean | number
    threadId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RunAgentThreadInput {key: Scalars['String'],title?: (Scalars['String'] | null)}

export interface SSOConnectionGenqlSelection{
    id?: boolean | number
    issuer?: boolean | number
    name?: boolean | number
    status?: boolean | number
    type?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SSOIdentityProviderGenqlSelection{
    id?: boolean | number
    issuer?: boolean | number
    name?: boolean | number
    status?: boolean | number
    type?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SdkClientChecksumsGenqlSelection{
    core?: boolean | number
    metadata?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SearchFieldGenqlSelection{
    createdAt?: boolean | number
    fieldMetadataId?: boolean | number
    id?: boolean | number
    position?: boolean | number
    tsVectorFieldMetadataId?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SendChatMessageResultGenqlSelection{
    mentionedParticipantWorkspaceMemberIds?: boolean | number
    messageId?: boolean | number
    queued?: boolean | number
    streamId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SendEmailAttachmentInput {id: Scalars['String'],name: Scalars['String']}

export interface SendEmailInput {bcc?: (Scalars['String'] | null),body: Scalars['String'],cc?: (Scalars['String'] | null),connectedAccountId: Scalars['String'],draftMessageId?: (Scalars['String'] | null),files?: (SendEmailAttachmentInput[] | null),fromHandle?: (Scalars['String'] | null),inReplyTo?: (Scalars['String'] | null),subject: Scalars['String'],to: Scalars['String']}

export interface SendEmailOutputGenqlSelection{
    error?: boolean | number
    messageThreadId?: boolean | number
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SendEmailViaDomainOutputGenqlSelection{
    messageId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SendInboxMessageInput {idempotencyKey: Scalars['String'],text: Scalars['String'],threadKey: Scalars['String'],title: Scalars['String'],toolCall?: (Scalars['JSON'] | null),workspaceMemberId: Scalars['UUID']}

export interface SendInboxMessageResultGenqlSelection{
    threadId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SendInvitationsGenqlSelection{
    errors?: boolean | number
    result?: WorkspaceInvitationGenqlSelection
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SendMessageCampaignInput {campaignId: Scalars['String'],scheduledAt?: (Scalars['DateTime'] | null)}

export interface SendMessageCampaignOutputDTOGenqlSelection{
    audience?: CampaignAudiencePreviewDTOGenqlSelection
    campaignId?: boolean | number
    queuedCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SendMessageCampaignTestInput {body: Scalars['String'],fromAddress: Scalars['String'],subject: Scalars['String'],toAddress: Scalars['String'],unsubscribeTopicId?: (Scalars['String'] | null)}

export interface SentryGenqlSelection{
    dsn?: boolean | number
    environment?: boolean | number
    release?: boolean | number
    tracesSampleRate?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SetAppKeyValueInput {key: Scalars['String'],scope?: (AppKeyValueScope | null),value?: (Scalars['JSON'] | null)}

export interface SettingsMenuItemGenqlSelection{
    applicationId?: boolean | number
    createdAt?: boolean | number
    frontComponentId?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    position?: boolean | number
    scope?: boolean | number
    title?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SetupOIDCSsoInput {clientID: Scalars['String'],clientSecret: Scalars['String'],issuer: Scalars['String'],name: Scalars['String']}

export interface SetupSAMLSsoInput {certificate: Scalars['String'],fingerprint?: (Scalars['String'] | null),id: Scalars['UUID'],issuer: Scalars['String'],name: Scalars['String'],ssoURL: Scalars['String']}

export interface SetupSsoGenqlSelection{
    id?: boolean | number
    issuer?: boolean | number
    name?: boolean | number
    status?: boolean | number
    type?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SignUpGenqlSelection{
    loginToken?: AuthTokenGenqlSelection
    workspace?: WorkspaceUrlsAndIdGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SignUpInNewWorkspaceInput {displayName?: (Scalars['String'] | null),subdomain?: (Scalars['String'] | null)}

export interface SkillGenqlSelection{
    applicationId?: boolean | number
    content?: boolean | number
    createdAt?: boolean | number
    description?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    isActive?: boolean | number
    isCustom?: boolean | number
    isSystem?: boolean | number
    label?: boolean | number
    name?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface StandaloneRichTextConfigurationGenqlSelection{
    body?: RichTextBodyGenqlSelection
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface StartWorkspaceSetupChatResultGenqlSelection{
    outcome?: boolean | number
    thread?: AgentChatThreadGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface StopImpersonationGenqlSelection{
    canRestoreImpersonatorSession?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SubdomainAvailabilityDTOGenqlSelection{
    available?: boolean | number
    isValid?: boolean | number
    suggestedSubdomain?: boolean | number
    suggestedSubdomains?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SubscriptionGenqlSelection{
    eventLogsLive?: (EventLogRecordGenqlSelection & { __args: {fieldFilters?: (EventLogFieldFilterInput[] | null), table: EventLogTable} })
    exportRecords?: (RecordExportGenqlSelection & { __args: {input: CreateRecordExportInput} })
    logicFunctionLogs?: (LogicFunctionLogsGenqlSelection & { __args: {input: LogicFunctionLogsInput} })
    onAgentChatEvent?: (AgentChatEventGenqlSelection & { __args: {threadId: Scalars['UUID']} })
    onEventSubscription?: (EventSubscriptionGenqlSelection & { __args: {eventStreamId: Scalars['String']} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SupportGenqlSelection{
    supportDriver?: boolean | number
    supportFrontChatId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TasksConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TimelineActivityTypeGenqlSelection{
    /** @deprecated Use emit.on */
    action?: boolean | number
    applicationId?: boolean | number
    createdAt?: boolean | number
    emit?: TimelineActivityTypeEmitGenqlSelection
    frontComponentUniversalIdentifier?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    isActive?: boolean | number
    label?: boolean | number
    name?: boolean | number
    /** @deprecated Use emit.objectUniversalIdentifier */
    objectUniversalIdentifier?: boolean | number
    replacesTimelineActivityTypeUniversalIdentifier?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TimelineActivityTypeEmitGenqlSelection{
    objectUniversalIdentifier?: boolean | number
    on?: boolean | number
    through?: TimelineActivityTypeEmitThroughGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TimelineActivityTypeEmitThroughGenqlSelection{
    happensAtFieldUniversalIdentifier?: boolean | number
    relationFieldUniversalIdentifier?: boolean | number
    triggerFieldUniversalIdentifiers?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TimelineConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ToolIndexEntryGenqlSelection{
    category?: boolean | number
    description?: boolean | number
    frontComponentId?: boolean | number
    icon?: boolean | number
    inputSchema?: boolean | number
    label?: boolean | number
    name?: boolean | number
    objectName?: boolean | number
    widgetName?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TransientTokenGenqlSelection{
    transientToken?: AuthTokenGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TriggerInstallApplicationJobInput {universalIdentifier: Scalars['String']}

export interface TriggerInstallApplicationJobResultGenqlSelection{
    jobId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TriggerUninstallApplicationJobInput {universalIdentifier: Scalars['String']}

export interface TriggerUninstallApplicationJobResultGenqlSelection{
    jobId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TwoFactorAuthenticationMethodSummaryGenqlSelection{
    status?: boolean | number
    strategy?: boolean | number
    twoFactorAuthenticationMethodId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TwoFactorAuthenticationRecoveryCodeGenqlSelection{
    expiresAt?: boolean | number
    recoveryCode?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TwoFactorAuthenticationRecoveryCodeRedemptionGenqlSelection{
    provisioningUri?: boolean | number
    tokens?: AuthTokenPairGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TwoFactorAuthenticationRecoveryStatusGenqlSelection{
    hasVerifiedTwoFactorAuthenticationMethod?: boolean | number
    isAwaitingRecoveryEnrollment?: boolean | number
    pendingRecoveryCodeExpiresAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UUIDFilterComparison {eq?: (Scalars['UUID'] | null),gt?: (Scalars['UUID'] | null),gte?: (Scalars['UUID'] | null),iLike?: (Scalars['UUID'] | null),in?: (Scalars['UUID'][] | null),is?: (Scalars['Boolean'] | null),isNot?: (Scalars['Boolean'] | null),like?: (Scalars['UUID'] | null),lt?: (Scalars['UUID'] | null),lte?: (Scalars['UUID'] | null),neq?: (Scalars['UUID'] | null),notILike?: (Scalars['UUID'] | null),notIn?: (Scalars['UUID'][] | null),notLike?: (Scalars['UUID'] | null)}

export interface UnsubscribeTopicGenqlSelection{
    createdAt?: boolean | number
    description?: boolean | number
    id?: boolean | number
    name?: boolean | number
    updatedAt?: boolean | number
    visibility?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UpdateAgentChatChannelInput {color?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),name?: (Scalars['String'] | null),visibility?: (AgentChatChannelVisibility | null)}

export interface UpdateAgentInput {description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),id: Scalars['UUID'],label?: (Scalars['String'] | null),modelConfiguration?: (Scalars['JSON'] | null),modelId?: (Scalars['String'] | null),name?: (Scalars['String'] | null),prompt?: (Scalars['String'] | null),responseFormat?: (Scalars['JSON'] | null),roleId?: (Scalars['UUID'] | null),triggers?: (Scalars['JSON'][] | null)}

export interface UpdateApiKeyInput {expiresAt?: (Scalars['String'] | null),id: Scalars['UUID'],name?: (Scalars['String'] | null),revokedAt?: (Scalars['String'] | null)}

export interface UpdateAppMessageChannelInput {displayName?: (Scalars['String'] | null),id: Scalars['UUID'],isSyncEnabled?: (Scalars['Boolean'] | null),visibility?: (MessageChannelVisibility | null)}

export interface UpdateApplicationInput {autoUpgrade?: (Scalars['Boolean'] | null)}

export interface UpdateApplicationRegistrationInput {id: Scalars['String'],update: UpdateApplicationRegistrationPayload}

export interface UpdateApplicationRegistrationPayload {name?: (Scalars['String'] | null),oAuthRedirectUris?: (Scalars['String'][] | null),oAuthScopes?: (Scalars['String'][] | null)}

export interface UpdateApplicationRegistrationVariableInput {id: Scalars['String'],update: UpdateApplicationRegistrationVariablePayload}

export interface UpdateApplicationRegistrationVariablePayload {description?: (Scalars['String'] | null),resetValue?: (Scalars['Boolean'] | null),value?: (Scalars['String'] | null)}

export interface UpdateCalendarChannelInput {id: Scalars['UUID'],update: UpdateCalendarChannelInputUpdates}

export interface UpdateCalendarChannelInputUpdates {contactAutoCreationPolicy?: (CalendarChannelContactAutoCreationPolicy | null),isContactAutoCreationEnabled?: (Scalars['Boolean'] | null),isSyncEnabled?: (Scalars['Boolean'] | null),visibility?: (CalendarChannelVisibility | null)}

export interface UpdateCommandMenuItemInput {availabilityObjectMetadataId?: (Scalars['UUID'] | null),availabilityType?: (CommandMenuItemAvailabilityType | null),engineComponentKey?: (EngineComponentKey | null),hotKeys?: (Scalars['String'][] | null),icon?: (Scalars['String'] | null),id: Scalars['UUID'],isPinned?: (Scalars['Boolean'] | null),label?: (Scalars['String'] | null),pageLayoutId?: (Scalars['UUID'] | null),position?: (Scalars['Float'] | null),shortLabel?: (Scalars['String'] | null)}

export interface UpdateEmailGroupChannelInput {displayName?: (Scalars['String'] | null),id: Scalars['UUID']}

export interface UpdateFieldInput {defaultValue?: (Scalars['JSON'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),isActive?: (Scalars['Boolean'] | null),isAuditLogged?: (Scalars['Boolean'] | null),isLabelSyncedWithName?: (Scalars['Boolean'] | null),isNullable?: (Scalars['Boolean'] | null),isSearchable?: (Scalars['Boolean'] | null),isSystem?: (Scalars['Boolean'] | null),isUIEditable?: (Scalars['Boolean'] | null),isUIReadOnly?: (Scalars['Boolean'] | null),isUnique?: (Scalars['Boolean'] | null),label?: (Scalars['String'] | null),morphRelationsUpdatePayload?: (Scalars['JSON'][] | null),name?: (Scalars['String'] | null),objectMetadataId?: (Scalars['UUID'] | null),options?: (Scalars['JSON'] | null),settings?: (Scalars['JSON'] | null),translations?: (MetadataTranslationOverrideInput[] | null),universalIdentifier?: (Scalars['String'] | null)}

export interface UpdateFrontComponentInput {
/** The id of the front component to update */
id: Scalars['UUID'],
/** The front component fields to update */
update: UpdateFrontComponentInputUpdates}

export interface UpdateFrontComponentInputUpdates {description?: (Scalars['String'] | null),name?: (Scalars['String'] | null)}

export interface UpdateLabPublicFeatureFlagInput {publicFeatureFlag: Scalars['String'],value: Scalars['Boolean']}

export interface UpdateLogicFunctionFromSourceInput {
/** Id of the logic function to update */
id: Scalars['UUID'],
/** The logic function updates */
update: UpdateLogicFunctionFromSourceInputUpdates}

export interface UpdateLogicFunctionFromSourceInputUpdates {cronTriggerSettings?: (Scalars['JSON'] | null),databaseEventTriggerSettings?: (Scalars['JSON'] | null),description?: (Scalars['String'] | null),handlerName?: (Scalars['String'] | null),httpRouteTriggerSettings?: (Scalars['JSON'] | null),name?: (Scalars['String'] | null),sourceHandlerCode?: (Scalars['String'] | null),sourceHandlerPath?: (Scalars['String'] | null),timeoutSeconds?: (Scalars['Float'] | null),toolTriggerSettings?: (Scalars['JSON'] | null),workflowActionTriggerSettings?: (Scalars['JSON'] | null)}

export interface UpdateMessageChannelInput {id: Scalars['UUID'],update: UpdateMessageChannelInputUpdates}

export interface UpdateMessageChannelInputUpdates {contactAutoCreationPolicy?: (MessageChannelContactAutoCreationPolicy | null),excludeGroupEmails?: (Scalars['Boolean'] | null),excludeNonProfessionalEmails?: (Scalars['Boolean'] | null),isContactAutoCreationEnabled?: (Scalars['Boolean'] | null),isSyncEnabled?: (Scalars['Boolean'] | null),messageFolderImportPolicy?: (MessageFolderImportPolicy | null),visibility?: (MessageChannelVisibility | null)}

export interface UpdateMessageFolderInput {id: Scalars['UUID'],update: UpdateMessageFolderInputUpdates}

export interface UpdateMessageFolderInputUpdates {isSynced: Scalars['Boolean']}

export interface UpdateMessageFoldersInput {ids: Scalars['UUID'][],update: UpdateMessageFolderInputUpdates}

export interface UpdateNavigationMenuItemInput {color?: (Scalars['String'] | null),folderId?: (Scalars['UUID'] | null),icon?: (Scalars['String'] | null),link?: (Scalars['String'] | null),name?: (Scalars['String'] | null),pageLayoutId?: (Scalars['UUID'] | null),position?: (Scalars['Float'] | null)}

export interface UpdateObjectPayload {color?: (Scalars['String'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),imageIdentifierFieldMetadataId?: (Scalars['UUID'] | null),isActive?: (Scalars['Boolean'] | null),isLabelSyncedWithName?: (Scalars['Boolean'] | null),isSearchable?: (Scalars['Boolean'] | null),labelIdentifierFieldMetadataId?: (Scalars['UUID'] | null),labelPlural?: (Scalars['String'] | null),labelSingular?: (Scalars['String'] | null),namePlural?: (Scalars['String'] | null),nameSingular?: (Scalars['String'] | null),openRecordIn?: (ObjectOpenRecordIn | null),readability?: (MetadataReadability | null),sharingReach?: (ObjectSharingReach | null),shortcut?: (Scalars['String'] | null),translations?: (MetadataTranslationOverrideInput[] | null)}

export interface UpdateOneFieldMetadataInput {
/** The id of the record to update */
id: Scalars['UUID'],
/** The record to update */
update: UpdateFieldInput}

export interface UpdateOneNavigationMenuItemInput {
/** The id of the record to update */
id: Scalars['UUID'],
/** The record to update */
update: UpdateNavigationMenuItemInput}

export interface UpdateOneObjectInput {
/** The id of the object to update */
id: Scalars['UUID'],update: UpdateObjectPayload}

export interface UpdatePageLayoutInput {name?: (Scalars['String'] | null),objectMetadataId?: (Scalars['UUID'] | null),type?: (PageLayoutType | null)}

export interface UpdatePageLayoutTabInput {icon?: (Scalars['String'] | null),layoutMode?: (PageLayoutTabLayoutMode | null),position?: (Scalars['Float'] | null),title?: (Scalars['String'] | null)}

export interface UpdatePageLayoutTabWithWidgetsInput {icon?: (Scalars['String'] | null),id: Scalars['UUID'],layoutMode?: (PageLayoutTabLayoutMode | null),position: Scalars['Float'],title: Scalars['String'],widgets: UpdatePageLayoutWidgetWithIdInput[]}

export interface UpdatePageLayoutWidgetInput {conditionalAvailabilityExpression?: (Scalars['String'] | null),conditionalDisplay?: (Scalars['JSON'] | null),configuration?: (Scalars['JSON'] | null),isActive?: (Scalars['Boolean'] | null),objectMetadataId?: (Scalars['UUID'] | null),pageLayoutTabId?: (Scalars['UUID'] | null),position?: (Scalars['JSON'] | null),title?: (Scalars['String'] | null),type?: (WidgetType | null)}

export interface UpdatePageLayoutWidgetWithIdInput {conditionalAvailabilityExpression?: (Scalars['String'] | null),conditionalDisplay?: (Scalars['JSON'] | null),configuration?: (Scalars['JSON'] | null),id: Scalars['UUID'],objectMetadataId?: (Scalars['UUID'] | null),pageLayoutTabId: Scalars['UUID'],position?: (Scalars['JSON'] | null),title: Scalars['String'],type: WidgetType}

export interface UpdatePageLayoutWithTabsInput {isFirstTabPinned?: (Scalars['Boolean'] | null),name: Scalars['String'],objectMetadataId?: (Scalars['UUID'] | null),tabs: UpdatePageLayoutTabWithWidgetsInput[],type: PageLayoutType}

export interface UpdateRoleInput {
/** The id of the role to update */
id: Scalars['UUID'],update: UpdateRolePayload}

export interface UpdateRolePayload {canAccessAllTools?: (Scalars['Boolean'] | null),canBeAssignedToAgents?: (Scalars['Boolean'] | null),canBeAssignedToApiKeys?: (Scalars['Boolean'] | null),canBeAssignedToUsers?: (Scalars['Boolean'] | null),canDestroyAllObjectRecords?: (Scalars['Boolean'] | null),canReadAllObjectRecords?: (Scalars['Boolean'] | null),canSoftDeleteAllObjectRecords?: (Scalars['Boolean'] | null),canUpdateAllObjectRecords?: (Scalars['Boolean'] | null),canUpdateAllSettings?: (Scalars['Boolean'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),label?: (Scalars['String'] | null)}

export interface UpdateSkillInput {content?: (Scalars['String'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),id: Scalars['UUID'],isActive?: (Scalars['Boolean'] | null),label?: (Scalars['String'] | null),name?: (Scalars['String'] | null)}

export interface UpdateTimelineActivityTypeInput {icon?: (Scalars['String'] | null),id: Scalars['UUID'],isActive?: (Scalars['Boolean'] | null),label?: (Scalars['String'] | null),translations?: (MetadataTranslationOverrideInput[] | null)}

export interface UpdateUnsubscribeTopicInput {description?: (Scalars['String'] | null),id: Scalars['String'],name?: (Scalars['String'] | null),visibility?: (UnsubscribeTopicVisibility | null)}

export interface UpdateUsageLimitInput {id: Scalars['UUID'],payload: CreateUsageLimitInput}

export interface UpdateValidationRuleInput {id: Scalars['UUID'],update: UpdateValidationRuleInputUpdates}

export interface UpdateValidationRuleInputUpdates {description?: (Scalars['String'] | null),errorFieldMetadataId?: (Scalars['UUID'] | null),expression?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),isActive?: (Scalars['Boolean'] | null),message?: (Scalars['String'] | null),name?: (Scalars['String'] | null)}

export interface UpdateViewFieldGroupInput {
/** The id of the view field group to update */
id: Scalars['UUID'],
/** The view field group to update */
update: UpdateViewFieldGroupInputUpdates}

export interface UpdateViewFieldGroupInputUpdates {deletedAt?: (Scalars['String'] | null),isVisible?: (Scalars['Boolean'] | null),name?: (Scalars['String'] | null),position?: (Scalars['Float'] | null)}

export interface UpdateViewFieldInput {
/** The id of the view field to update */
id: Scalars['UUID'],
/** The view field to update */
update: UpdateViewFieldInputUpdates}

export interface UpdateViewFieldInputUpdates {aggregateOperation?: (AggregateOperations | null),isVisible?: (Scalars['Boolean'] | null),position?: (Scalars['Float'] | null),size?: (Scalars['Float'] | null),viewFieldGroupId?: (Scalars['UUID'] | null)}

export interface UpdateViewFilterGroupInput {id?: (Scalars['UUID'] | null),logicalOperator?: (ViewFilterGroupLogicalOperator | null),parentViewFilterGroupId?: (Scalars['UUID'] | null),positionInViewFilterGroup?: (Scalars['Float'] | null),viewId?: (Scalars['UUID'] | null)}

export interface UpdateViewFilterInput {
/** The id of the view filter to update */
id: Scalars['UUID'],
/** The view filter to update */
update: UpdateViewFilterInputUpdates}

export interface UpdateViewFilterInputUpdates {fieldMetadataId?: (Scalars['UUID'] | null),operand?: (ViewFilterOperand | null),positionInViewFilterGroup?: (Scalars['Float'] | null),relationTargetFieldMetadataId?: (Scalars['UUID'] | null),subFieldName?: (Scalars['String'] | null),value?: (Scalars['JSON'] | null),viewFilterGroupId?: (Scalars['UUID'] | null)}

export interface UpdateViewGroupInput {
/** The id of the view group to update */
id: Scalars['UUID'],
/** The view group to update */
update: UpdateViewGroupInputUpdates}

export interface UpdateViewGroupInputUpdates {fieldMetadataId?: (Scalars['UUID'] | null),fieldValue?: (Scalars['String'] | null),isVisible?: (Scalars['Boolean'] | null),position?: (Scalars['Float'] | null)}

export interface UpdateViewInput {anyFieldFilterValue?: (Scalars['String'] | null),calendarEndFieldMetadataId?: (Scalars['UUID'] | null),calendarFieldMetadataId?: (Scalars['UUID'] | null),calendarLayout?: (ViewCalendarLayout | null),groupLoadLimit?: (Scalars['Int'] | null),icon?: (Scalars['String'] | null),id?: (Scalars['UUID'] | null),isCompact?: (Scalars['Boolean'] | null),kanbanAggregateOperation?: (AggregateOperations | null),kanbanAggregateOperationFieldMetadataId?: (Scalars['UUID'] | null),kanbanColumnWidth?: (Scalars['Int'] | null),mainGroupByFieldMetadataId?: (Scalars['UUID'] | null),name?: (Scalars['String'] | null),
/** Deprecated: Superseded by objectMetadata.openRecordIn and the workspace member preference; kept one release for API compatibility, no longer read by the frontend. */
openRecordIn?: (ViewOpenRecordIn | null),position?: (Scalars['Float'] | null),shouldHideEmptyGroups?: (Scalars['Boolean'] | null),type?: (ViewType | null),visibility?: (ViewVisibility | null)}

export interface UpdateViewSortInput {
/** The id of the view sort to update */
id: Scalars['UUID'],
/** The view sort to update */
update: UpdateViewSortInputUpdates}

export interface UpdateViewSortInputUpdates {direction?: (ViewSortDirection | null),subFieldName?: (Scalars['String'] | null)}

export interface UpdateWebhookInput {
/** The id of the webhook to update */
id: Scalars['UUID'],
/** The webhook fields to update */
update: UpdateWebhookInputUpdates}

export interface UpdateWebhookInputUpdates {description?: (Scalars['String'] | null),operations?: (Scalars['String'][] | null),secret?: (Scalars['String'] | null),targetUrl?: (Scalars['String'] | null)}

export interface UpdateWorkspaceAllowedIframeOriginsInput {operation: Scalars['String'],origin: Scalars['String']}

export interface UpdateWorkspaceInput {aiAdditionalInstructions?: (Scalars['String'] | null),aiAgentModelTier?: (AiModelTier | null),aiChatModelTier?: (AiModelTier | null),aiEvaluationModelId?: (Scalars['String'] | null),aiModelIdByTier?: (Scalars['JSON'] | null),allowImpersonation?: (Scalars['Boolean'] | null),customDomain?: (Scalars['String'] | null),defaultRoleId?: (Scalars['UUID'] | null),displayName?: (Scalars['String'] | null),editableProfileFields?: (Scalars['String'][] | null),eventLogRetentionDays?: (Scalars['Float'] | null),inviteHash?: (Scalars['String'] | null),isAutoModelSelectionEnabled?: (Scalars['Boolean'] | null),isCampaignClickTrackingEnabled?: (Scalars['Boolean'] | null),isGoogleAuthBypassEnabled?: (Scalars['Boolean'] | null),isGoogleAuthEnabled?: (Scalars['Boolean'] | null),isInternalMessagesImportEnabled?: (Scalars['Boolean'] | null),isMicrosoftAuthBypassEnabled?: (Scalars['Boolean'] | null),isMicrosoftAuthEnabled?: (Scalars['Boolean'] | null),isPasswordAuthBypassEnabled?: (Scalars['Boolean'] | null),isPasswordAuthEnabled?: (Scalars['Boolean'] | null),isPublicInviteLinkEnabled?: (Scalars['Boolean'] | null),isTwoFactorAuthenticationEnforced?: (Scalars['Boolean'] | null),logo?: (Scalars['String'] | null),subdomain?: (Scalars['String'] | null),trashRetentionDays?: (Scalars['Float'] | null),workspaceDiscoverability?: (WorkspaceDiscoverability | null)}

export interface UpdateWorkspaceMemberSettingsInput {update: Scalars['JSON'],workspaceMemberId: Scalars['UUID']}

export interface UpsertFieldPermissionsInput {fieldPermissions: FieldPermissionInput[],roleId: Scalars['UUID']}

export interface UpsertFieldsWidgetFieldInput {
/** The id of the field metadata. Used to create a new view field when viewFieldId is not provided. */
fieldMetadataId?: (Scalars['UUID'] | null),isVisible: Scalars['Boolean'],position: Scalars['Float'],
/** The id of the view field. Required if fieldMetadataId is not provided. */
viewFieldId?: (Scalars['UUID'] | null)}

export interface UpsertFieldsWidgetGroupInput {fields: UpsertFieldsWidgetFieldInput[],id: Scalars['UUID'],isVisible: Scalars['Boolean'],name: Scalars['String'],position: Scalars['Float']}

export interface UpsertFieldsWidgetInput {
/** The ungrouped fields to upsert. When provided, all existing groups are deleted and fields are detached from groups. Mutually exclusive with "groups". */
fields?: (UpsertFieldsWidgetFieldInput[] | null),
/** The groups (with nested fields) to upsert. Mutually exclusive with "fields". */
groups?: (UpsertFieldsWidgetGroupInput[] | null),
/** The id of the fields widget whose groups and fields to upsert */
widgetId: Scalars['UUID']}

export interface UpsertObjectPermissionsInput {objectPermissions: ObjectPermissionInput[],roleId: Scalars['UUID']}

export interface UpsertPermissionFlagsInput {permissionFlagKeys: Scalars['String'][],roleId: Scalars['UUID']}

export interface UpsertRowLevelPermissionPredicatesInput {objectMetadataId: Scalars['UUID'],predicateGroups: RowLevelPermissionPredicateGroupInput[],predicates: RowLevelPermissionPredicateInput[],roleId: Scalars['UUID']}

export interface UpsertRowLevelPermissionPredicatesResultGenqlSelection{
    predicateGroups?: RowLevelPermissionPredicateGroupGenqlSelection
    predicates?: RowLevelPermissionPredicateGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UpsertViewWidgetInput {
/** View-level settings (layout type, group by, kanban and calendar settings) to apply to the widget view. */
view?: (UpsertViewWidgetViewSettingsInput | null),
/** The view fields to upsert. */
viewFields?: (UpsertViewWidgetViewFieldInput[] | null),
/** The view filter groups to upsert. */
viewFilterGroups?: (UpsertViewWidgetViewFilterGroupInput[] | null),
/** The view filters to upsert. */
viewFilters?: (UpsertViewWidgetViewFilterInput[] | null),
/** The view sorts to upsert. */
viewSorts?: (UpsertViewWidgetViewSortInput[] | null),
/** The id of the view widget (page layout widget). */
widgetId: Scalars['UUID']}

export interface UpsertViewWidgetViewFieldInput {aggregateOperation?: (AggregateOperations | null),
/** The field metadata id. Used to create a new view field when viewFieldId is not provided. */
fieldMetadataId?: (Scalars['UUID'] | null),isVisible: Scalars['Boolean'],position: Scalars['Float'],size?: (Scalars['Float'] | null),
/** The id of an existing view field to update. */
viewFieldId?: (Scalars['UUID'] | null)}

export interface UpsertViewWidgetViewFilterGroupInput {id?: (Scalars['UUID'] | null),logicalOperator?: (ViewFilterGroupLogicalOperator | null),parentViewFilterGroupId?: (Scalars['UUID'] | null),positionInViewFilterGroup?: (Scalars['Float'] | null)}

export interface UpsertViewWidgetViewFilterInput {fieldMetadataId: Scalars['UUID'],id?: (Scalars['UUID'] | null),operand?: (ViewFilterOperand | null),positionInViewFilterGroup?: (Scalars['Float'] | null),relationTargetFieldMetadataId?: (Scalars['UUID'] | null),subFieldName?: (Scalars['String'] | null),value: Scalars['JSON'],viewFilterGroupId?: (Scalars['UUID'] | null)}

export interface UpsertViewWidgetViewSettingsInput {calendarEndFieldMetadataId?: (Scalars['UUID'] | null),calendarFieldMetadataId?: (Scalars['UUID'] | null),calendarLayout?: (ViewCalendarLayout | null),kanbanAggregateOperation?: (AggregateOperations | null),kanbanAggregateOperationFieldMetadataId?: (Scalars['UUID'] | null),kanbanColumnWidth?: (Scalars['Int'] | null),mainGroupByFieldMetadataId?: (Scalars['UUID'] | null),
/** Deprecated: Superseded by objectMetadata.openRecordIn and the workspace member preference; kept one release for API compatibility, no longer read by the frontend. */
openRecordIn?: (ViewOpenRecordIn | null),shouldHideEmptyGroups?: (Scalars['Boolean'] | null),
/** The layout type of the widget view. Only widget view types (TABLE_WIDGET, KANBAN_WIDGET, LIST_WIDGET, CALENDAR_WIDGET) are allowed. */
type?: (ViewType | null)}

export interface UpsertViewWidgetViewSortInput {direction?: (ViewSortDirection | null),fieldMetadataId: Scalars['UUID'],id?: (Scalars['UUID'] | null)}

export interface UsageAnalyticsGenqlSelection{
    periodEnd?: boolean | number
    periodStart?: boolean | number
    timeSeries?: UsageTimeSeriesGenqlSelection
    usageByApplication?: UsageBreakdownItemGenqlSelection
    usageByModel?: UsageBreakdownItemGenqlSelection
    usageByOperationType?: UsageBreakdownItemGenqlSelection
    usageByUser?: UsageBreakdownItemGenqlSelection
    userDailyUsage?: UsageUserDailyGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UsageAnalyticsInput {operationTypes?: (UsageOperationType[] | null),periodEnd?: (Scalars['DateTime'] | null),periodStart?: (Scalars['DateTime'] | null),userWorkspaceId?: (Scalars['String'] | null)}

export interface UsageBreakdownItemGenqlSelection{
    creditsUsed?: boolean | number
    key?: boolean | number
    label?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UsageLimitGenqlSelection{
    burstValue?: boolean | number
    createdAt?: boolean | number
    id?: boolean | number
    limitKind?: boolean | number
    limitValue?: boolean | number
    operationType?: boolean | number
    periodCount?: boolean | number
    periodUnit?: boolean | number
    resourceType?: boolean | number
    spenderId?: boolean | number
    spenderType?: boolean | number
    unit?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UsageLimitOperationDefinitionGenqlSelection{
    allowedUnits?: boolean | number
    operationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UsageQuotaDefinitionGenqlSelection{
    allowedOperations?: UsageLimitOperationDefinitionGenqlSelection
    allowedSpenderTypes?: boolean | number
    limitKind?: boolean | number
    operatorOnlyScopes?: UsageQuotaOperatorOnlyScopeGenqlSelection
    resourceType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UsageQuotaDefinitionsGenqlSelection{
    definitions?: UsageQuotaDefinitionGenqlSelection
    hasAllowancePeriod?: boolean | number
    isIntraWorkspaceLimitEntitled?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UsageQuotaOperatorOnlyScopeGenqlSelection{
    operationType?: boolean | number
    periodUnit?: boolean | number
    spenderType?: boolean | number
    unit?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UsageQuotaScopeConsumptionGenqlSelection{
    consumedValue?: boolean | number
    periodEnd?: boolean | number
    periodStart?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UsageQuotaScopeInput {operationType: UsageOperationType,periodUnit: Scalars['String'],resourceType: UsageResourceType,spenderId?: (Scalars['String'] | null),spenderType: Scalars['String'],unit: UsageUnit}

export interface UsageQuotaWithConsumptionGenqlSelection{
    consumedValue?: boolean | number
    id?: boolean | number
    isEnforced?: boolean | number
    limitValue?: boolean | number
    operationType?: boolean | number
    periodEnd?: boolean | number
    periodStart?: boolean | number
    periodUnit?: boolean | number
    remainingValue?: boolean | number
    resourceType?: boolean | number
    spenderId?: boolean | number
    spenderLabel?: boolean | number
    spenderType?: boolean | number
    unit?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UsageTimeSeriesGenqlSelection{
    creditsUsed?: boolean | number
    date?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UsageUserDailyGenqlSelection{
    dailyUsage?: UsageTimeSeriesGenqlSelection
    userWorkspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserGenqlSelection{
    availableWorkspaces?: AvailableWorkspacesGenqlSelection
    canAccessFullAdminPanel?: boolean | number
    canImpersonate?: boolean | number
    createdAt?: boolean | number
    currentUserWorkspace?: UserWorkspaceGenqlSelection
    currentWorkspace?: WorkspaceGenqlSelection
    deletedAt?: boolean | number
    deletedWorkspaceMembers?: DeletedWorkspaceMemberGenqlSelection
    disabled?: boolean | number
    email?: boolean | number
    firstName?: boolean | number
    hasPassword?: boolean | number
    id?: boolean | number
    isEmailVerified?: boolean | number
    isWorkspaceCreator?: boolean | number
    lastName?: boolean | number
    locale?: boolean | number
    onboardingStatus?: boolean | number
    previousOnboardingStatus?: boolean | number
    supportUserHash?: boolean | number
    updatedAt?: boolean | number
    userVars?: boolean | number
    userWorkspaces?: UserWorkspaceGenqlSelection
    workspaceMember?: WorkspaceMemberGenqlSelection
    workspaceMembers?: WorkspaceMemberGenqlSelection
    workspaces?: UserWorkspaceGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserApplicationVariableValueGenqlSelection{
    description?: boolean | number
    isDeprecated?: boolean | number
    isRequired?: boolean | number
    isSecret?: boolean | number
    key?: boolean | number
    label?: boolean | number
    options?: boolean | number
    type?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserSessionGenqlSelection{
    authProvider?: boolean | number
    createdAt?: boolean | number
    expiresAt?: boolean | number
    id?: boolean | number
    ipAddress?: boolean | number
    isCurrent?: boolean | number
    isImpersonating?: boolean | number
    lastActiveAt?: boolean | number
    userAgent?: boolean | number
    workspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserWorkspaceGenqlSelection{
    createdAt?: boolean | number
    deletedAt?: boolean | number
    id?: boolean | number
    isImpersonating?: boolean | number
    locale?: boolean | number
    objectPermissions?: ObjectPermissionGenqlSelection
    objectsPermissions?: ObjectPermissionGenqlSelection
    permissionFlags?: boolean | number
    twoFactorAuthenticationMethodSummary?: TwoFactorAuthenticationMethodSummaryGenqlSelection
    updatedAt?: boolean | number
    user?: UserGenqlSelection
    userId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ValidateApprovedAccessDomainInput {approvedAccessDomainId: Scalars['UUID'],validationToken: Scalars['String']}

export interface ValidatePasswordResetTokenGenqlSelection{
    email?: boolean | number
    hasPassword?: boolean | number
    id?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ValidationRuleGenqlSelection{
    description?: boolean | number
    errorFieldMetadataId?: boolean | number
    expression?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    isActive?: boolean | number
    message?: boolean | number
    name?: boolean | number
    objectMetadataId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface VerificationRecordGenqlSelection{
    key?: boolean | number
    priority?: boolean | number
    status?: boolean | number
    type?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface VerifyEmailAndGetLoginTokenGenqlSelection{
    loginToken?: AuthTokenGenqlSelection
    workspaceUrls?: WorkspaceUrlsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface VerifyTwoFactorAuthenticationMethodGenqlSelection{
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface VersionDistributionEntryGenqlSelection{
    count?: boolean | number
    version?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewGenqlSelection{
    anyFieldFilterValue?: boolean | number
    applicationId?: boolean | number
    calendarEndFieldMetadataId?: boolean | number
    calendarFieldMetadataId?: boolean | number
    calendarLayout?: boolean | number
    createdAt?: boolean | number
    createdByUserWorkspaceId?: boolean | number
    deletedAt?: boolean | number
    groupLoadLimit?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    isActive?: boolean | number
    isCompact?: boolean | number
    isCustom?: boolean | number
    isSystemSideEffect?: boolean | number
    kanbanAggregateOperation?: boolean | number
    kanbanAggregateOperationFieldMetadataId?: boolean | number
    kanbanColumnWidth?: boolean | number
    key?: boolean | number
    mainGroupByFieldMetadataId?: boolean | number
    name?: boolean | number
    objectMetadataId?: boolean | number
    /** @deprecated Superseded by objectMetadata.openRecordIn and the workspace member preference; kept one release for API compatibility, no longer read by the frontend. */
    openRecordIn?: boolean | number
    position?: boolean | number
    shouldHideEmptyGroups?: boolean | number
    type?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    viewFieldGroups?: ViewFieldGroupGenqlSelection
    viewFields?: ViewFieldGenqlSelection
    viewFilterGroups?: ViewFilterGroupGenqlSelection
    viewFilters?: ViewFilterGenqlSelection
    viewGroups?: ViewGroupGenqlSelection
    viewSorts?: ViewSortGenqlSelection
    visibility?: boolean | number
    workspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewConfigurationGenqlSelection{
    configurationType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewFieldGenqlSelection{
    aggregateOperation?: boolean | number
    applicationId?: boolean | number
    createdAt?: boolean | number
    deletedAt?: boolean | number
    fieldMetadataId?: boolean | number
    id?: boolean | number
    isActive?: boolean | number
    /** @deprecated isOverridden is deprecated */
    isOverridden?: boolean | number
    isSystemSideEffect?: boolean | number
    isVisible?: boolean | number
    position?: boolean | number
    size?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    viewFieldGroupId?: boolean | number
    viewId?: boolean | number
    workspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewFieldGroupGenqlSelection{
    createdAt?: boolean | number
    deletedAt?: boolean | number
    id?: boolean | number
    isActive?: boolean | number
    /** @deprecated isOverridden is deprecated */
    isOverridden?: boolean | number
    isVisible?: boolean | number
    name?: boolean | number
    position?: boolean | number
    updatedAt?: boolean | number
    viewFields?: ViewFieldGenqlSelection
    viewId?: boolean | number
    workspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewFilterGenqlSelection{
    createdAt?: boolean | number
    deletedAt?: boolean | number
    fieldMetadataId?: boolean | number
    id?: boolean | number
    operand?: boolean | number
    positionInViewFilterGroup?: boolean | number
    relationTargetFieldMetadataId?: boolean | number
    subFieldName?: boolean | number
    updatedAt?: boolean | number
    value?: boolean | number
    viewFilterGroupId?: boolean | number
    viewId?: boolean | number
    workspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewFilterGroupGenqlSelection{
    createdAt?: boolean | number
    deletedAt?: boolean | number
    id?: boolean | number
    logicalOperator?: boolean | number
    parentViewFilterGroupId?: boolean | number
    positionInViewFilterGroup?: boolean | number
    updatedAt?: boolean | number
    viewId?: boolean | number
    workspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewGroupGenqlSelection{
    createdAt?: boolean | number
    deletedAt?: boolean | number
    fieldValue?: boolean | number
    id?: boolean | number
    isVisible?: boolean | number
    position?: boolean | number
    updatedAt?: boolean | number
    viewId?: boolean | number
    workspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewSortGenqlSelection{
    createdAt?: boolean | number
    deletedAt?: boolean | number
    direction?: boolean | number
    fieldMetadataId?: boolean | number
    id?: boolean | number
    subFieldName?: boolean | number
    updatedAt?: boolean | number
    viewId?: boolean | number
    workspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WebhookGenqlSelection{
    applicationId?: boolean | number
    createdAt?: boolean | number
    deletedAt?: boolean | number
    description?: boolean | number
    id?: boolean | number
    operations?: boolean | number
    secret?: boolean | number
    targetUrl?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WidgetConfigurationGenqlSelection{
    on_AggregateChartConfiguration?:AggregateChartConfigurationGenqlSelection,
    on_BarChartConfiguration?:BarChartConfigurationGenqlSelection,
    on_CalendarConfiguration?:CalendarConfigurationGenqlSelection,
    on_CallRecordingSummaryConfiguration?:CallRecordingSummaryConfigurationGenqlSelection,
    on_CallRecordingTranscriptConfiguration?:CallRecordingTranscriptConfigurationGenqlSelection,
    on_ChatConfiguration?:ChatConfigurationGenqlSelection,
    on_ChatThreadsConfiguration?:ChatThreadsConfigurationGenqlSelection,
    on_EmailThreadConfiguration?:EmailThreadConfigurationGenqlSelection,
    on_EmailsConfiguration?:EmailsConfigurationGenqlSelection,
    on_FieldConfiguration?:FieldConfigurationGenqlSelection,
    on_FieldRichTextConfiguration?:FieldRichTextConfigurationGenqlSelection,
    on_FieldsConfiguration?:FieldsConfigurationGenqlSelection,
    on_FilesConfiguration?:FilesConfigurationGenqlSelection,
    on_FormFieldConfiguration?:FormFieldConfigurationGenqlSelection,
    on_FrontComponentConfiguration?:FrontComponentConfigurationGenqlSelection,
    on_IframeConfiguration?:IframeConfigurationGenqlSelection,
    on_LineChartConfiguration?:LineChartConfigurationGenqlSelection,
    on_MessageCampaignBodyConfiguration?:MessageCampaignBodyConfigurationGenqlSelection,
    on_MessageCampaignDetailsConfiguration?:MessageCampaignDetailsConfigurationGenqlSelection,
    on_NotesConfiguration?:NotesConfigurationGenqlSelection,
    on_PieChartConfiguration?:PieChartConfigurationGenqlSelection,
    on_RecordTableConfiguration?:RecordTableConfigurationGenqlSelection,
    on_StandaloneRichTextConfiguration?:StandaloneRichTextConfigurationGenqlSelection,
    on_TasksConfiguration?:TasksConfigurationGenqlSelection,
    on_TimelineConfiguration?:TimelineConfigurationGenqlSelection,
    on_ViewConfiguration?:ViewConfigurationGenqlSelection,
    on_WorkflowConfiguration?:WorkflowConfigurationGenqlSelection,
    on_WorkflowRunConfiguration?:WorkflowRunConfigurationGenqlSelection,
    on_WorkflowVersionConfiguration?:WorkflowVersionConfigurationGenqlSelection,
    __typename?: boolean | number
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

export interface WorkspaceGenqlSelection{
    activationStatus?: boolean | number
    aiAdditionalInstructions?: boolean | number
    aiAgentModelTier?: boolean | number
    aiChatModelTier?: boolean | number
    aiEvaluationModelId?: boolean | number
    aiModelIdByTier?: boolean | number
    allowImpersonation?: boolean | number
    allowedIframeOrigins?: boolean | number
    billingCustomer?: BillingCustomerGenqlSelection
    billingEntitlements?: BillingEntitlementGenqlSelection
    billingSubscriptions?: BillingSubscriptionGenqlSelection
    createdAt?: boolean | number
    currentBillingSubscription?: BillingSubscriptionGenqlSelection
    customDomain?: boolean | number
    databaseSchema?: boolean | number
    defaultRole?: RoleGenqlSelection
    deletedAt?: boolean | number
    displayName?: boolean | number
    editableProfileFields?: boolean | number
    eventLogRetentionDays?: boolean | number
    featureFlags?: FeatureFlagGenqlSelection
    hasValidEnterpriseValidityToken?: boolean | number
    hasValidSignedEnterpriseKey?: boolean | number
    id?: boolean | number
    installedApplications?: ApplicationGenqlSelection
    inviteHash?: boolean | number
    isAutoModelSelectionEnabled?: boolean | number
    isCampaignClickTrackingEnabled?: boolean | number
    isCampaignOpenTrackingEnabled?: boolean | number
    isCustomDomainEnabled?: boolean | number
    isGoogleAuthBypassEnabled?: boolean | number
    isGoogleAuthEnabled?: boolean | number
    isInternalMessagesImportEnabled?: boolean | number
    isMicrosoftAuthBypassEnabled?: boolean | number
    isMicrosoftAuthEnabled?: boolean | number
    isPasswordAuthBypassEnabled?: boolean | number
    isPasswordAuthEnabled?: boolean | number
    isPublicInviteLinkEnabled?: boolean | number
    isTwoFactorAuthenticationEnforced?: boolean | number
    logo?: boolean | number
    logoFileId?: boolean | number
    /** @deprecated No longer used for metadata cache invalidation, will be removed */
    metadataVersion?: boolean | number
    subdomain?: boolean | number
    trashRetentionDays?: boolean | number
    updatedAt?: boolean | number
    viewFields?: ViewFieldGenqlSelection
    viewFilterGroups?: ViewFilterGroupGenqlSelection
    viewFilters?: ViewFilterGenqlSelection
    viewGroups?: ViewGroupGenqlSelection
    viewSorts?: ViewSortGenqlSelection
    views?: ViewGenqlSelection
    workspaceCustomApplication?: ApplicationGenqlSelection
    workspaceCustomApplicationId?: boolean | number
    workspaceDiscoverability?: boolean | number
    workspaceMembersCount?: boolean | number
    workspaceUrls?: WorkspaceUrlsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceAiStatsGenqlSelection{
    conversationsCount?: boolean | number
    skillsCount?: boolean | number
    toolsCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceCompanyEnrichmentResultGenqlSelection{
    enrichment?: boolean | number
    isBookCallOnboardingStepPending?: boolean | number
    outcome?: boolean | number
    personEnrichment?: boolean | number
    personOutcome?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceCreationDefaultsDTOGenqlSelection{
    displayName?: boolean | number
    subdomain?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceInvitationGenqlSelection{
    email?: boolean | number
    expiresAt?: boolean | number
    id?: boolean | number
    roleId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceInviteHashValidGenqlSelection{
    isValid?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceMemberGenqlSelection{
    avatarUrl?: boolean | number
    calendarStartDay?: boolean | number
    colorScheme?: boolean | number
    dateFormat?: boolean | number
    id?: boolean | number
    locale?: boolean | number
    name?: FullNameGenqlSelection
    numberFormat?: boolean | number
    openRecordIn?: boolean | number
    roles?: RoleGenqlSelection
    timeFormat?: boolean | number
    timeZone?: boolean | number
    uiScale?: boolean | number
    userEmail?: boolean | number
    userId?: boolean | number
    userWorkspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceMemberApplicationVariablesGenqlSelection{
    userWorkspaceId?: boolean | number
    variables?: UserApplicationVariableValueGenqlSelection
    workspaceMemberId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceMigrationGenqlSelection{
    actions?: boolean | number
    applicationUniversalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceNameAndIdGenqlSelection{
    displayName?: boolean | number
    id?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceUrlsGenqlSelection{
    customUrl?: boolean | number
    subdomainUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceUrlsAndIdGenqlSelection{
    id?: boolean | number
    workspaceUrls?: WorkspaceUrlsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


    const Agent_possibleTypes: string[] = ['Agent']
    export const isAgent = (obj?: { __typename?: any } | null): obj is Agent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgent"')
      return Agent_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatChannel_possibleTypes: string[] = ['AgentChatChannel']
    export const isAgentChatChannel = (obj?: { __typename?: any } | null): obj is AgentChatChannel => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatChannel"')
      return AgentChatChannel_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatChannelListItem_possibleTypes: string[] = ['AgentChatChannelListItem']
    export const isAgentChatChannelListItem = (obj?: { __typename?: any } | null): obj is AgentChatChannelListItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatChannelListItem"')
      return AgentChatChannelListItem_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatEvent_possibleTypes: string[] = ['AgentChatEvent']
    export const isAgentChatEvent = (obj?: { __typename?: any } | null): obj is AgentChatEvent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatEvent"')
      return AgentChatEvent_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatInboxChannelSummary_possibleTypes: string[] = ['AgentChatInboxChannelSummary']
    export const isAgentChatInboxChannelSummary = (obj?: { __typename?: any } | null): obj is AgentChatInboxChannelSummary => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatInboxChannelSummary"')
      return AgentChatInboxChannelSummary_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatInboxSummary_possibleTypes: string[] = ['AgentChatInboxSummary']
    export const isAgentChatInboxSummary = (obj?: { __typename?: any } | null): obj is AgentChatInboxSummary => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatInboxSummary"')
      return AgentChatInboxSummary_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatInboxThreadIds_possibleTypes: string[] = ['AgentChatInboxThreadIds']
    export const isAgentChatInboxThreadIds = (obj?: { __typename?: any } | null): obj is AgentChatInboxThreadIds => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatInboxThreadIds"')
      return AgentChatInboxThreadIds_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatThread_possibleTypes: string[] = ['AgentChatThread']
    export const isAgentChatThread = (obj?: { __typename?: any } | null): obj is AgentChatThread => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatThread"')
      return AgentChatThread_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatThreadParticipant_possibleTypes: string[] = ['AgentChatThreadParticipant']
    export const isAgentChatThreadParticipant = (obj?: { __typename?: any } | null): obj is AgentChatThreadParticipant => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatThreadParticipant"')
      return AgentChatThreadParticipant_possibleTypes.includes(obj.__typename)
    }
    


    const AgentMessage_possibleTypes: string[] = ['AgentMessage']
    export const isAgentMessage = (obj?: { __typename?: any } | null): obj is AgentMessage => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentMessage"')
      return AgentMessage_possibleTypes.includes(obj.__typename)
    }
    


    const AgentMessagePart_possibleTypes: string[] = ['AgentMessagePart']
    export const isAgentMessagePart = (obj?: { __typename?: any } | null): obj is AgentMessagePart => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentMessagePart"')
      return AgentMessagePart_possibleTypes.includes(obj.__typename)
    }
    


    const AgentRun_possibleTypes: string[] = ['AgentRun']
    export const isAgentRun = (obj?: { __typename?: any } | null): obj is AgentRun => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentRun"')
      return AgentRun_possibleTypes.includes(obj.__typename)
    }
    


    const AggregateChartConfiguration_possibleTypes: string[] = ['AggregateChartConfiguration']
    export const isAggregateChartConfiguration = (obj?: { __typename?: any } | null): obj is AggregateChartConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAggregateChartConfiguration"')
      return AggregateChartConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const AiChatUsage_possibleTypes: string[] = ['AiChatUsage']
    export const isAiChatUsage = (obj?: { __typename?: any } | null): obj is AiChatUsage => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAiChatUsage"')
      return AiChatUsage_possibleTypes.includes(obj.__typename)
    }
    


    const AiSystemPromptPreview_possibleTypes: string[] = ['AiSystemPromptPreview']
    export const isAiSystemPromptPreview = (obj?: { __typename?: any } | null): obj is AiSystemPromptPreview => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAiSystemPromptPreview"')
      return AiSystemPromptPreview_possibleTypes.includes(obj.__typename)
    }
    


    const AiSystemPromptSection_possibleTypes: string[] = ['AiSystemPromptSection']
    export const isAiSystemPromptSection = (obj?: { __typename?: any } | null): obj is AiSystemPromptSection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAiSystemPromptSection"')
      return AiSystemPromptSection_possibleTypes.includes(obj.__typename)
    }
    


    const Analytics_possibleTypes: string[] = ['Analytics']
    export const isAnalytics = (obj?: { __typename?: any } | null): obj is Analytics => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAnalytics"')
      return Analytics_possibleTypes.includes(obj.__typename)
    }
    


    const ApiConfig_possibleTypes: string[] = ['ApiConfig']
    export const isApiConfig = (obj?: { __typename?: any } | null): obj is ApiConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApiConfig"')
      return ApiConfig_possibleTypes.includes(obj.__typename)
    }
    


    const ApiKey_possibleTypes: string[] = ['ApiKey']
    export const isApiKey = (obj?: { __typename?: any } | null): obj is ApiKey => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApiKey"')
      return ApiKey_possibleTypes.includes(obj.__typename)
    }
    


    const ApiKeyForRole_possibleTypes: string[] = ['ApiKeyForRole']
    export const isApiKeyForRole = (obj?: { __typename?: any } | null): obj is ApiKeyForRole => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApiKeyForRole"')
      return ApiKeyForRole_possibleTypes.includes(obj.__typename)
    }
    


    const ApiKeyToken_possibleTypes: string[] = ['ApiKeyToken']
    export const isApiKeyToken = (obj?: { __typename?: any } | null): obj is ApiKeyToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApiKeyToken"')
      return ApiKeyToken_possibleTypes.includes(obj.__typename)
    }
    


    const AppConnection_possibleTypes: string[] = ['AppConnection']
    export const isAppConnection = (obj?: { __typename?: any } | null): obj is AppConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAppConnection"')
      return AppConnection_possibleTypes.includes(obj.__typename)
    }
    


    const AppKeyValue_possibleTypes: string[] = ['AppKeyValue']
    export const isAppKeyValue = (obj?: { __typename?: any } | null): obj is AppKeyValue => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAppKeyValue"')
      return AppKeyValue_possibleTypes.includes(obj.__typename)
    }
    


    const Application_possibleTypes: string[] = ['Application']
    export const isApplication = (obj?: { __typename?: any } | null): obj is Application => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplication"')
      return Application_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationAuthorization_possibleTypes: string[] = ['ApplicationAuthorization']
    export const isApplicationAuthorization = (obj?: { __typename?: any } | null): obj is ApplicationAuthorization => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationAuthorization"')
      return ApplicationAuthorization_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationCapabilityGrant_possibleTypes: string[] = ['ApplicationCapabilityGrant']
    export const isApplicationCapabilityGrant = (obj?: { __typename?: any } | null): obj is ApplicationCapabilityGrant => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationCapabilityGrant"')
      return ApplicationCapabilityGrant_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationConnectedAccountDTO_possibleTypes: string[] = ['ApplicationConnectedAccountDTO']
    export const isApplicationConnectedAccountDTO = (obj?: { __typename?: any } | null): obj is ApplicationConnectedAccountDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationConnectedAccountDTO"')
      return ApplicationConnectedAccountDTO_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationConnectionProvider_possibleTypes: string[] = ['ApplicationConnectionProvider']
    export const isApplicationConnectionProvider = (obj?: { __typename?: any } | null): obj is ApplicationConnectionProvider => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationConnectionProvider"')
      return ApplicationConnectionProvider_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationConnectionProviderOAuthConfig_possibleTypes: string[] = ['ApplicationConnectionProviderOAuthConfig']
    export const isApplicationConnectionProviderOAuthConfig = (obj?: { __typename?: any } | null): obj is ApplicationConnectionProviderOAuthConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationConnectionProviderOAuthConfig"')
      return ApplicationConnectionProviderOAuthConfig_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationExport_possibleTypes: string[] = ['ApplicationExport']
    export const isApplicationExport = (obj?: { __typename?: any } | null): obj is ApplicationExport => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationExport"')
      return ApplicationExport_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationExportApplication_possibleTypes: string[] = ['ApplicationExportApplication']
    export const isApplicationExportApplication = (obj?: { __typename?: any } | null): obj is ApplicationExportApplication => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationExportApplication"')
      return ApplicationExportApplication_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationExportCoverageEntry_possibleTypes: string[] = ['ApplicationExportCoverageEntry']
    export const isApplicationExportCoverageEntry = (obj?: { __typename?: any } | null): obj is ApplicationExportCoverageEntry => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationExportCoverageEntry"')
      return ApplicationExportCoverageEntry_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationExportFile_possibleTypes: string[] = ['ApplicationExportFile']
    export const isApplicationExportFile = (obj?: { __typename?: any } | null): obj is ApplicationExportFile => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationExportFile"')
      return ApplicationExportFile_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationFileCompletionError_possibleTypes: string[] = ['ApplicationFileCompletionError']
    export const isApplicationFileCompletionError = (obj?: { __typename?: any } | null): obj is ApplicationFileCompletionError => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationFileCompletionError"')
      return ApplicationFileCompletionError_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationFileUploadError_possibleTypes: string[] = ['ApplicationFileUploadError']
    export const isApplicationFileUploadError = (obj?: { __typename?: any } | null): obj is ApplicationFileUploadError => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationFileUploadError"')
      return ApplicationFileUploadError_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationFileUploadTarget_possibleTypes: string[] = ['ApplicationFileUploadTarget']
    export const isApplicationFileUploadTarget = (obj?: { __typename?: any } | null): obj is ApplicationFileUploadTarget => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationFileUploadTarget"')
      return ApplicationFileUploadTarget_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationHealthCheckAction_possibleTypes: string[] = ['ApplicationHealthCheckAction']
    export const isApplicationHealthCheckAction = (obj?: { __typename?: any } | null): obj is ApplicationHealthCheckAction => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationHealthCheckAction"')
      return ApplicationHealthCheckAction_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationHealthCheckResult_possibleTypes: string[] = ['ApplicationHealthCheckResult']
    export const isApplicationHealthCheckResult = (obj?: { __typename?: any } | null): obj is ApplicationHealthCheckResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationHealthCheckResult"')
      return ApplicationHealthCheckResult_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationRegistration_possibleTypes: string[] = ['ApplicationRegistration']
    export const isApplicationRegistration = (obj?: { __typename?: any } | null): obj is ApplicationRegistration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationRegistration"')
      return ApplicationRegistration_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationRegistrationStats_possibleTypes: string[] = ['ApplicationRegistrationStats']
    export const isApplicationRegistrationStats = (obj?: { __typename?: any } | null): obj is ApplicationRegistrationStats => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationRegistrationStats"')
      return ApplicationRegistrationStats_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationRegistrationSummary_possibleTypes: string[] = ['ApplicationRegistrationSummary']
    export const isApplicationRegistrationSummary = (obj?: { __typename?: any } | null): obj is ApplicationRegistrationSummary => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationRegistrationSummary"')
      return ApplicationRegistrationSummary_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationRegistrationVariable_possibleTypes: string[] = ['ApplicationRegistrationVariable']
    export const isApplicationRegistrationVariable = (obj?: { __typename?: any } | null): obj is ApplicationRegistrationVariable => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationRegistrationVariable"')
      return ApplicationRegistrationVariable_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationTokenPair_possibleTypes: string[] = ['ApplicationTokenPair']
    export const isApplicationTokenPair = (obj?: { __typename?: any } | null): obj is ApplicationTokenPair => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationTokenPair"')
      return ApplicationTokenPair_possibleTypes.includes(obj.__typename)
    }
    


    const ApplicationVariable_possibleTypes: string[] = ['ApplicationVariable']
    export const isApplicationVariable = (obj?: { __typename?: any } | null): obj is ApplicationVariable => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplicationVariable"')
      return ApplicationVariable_possibleTypes.includes(obj.__typename)
    }
    


    const ApprovedAccessDomain_possibleTypes: string[] = ['ApprovedAccessDomain']
    export const isApprovedAccessDomain = (obj?: { __typename?: any } | null): obj is ApprovedAccessDomain => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApprovedAccessDomain"')
      return ApprovedAccessDomain_possibleTypes.includes(obj.__typename)
    }
    


    const AuthBypassProviders_possibleTypes: string[] = ['AuthBypassProviders']
    export const isAuthBypassProviders = (obj?: { __typename?: any } | null): obj is AuthBypassProviders => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAuthBypassProviders"')
      return AuthBypassProviders_possibleTypes.includes(obj.__typename)
    }
    


    const AuthProviders_possibleTypes: string[] = ['AuthProviders']
    export const isAuthProviders = (obj?: { __typename?: any } | null): obj is AuthProviders => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAuthProviders"')
      return AuthProviders_possibleTypes.includes(obj.__typename)
    }
    


    const AuthToken_possibleTypes: string[] = ['AuthToken']
    export const isAuthToken = (obj?: { __typename?: any } | null): obj is AuthToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAuthToken"')
      return AuthToken_possibleTypes.includes(obj.__typename)
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
    


    const AuthorizeApp_possibleTypes: string[] = ['AuthorizeApp']
    export const isAuthorizeApp = (obj?: { __typename?: any } | null): obj is AuthorizeApp => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAuthorizeApp"')
      return AuthorizeApp_possibleTypes.includes(obj.__typename)
    }
    


    const AutocompleteResult_possibleTypes: string[] = ['AutocompleteResult']
    export const isAutocompleteResult = (obj?: { __typename?: any } | null): obj is AutocompleteResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAutocompleteResult"')
      return AutocompleteResult_possibleTypes.includes(obj.__typename)
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
    


    const AvailableWorkspacesAndAccessTokens_possibleTypes: string[] = ['AvailableWorkspacesAndAccessTokens']
    export const isAvailableWorkspacesAndAccessTokens = (obj?: { __typename?: any } | null): obj is AvailableWorkspacesAndAccessTokens => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAvailableWorkspacesAndAccessTokens"')
      return AvailableWorkspacesAndAccessTokens_possibleTypes.includes(obj.__typename)
    }
    


    const BarChartConfiguration_possibleTypes: string[] = ['BarChartConfiguration']
    export const isBarChartConfiguration = (obj?: { __typename?: any } | null): obj is BarChartConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBarChartConfiguration"')
      return BarChartConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const BarChartData_possibleTypes: string[] = ['BarChartData']
    export const isBarChartData = (obj?: { __typename?: any } | null): obj is BarChartData => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBarChartData"')
      return BarChartData_possibleTypes.includes(obj.__typename)
    }
    


    const BarChartSeries_possibleTypes: string[] = ['BarChartSeries']
    export const isBarChartSeries = (obj?: { __typename?: any } | null): obj is BarChartSeries => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBarChartSeries"')
      return BarChartSeries_possibleTypes.includes(obj.__typename)
    }
    


    const Billing_possibleTypes: string[] = ['Billing']
    export const isBilling = (obj?: { __typename?: any } | null): obj is Billing => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBilling"')
      return Billing_possibleTypes.includes(obj.__typename)
    }
    


    const BillingCustomer_possibleTypes: string[] = ['BillingCustomer']
    export const isBillingCustomer = (obj?: { __typename?: any } | null): obj is BillingCustomer => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingCustomer"')
      return BillingCustomer_possibleTypes.includes(obj.__typename)
    }
    


    const BillingEndTrialPeriod_possibleTypes: string[] = ['BillingEndTrialPeriod']
    export const isBillingEndTrialPeriod = (obj?: { __typename?: any } | null): obj is BillingEndTrialPeriod => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingEndTrialPeriod"')
      return BillingEndTrialPeriod_possibleTypes.includes(obj.__typename)
    }
    


    const BillingEntitlement_possibleTypes: string[] = ['BillingEntitlement']
    export const isBillingEntitlement = (obj?: { __typename?: any } | null): obj is BillingEntitlement => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingEntitlement"')
      return BillingEntitlement_possibleTypes.includes(obj.__typename)
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
    


    const BillingPaymentIntent_possibleTypes: string[] = ['BillingPaymentIntent']
    export const isBillingPaymentIntent = (obj?: { __typename?: any } | null): obj is BillingPaymentIntent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingPaymentIntent"')
      return BillingPaymentIntent_possibleTypes.includes(obj.__typename)
    }
    


    const BillingPlan_possibleTypes: string[] = ['BillingPlan']
    export const isBillingPlan = (obj?: { __typename?: any } | null): obj is BillingPlan => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingPlan"')
      return BillingPlan_possibleTypes.includes(obj.__typename)
    }
    


    const BillingPriceLicensed_possibleTypes: string[] = ['BillingPriceLicensed']
    export const isBillingPriceLicensed = (obj?: { __typename?: any } | null): obj is BillingPriceLicensed => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingPriceLicensed"')
      return BillingPriceLicensed_possibleTypes.includes(obj.__typename)
    }
    


    const BillingPriceMetered_possibleTypes: string[] = ['BillingPriceMetered']
    export const isBillingPriceMetered = (obj?: { __typename?: any } | null): obj is BillingPriceMetered => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingPriceMetered"')
      return BillingPriceMetered_possibleTypes.includes(obj.__typename)
    }
    


    const BillingPriceTier_possibleTypes: string[] = ['BillingPriceTier']
    export const isBillingPriceTier = (obj?: { __typename?: any } | null): obj is BillingPriceTier => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingPriceTier"')
      return BillingPriceTier_possibleTypes.includes(obj.__typename)
    }
    


    const BillingProduct_possibleTypes: string[] = ['BillingProduct']
    export const isBillingProduct = (obj?: { __typename?: any } | null): obj is BillingProduct => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingProduct"')
      return BillingProduct_possibleTypes.includes(obj.__typename)
    }
    


    const BillingProductDTO_possibleTypes: string[] = ['BillingLicensedProduct','BillingMeteredProduct']
    export const isBillingProductDTO = (obj?: { __typename?: any } | null): obj is BillingProductDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingProductDTO"')
      return BillingProductDTO_possibleTypes.includes(obj.__typename)
    }
    


    const BillingProductMetadata_possibleTypes: string[] = ['BillingProductMetadata']
    export const isBillingProductMetadata = (obj?: { __typename?: any } | null): obj is BillingProductMetadata => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingProductMetadata"')
      return BillingProductMetadata_possibleTypes.includes(obj.__typename)
    }
    


    const BillingResourceCreditUsage_possibleTypes: string[] = ['BillingResourceCreditUsage']
    export const isBillingResourceCreditUsage = (obj?: { __typename?: any } | null): obj is BillingResourceCreditUsage => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingResourceCreditUsage"')
      return BillingResourceCreditUsage_possibleTypes.includes(obj.__typename)
    }
    


    const BillingSession_possibleTypes: string[] = ['BillingSession']
    export const isBillingSession = (obj?: { __typename?: any } | null): obj is BillingSession => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingSession"')
      return BillingSession_possibleTypes.includes(obj.__typename)
    }
    


    const BillingSubscription_possibleTypes: string[] = ['BillingSubscription']
    export const isBillingSubscription = (obj?: { __typename?: any } | null): obj is BillingSubscription => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingSubscription"')
      return BillingSubscription_possibleTypes.includes(obj.__typename)
    }
    


    const BillingSubscriptionItem_possibleTypes: string[] = ['BillingSubscriptionItem']
    export const isBillingSubscriptionItem = (obj?: { __typename?: any } | null): obj is BillingSubscriptionItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingSubscriptionItem"')
      return BillingSubscriptionItem_possibleTypes.includes(obj.__typename)
    }
    


    const BillingSubscriptionSchedulePhase_possibleTypes: string[] = ['BillingSubscriptionSchedulePhase']
    export const isBillingSubscriptionSchedulePhase = (obj?: { __typename?: any } | null): obj is BillingSubscriptionSchedulePhase => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingSubscriptionSchedulePhase"')
      return BillingSubscriptionSchedulePhase_possibleTypes.includes(obj.__typename)
    }
    


    const BillingSubscriptionSchedulePhaseItem_possibleTypes: string[] = ['BillingSubscriptionSchedulePhaseItem']
    export const isBillingSubscriptionSchedulePhaseItem = (obj?: { __typename?: any } | null): obj is BillingSubscriptionSchedulePhaseItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingSubscriptionSchedulePhaseItem"')
      return BillingSubscriptionSchedulePhaseItem_possibleTypes.includes(obj.__typename)
    }
    


    const BillingTrialPeriod_possibleTypes: string[] = ['BillingTrialPeriod']
    export const isBillingTrialPeriod = (obj?: { __typename?: any } | null): obj is BillingTrialPeriod => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingTrialPeriod"')
      return BillingTrialPeriod_possibleTypes.includes(obj.__typename)
    }
    


    const BillingUpdate_possibleTypes: string[] = ['BillingUpdate']
    export const isBillingUpdate = (obj?: { __typename?: any } | null): obj is BillingUpdate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBillingUpdate"')
      return BillingUpdate_possibleTypes.includes(obj.__typename)
    }
    


    const CalendarChannel_possibleTypes: string[] = ['CalendarChannel']
    export const isCalendarChannel = (obj?: { __typename?: any } | null): obj is CalendarChannel => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCalendarChannel"')
      return CalendarChannel_possibleTypes.includes(obj.__typename)
    }
    


    const CalendarConfiguration_possibleTypes: string[] = ['CalendarConfiguration']
    export const isCalendarConfiguration = (obj?: { __typename?: any } | null): obj is CalendarConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCalendarConfiguration"')
      return CalendarConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const CallRecordingSummaryConfiguration_possibleTypes: string[] = ['CallRecordingSummaryConfiguration']
    export const isCallRecordingSummaryConfiguration = (obj?: { __typename?: any } | null): obj is CallRecordingSummaryConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCallRecordingSummaryConfiguration"')
      return CallRecordingSummaryConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const CallRecordingTranscriptConfiguration_possibleTypes: string[] = ['CallRecordingTranscriptConfiguration']
    export const isCallRecordingTranscriptConfiguration = (obj?: { __typename?: any } | null): obj is CallRecordingTranscriptConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCallRecordingTranscriptConfiguration"')
      return CallRecordingTranscriptConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const CampaignAudiencePreviewDTO_possibleTypes: string[] = ['CampaignAudiencePreviewDTO']
    export const isCampaignAudiencePreviewDTO = (obj?: { __typename?: any } | null): obj is CampaignAudiencePreviewDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCampaignAudiencePreviewDTO"')
      return CampaignAudiencePreviewDTO_possibleTypes.includes(obj.__typename)
    }
    


    const CancelMessageCampaignOutputDTO_possibleTypes: string[] = ['CancelMessageCampaignOutputDTO']
    export const isCancelMessageCampaignOutputDTO = (obj?: { __typename?: any } | null): obj is CancelMessageCampaignOutputDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCancelMessageCampaignOutputDTO"')
      return CancelMessageCampaignOutputDTO_possibleTypes.includes(obj.__typename)
    }
    


    const Captcha_possibleTypes: string[] = ['Captcha']
    export const isCaptcha = (obj?: { __typename?: any } | null): obj is Captcha => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCaptcha"')
      return Captcha_possibleTypes.includes(obj.__typename)
    }
    


    const ChannelSyncSuccess_possibleTypes: string[] = ['ChannelSyncSuccess']
    export const isChannelSyncSuccess = (obj?: { __typename?: any } | null): obj is ChannelSyncSuccess => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isChannelSyncSuccess"')
      return ChannelSyncSuccess_possibleTypes.includes(obj.__typename)
    }
    


    const ChatConfiguration_possibleTypes: string[] = ['ChatConfiguration']
    export const isChatConfiguration = (obj?: { __typename?: any } | null): obj is ChatConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isChatConfiguration"')
      return ChatConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const ChatStreamCatchupChunks_possibleTypes: string[] = ['ChatStreamCatchupChunks']
    export const isChatStreamCatchupChunks = (obj?: { __typename?: any } | null): obj is ChatStreamCatchupChunks => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isChatStreamCatchupChunks"')
      return ChatStreamCatchupChunks_possibleTypes.includes(obj.__typename)
    }
    


    const ChatStreamError_possibleTypes: string[] = ['ChatStreamError']
    export const isChatStreamError = (obj?: { __typename?: any } | null): obj is ChatStreamError => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isChatStreamError"')
      return ChatStreamError_possibleTypes.includes(obj.__typename)
    }
    


    const ChatThreadsConfiguration_possibleTypes: string[] = ['ChatThreadsConfiguration']
    export const isChatThreadsConfiguration = (obj?: { __typename?: any } | null): obj is ChatThreadsConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isChatThreadsConfiguration"')
      return ChatThreadsConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const CheckUserExist_possibleTypes: string[] = ['CheckUserExist']
    export const isCheckUserExist = (obj?: { __typename?: any } | null): obj is CheckUserExist => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCheckUserExist"')
      return CheckUserExist_possibleTypes.includes(obj.__typename)
    }
    


    const ClaimableApplicationRegistration_possibleTypes: string[] = ['ClaimableApplicationRegistration']
    export const isClaimableApplicationRegistration = (obj?: { __typename?: any } | null): obj is ClaimableApplicationRegistration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isClaimableApplicationRegistration"')
      return ClaimableApplicationRegistration_possibleTypes.includes(obj.__typename)
    }
    


    const ClientAiEvaluationModelConfig_possibleTypes: string[] = ['ClientAiEvaluationModelConfig']
    export const isClientAiEvaluationModelConfig = (obj?: { __typename?: any } | null): obj is ClientAiEvaluationModelConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isClientAiEvaluationModelConfig"')
      return ClientAiEvaluationModelConfig_possibleTypes.includes(obj.__typename)
    }
    


    const ClientAiModelConfig_possibleTypes: string[] = ['ClientAiModelConfig']
    export const isClientAiModelConfig = (obj?: { __typename?: any } | null): obj is ClientAiModelConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isClientAiModelConfig"')
      return ClientAiModelConfig_possibleTypes.includes(obj.__typename)
    }
    


    const ClientAiModelTierConfig_possibleTypes: string[] = ['ClientAiModelTierConfig']
    export const isClientAiModelTierConfig = (obj?: { __typename?: any } | null): obj is ClientAiModelTierConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isClientAiModelTierConfig"')
      return ClientAiModelTierConfig_possibleTypes.includes(obj.__typename)
    }
    


    const ClientConfig_possibleTypes: string[] = ['ClientConfig']
    export const isClientConfig = (obj?: { __typename?: any } | null): obj is ClientConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isClientConfig"')
      return ClientConfig_possibleTypes.includes(obj.__typename)
    }
    


    const ClientConfigMaintenanceMode_possibleTypes: string[] = ['ClientConfigMaintenanceMode']
    export const isClientConfigMaintenanceMode = (obj?: { __typename?: any } | null): obj is ClientConfigMaintenanceMode => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isClientConfigMaintenanceMode"')
      return ClientConfigMaintenanceMode_possibleTypes.includes(obj.__typename)
    }
    


    const CollectionHash_possibleTypes: string[] = ['CollectionHash']
    export const isCollectionHash = (obj?: { __typename?: any } | null): obj is CollectionHash => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCollectionHash"')
      return CollectionHash_possibleTypes.includes(obj.__typename)
    }
    


    const CommandMenuItem_possibleTypes: string[] = ['CommandMenuItem']
    export const isCommandMenuItem = (obj?: { __typename?: any } | null): obj is CommandMenuItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCommandMenuItem"')
      return CommandMenuItem_possibleTypes.includes(obj.__typename)
    }
    


    const CommandMenuItemPayload_possibleTypes: string[] = ['ObjectMetadataCommandMenuItemPayload','PathCommandMenuItemPayload']
    export const isCommandMenuItemPayload = (obj?: { __typename?: any } | null): obj is CommandMenuItemPayload => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCommandMenuItemPayload"')
      return CommandMenuItemPayload_possibleTypes.includes(obj.__typename)
    }
    


    const CompleteApplicationFileUploadsResult_possibleTypes: string[] = ['CompleteApplicationFileUploadsResult']
    export const isCompleteApplicationFileUploadsResult = (obj?: { __typename?: any } | null): obj is CompleteApplicationFileUploadsResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCompleteApplicationFileUploadsResult"')
      return CompleteApplicationFileUploadsResult_possibleTypes.includes(obj.__typename)
    }
    


    const ConnectedAccountPublicDTO_possibleTypes: string[] = ['ConnectedAccountPublicDTO']
    export const isConnectedAccountPublicDTO = (obj?: { __typename?: any } | null): obj is ConnectedAccountPublicDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConnectedAccountPublicDTO"')
      return ConnectedAccountPublicDTO_possibleTypes.includes(obj.__typename)
    }
    


    const ConnectedImapSmtpCaldavAccount_possibleTypes: string[] = ['ConnectedImapSmtpCaldavAccount']
    export const isConnectedImapSmtpCaldavAccount = (obj?: { __typename?: any } | null): obj is ConnectedImapSmtpCaldavAccount => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConnectedImapSmtpCaldavAccount"')
      return ConnectedImapSmtpCaldavAccount_possibleTypes.includes(obj.__typename)
    }
    


    const CreateApplicationFileUploadsResult_possibleTypes: string[] = ['CreateApplicationFileUploadsResult']
    export const isCreateApplicationFileUploadsResult = (obj?: { __typename?: any } | null): obj is CreateApplicationFileUploadsResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCreateApplicationFileUploadsResult"')
      return CreateApplicationFileUploadsResult_possibleTypes.includes(obj.__typename)
    }
    


    const CreateApplicationRegistration_possibleTypes: string[] = ['CreateApplicationRegistration']
    export const isCreateApplicationRegistration = (obj?: { __typename?: any } | null): obj is CreateApplicationRegistration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCreateApplicationRegistration"')
      return CreateApplicationRegistration_possibleTypes.includes(obj.__typename)
    }
    


    const CreateCalendarEventOutput_possibleTypes: string[] = ['CreateCalendarEventOutput']
    export const isCreateCalendarEventOutput = (obj?: { __typename?: any } | null): obj is CreateCalendarEventOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCreateCalendarEventOutput"')
      return CreateCalendarEventOutput_possibleTypes.includes(obj.__typename)
    }
    


    const CreateEmailGroupChannelOutput_possibleTypes: string[] = ['CreateEmailGroupChannelOutput']
    export const isCreateEmailGroupChannelOutput = (obj?: { __typename?: any } | null): obj is CreateEmailGroupChannelOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCreateEmailGroupChannelOutput"')
      return CreateEmailGroupChannelOutput_possibleTypes.includes(obj.__typename)
    }
    


    const DeleteSso_possibleTypes: string[] = ['DeleteSso']
    export const isDeleteSso = (obj?: { __typename?: any } | null): obj is DeleteSso => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDeleteSso"')
      return DeleteSso_possibleTypes.includes(obj.__typename)
    }
    


    const DeleteTwoFactorAuthenticationMethod_possibleTypes: string[] = ['DeleteTwoFactorAuthenticationMethod']
    export const isDeleteTwoFactorAuthenticationMethod = (obj?: { __typename?: any } | null): obj is DeleteTwoFactorAuthenticationMethod => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDeleteTwoFactorAuthenticationMethod"')
      return DeleteTwoFactorAuthenticationMethod_possibleTypes.includes(obj.__typename)
    }
    


    const DeletedWorkspaceMember_possibleTypes: string[] = ['DeletedWorkspaceMember']
    export const isDeletedWorkspaceMember = (obj?: { __typename?: any } | null): obj is DeletedWorkspaceMember => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDeletedWorkspaceMember"')
      return DeletedWorkspaceMember_possibleTypes.includes(obj.__typename)
    }
    


    const DevelopmentApplication_possibleTypes: string[] = ['DevelopmentApplication']
    export const isDevelopmentApplication = (obj?: { __typename?: any } | null): obj is DevelopmentApplication => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDevelopmentApplication"')
      return DevelopmentApplication_possibleTypes.includes(obj.__typename)
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
    


    const DuplicatedDashboard_possibleTypes: string[] = ['DuplicatedDashboard']
    export const isDuplicatedDashboard = (obj?: { __typename?: any } | null): obj is DuplicatedDashboard => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDuplicatedDashboard"')
      return DuplicatedDashboard_possibleTypes.includes(obj.__typename)
    }
    


    const DuplicatedMessageList_possibleTypes: string[] = ['DuplicatedMessageList']
    export const isDuplicatedMessageList = (obj?: { __typename?: any } | null): obj is DuplicatedMessageList => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDuplicatedMessageList"')
      return DuplicatedMessageList_possibleTypes.includes(obj.__typename)
    }
    


    const EditSso_possibleTypes: string[] = ['EditSso']
    export const isEditSso = (obj?: { __typename?: any } | null): obj is EditSso => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEditSso"')
      return EditSso_possibleTypes.includes(obj.__typename)
    }
    


    const EmailPasswordResetLink_possibleTypes: string[] = ['EmailPasswordResetLink']
    export const isEmailPasswordResetLink = (obj?: { __typename?: any } | null): obj is EmailPasswordResetLink => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEmailPasswordResetLink"')
      return EmailPasswordResetLink_possibleTypes.includes(obj.__typename)
    }
    


    const EmailThreadConfiguration_possibleTypes: string[] = ['EmailThreadConfiguration']
    export const isEmailThreadConfiguration = (obj?: { __typename?: any } | null): obj is EmailThreadConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEmailThreadConfiguration"')
      return EmailThreadConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const EmailingDomain_possibleTypes: string[] = ['EmailingDomain']
    export const isEmailingDomain = (obj?: { __typename?: any } | null): obj is EmailingDomain => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEmailingDomain"')
      return EmailingDomain_possibleTypes.includes(obj.__typename)
    }
    


    const EmailsConfiguration_possibleTypes: string[] = ['EmailsConfiguration']
    export const isEmailsConfiguration = (obj?: { __typename?: any } | null): obj is EmailsConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEmailsConfiguration"')
      return EmailsConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const EnqueueJobResult_possibleTypes: string[] = ['EnqueueJobResult']
    export const isEnqueueJobResult = (obj?: { __typename?: any } | null): obj is EnqueueJobResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEnqueueJobResult"')
      return EnqueueJobResult_possibleTypes.includes(obj.__typename)
    }
    


    const EnqueueJobsResult_possibleTypes: string[] = ['EnqueueJobsResult']
    export const isEnqueueJobsResult = (obj?: { __typename?: any } | null): obj is EnqueueJobsResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEnqueueJobsResult"')
      return EnqueueJobsResult_possibleTypes.includes(obj.__typename)
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
    


    const EventLogRecord_possibleTypes: string[] = ['EventLogRecord']
    export const isEventLogRecord = (obj?: { __typename?: any } | null): obj is EventLogRecord => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEventLogRecord"')
      return EventLogRecord_possibleTypes.includes(obj.__typename)
    }
    


    const EventSubscription_possibleTypes: string[] = ['EventSubscription']
    export const isEventSubscription = (obj?: { __typename?: any } | null): obj is EventSubscription => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEventSubscription"')
      return EventSubscription_possibleTypes.includes(obj.__typename)
    }
    


    const FeatureFlag_possibleTypes: string[] = ['FeatureFlag']
    export const isFeatureFlag = (obj?: { __typename?: any } | null): obj is FeatureFlag => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFeatureFlag"')
      return FeatureFlag_possibleTypes.includes(obj.__typename)
    }
    


    const Field_possibleTypes: string[] = ['Field']
    export const isField = (obj?: { __typename?: any } | null): obj is Field => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isField"')
      return Field_possibleTypes.includes(obj.__typename)
    }
    


    const FieldConfiguration_possibleTypes: string[] = ['FieldConfiguration']
    export const isFieldConfiguration = (obj?: { __typename?: any } | null): obj is FieldConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFieldConfiguration"')
      return FieldConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const FieldConnection_possibleTypes: string[] = ['FieldConnection']
    export const isFieldConnection = (obj?: { __typename?: any } | null): obj is FieldConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFieldConnection"')
      return FieldConnection_possibleTypes.includes(obj.__typename)
    }
    


    const FieldEdge_possibleTypes: string[] = ['FieldEdge']
    export const isFieldEdge = (obj?: { __typename?: any } | null): obj is FieldEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFieldEdge"')
      return FieldEdge_possibleTypes.includes(obj.__typename)
    }
    


    const FieldPermission_possibleTypes: string[] = ['FieldPermission']
    export const isFieldPermission = (obj?: { __typename?: any } | null): obj is FieldPermission => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFieldPermission"')
      return FieldPermission_possibleTypes.includes(obj.__typename)
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
    


    const File_possibleTypes: string[] = ['File']
    export const isFile = (obj?: { __typename?: any } | null): obj is File => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFile"')
      return File_possibleTypes.includes(obj.__typename)
    }
    


    const FileUploadTarget_possibleTypes: string[] = ['FileUploadTarget']
    export const isFileUploadTarget = (obj?: { __typename?: any } | null): obj is FileUploadTarget => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFileUploadTarget"')
      return FileUploadTarget_possibleTypes.includes(obj.__typename)
    }
    


    const FileWithSignedUrl_possibleTypes: string[] = ['FileWithSignedUrl']
    export const isFileWithSignedUrl = (obj?: { __typename?: any } | null): obj is FileWithSignedUrl => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFileWithSignedUrl"')
      return FileWithSignedUrl_possibleTypes.includes(obj.__typename)
    }
    


    const FilesConfiguration_possibleTypes: string[] = ['FilesConfiguration']
    export const isFilesConfiguration = (obj?: { __typename?: any } | null): obj is FilesConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFilesConfiguration"')
      return FilesConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const FindAvailableSSOIDP_possibleTypes: string[] = ['FindAvailableSSOIDP']
    export const isFindAvailableSSOIDP = (obj?: { __typename?: any } | null): obj is FindAvailableSSOIDP => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFindAvailableSSOIDP"')
      return FindAvailableSSOIDP_possibleTypes.includes(obj.__typename)
    }
    


    const FormFieldConfiguration_possibleTypes: string[] = ['FormFieldConfiguration']
    export const isFormFieldConfiguration = (obj?: { __typename?: any } | null): obj is FormFieldConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFormFieldConfiguration"')
      return FormFieldConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const FrontComponent_possibleTypes: string[] = ['FrontComponent']
    export const isFrontComponent = (obj?: { __typename?: any } | null): obj is FrontComponent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFrontComponent"')
      return FrontComponent_possibleTypes.includes(obj.__typename)
    }
    


    const FrontComponentConfiguration_possibleTypes: string[] = ['FrontComponentConfiguration']
    export const isFrontComponentConfiguration = (obj?: { __typename?: any } | null): obj is FrontComponentConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFrontComponentConfiguration"')
      return FrontComponentConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const FullName_possibleTypes: string[] = ['FullName']
    export const isFullName = (obj?: { __typename?: any } | null): obj is FullName => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFullName"')
      return FullName_possibleTypes.includes(obj.__typename)
    }
    


    const GetAuthorizationUrlForSSO_possibleTypes: string[] = ['GetAuthorizationUrlForSSO']
    export const isGetAuthorizationUrlForSSO = (obj?: { __typename?: any } | null): obj is GetAuthorizationUrlForSSO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isGetAuthorizationUrlForSSO"')
      return GetAuthorizationUrlForSSO_possibleTypes.includes(obj.__typename)
    }
    


    const GridPosition_possibleTypes: string[] = ['GridPosition']
    export const isGridPosition = (obj?: { __typename?: any } | null): obj is GridPosition => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isGridPosition"')
      return GridPosition_possibleTypes.includes(obj.__typename)
    }
    


    const IframeConfiguration_possibleTypes: string[] = ['IframeConfiguration']
    export const isIframeConfiguration = (obj?: { __typename?: any } | null): obj is IframeConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isIframeConfiguration"')
      return IframeConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const ImapSmtpCaldavConnectionSuccess_possibleTypes: string[] = ['ImapSmtpCaldavConnectionSuccess']
    export const isImapSmtpCaldavConnectionSuccess = (obj?: { __typename?: any } | null): obj is ImapSmtpCaldavConnectionSuccess => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isImapSmtpCaldavConnectionSuccess"')
      return ImapSmtpCaldavConnectionSuccess_possibleTypes.includes(obj.__typename)
    }
    


    const ImapSmtpCaldavPublicConnectionParameters_possibleTypes: string[] = ['ImapSmtpCaldavPublicConnectionParameters']
    export const isImapSmtpCaldavPublicConnectionParameters = (obj?: { __typename?: any } | null): obj is ImapSmtpCaldavPublicConnectionParameters => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isImapSmtpCaldavPublicConnectionParameters"')
      return ImapSmtpCaldavPublicConnectionParameters_possibleTypes.includes(obj.__typename)
    }
    


    const ImapSmtpCaldavPublicConnectionParams_possibleTypes: string[] = ['ImapSmtpCaldavPublicConnectionParams']
    export const isImapSmtpCaldavPublicConnectionParams = (obj?: { __typename?: any } | null): obj is ImapSmtpCaldavPublicConnectionParams => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isImapSmtpCaldavPublicConnectionParams"')
      return ImapSmtpCaldavPublicConnectionParams_possibleTypes.includes(obj.__typename)
    }
    


    const Impersonate_possibleTypes: string[] = ['Impersonate']
    export const isImpersonate = (obj?: { __typename?: any } | null): obj is Impersonate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isImpersonate"')
      return Impersonate_possibleTypes.includes(obj.__typename)
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
    


    const IndexField_possibleTypes: string[] = ['IndexField']
    export const isIndexField = (obj?: { __typename?: any } | null): obj is IndexField => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isIndexField"')
      return IndexField_possibleTypes.includes(obj.__typename)
    }
    


    const IngestAppMessagesOutput_possibleTypes: string[] = ['IngestAppMessagesOutput']
    export const isIngestAppMessagesOutput = (obj?: { __typename?: any } | null): obj is IngestAppMessagesOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isIngestAppMessagesOutput"')
      return IngestAppMessagesOutput_possibleTypes.includes(obj.__typename)
    }
    


    const IngestedAppMessage_possibleTypes: string[] = ['IngestedAppMessage']
    export const isIngestedAppMessage = (obj?: { __typename?: any } | null): obj is IngestedAppMessage => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isIngestedAppMessage"')
      return IngestedAppMessage_possibleTypes.includes(obj.__typename)
    }
    


    const InitiateTwoFactorAuthenticationProvisioning_possibleTypes: string[] = ['InitiateTwoFactorAuthenticationProvisioning']
    export const isInitiateTwoFactorAuthenticationProvisioning = (obj?: { __typename?: any } | null): obj is InitiateTwoFactorAuthenticationProvisioning => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isInitiateTwoFactorAuthenticationProvisioning"')
      return InitiateTwoFactorAuthenticationProvisioning_possibleTypes.includes(obj.__typename)
    }
    


    const InvalidatePassword_possibleTypes: string[] = ['InvalidatePassword']
    export const isInvalidatePassword = (obj?: { __typename?: any } | null): obj is InvalidatePassword => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isInvalidatePassword"')
      return InvalidatePassword_possibleTypes.includes(obj.__typename)
    }
    


    const InviteSuggestion_possibleTypes: string[] = ['InviteSuggestion']
    export const isInviteSuggestion = (obj?: { __typename?: any } | null): obj is InviteSuggestion => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isInviteSuggestion"')
      return InviteSuggestion_possibleTypes.includes(obj.__typename)
    }
    


    const JobStatus_possibleTypes: string[] = ['JobStatus']
    export const isJobStatus = (obj?: { __typename?: any } | null): obj is JobStatus => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isJobStatus"')
      return JobStatus_possibleTypes.includes(obj.__typename)
    }
    


    const LineChartConfiguration_possibleTypes: string[] = ['LineChartConfiguration']
    export const isLineChartConfiguration = (obj?: { __typename?: any } | null): obj is LineChartConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLineChartConfiguration"')
      return LineChartConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const LineChartData_possibleTypes: string[] = ['LineChartData']
    export const isLineChartData = (obj?: { __typename?: any } | null): obj is LineChartData => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLineChartData"')
      return LineChartData_possibleTypes.includes(obj.__typename)
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
    


    const Location_possibleTypes: string[] = ['Location']
    export const isLocation = (obj?: { __typename?: any } | null): obj is Location => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLocation"')
      return Location_possibleTypes.includes(obj.__typename)
    }
    


    const LogicFunction_possibleTypes: string[] = ['LogicFunction']
    export const isLogicFunction = (obj?: { __typename?: any } | null): obj is LogicFunction => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLogicFunction"')
      return LogicFunction_possibleTypes.includes(obj.__typename)
    }
    


    const LogicFunctionExecutionResult_possibleTypes: string[] = ['LogicFunctionExecutionResult']
    export const isLogicFunctionExecutionResult = (obj?: { __typename?: any } | null): obj is LogicFunctionExecutionResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLogicFunctionExecutionResult"')
      return LogicFunctionExecutionResult_possibleTypes.includes(obj.__typename)
    }
    


    const LogicFunctionLogs_possibleTypes: string[] = ['LogicFunctionLogs']
    export const isLogicFunctionLogs = (obj?: { __typename?: any } | null): obj is LogicFunctionLogs => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLogicFunctionLogs"')
      return LogicFunctionLogs_possibleTypes.includes(obj.__typename)
    }
    


    const LoginToken_possibleTypes: string[] = ['LoginToken']
    export const isLoginToken = (obj?: { __typename?: any } | null): obj is LoginToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLoginToken"')
      return LoginToken_possibleTypes.includes(obj.__typename)
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
    


    const MarketplaceAppRole_possibleTypes: string[] = ['MarketplaceAppRole']
    export const isMarketplaceAppRole = (obj?: { __typename?: any } | null): obj is MarketplaceAppRole => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMarketplaceAppRole"')
      return MarketplaceAppRole_possibleTypes.includes(obj.__typename)
    }
    


    const MarketplaceAppRoleFieldPermission_possibleTypes: string[] = ['MarketplaceAppRoleFieldPermission']
    export const isMarketplaceAppRoleFieldPermission = (obj?: { __typename?: any } | null): obj is MarketplaceAppRoleFieldPermission => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMarketplaceAppRoleFieldPermission"')
      return MarketplaceAppRoleFieldPermission_possibleTypes.includes(obj.__typename)
    }
    


    const MarketplaceAppRoleObjectPermission_possibleTypes: string[] = ['MarketplaceAppRoleObjectPermission']
    export const isMarketplaceAppRoleObjectPermission = (obj?: { __typename?: any } | null): obj is MarketplaceAppRoleObjectPermission => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMarketplaceAppRoleObjectPermission"')
      return MarketplaceAppRoleObjectPermission_possibleTypes.includes(obj.__typename)
    }
    


    const MessageCampaignBodyConfiguration_possibleTypes: string[] = ['MessageCampaignBodyConfiguration']
    export const isMessageCampaignBodyConfiguration = (obj?: { __typename?: any } | null): obj is MessageCampaignBodyConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageCampaignBodyConfiguration"')
      return MessageCampaignBodyConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const MessageCampaignDetailsConfiguration_possibleTypes: string[] = ['MessageCampaignDetailsConfiguration']
    export const isMessageCampaignDetailsConfiguration = (obj?: { __typename?: any } | null): obj is MessageCampaignDetailsConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageCampaignDetailsConfiguration"')
      return MessageCampaignDetailsConfiguration_possibleTypes.includes(obj.__typename)
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
    


    const MessageSuppression_possibleTypes: string[] = ['MessageSuppression']
    export const isMessageSuppression = (obj?: { __typename?: any } | null): obj is MessageSuppression => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageSuppression"')
      return MessageSuppression_possibleTypes.includes(obj.__typename)
    }
    


    const MessageSuppressionList_possibleTypes: string[] = ['MessageSuppressionList']
    export const isMessageSuppressionList = (obj?: { __typename?: any } | null): obj is MessageSuppressionList => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageSuppressionList"')
      return MessageSuppressionList_possibleTypes.includes(obj.__typename)
    }
    


    const MetadataEvent_possibleTypes: string[] = ['MetadataEvent']
    export const isMetadataEvent = (obj?: { __typename?: any } | null): obj is MetadataEvent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMetadataEvent"')
      return MetadataEvent_possibleTypes.includes(obj.__typename)
    }
    


    const MetadataTranslation_possibleTypes: string[] = ['MetadataTranslation']
    export const isMetadataTranslation = (obj?: { __typename?: any } | null): obj is MetadataTranslation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMetadataTranslation"')
      return MetadataTranslation_possibleTypes.includes(obj.__typename)
    }
    


    const MinimalMetadata_possibleTypes: string[] = ['MinimalMetadata']
    export const isMinimalMetadata = (obj?: { __typename?: any } | null): obj is MinimalMetadata => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMinimalMetadata"')
      return MinimalMetadata_possibleTypes.includes(obj.__typename)
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
    


    const Mutation_possibleTypes: string[] = ['Mutation']
    export const isMutation = (obj?: { __typename?: any } | null): obj is Mutation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMutation"')
      return Mutation_possibleTypes.includes(obj.__typename)
    }
    


    const NativeModelCapabilities_possibleTypes: string[] = ['NativeModelCapabilities']
    export const isNativeModelCapabilities = (obj?: { __typename?: any } | null): obj is NativeModelCapabilities => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNativeModelCapabilities"')
      return NativeModelCapabilities_possibleTypes.includes(obj.__typename)
    }
    


    const NavigationMenuItem_possibleTypes: string[] = ['NavigationMenuItem']
    export const isNavigationMenuItem = (obj?: { __typename?: any } | null): obj is NavigationMenuItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNavigationMenuItem"')
      return NavigationMenuItem_possibleTypes.includes(obj.__typename)
    }
    


    const NotesConfiguration_possibleTypes: string[] = ['NotesConfiguration']
    export const isNotesConfiguration = (obj?: { __typename?: any } | null): obj is NotesConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNotesConfiguration"')
      return NotesConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const Object_possibleTypes: string[] = ['Object']
    export const isObject = (obj?: { __typename?: any } | null): obj is Object => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObject"')
      return Object_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectConnection_possibleTypes: string[] = ['ObjectConnection']
    export const isObjectConnection = (obj?: { __typename?: any } | null): obj is ObjectConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectConnection"')
      return ObjectConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectEdge_possibleTypes: string[] = ['ObjectEdge']
    export const isObjectEdge = (obj?: { __typename?: any } | null): obj is ObjectEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectEdge"')
      return ObjectEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectFieldsConnection_possibleTypes: string[] = ['ObjectFieldsConnection']
    export const isObjectFieldsConnection = (obj?: { __typename?: any } | null): obj is ObjectFieldsConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectFieldsConnection"')
      return ObjectFieldsConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectIndexMetadatasConnection_possibleTypes: string[] = ['ObjectIndexMetadatasConnection']
    export const isObjectIndexMetadatasConnection = (obj?: { __typename?: any } | null): obj is ObjectIndexMetadatasConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectIndexMetadatasConnection"')
      return ObjectIndexMetadatasConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectMetadataCommandMenuItemPayload_possibleTypes: string[] = ['ObjectMetadataCommandMenuItemPayload']
    export const isObjectMetadataCommandMenuItemPayload = (obj?: { __typename?: any } | null): obj is ObjectMetadataCommandMenuItemPayload => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectMetadataCommandMenuItemPayload"')
      return ObjectMetadataCommandMenuItemPayload_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectPermission_possibleTypes: string[] = ['ObjectPermission']
    export const isObjectPermission = (obj?: { __typename?: any } | null): obj is ObjectPermission => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectPermission"')
      return ObjectPermission_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectRecordCount_possibleTypes: string[] = ['ObjectRecordCount']
    export const isObjectRecordCount = (obj?: { __typename?: any } | null): obj is ObjectRecordCount => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectRecordCount"')
      return ObjectRecordCount_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectRecordEvent_possibleTypes: string[] = ['ObjectRecordEvent']
    export const isObjectRecordEvent = (obj?: { __typename?: any } | null): obj is ObjectRecordEvent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectRecordEvent"')
      return ObjectRecordEvent_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectRecordEventProperties_possibleTypes: string[] = ['ObjectRecordEventProperties']
    export const isObjectRecordEventProperties = (obj?: { __typename?: any } | null): obj is ObjectRecordEventProperties => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectRecordEventProperties"')
      return ObjectRecordEventProperties_possibleTypes.includes(obj.__typename)
    }
    


    const ObjectRecordEventWithQueryIds_possibleTypes: string[] = ['ObjectRecordEventWithQueryIds']
    export const isObjectRecordEventWithQueryIds = (obj?: { __typename?: any } | null): obj is ObjectRecordEventWithQueryIds => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectRecordEventWithQueryIds"')
      return ObjectRecordEventWithQueryIds_possibleTypes.includes(obj.__typename)
    }
    


    const OnboardingStepNavigation_possibleTypes: string[] = ['OnboardingStepNavigation']
    export const isOnboardingStepNavigation = (obj?: { __typename?: any } | null): obj is OnboardingStepNavigation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOnboardingStepNavigation"')
      return OnboardingStepNavigation_possibleTypes.includes(obj.__typename)
    }
    


    const OnboardingStepSuccess_possibleTypes: string[] = ['OnboardingStepSuccess']
    export const isOnboardingStepSuccess = (obj?: { __typename?: any } | null): obj is OnboardingStepSuccess => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOnboardingStepSuccess"')
      return OnboardingStepSuccess_possibleTypes.includes(obj.__typename)
    }
    


    const PageInfo_possibleTypes: string[] = ['PageInfo']
    export const isPageInfo = (obj?: { __typename?: any } | null): obj is PageInfo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageInfo"')
      return PageInfo_possibleTypes.includes(obj.__typename)
    }
    


    const PageLayout_possibleTypes: string[] = ['PageLayout']
    export const isPageLayout = (obj?: { __typename?: any } | null): obj is PageLayout => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageLayout"')
      return PageLayout_possibleTypes.includes(obj.__typename)
    }
    


    const PageLayoutTab_possibleTypes: string[] = ['PageLayoutTab']
    export const isPageLayoutTab = (obj?: { __typename?: any } | null): obj is PageLayoutTab => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageLayoutTab"')
      return PageLayoutTab_possibleTypes.includes(obj.__typename)
    }
    


    const PageLayoutWidget_possibleTypes: string[] = ['PageLayoutWidget']
    export const isPageLayoutWidget = (obj?: { __typename?: any } | null): obj is PageLayoutWidget => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageLayoutWidget"')
      return PageLayoutWidget_possibleTypes.includes(obj.__typename)
    }
    


    const PageLayoutWidgetCanvasPosition_possibleTypes: string[] = ['PageLayoutWidgetCanvasPosition']
    export const isPageLayoutWidgetCanvasPosition = (obj?: { __typename?: any } | null): obj is PageLayoutWidgetCanvasPosition => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageLayoutWidgetCanvasPosition"')
      return PageLayoutWidgetCanvasPosition_possibleTypes.includes(obj.__typename)
    }
    


    const PageLayoutWidgetGridPosition_possibleTypes: string[] = ['PageLayoutWidgetGridPosition']
    export const isPageLayoutWidgetGridPosition = (obj?: { __typename?: any } | null): obj is PageLayoutWidgetGridPosition => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageLayoutWidgetGridPosition"')
      return PageLayoutWidgetGridPosition_possibleTypes.includes(obj.__typename)
    }
    


    const PageLayoutWidgetPosition_possibleTypes: string[] = ['PageLayoutWidgetCanvasPosition','PageLayoutWidgetGridPosition','PageLayoutWidgetVerticalListPosition']
    export const isPageLayoutWidgetPosition = (obj?: { __typename?: any } | null): obj is PageLayoutWidgetPosition => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageLayoutWidgetPosition"')
      return PageLayoutWidgetPosition_possibleTypes.includes(obj.__typename)
    }
    


    const PageLayoutWidgetVerticalListPosition_possibleTypes: string[] = ['PageLayoutWidgetVerticalListPosition']
    export const isPageLayoutWidgetVerticalListPosition = (obj?: { __typename?: any } | null): obj is PageLayoutWidgetVerticalListPosition => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageLayoutWidgetVerticalListPosition"')
      return PageLayoutWidgetVerticalListPosition_possibleTypes.includes(obj.__typename)
    }
    


    const PathCommandMenuItemPayload_possibleTypes: string[] = ['PathCommandMenuItemPayload']
    export const isPathCommandMenuItemPayload = (obj?: { __typename?: any } | null): obj is PathCommandMenuItemPayload => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPathCommandMenuItemPayload"')
      return PathCommandMenuItemPayload_possibleTypes.includes(obj.__typename)
    }
    


    const PermissionFlag_possibleTypes: string[] = ['PermissionFlag']
    export const isPermissionFlag = (obj?: { __typename?: any } | null): obj is PermissionFlag => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPermissionFlag"')
      return PermissionFlag_possibleTypes.includes(obj.__typename)
    }
    


    const PieChartConfiguration_possibleTypes: string[] = ['PieChartConfiguration']
    export const isPieChartConfiguration = (obj?: { __typename?: any } | null): obj is PieChartConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPieChartConfiguration"')
      return PieChartConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const PieChartData_possibleTypes: string[] = ['PieChartData']
    export const isPieChartData = (obj?: { __typename?: any } | null): obj is PieChartData => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPieChartData"')
      return PieChartData_possibleTypes.includes(obj.__typename)
    }
    


    const PieChartDataItem_possibleTypes: string[] = ['PieChartDataItem']
    export const isPieChartDataItem = (obj?: { __typename?: any } | null): obj is PieChartDataItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPieChartDataItem"')
      return PieChartDataItem_possibleTypes.includes(obj.__typename)
    }
    


    const PlaceDetailsResult_possibleTypes: string[] = ['PlaceDetailsResult']
    export const isPlaceDetailsResult = (obj?: { __typename?: any } | null): obj is PlaceDetailsResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPlaceDetailsResult"')
      return PlaceDetailsResult_possibleTypes.includes(obj.__typename)
    }
    


    const PublicApplicationRegistration_possibleTypes: string[] = ['PublicApplicationRegistration']
    export const isPublicApplicationRegistration = (obj?: { __typename?: any } | null): obj is PublicApplicationRegistration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicApplicationRegistration"')
      return PublicApplicationRegistration_possibleTypes.includes(obj.__typename)
    }
    


    const PublicConnectionParametersOutput_possibleTypes: string[] = ['PublicConnectionParametersOutput']
    export const isPublicConnectionParametersOutput = (obj?: { __typename?: any } | null): obj is PublicConnectionParametersOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicConnectionParametersOutput"')
      return PublicConnectionParametersOutput_possibleTypes.includes(obj.__typename)
    }
    


    const PublicDomain_possibleTypes: string[] = ['PublicDomain']
    export const isPublicDomain = (obj?: { __typename?: any } | null): obj is PublicDomain => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicDomain"')
      return PublicDomain_possibleTypes.includes(obj.__typename)
    }
    


    const PublicFeatureFlag_possibleTypes: string[] = ['PublicFeatureFlag']
    export const isPublicFeatureFlag = (obj?: { __typename?: any } | null): obj is PublicFeatureFlag => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicFeatureFlag"')
      return PublicFeatureFlag_possibleTypes.includes(obj.__typename)
    }
    


    const PublicFeatureFlagMetadata_possibleTypes: string[] = ['PublicFeatureFlagMetadata']
    export const isPublicFeatureFlagMetadata = (obj?: { __typename?: any } | null): obj is PublicFeatureFlagMetadata => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicFeatureFlagMetadata"')
      return PublicFeatureFlagMetadata_possibleTypes.includes(obj.__typename)
    }
    


    const PublicImapSmtpCaldavConnectionParameters_possibleTypes: string[] = ['PublicImapSmtpCaldavConnectionParameters']
    export const isPublicImapSmtpCaldavConnectionParameters = (obj?: { __typename?: any } | null): obj is PublicImapSmtpCaldavConnectionParameters => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicImapSmtpCaldavConnectionParameters"')
      return PublicImapSmtpCaldavConnectionParameters_possibleTypes.includes(obj.__typename)
    }
    


    const PublicWorkspaceData_possibleTypes: string[] = ['PublicWorkspaceData']
    export const isPublicWorkspaceData = (obj?: { __typename?: any } | null): obj is PublicWorkspaceData => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicWorkspaceData"')
      return PublicWorkspaceData_possibleTypes.includes(obj.__typename)
    }
    


    const PublicWorkspaceDataSummary_possibleTypes: string[] = ['PublicWorkspaceDataSummary']
    export const isPublicWorkspaceDataSummary = (obj?: { __typename?: any } | null): obj is PublicWorkspaceDataSummary => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicWorkspaceDataSummary"')
      return PublicWorkspaceDataSummary_possibleTypes.includes(obj.__typename)
    }
    


    const Query_possibleTypes: string[] = ['Query']
    export const isQuery = (obj?: { __typename?: any } | null): obj is Query => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuery"')
      return Query_possibleTypes.includes(obj.__typename)
    }
    


    const RatioAggregateConfig_possibleTypes: string[] = ['RatioAggregateConfig']
    export const isRatioAggregateConfig = (obj?: { __typename?: any } | null): obj is RatioAggregateConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRatioAggregateConfig"')
      return RatioAggregateConfig_possibleTypes.includes(obj.__typename)
    }
    


    const RecordExport_possibleTypes: string[] = ['RecordExport']
    export const isRecordExport = (obj?: { __typename?: any } | null): obj is RecordExport => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRecordExport"')
      return RecordExport_possibleTypes.includes(obj.__typename)
    }
    


    const RecordIdentifier_possibleTypes: string[] = ['RecordIdentifier']
    export const isRecordIdentifier = (obj?: { __typename?: any } | null): obj is RecordIdentifier => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRecordIdentifier"')
      return RecordIdentifier_possibleTypes.includes(obj.__typename)
    }
    


    const RecordPermissionsDTO_possibleTypes: string[] = ['RecordPermissionsDTO']
    export const isRecordPermissionsDTO = (obj?: { __typename?: any } | null): obj is RecordPermissionsDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRecordPermissionsDTO"')
      return RecordPermissionsDTO_possibleTypes.includes(obj.__typename)
    }
    


    const RecordPermissionsResult_possibleTypes: string[] = ['RecordPermissionsResult']
    export const isRecordPermissionsResult = (obj?: { __typename?: any } | null): obj is RecordPermissionsResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRecordPermissionsResult"')
      return RecordPermissionsResult_possibleTypes.includes(obj.__typename)
    }
    


    const RecordSharingDTO_possibleTypes: string[] = ['RecordSharingDTO']
    export const isRecordSharingDTO = (obj?: { __typename?: any } | null): obj is RecordSharingDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRecordSharingDTO"')
      return RecordSharingDTO_possibleTypes.includes(obj.__typename)
    }
    


    const RecordSharingGrantDTO_possibleTypes: string[] = ['RecordSharingGrantDTO']
    export const isRecordSharingGrantDTO = (obj?: { __typename?: any } | null): obj is RecordSharingGrantDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRecordSharingGrantDTO"')
      return RecordSharingGrantDTO_possibleTypes.includes(obj.__typename)
    }
    


    const RecordSharingRoleDTO_possibleTypes: string[] = ['RecordSharingRoleDTO']
    export const isRecordSharingRoleDTO = (obj?: { __typename?: any } | null): obj is RecordSharingRoleDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRecordSharingRoleDTO"')
      return RecordSharingRoleDTO_possibleTypes.includes(obj.__typename)
    }
    


    const RecordTableConfiguration_possibleTypes: string[] = ['RecordTableConfiguration']
    export const isRecordTableConfiguration = (obj?: { __typename?: any } | null): obj is RecordTableConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRecordTableConfiguration"')
      return RecordTableConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const Relation_possibleTypes: string[] = ['Relation']
    export const isRelation = (obj?: { __typename?: any } | null): obj is Relation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRelation"')
      return Relation_possibleTypes.includes(obj.__typename)
    }
    


    const ResendEmailVerificationToken_possibleTypes: string[] = ['ResendEmailVerificationToken']
    export const isResendEmailVerificationToken = (obj?: { __typename?: any } | null): obj is ResendEmailVerificationToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isResendEmailVerificationToken"')
      return ResendEmailVerificationToken_possibleTypes.includes(obj.__typename)
    }
    


    const RichTextBody_possibleTypes: string[] = ['RichTextBody']
    export const isRichTextBody = (obj?: { __typename?: any } | null): obj is RichTextBody => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRichTextBody"')
      return RichTextBody_possibleTypes.includes(obj.__typename)
    }
    


    const Role_possibleTypes: string[] = ['Role']
    export const isRole = (obj?: { __typename?: any } | null): obj is Role => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRole"')
      return Role_possibleTypes.includes(obj.__typename)
    }
    


    const RolePermissionFlag_possibleTypes: string[] = ['RolePermissionFlag']
    export const isRolePermissionFlag = (obj?: { __typename?: any } | null): obj is RolePermissionFlag => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRolePermissionFlag"')
      return RolePermissionFlag_possibleTypes.includes(obj.__typename)
    }
    


    const RotateClientSecret_possibleTypes: string[] = ['RotateClientSecret']
    export const isRotateClientSecret = (obj?: { __typename?: any } | null): obj is RotateClientSecret => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRotateClientSecret"')
      return RotateClientSecret_possibleTypes.includes(obj.__typename)
    }
    


    const RowLevelPermissionPredicate_possibleTypes: string[] = ['RowLevelPermissionPredicate']
    export const isRowLevelPermissionPredicate = (obj?: { __typename?: any } | null): obj is RowLevelPermissionPredicate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRowLevelPermissionPredicate"')
      return RowLevelPermissionPredicate_possibleTypes.includes(obj.__typename)
    }
    


    const RowLevelPermissionPredicateGroup_possibleTypes: string[] = ['RowLevelPermissionPredicateGroup']
    export const isRowLevelPermissionPredicateGroup = (obj?: { __typename?: any } | null): obj is RowLevelPermissionPredicateGroup => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRowLevelPermissionPredicateGroup"')
      return RowLevelPermissionPredicateGroup_possibleTypes.includes(obj.__typename)
    }
    


    const RunAgentResult_possibleTypes: string[] = ['RunAgentResult']
    export const isRunAgentResult = (obj?: { __typename?: any } | null): obj is RunAgentResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRunAgentResult"')
      return RunAgentResult_possibleTypes.includes(obj.__typename)
    }
    


    const SSOConnection_possibleTypes: string[] = ['SSOConnection']
    export const isSSOConnection = (obj?: { __typename?: any } | null): obj is SSOConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSSOConnection"')
      return SSOConnection_possibleTypes.includes(obj.__typename)
    }
    


    const SSOIdentityProvider_possibleTypes: string[] = ['SSOIdentityProvider']
    export const isSSOIdentityProvider = (obj?: { __typename?: any } | null): obj is SSOIdentityProvider => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSSOIdentityProvider"')
      return SSOIdentityProvider_possibleTypes.includes(obj.__typename)
    }
    


    const SdkClientChecksums_possibleTypes: string[] = ['SdkClientChecksums']
    export const isSdkClientChecksums = (obj?: { __typename?: any } | null): obj is SdkClientChecksums => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSdkClientChecksums"')
      return SdkClientChecksums_possibleTypes.includes(obj.__typename)
    }
    


    const SearchField_possibleTypes: string[] = ['SearchField']
    export const isSearchField = (obj?: { __typename?: any } | null): obj is SearchField => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSearchField"')
      return SearchField_possibleTypes.includes(obj.__typename)
    }
    


    const SendChatMessageResult_possibleTypes: string[] = ['SendChatMessageResult']
    export const isSendChatMessageResult = (obj?: { __typename?: any } | null): obj is SendChatMessageResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSendChatMessageResult"')
      return SendChatMessageResult_possibleTypes.includes(obj.__typename)
    }
    


    const SendEmailOutput_possibleTypes: string[] = ['SendEmailOutput']
    export const isSendEmailOutput = (obj?: { __typename?: any } | null): obj is SendEmailOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSendEmailOutput"')
      return SendEmailOutput_possibleTypes.includes(obj.__typename)
    }
    


    const SendEmailViaDomainOutput_possibleTypes: string[] = ['SendEmailViaDomainOutput']
    export const isSendEmailViaDomainOutput = (obj?: { __typename?: any } | null): obj is SendEmailViaDomainOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSendEmailViaDomainOutput"')
      return SendEmailViaDomainOutput_possibleTypes.includes(obj.__typename)
    }
    


    const SendInboxMessageResult_possibleTypes: string[] = ['SendInboxMessageResult']
    export const isSendInboxMessageResult = (obj?: { __typename?: any } | null): obj is SendInboxMessageResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSendInboxMessageResult"')
      return SendInboxMessageResult_possibleTypes.includes(obj.__typename)
    }
    


    const SendInvitations_possibleTypes: string[] = ['SendInvitations']
    export const isSendInvitations = (obj?: { __typename?: any } | null): obj is SendInvitations => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSendInvitations"')
      return SendInvitations_possibleTypes.includes(obj.__typename)
    }
    


    const SendMessageCampaignOutputDTO_possibleTypes: string[] = ['SendMessageCampaignOutputDTO']
    export const isSendMessageCampaignOutputDTO = (obj?: { __typename?: any } | null): obj is SendMessageCampaignOutputDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSendMessageCampaignOutputDTO"')
      return SendMessageCampaignOutputDTO_possibleTypes.includes(obj.__typename)
    }
    


    const Sentry_possibleTypes: string[] = ['Sentry']
    export const isSentry = (obj?: { __typename?: any } | null): obj is Sentry => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSentry"')
      return Sentry_possibleTypes.includes(obj.__typename)
    }
    


    const SettingsMenuItem_possibleTypes: string[] = ['SettingsMenuItem']
    export const isSettingsMenuItem = (obj?: { __typename?: any } | null): obj is SettingsMenuItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSettingsMenuItem"')
      return SettingsMenuItem_possibleTypes.includes(obj.__typename)
    }
    


    const SetupSso_possibleTypes: string[] = ['SetupSso']
    export const isSetupSso = (obj?: { __typename?: any } | null): obj is SetupSso => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSetupSso"')
      return SetupSso_possibleTypes.includes(obj.__typename)
    }
    


    const SignUp_possibleTypes: string[] = ['SignUp']
    export const isSignUp = (obj?: { __typename?: any } | null): obj is SignUp => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSignUp"')
      return SignUp_possibleTypes.includes(obj.__typename)
    }
    


    const Skill_possibleTypes: string[] = ['Skill']
    export const isSkill = (obj?: { __typename?: any } | null): obj is Skill => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSkill"')
      return Skill_possibleTypes.includes(obj.__typename)
    }
    


    const StandaloneRichTextConfiguration_possibleTypes: string[] = ['StandaloneRichTextConfiguration']
    export const isStandaloneRichTextConfiguration = (obj?: { __typename?: any } | null): obj is StandaloneRichTextConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isStandaloneRichTextConfiguration"')
      return StandaloneRichTextConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const StartWorkspaceSetupChatResult_possibleTypes: string[] = ['StartWorkspaceSetupChatResult']
    export const isStartWorkspaceSetupChatResult = (obj?: { __typename?: any } | null): obj is StartWorkspaceSetupChatResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isStartWorkspaceSetupChatResult"')
      return StartWorkspaceSetupChatResult_possibleTypes.includes(obj.__typename)
    }
    


    const StopImpersonation_possibleTypes: string[] = ['StopImpersonation']
    export const isStopImpersonation = (obj?: { __typename?: any } | null): obj is StopImpersonation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isStopImpersonation"')
      return StopImpersonation_possibleTypes.includes(obj.__typename)
    }
    


    const SubdomainAvailabilityDTO_possibleTypes: string[] = ['SubdomainAvailabilityDTO']
    export const isSubdomainAvailabilityDTO = (obj?: { __typename?: any } | null): obj is SubdomainAvailabilityDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSubdomainAvailabilityDTO"')
      return SubdomainAvailabilityDTO_possibleTypes.includes(obj.__typename)
    }
    


    const Subscription_possibleTypes: string[] = ['Subscription']
    export const isSubscription = (obj?: { __typename?: any } | null): obj is Subscription => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSubscription"')
      return Subscription_possibleTypes.includes(obj.__typename)
    }
    


    const Support_possibleTypes: string[] = ['Support']
    export const isSupport = (obj?: { __typename?: any } | null): obj is Support => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSupport"')
      return Support_possibleTypes.includes(obj.__typename)
    }
    


    const TasksConfiguration_possibleTypes: string[] = ['TasksConfiguration']
    export const isTasksConfiguration = (obj?: { __typename?: any } | null): obj is TasksConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTasksConfiguration"')
      return TasksConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const TimelineActivityType_possibleTypes: string[] = ['TimelineActivityType']
    export const isTimelineActivityType = (obj?: { __typename?: any } | null): obj is TimelineActivityType => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTimelineActivityType"')
      return TimelineActivityType_possibleTypes.includes(obj.__typename)
    }
    


    const TimelineActivityTypeEmit_possibleTypes: string[] = ['TimelineActivityTypeEmit']
    export const isTimelineActivityTypeEmit = (obj?: { __typename?: any } | null): obj is TimelineActivityTypeEmit => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTimelineActivityTypeEmit"')
      return TimelineActivityTypeEmit_possibleTypes.includes(obj.__typename)
    }
    


    const TimelineActivityTypeEmitThrough_possibleTypes: string[] = ['TimelineActivityTypeEmitThrough']
    export const isTimelineActivityTypeEmitThrough = (obj?: { __typename?: any } | null): obj is TimelineActivityTypeEmitThrough => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTimelineActivityTypeEmitThrough"')
      return TimelineActivityTypeEmitThrough_possibleTypes.includes(obj.__typename)
    }
    


    const TimelineConfiguration_possibleTypes: string[] = ['TimelineConfiguration']
    export const isTimelineConfiguration = (obj?: { __typename?: any } | null): obj is TimelineConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTimelineConfiguration"')
      return TimelineConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const ToolIndexEntry_possibleTypes: string[] = ['ToolIndexEntry']
    export const isToolIndexEntry = (obj?: { __typename?: any } | null): obj is ToolIndexEntry => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isToolIndexEntry"')
      return ToolIndexEntry_possibleTypes.includes(obj.__typename)
    }
    


    const TransientToken_possibleTypes: string[] = ['TransientToken']
    export const isTransientToken = (obj?: { __typename?: any } | null): obj is TransientToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTransientToken"')
      return TransientToken_possibleTypes.includes(obj.__typename)
    }
    


    const TriggerInstallApplicationJobResult_possibleTypes: string[] = ['TriggerInstallApplicationJobResult']
    export const isTriggerInstallApplicationJobResult = (obj?: { __typename?: any } | null): obj is TriggerInstallApplicationJobResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTriggerInstallApplicationJobResult"')
      return TriggerInstallApplicationJobResult_possibleTypes.includes(obj.__typename)
    }
    


    const TriggerUninstallApplicationJobResult_possibleTypes: string[] = ['TriggerUninstallApplicationJobResult']
    export const isTriggerUninstallApplicationJobResult = (obj?: { __typename?: any } | null): obj is TriggerUninstallApplicationJobResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTriggerUninstallApplicationJobResult"')
      return TriggerUninstallApplicationJobResult_possibleTypes.includes(obj.__typename)
    }
    


    const TwoFactorAuthenticationMethodSummary_possibleTypes: string[] = ['TwoFactorAuthenticationMethodSummary']
    export const isTwoFactorAuthenticationMethodSummary = (obj?: { __typename?: any } | null): obj is TwoFactorAuthenticationMethodSummary => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTwoFactorAuthenticationMethodSummary"')
      return TwoFactorAuthenticationMethodSummary_possibleTypes.includes(obj.__typename)
    }
    


    const TwoFactorAuthenticationRecoveryCode_possibleTypes: string[] = ['TwoFactorAuthenticationRecoveryCode']
    export const isTwoFactorAuthenticationRecoveryCode = (obj?: { __typename?: any } | null): obj is TwoFactorAuthenticationRecoveryCode => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTwoFactorAuthenticationRecoveryCode"')
      return TwoFactorAuthenticationRecoveryCode_possibleTypes.includes(obj.__typename)
    }
    


    const TwoFactorAuthenticationRecoveryCodeRedemption_possibleTypes: string[] = ['TwoFactorAuthenticationRecoveryCodeRedemption']
    export const isTwoFactorAuthenticationRecoveryCodeRedemption = (obj?: { __typename?: any } | null): obj is TwoFactorAuthenticationRecoveryCodeRedemption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTwoFactorAuthenticationRecoveryCodeRedemption"')
      return TwoFactorAuthenticationRecoveryCodeRedemption_possibleTypes.includes(obj.__typename)
    }
    


    const TwoFactorAuthenticationRecoveryStatus_possibleTypes: string[] = ['TwoFactorAuthenticationRecoveryStatus']
    export const isTwoFactorAuthenticationRecoveryStatus = (obj?: { __typename?: any } | null): obj is TwoFactorAuthenticationRecoveryStatus => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTwoFactorAuthenticationRecoveryStatus"')
      return TwoFactorAuthenticationRecoveryStatus_possibleTypes.includes(obj.__typename)
    }
    


    const UnsubscribeTopic_possibleTypes: string[] = ['UnsubscribeTopic']
    export const isUnsubscribeTopic = (obj?: { __typename?: any } | null): obj is UnsubscribeTopic => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUnsubscribeTopic"')
      return UnsubscribeTopic_possibleTypes.includes(obj.__typename)
    }
    


    const UpsertRowLevelPermissionPredicatesResult_possibleTypes: string[] = ['UpsertRowLevelPermissionPredicatesResult']
    export const isUpsertRowLevelPermissionPredicatesResult = (obj?: { __typename?: any } | null): obj is UpsertRowLevelPermissionPredicatesResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUpsertRowLevelPermissionPredicatesResult"')
      return UpsertRowLevelPermissionPredicatesResult_possibleTypes.includes(obj.__typename)
    }
    


    const UsageAnalytics_possibleTypes: string[] = ['UsageAnalytics']
    export const isUsageAnalytics = (obj?: { __typename?: any } | null): obj is UsageAnalytics => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUsageAnalytics"')
      return UsageAnalytics_possibleTypes.includes(obj.__typename)
    }
    


    const UsageBreakdownItem_possibleTypes: string[] = ['UsageBreakdownItem']
    export const isUsageBreakdownItem = (obj?: { __typename?: any } | null): obj is UsageBreakdownItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUsageBreakdownItem"')
      return UsageBreakdownItem_possibleTypes.includes(obj.__typename)
    }
    


    const UsageLimit_possibleTypes: string[] = ['UsageLimit']
    export const isUsageLimit = (obj?: { __typename?: any } | null): obj is UsageLimit => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUsageLimit"')
      return UsageLimit_possibleTypes.includes(obj.__typename)
    }
    


    const UsageLimitOperationDefinition_possibleTypes: string[] = ['UsageLimitOperationDefinition']
    export const isUsageLimitOperationDefinition = (obj?: { __typename?: any } | null): obj is UsageLimitOperationDefinition => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUsageLimitOperationDefinition"')
      return UsageLimitOperationDefinition_possibleTypes.includes(obj.__typename)
    }
    


    const UsageQuotaDefinition_possibleTypes: string[] = ['UsageQuotaDefinition']
    export const isUsageQuotaDefinition = (obj?: { __typename?: any } | null): obj is UsageQuotaDefinition => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUsageQuotaDefinition"')
      return UsageQuotaDefinition_possibleTypes.includes(obj.__typename)
    }
    


    const UsageQuotaDefinitions_possibleTypes: string[] = ['UsageQuotaDefinitions']
    export const isUsageQuotaDefinitions = (obj?: { __typename?: any } | null): obj is UsageQuotaDefinitions => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUsageQuotaDefinitions"')
      return UsageQuotaDefinitions_possibleTypes.includes(obj.__typename)
    }
    


    const UsageQuotaOperatorOnlyScope_possibleTypes: string[] = ['UsageQuotaOperatorOnlyScope']
    export const isUsageQuotaOperatorOnlyScope = (obj?: { __typename?: any } | null): obj is UsageQuotaOperatorOnlyScope => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUsageQuotaOperatorOnlyScope"')
      return UsageQuotaOperatorOnlyScope_possibleTypes.includes(obj.__typename)
    }
    


    const UsageQuotaScopeConsumption_possibleTypes: string[] = ['UsageQuotaScopeConsumption']
    export const isUsageQuotaScopeConsumption = (obj?: { __typename?: any } | null): obj is UsageQuotaScopeConsumption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUsageQuotaScopeConsumption"')
      return UsageQuotaScopeConsumption_possibleTypes.includes(obj.__typename)
    }
    


    const UsageQuotaWithConsumption_possibleTypes: string[] = ['UsageQuotaWithConsumption']
    export const isUsageQuotaWithConsumption = (obj?: { __typename?: any } | null): obj is UsageQuotaWithConsumption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUsageQuotaWithConsumption"')
      return UsageQuotaWithConsumption_possibleTypes.includes(obj.__typename)
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
    


    const User_possibleTypes: string[] = ['User']
    export const isUser = (obj?: { __typename?: any } | null): obj is User => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUser"')
      return User_possibleTypes.includes(obj.__typename)
    }
    


    const UserApplicationVariableValue_possibleTypes: string[] = ['UserApplicationVariableValue']
    export const isUserApplicationVariableValue = (obj?: { __typename?: any } | null): obj is UserApplicationVariableValue => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUserApplicationVariableValue"')
      return UserApplicationVariableValue_possibleTypes.includes(obj.__typename)
    }
    


    const UserSession_possibleTypes: string[] = ['UserSession']
    export const isUserSession = (obj?: { __typename?: any } | null): obj is UserSession => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUserSession"')
      return UserSession_possibleTypes.includes(obj.__typename)
    }
    


    const UserWorkspace_possibleTypes: string[] = ['UserWorkspace']
    export const isUserWorkspace = (obj?: { __typename?: any } | null): obj is UserWorkspace => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUserWorkspace"')
      return UserWorkspace_possibleTypes.includes(obj.__typename)
    }
    


    const ValidatePasswordResetToken_possibleTypes: string[] = ['ValidatePasswordResetToken']
    export const isValidatePasswordResetToken = (obj?: { __typename?: any } | null): obj is ValidatePasswordResetToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isValidatePasswordResetToken"')
      return ValidatePasswordResetToken_possibleTypes.includes(obj.__typename)
    }
    


    const ValidationRule_possibleTypes: string[] = ['ValidationRule']
    export const isValidationRule = (obj?: { __typename?: any } | null): obj is ValidationRule => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isValidationRule"')
      return ValidationRule_possibleTypes.includes(obj.__typename)
    }
    


    const VerificationRecord_possibleTypes: string[] = ['VerificationRecord']
    export const isVerificationRecord = (obj?: { __typename?: any } | null): obj is VerificationRecord => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isVerificationRecord"')
      return VerificationRecord_possibleTypes.includes(obj.__typename)
    }
    


    const VerifyEmailAndGetLoginToken_possibleTypes: string[] = ['VerifyEmailAndGetLoginToken']
    export const isVerifyEmailAndGetLoginToken = (obj?: { __typename?: any } | null): obj is VerifyEmailAndGetLoginToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isVerifyEmailAndGetLoginToken"')
      return VerifyEmailAndGetLoginToken_possibleTypes.includes(obj.__typename)
    }
    


    const VerifyTwoFactorAuthenticationMethod_possibleTypes: string[] = ['VerifyTwoFactorAuthenticationMethod']
    export const isVerifyTwoFactorAuthenticationMethod = (obj?: { __typename?: any } | null): obj is VerifyTwoFactorAuthenticationMethod => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isVerifyTwoFactorAuthenticationMethod"')
      return VerifyTwoFactorAuthenticationMethod_possibleTypes.includes(obj.__typename)
    }
    


    const VersionDistributionEntry_possibleTypes: string[] = ['VersionDistributionEntry']
    export const isVersionDistributionEntry = (obj?: { __typename?: any } | null): obj is VersionDistributionEntry => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isVersionDistributionEntry"')
      return VersionDistributionEntry_possibleTypes.includes(obj.__typename)
    }
    


    const View_possibleTypes: string[] = ['View']
    export const isView = (obj?: { __typename?: any } | null): obj is View => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isView"')
      return View_possibleTypes.includes(obj.__typename)
    }
    


    const ViewConfiguration_possibleTypes: string[] = ['ViewConfiguration']
    export const isViewConfiguration = (obj?: { __typename?: any } | null): obj is ViewConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewConfiguration"')
      return ViewConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const ViewField_possibleTypes: string[] = ['ViewField']
    export const isViewField = (obj?: { __typename?: any } | null): obj is ViewField => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewField"')
      return ViewField_possibleTypes.includes(obj.__typename)
    }
    


    const ViewFieldGroup_possibleTypes: string[] = ['ViewFieldGroup']
    export const isViewFieldGroup = (obj?: { __typename?: any } | null): obj is ViewFieldGroup => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewFieldGroup"')
      return ViewFieldGroup_possibleTypes.includes(obj.__typename)
    }
    


    const ViewFilter_possibleTypes: string[] = ['ViewFilter']
    export const isViewFilter = (obj?: { __typename?: any } | null): obj is ViewFilter => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewFilter"')
      return ViewFilter_possibleTypes.includes(obj.__typename)
    }
    


    const ViewFilterGroup_possibleTypes: string[] = ['ViewFilterGroup']
    export const isViewFilterGroup = (obj?: { __typename?: any } | null): obj is ViewFilterGroup => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewFilterGroup"')
      return ViewFilterGroup_possibleTypes.includes(obj.__typename)
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
    


    const Webhook_possibleTypes: string[] = ['Webhook']
    export const isWebhook = (obj?: { __typename?: any } | null): obj is Webhook => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWebhook"')
      return Webhook_possibleTypes.includes(obj.__typename)
    }
    


    const WidgetConfiguration_possibleTypes: string[] = ['AggregateChartConfiguration','BarChartConfiguration','CalendarConfiguration','CallRecordingSummaryConfiguration','CallRecordingTranscriptConfiguration','ChatConfiguration','ChatThreadsConfiguration','EmailThreadConfiguration','EmailsConfiguration','FieldConfiguration','FieldRichTextConfiguration','FieldsConfiguration','FilesConfiguration','FormFieldConfiguration','FrontComponentConfiguration','IframeConfiguration','LineChartConfiguration','MessageCampaignBodyConfiguration','MessageCampaignDetailsConfiguration','NotesConfiguration','PieChartConfiguration','RecordTableConfiguration','StandaloneRichTextConfiguration','TasksConfiguration','TimelineConfiguration','ViewConfiguration','WorkflowConfiguration','WorkflowRunConfiguration','WorkflowVersionConfiguration']
    export const isWidgetConfiguration = (obj?: { __typename?: any } | null): obj is WidgetConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWidgetConfiguration"')
      return WidgetConfiguration_possibleTypes.includes(obj.__typename)
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
    


    const Workspace_possibleTypes: string[] = ['Workspace']
    export const isWorkspace = (obj?: { __typename?: any } | null): obj is Workspace => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspace"')
      return Workspace_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceAiStats_possibleTypes: string[] = ['WorkspaceAiStats']
    export const isWorkspaceAiStats = (obj?: { __typename?: any } | null): obj is WorkspaceAiStats => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceAiStats"')
      return WorkspaceAiStats_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceCompanyEnrichmentResult_possibleTypes: string[] = ['WorkspaceCompanyEnrichmentResult']
    export const isWorkspaceCompanyEnrichmentResult = (obj?: { __typename?: any } | null): obj is WorkspaceCompanyEnrichmentResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceCompanyEnrichmentResult"')
      return WorkspaceCompanyEnrichmentResult_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceCreationDefaultsDTO_possibleTypes: string[] = ['WorkspaceCreationDefaultsDTO']
    export const isWorkspaceCreationDefaultsDTO = (obj?: { __typename?: any } | null): obj is WorkspaceCreationDefaultsDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceCreationDefaultsDTO"')
      return WorkspaceCreationDefaultsDTO_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceInvitation_possibleTypes: string[] = ['WorkspaceInvitation']
    export const isWorkspaceInvitation = (obj?: { __typename?: any } | null): obj is WorkspaceInvitation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceInvitation"')
      return WorkspaceInvitation_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceInviteHashValid_possibleTypes: string[] = ['WorkspaceInviteHashValid']
    export const isWorkspaceInviteHashValid = (obj?: { __typename?: any } | null): obj is WorkspaceInviteHashValid => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceInviteHashValid"')
      return WorkspaceInviteHashValid_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceMember_possibleTypes: string[] = ['WorkspaceMember']
    export const isWorkspaceMember = (obj?: { __typename?: any } | null): obj is WorkspaceMember => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceMember"')
      return WorkspaceMember_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceMemberApplicationVariables_possibleTypes: string[] = ['WorkspaceMemberApplicationVariables']
    export const isWorkspaceMemberApplicationVariables = (obj?: { __typename?: any } | null): obj is WorkspaceMemberApplicationVariables => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceMemberApplicationVariables"')
      return WorkspaceMemberApplicationVariables_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceMigration_possibleTypes: string[] = ['WorkspaceMigration']
    export const isWorkspaceMigration = (obj?: { __typename?: any } | null): obj is WorkspaceMigration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceMigration"')
      return WorkspaceMigration_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceNameAndId_possibleTypes: string[] = ['WorkspaceNameAndId']
    export const isWorkspaceNameAndId = (obj?: { __typename?: any } | null): obj is WorkspaceNameAndId => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceNameAndId"')
      return WorkspaceNameAndId_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceUrls_possibleTypes: string[] = ['WorkspaceUrls']
    export const isWorkspaceUrls = (obj?: { __typename?: any } | null): obj is WorkspaceUrls => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceUrls"')
      return WorkspaceUrls_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceUrlsAndId_possibleTypes: string[] = ['WorkspaceUrlsAndId']
    export const isWorkspaceUrlsAndId = (obj?: { __typename?: any } | null): obj is WorkspaceUrlsAndId => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceUrlsAndId"')
      return WorkspaceUrlsAndId_possibleTypes.includes(obj.__typename)
    }
    

export const enumAgentChatChannelAssignmentFilter = {
   ANY: 'ANY' as const,
   ASSIGNED_TO_ME: 'ASSIGNED_TO_ME' as const,
   UNASSIGNED: 'UNASSIGNED' as const
}

export const enumAgentChatChannelThreadStatus = {
   DONE: 'DONE' as const,
   OPEN: 'OPEN' as const,
   SNOOZED: 'SNOOZED' as const
}

export const enumAgentChatChannelVisibility = {
   PRIVATE: 'PRIVATE' as const,
   PUBLIC: 'PUBLIC' as const
}

export const enumAgentChatInboxViewKind = {
   ASSIGNED: 'ASSIGNED' as const,
   CHANNEL: 'CHANNEL' as const,
   DONE: 'DONE' as const,
   MENTIONS: 'MENTIONS' as const,
   NEEDS_INPUT: 'NEEDS_INPUT' as const,
   OPEN: 'OPEN' as const,
   RECENT: 'RECENT' as const,
   SNOOZED: 'SNOOZED' as const
}

export const enumAgentTurnStatus = {
   CANCELLED: 'CANCELLED' as const,
   COMPLETED: 'COMPLETED' as const,
   FAILED: 'FAILED' as const,
   RUNNING: 'RUNNING' as const,
   WAITING_FOR_INPUT: 'WAITING_FOR_INPUT' as const
}

export const enumAggregateOperations = {
   AVG: 'AVG' as const,
   COUNT: 'COUNT' as const,
   COUNT_EMPTY: 'COUNT_EMPTY' as const,
   COUNT_FALSE: 'COUNT_FALSE' as const,
   COUNT_NOT_EMPTY: 'COUNT_NOT_EMPTY' as const,
   COUNT_TRUE: 'COUNT_TRUE' as const,
   COUNT_UNIQUE_VALUES: 'COUNT_UNIQUE_VALUES' as const,
   MAX: 'MAX' as const,
   MIN: 'MIN' as const,
   PERCENTAGE_EMPTY: 'PERCENTAGE_EMPTY' as const,
   PERCENTAGE_NOT_EMPTY: 'PERCENTAGE_NOT_EMPTY' as const,
   SUM: 'SUM' as const
}

export const enumAiModelTier = {
   balanced: 'balanced' as const,
   extraFast: 'extraFast' as const,
   extraSmart: 'extraSmart' as const,
   fast: 'fast' as const,
   smart: 'smart' as const
}

export const enumAllMetadataName = {
   agent: 'agent' as const,
   applicationVariable: 'applicationVariable' as const,
   commandMenuItem: 'commandMenuItem' as const,
   connectionProvider: 'connectionProvider' as const,
   fieldMetadata: 'fieldMetadata' as const,
   fieldPermission: 'fieldPermission' as const,
   frontComponent: 'frontComponent' as const,
   index: 'index' as const,
   logicFunction: 'logicFunction' as const,
   navigationMenuItem: 'navigationMenuItem' as const,
   objectMetadata: 'objectMetadata' as const,
   objectPermission: 'objectPermission' as const,
   pageLayout: 'pageLayout' as const,
   pageLayoutTab: 'pageLayoutTab' as const,
   pageLayoutWidget: 'pageLayoutWidget' as const,
   permissionFlag: 'permissionFlag' as const,
   role: 'role' as const,
   rolePermissionFlag: 'rolePermissionFlag' as const,
   roleTarget: 'roleTarget' as const,
   rowLevelPermissionPredicate: 'rowLevelPermissionPredicate' as const,
   rowLevelPermissionPredicateGroup: 'rowLevelPermissionPredicateGroup' as const,
   searchFieldMetadata: 'searchFieldMetadata' as const,
   settingsMenuItem: 'settingsMenuItem' as const,
   skill: 'skill' as const,
   timelineActivityType: 'timelineActivityType' as const,
   validationRule: 'validationRule' as const,
   view: 'view' as const,
   viewField: 'viewField' as const,
   viewFieldGroup: 'viewFieldGroup' as const,
   viewFilter: 'viewFilter' as const,
   viewFilterGroup: 'viewFilterGroup' as const,
   viewGroup: 'viewGroup' as const,
   viewSort: 'viewSort' as const,
   webhook: 'webhook' as const,
   workflow: 'workflow' as const,
   workflowVersion: 'workflowVersion' as const
}

export const enumAnalyticsType = {
   PAGEVIEW: 'PAGEVIEW' as const,
   TRACK: 'TRACK' as const
}

export const enumAppKeyValueScope = {
   SERVER: 'SERVER' as const,
   WORKSPACE: 'WORKSPACE' as const
}

export const enumApplicationExportCoverageStatus = {
   ENGINE_DERIVED: 'ENGINE_DERIVED' as const,
   EXCLUDED: 'EXCLUDED' as const,
   EXPORTED: 'EXPORTED' as const,
   FOREIGN_OWNED: 'FOREIGN_OWNED' as const,
   UNSUPPORTED: 'UNSUPPORTED' as const
}

export const enumApplicationHealthStatus = {
   ERROR: 'ERROR' as const,
   INFO: 'INFO' as const,
   NEUTRAL: 'NEUTRAL' as const,
   OK: 'OK' as const,
   SUCCESS: 'SUCCESS' as const,
   UNKNOWN: 'UNKNOWN' as const,
   WARNING: 'WARNING' as const
}

export const enumApplicationRegistrationSourceType = {
   LOCAL: 'LOCAL' as const,
   NPM: 'NPM' as const,
   OAUTH_ONLY: 'OAUTH_ONLY' as const,
   TARBALL: 'TARBALL' as const
}

export const enumApplicationVariableScope = {
   USER: 'USER' as const,
   WORKSPACE: 'WORKSPACE' as const
}

export const enumAxisNameDisplay = {
   BOTH: 'BOTH' as const,
   NONE: 'NONE' as const,
   X: 'X' as const,
   Y: 'Y' as const
}

export const enumBarChartGroupMode = {
   GROUPED: 'GROUPED' as const,
   STACKED: 'STACKED' as const
}

export const enumBarChartLayout = {
   HORIZONTAL: 'HORIZONTAL' as const,
   VERTICAL: 'VERTICAL' as const
}

export const enumBillingEntitlementKey = {
   AUDIT_LOGS: 'AUDIT_LOGS' as const,
   CUSTOM_DOMAIN: 'CUSTOM_DOMAIN' as const,
   RECORD_SHARING: 'RECORD_SHARING' as const,
   RLS: 'RLS' as const,
   SSO: 'SSO' as const,
   USAGE_LIMIT: 'USAGE_LIMIT' as const
}

export const enumBillingPlanKey = {
   ENTERPRISE: 'ENTERPRISE' as const,
   PRO: 'PRO' as const
}

export const enumBillingProductKey = {
   BASE_PRODUCT: 'BASE_PRODUCT' as const,
   RESOURCE_CREDIT: 'RESOURCE_CREDIT' as const
}

export const enumBillingUsageType = {
   LICENSED: 'LICENSED' as const,
   METERED: 'METERED' as const
}

export const enumCalendarChannelContactAutoCreationPolicy = {
   AS_ORGANIZER: 'AS_ORGANIZER' as const,
   AS_PARTICIPANT: 'AS_PARTICIPANT' as const,
   AS_PARTICIPANT_AND_ORGANIZER: 'AS_PARTICIPANT_AND_ORGANIZER' as const,
   NONE: 'NONE' as const
}

export const enumCalendarChannelSyncStage = {
   CALENDAR_EVENTS_IMPORT_ONGOING: 'CALENDAR_EVENTS_IMPORT_ONGOING' as const,
   CALENDAR_EVENTS_IMPORT_PENDING: 'CALENDAR_EVENTS_IMPORT_PENDING' as const,
   CALENDAR_EVENTS_IMPORT_SCHEDULED: 'CALENDAR_EVENTS_IMPORT_SCHEDULED' as const,
   CALENDAR_EVENT_LIST_FETCH_ONGOING: 'CALENDAR_EVENT_LIST_FETCH_ONGOING' as const,
   CALENDAR_EVENT_LIST_FETCH_PENDING: 'CALENDAR_EVENT_LIST_FETCH_PENDING' as const,
   CALENDAR_EVENT_LIST_FETCH_SCHEDULED: 'CALENDAR_EVENT_LIST_FETCH_SCHEDULED' as const,
   FAILED: 'FAILED' as const,
   PENDING_CONFIGURATION: 'PENDING_CONFIGURATION' as const
}

export const enumCalendarChannelSyncStatus = {
   ACTIVE: 'ACTIVE' as const,
   FAILED_INSUFFICIENT_PERMISSIONS: 'FAILED_INSUFFICIENT_PERMISSIONS' as const,
   FAILED_UNKNOWN: 'FAILED_UNKNOWN' as const,
   NOT_SYNCED: 'NOT_SYNCED' as const,
   ONGOING: 'ONGOING' as const
}

export const enumCalendarChannelVisibility = {
   METADATA: 'METADATA' as const,
   SHARE_EVERYTHING: 'SHARE_EVERYTHING' as const
}

export const enumCaptchaDriverType = {
   GOOGLE_RECAPTCHA: 'GOOGLE_RECAPTCHA' as const,
   TURNSTILE: 'TURNSTILE' as const
}

export const enumChartNumberFormat = {
   FULL: 'FULL' as const,
   SHORT: 'SHORT' as const
}

export const enumCommandMenuItemAvailabilityType = {
   FALLBACK: 'FALLBACK' as const,
   GLOBAL: 'GLOBAL' as const,
   GLOBAL_OBJECT_CONTEXT: 'GLOBAL_OBJECT_CONTEXT' as const,
   RECORD_SELECTION: 'RECORD_SELECTION' as const
}

export const enumDatabaseEventAction = {
   CREATED: 'CREATED' as const,
   DELETED: 'DELETED' as const,
   DESTROYED: 'DESTROYED' as const,
   RESTORED: 'RESTORED' as const,
   UPDATED: 'UPDATED' as const,
   UPSERTED: 'UPSERTED' as const
}

export const enumEmailConnectionSecurity = {
   NONE: 'NONE' as const,
   SSL_TLS: 'SSL_TLS' as const,
   STARTTLS: 'STARTTLS' as const
}

export const enumEmailingDomainStatus = {
   FAILED: 'FAILED' as const,
   PENDING: 'PENDING' as const,
   TEMPORARY_FAILURE: 'TEMPORARY_FAILURE' as const,
   VERIFIED: 'VERIFIED' as const
}

export const enumEmailingDomainTenantStatus = {
   ACTIVE: 'ACTIVE' as const,
   PAUSED: 'PAUSED' as const,
   SANDBOX: 'SANDBOX' as const
}

export const enumEngineComponentKey = {
   ACTIVATE_WORKFLOW: 'ACTIVATE_WORKFLOW' as const,
   ADD_NODE_WORKFLOW: 'ADD_NODE_WORKFLOW' as const,
   ADD_TO_FAVORITES: 'ADD_TO_FAVORITES' as const,
   ASK_AI: 'ASK_AI' as const,
   ASSIGN_AI_CHAT: 'ASSIGN_AI_CHAT' as const,
   CANCEL_DASHBOARD_LAYOUT: 'CANCEL_DASHBOARD_LAYOUT' as const,
   CANCEL_MESSAGE_CAMPAIGN: 'CANCEL_MESSAGE_CAMPAIGN' as const,
   COMPOSE_CAMPAIGN: 'COMPOSE_CAMPAIGN' as const,
   COMPOSE_EMAIL: 'COMPOSE_EMAIL' as const,
   CREATE_NEW_RECORD: 'CREATE_NEW_RECORD' as const,
   CREATE_NEW_VIEW: 'CREATE_NEW_VIEW' as const,
   DEACTIVATE_WORKFLOW: 'DEACTIVATE_WORKFLOW' as const,
   DELETE_MULTIPLE_RECORDS: 'DELETE_MULTIPLE_RECORDS' as const,
   DELETE_RECORDS: 'DELETE_RECORDS' as const,
   DELETE_SINGLE_RECORD: 'DELETE_SINGLE_RECORD' as const,
   DESTROY_MULTIPLE_RECORDS: 'DESTROY_MULTIPLE_RECORDS' as const,
   DESTROY_RECORDS: 'DESTROY_RECORDS' as const,
   DESTROY_SINGLE_RECORD: 'DESTROY_SINGLE_RECORD' as const,
   DISCARD_DRAFT_WORKFLOW: 'DISCARD_DRAFT_WORKFLOW' as const,
   DUPLICATE_DASHBOARD: 'DUPLICATE_DASHBOARD' as const,
   DUPLICATE_MESSAGE_CAMPAIGN: 'DUPLICATE_MESSAGE_CAMPAIGN' as const,
   DUPLICATE_MESSAGE_LIST: 'DUPLICATE_MESSAGE_LIST' as const,
   DUPLICATE_WORKFLOW: 'DUPLICATE_WORKFLOW' as const,
   EDIT_DASHBOARD_LAYOUT: 'EDIT_DASHBOARD_LAYOUT' as const,
   EDIT_RECORD_PAGE_LAYOUT: 'EDIT_RECORD_PAGE_LAYOUT' as const,
   EMAIL_BLOCK_SETTINGS: 'EMAIL_BLOCK_SETTINGS' as const,
   EXPORT_FROM_RECORD_INDEX: 'EXPORT_FROM_RECORD_INDEX' as const,
   EXPORT_FROM_RECORD_SHOW: 'EXPORT_FROM_RECORD_SHOW' as const,
   EXPORT_MULTIPLE_RECORDS: 'EXPORT_MULTIPLE_RECORDS' as const,
   EXPORT_NOTE_TO_PDF: 'EXPORT_NOTE_TO_PDF' as const,
   EXPORT_RECORDS: 'EXPORT_RECORDS' as const,
   EXPORT_VIEW: 'EXPORT_VIEW' as const,
   FRONT_COMPONENT_RENDERER: 'FRONT_COMPONENT_RENDERER' as const,
   GO_TO_COMPANIES: 'GO_TO_COMPANIES' as const,
   GO_TO_DASHBOARDS: 'GO_TO_DASHBOARDS' as const,
   GO_TO_NOTES: 'GO_TO_NOTES' as const,
   GO_TO_OPPORTUNITIES: 'GO_TO_OPPORTUNITIES' as const,
   GO_TO_PEOPLE: 'GO_TO_PEOPLE' as const,
   GO_TO_RUNS: 'GO_TO_RUNS' as const,
   GO_TO_SETTINGS: 'GO_TO_SETTINGS' as const,
   GO_TO_TASKS: 'GO_TO_TASKS' as const,
   GO_TO_WORKFLOWS: 'GO_TO_WORKFLOWS' as const,
   HIDE_DELETED_RECORDS: 'HIDE_DELETED_RECORDS' as const,
   IMPORT_RECORDS: 'IMPORT_RECORDS' as const,
   MARK_AI_CHAT_AS_DONE: 'MARK_AI_CHAT_AS_DONE' as const,
   MARK_AI_CHAT_AS_READ: 'MARK_AI_CHAT_AS_READ' as const,
   MARK_AI_CHAT_AS_UNREAD: 'MARK_AI_CHAT_AS_UNREAD' as const,
   MERGE_MULTIPLE_RECORDS: 'MERGE_MULTIPLE_RECORDS' as const,
   NAVIGATE_TO_NEXT_RECORD: 'NAVIGATE_TO_NEXT_RECORD' as const,
   NAVIGATE_TO_PREVIOUS_RECORD: 'NAVIGATE_TO_PREVIOUS_RECORD' as const,
   NAVIGATION: 'NAVIGATION' as const,
   NEW_AI_CHAT: 'NEW_AI_CHAT' as const,
   REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES' as const,
   REOPEN_AI_CHAT: 'REOPEN_AI_CHAT' as const,
   REPLY_TO_EMAIL_THREAD: 'REPLY_TO_EMAIL_THREAD' as const,
   RESTORE_MULTIPLE_RECORDS: 'RESTORE_MULTIPLE_RECORDS' as const,
   RESTORE_RECORDS: 'RESTORE_RECORDS' as const,
   RESTORE_SINGLE_RECORD: 'RESTORE_SINGLE_RECORD' as const,
   RETRY_WORKFLOW_RUN: 'RETRY_WORKFLOW_RUN' as const,
   SAVE_DASHBOARD_LAYOUT: 'SAVE_DASHBOARD_LAYOUT' as const,
   SEARCH_RECORDS: 'SEARCH_RECORDS' as const,
   SEARCH_RECORDS_FALLBACK: 'SEARCH_RECORDS_FALLBACK' as const,
   SEE_ACTIVE_VERSION_WORKFLOW: 'SEE_ACTIVE_VERSION_WORKFLOW' as const,
   SEE_DELETED_RECORDS: 'SEE_DELETED_RECORDS' as const,
   SEE_RUNS_WORKFLOW: 'SEE_RUNS_WORKFLOW' as const,
   SEE_RUNS_WORKFLOW_VERSION: 'SEE_RUNS_WORKFLOW_VERSION' as const,
   SEE_VERSIONS_WORKFLOW: 'SEE_VERSIONS_WORKFLOW' as const,
   SEE_VERSIONS_WORKFLOW_VERSION: 'SEE_VERSIONS_WORKFLOW_VERSION' as const,
   SEE_VERSION_WORKFLOW_RUN: 'SEE_VERSION_WORKFLOW_RUN' as const,
   SEE_WORKFLOW_WORKFLOW_RUN: 'SEE_WORKFLOW_WORKFLOW_RUN' as const,
   SEE_WORKFLOW_WORKFLOW_VERSION: 'SEE_WORKFLOW_WORKFLOW_VERSION' as const,
   SEND_MESSAGE_CAMPAIGN: 'SEND_MESSAGE_CAMPAIGN' as const,
   SEND_MESSAGE_CAMPAIGN_TEST: 'SEND_MESSAGE_CAMPAIGN_TEST' as const,
   SHARE_RECORD: 'SHARE_RECORD' as const,
   SNOOZE_AI_CHAT: 'SNOOZE_AI_CHAT' as const,
   STOP_WORKFLOW_RUN: 'STOP_WORKFLOW_RUN' as const,
   SUBSCRIBE_TO_AI_CHAT: 'SUBSCRIBE_TO_AI_CHAT' as const,
   TEST_WORKFLOW: 'TEST_WORKFLOW' as const,
   TIDY_UP_WORKFLOW: 'TIDY_UP_WORKFLOW' as const,
   TOGGLE_WORKFLOW_VISIBILITY: 'TOGGLE_WORKFLOW_VISIBILITY' as const,
   TRIGGER_WORKFLOW_VERSION: 'TRIGGER_WORKFLOW_VERSION' as const,
   UNSUBSCRIBE_FROM_AI_CHAT: 'UNSUBSCRIBE_FROM_AI_CHAT' as const,
   UPDATE_MULTIPLE_RECORDS: 'UPDATE_MULTIPLE_RECORDS' as const,
   USE_AS_DRAFT_WORKFLOW_VERSION: 'USE_AS_DRAFT_WORKFLOW_VERSION' as const,
   VIEW_PREVIOUS_AI_CHATS: 'VIEW_PREVIOUS_AI_CHATS' as const
}

export const enumEventLogFilterOperand = {
   IS: 'IS' as const,
   IS_NOT: 'IS_NOT' as const
}

export const enumEventLogTable = {
   APPLICATION_LOG: 'APPLICATION_LOG' as const,
   OBJECT_EVENT: 'OBJECT_EVENT' as const,
   PAGEVIEW: 'PAGEVIEW' as const,
   USAGE_EVENT: 'USAGE_EVENT' as const,
   WORKSPACE_EVENT: 'WORKSPACE_EVENT' as const
}

export const enumFeatureFlagKey = {
   IS_AI_CHAT_SHARING_DROPDOWN_ENABLED: 'IS_AI_CHAT_SHARING_DROPDOWN_ENABLED' as const,
   IS_APPLICATION_WORKFLOWS_ENABLED: 'IS_APPLICATION_WORKFLOWS_ENABLED' as const,
   IS_ASYNC_CSV_EXPORT_ENABLED: 'IS_ASYNC_CSV_EXPORT_ENABLED' as const,
   IS_CALENDAR_SYNC_SKIP_UNCHANGED_RECORDS_ENABLED: 'IS_CALENDAR_SYNC_SKIP_UNCHANGED_RECORDS_ENABLED' as const,
   IS_CONFIGURABLE_SEARCH_FIELDS_ENABLED: 'IS_CONFIGURABLE_SEARCH_FIELDS_ENABLED' as const,
   IS_CONVERSATIONS_TAB_ENABLED: 'IS_CONVERSATIONS_TAB_ENABLED' as const,
   IS_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_ENABLED: 'IS_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_ENABLED' as const,
   IS_INITIAL_OBJECT_VIEW_ENABLED: 'IS_INITIAL_OBJECT_VIEW_ENABLED' as const,
   IS_JSON_FILTER_ENABLED: 'IS_JSON_FILTER_ENABLED' as const,
   IS_LOGS_SETTINGS_SECTION_ENABLED: 'IS_LOGS_SETTINGS_SECTION_ENABLED' as const,
   IS_MESSAGE_CAMPAIGN_ENABLED: 'IS_MESSAGE_CAMPAIGN_ENABLED' as const,
   IS_RECORD_CREATION_FORM_ENABLED: 'IS_RECORD_CREATION_FORM_ENABLED' as const,
   IS_RECORD_LEVEL_SHARING_ENABLED: 'IS_RECORD_LEVEL_SHARING_ENABLED' as const,
   IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED: 'IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED' as const,
   IS_REST_METADATA_API_NEW_FORMAT_DIRECT: 'IS_REST_METADATA_API_NEW_FORMAT_DIRECT' as const,
   IS_VALIDATION_RULES_ENABLED: 'IS_VALIDATION_RULES_ENABLED' as const,
   IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED: 'IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED' as const,
   IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED: 'IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED' as const
}

export const enumFieldDisplayMode = {
   CARD: 'CARD' as const,
   EDITOR: 'EDITOR' as const,
   FIELD: 'FIELD' as const,
   TABLE: 'TABLE' as const,
   VIEW: 'VIEW' as const
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

export const enumFileFolder = {
   AgentChat: 'AgentChat' as const,
   AppTarball: 'AppTarball' as const,
   BuiltFrontComponent: 'BuiltFrontComponent' as const,
   BuiltLogicFunction: 'BuiltLogicFunction' as const,
   CorePicture: 'CorePicture' as const,
   Dependencies: 'Dependencies' as const,
   Dpa: 'Dpa' as const,
   EmailAttachment: 'EmailAttachment' as const,
   EmailImage: 'EmailImage' as const,
   FilesField: 'FilesField' as const,
   GeneratedSdkClient: 'GeneratedSdkClient' as const,
   PublicAsset: 'PublicAsset' as const,
   RecordExport: 'RecordExport' as const,
   Source: 'Source' as const,
   Workflow: 'Workflow' as const
}

export const enumGraphOrderBy = {
   FIELD_ASC: 'FIELD_ASC' as const,
   FIELD_DESC: 'FIELD_DESC' as const,
   FIELD_POSITION_ASC: 'FIELD_POSITION_ASC' as const,
   FIELD_POSITION_DESC: 'FIELD_POSITION_DESC' as const,
   MANUAL: 'MANUAL' as const,
   VALUE_ASC: 'VALUE_ASC' as const,
   VALUE_DESC: 'VALUE_DESC' as const
}

export const enumIdentityProviderType = {
   OIDC: 'OIDC' as const,
   SAML: 'SAML' as const
}

export const enumIndexType = {
   BTREE: 'BTREE' as const,
   GIN: 'GIN' as const
}

export const enumJobState = {
   ACTIVE: 'ACTIVE' as const,
   COMPLETED: 'COMPLETED' as const,
   DELAYED: 'DELAYED' as const,
   FAILED: 'FAILED' as const,
   PRIORITIZED: 'PRIORITIZED' as const,
   WAITING: 'WAITING' as const,
   WAITING_CHILDREN: 'WAITING_CHILDREN' as const
}

export const enumLogicFunctionExecutionMode = {
   LIVE: 'LIVE' as const,
   PREBUILT: 'PREBUILT' as const
}

export const enumLogicFunctionExecutionStatus = {
   ERROR: 'ERROR' as const,
   IDLE: 'IDLE' as const,
   SUCCESS: 'SUCCESS' as const
}

export const enumMessageChannelContactAutoCreationPolicy = {
   NONE: 'NONE' as const,
   SENT: 'SENT' as const,
   SENT_AND_RECEIVED: 'SENT_AND_RECEIVED' as const
}

export const enumMessageChannelPendingGroupEmailsAction = {
   GROUP_EMAILS_DELETION: 'GROUP_EMAILS_DELETION' as const,
   GROUP_EMAILS_IMPORT: 'GROUP_EMAILS_IMPORT' as const,
   NONE: 'NONE' as const
}

export const enumMessageChannelSyncStage = {
   FAILED: 'FAILED' as const,
   MESSAGES_IMPORT_ONGOING: 'MESSAGES_IMPORT_ONGOING' as const,
   MESSAGES_IMPORT_PENDING: 'MESSAGES_IMPORT_PENDING' as const,
   MESSAGES_IMPORT_SCHEDULED: 'MESSAGES_IMPORT_SCHEDULED' as const,
   MESSAGE_LIST_FETCH_ONGOING: 'MESSAGE_LIST_FETCH_ONGOING' as const,
   MESSAGE_LIST_FETCH_PENDING: 'MESSAGE_LIST_FETCH_PENDING' as const,
   MESSAGE_LIST_FETCH_SCHEDULED: 'MESSAGE_LIST_FETCH_SCHEDULED' as const,
   PENDING_CONFIGURATION: 'PENDING_CONFIGURATION' as const
}

export const enumMessageChannelSyncStatus = {
   ACTIVE: 'ACTIVE' as const,
   FAILED_INSUFFICIENT_PERMISSIONS: 'FAILED_INSUFFICIENT_PERMISSIONS' as const,
   FAILED_UNKNOWN: 'FAILED_UNKNOWN' as const,
   NOT_SYNCED: 'NOT_SYNCED' as const,
   ONGOING: 'ONGOING' as const
}

export const enumMessageChannelType = {
   APP: 'APP' as const,
   EMAIL: 'EMAIL' as const,
   EMAIL_GROUP: 'EMAIL_GROUP' as const,
   SMS: 'SMS' as const
}

export const enumMessageChannelVisibility = {
   METADATA: 'METADATA' as const,
   SHARE_EVERYTHING: 'SHARE_EVERYTHING' as const,
   SUBJECT: 'SUBJECT' as const
}

export const enumMessageFolderImportPolicy = {
   ALL_FOLDERS: 'ALL_FOLDERS' as const,
   SELECTED_FOLDERS: 'SELECTED_FOLDERS' as const
}

export const enumMessageFolderPendingSyncAction = {
   FOLDER_DELETION: 'FOLDER_DELETION' as const,
   FOLDER_IMPORT: 'FOLDER_IMPORT' as const,
   NONE: 'NONE' as const
}

export const enumMessageParticipantRole = {
   BCC: 'BCC' as const,
   CC: 'CC' as const,
   FROM: 'FROM' as const,
   REPLY_TO: 'REPLY_TO' as const,
   TO: 'TO' as const
}

export const enumMessageSuppressionReason = {
   BOUNCE: 'BOUNCE' as const,
   COMPLAINT: 'COMPLAINT' as const,
   TRACKING: 'TRACKING' as const,
   UNSUBSCRIBE: 'UNSUBSCRIBE' as const
}

export const enumMessageSuppressionSource = {
   SYSTEM: 'SYSTEM' as const,
   WEBHOOK: 'WEBHOOK' as const
}

export const enumMetadataEventAction = {
   CREATED: 'CREATED' as const,
   DELETED: 'DELETED' as const,
   UPDATED: 'UPDATED' as const
}

export const enumMetadataReadability = {
   APPLICATION: 'APPLICATION' as const,
   INHERITED: 'INHERITED' as const,
   OPEN: 'OPEN' as const,
   PRIVATE: 'PRIVATE' as const,
   SYSTEM: 'SYSTEM' as const
}

export const enumMetadataTranslationProvenance = {
   INHERITED: 'INHERITED' as const,
   SHIPPED: 'SHIPPED' as const,
   WORKSPACE: 'WORKSPACE' as const
}

export const enumMetadataWritability = {
   APPLICATION: 'APPLICATION' as const,
   OPEN: 'OPEN' as const,
   SYSTEM: 'SYSTEM' as const
}

export const enumModelFamily = {
   CLAUDE: 'CLAUDE' as const,
   GEMINI: 'GEMINI' as const,
   GPT: 'GPT' as const,
   GROK: 'GROK' as const,
   MISTRAL: 'MISTRAL' as const
}

export const enumNavigationMenuItemType = {
   FOLDER: 'FOLDER' as const,
   LINK: 'LINK' as const,
   OBJECT: 'OBJECT' as const,
   PAGE_LAYOUT: 'PAGE_LAYOUT' as const,
   RECORD: 'RECORD' as const,
   VIEW: 'VIEW' as const
}

export const enumObjectOpenRecordIn = {
   RECORD_PAGE: 'RECORD_PAGE' as const,
   SIDE_PANEL: 'SIDE_PANEL' as const,
   USER_CHOICE: 'USER_CHOICE' as const
}

export const enumObjectRecordGroupByDateGranularity = {
   DAY: 'DAY' as const,
   DAY_OF_THE_WEEK: 'DAY_OF_THE_WEEK' as const,
   MONTH: 'MONTH' as const,
   MONTH_OF_THE_YEAR: 'MONTH_OF_THE_YEAR' as const,
   NONE: 'NONE' as const,
   QUARTER: 'QUARTER' as const,
   QUARTER_OF_THE_YEAR: 'QUARTER_OF_THE_YEAR' as const,
   WEEK: 'WEEK' as const,
   YEAR: 'YEAR' as const
}

export const enumObjectSharingReach = {
   ROLE_ACCESS: 'ROLE_ACCESS' as const,
   WORKSPACE: 'WORKSPACE' as const
}

export const enumOnboardingStatus = {
   BOOK_CALL: 'BOOK_CALL' as const,
   COMPLETED: 'COMPLETED' as const,
   INVITE_TEAM: 'INVITE_TEAM' as const,
   PLAN_REQUIRED: 'PLAN_REQUIRED' as const,
   PROFILE_CREATION: 'PROFILE_CREATION' as const,
   SYNC_EMAIL: 'SYNC_EMAIL' as const,
   WORKSPACE_ACTIVATION: 'WORKSPACE_ACTIVATION' as const
}

export const enumOpenRecordIn = {
   RECORD_PAGE: 'RECORD_PAGE' as const,
   SIDE_PANEL: 'SIDE_PANEL' as const
}

export const enumPageLayoutTabLayoutMode = {
   CANVAS: 'CANVAS' as const,
   GRID: 'GRID' as const,
   VERTICAL_LIST: 'VERTICAL_LIST' as const
}

export const enumPageLayoutType = {
   DASHBOARD: 'DASHBOARD' as const,
   RECORD_FORM: 'RECORD_FORM' as const,
   RECORD_INDEX: 'RECORD_INDEX' as const,
   RECORD_PAGE: 'RECORD_PAGE' as const,
   STANDALONE_PAGE: 'STANDALONE_PAGE' as const
}

export const enumPageLayoutWidgetVerticalListHeightBehavior = {
   FIT_CONTENT: 'FIT_CONTENT' as const,
   TAB_VIEWPORT: 'TAB_VIEWPORT' as const
}

export const enumPermissionFlagType = {
   AI: 'AI' as const,
   AI_SETTINGS: 'AI_SETTINGS' as const,
   API_KEYS_AND_WEBHOOKS: 'API_KEYS_AND_WEBHOOKS' as const,
   APPLICATIONS: 'APPLICATIONS' as const,
   BILLING: 'BILLING' as const,
   CODE_INTERPRETER_TOOL: 'CODE_INTERPRETER_TOOL' as const,
   CONNECTED_ACCOUNTS: 'CONNECTED_ACCOUNTS' as const,
   CREATE_CALENDAR_EVENT_TOOL: 'CREATE_CALENDAR_EVENT_TOOL' as const,
   DATA_MODEL: 'DATA_MODEL' as const,
   DOWNLOAD_FILE: 'DOWNLOAD_FILE' as const,
   EXPORT_CSV: 'EXPORT_CSV' as const,
   HTTP_REQUEST_TOOL: 'HTTP_REQUEST_TOOL' as const,
   IMPERSONATE: 'IMPERSONATE' as const,
   IMPORT_CSV: 'IMPORT_CSV' as const,
   LAYOUTS: 'LAYOUTS' as const,
   MARKETPLACE_APPS: 'MARKETPLACE_APPS' as const,
   PROFILE_INFORMATION: 'PROFILE_INFORMATION' as const,
   ROLES: 'ROLES' as const,
   SECURITY: 'SECURITY' as const,
   SEND_EMAIL_TOOL: 'SEND_EMAIL_TOOL' as const,
   SSO_BYPASS: 'SSO_BYPASS' as const,
   UPLOAD_FILE: 'UPLOAD_FILE' as const,
   VIEWS: 'VIEWS' as const,
   WORKFLOWS: 'WORKFLOWS' as const,
   WORKSPACE: 'WORKSPACE' as const,
   WORKSPACE_MEMBERS: 'WORKSPACE_MEMBERS' as const
}

export const enumRecordShareAccessLevel = {
   FULL: 'FULL' as const,
   NONE: 'NONE' as const,
   READ: 'READ' as const,
   READ_WRITE: 'READ_WRITE' as const
}

export const enumRecordSharePrincipalType = {
   EVERYONE: 'EVERYONE' as const,
   ROLE: 'ROLE' as const,
   WORKSPACE_MEMBER: 'WORKSPACE_MEMBER' as const
}

export const enumRecordShareRowCause = {
   APPLICATION: 'APPLICATION' as const,
   MANUAL: 'MANUAL' as const,
   OWNER: 'OWNER' as const,
   RULE: 'RULE' as const
}

export const enumRecordSharingMode = {
   INHERITED: 'INHERITED' as const,
   OPEN_BY_DEFAULT: 'OPEN_BY_DEFAULT' as const,
   PRIVATE: 'PRIVATE' as const,
   ROLE_ONLY: 'ROLE_ONLY' as const
}

export const enumRelationType = {
   MANY_TO_ONE: 'MANY_TO_ONE' as const,
   ONE_TO_MANY: 'ONE_TO_MANY' as const
}

export const enumRowLevelPermissionPredicateGroupLogicalOperator = {
   AND: 'AND' as const,
   OR: 'OR' as const
}

export const enumRowLevelPermissionPredicateOperand = {
   CONTAINS: 'CONTAINS' as const,
   DOES_NOT_CONTAIN: 'DOES_NOT_CONTAIN' as const,
   GREATER_THAN_OR_EQUAL: 'GREATER_THAN_OR_EQUAL' as const,
   IS: 'IS' as const,
   IS_AFTER: 'IS_AFTER' as const,
   IS_BEFORE: 'IS_BEFORE' as const,
   IS_EMPTY: 'IS_EMPTY' as const,
   IS_IN_FUTURE: 'IS_IN_FUTURE' as const,
   IS_IN_PAST: 'IS_IN_PAST' as const,
   IS_NOT: 'IS_NOT' as const,
   IS_NOT_EMPTY: 'IS_NOT_EMPTY' as const,
   IS_NOT_NULL: 'IS_NOT_NULL' as const,
   IS_RELATIVE: 'IS_RELATIVE' as const,
   IS_TODAY: 'IS_TODAY' as const,
   LESS_THAN_OR_EQUAL: 'LESS_THAN_OR_EQUAL' as const,
   VECTOR_SEARCH: 'VECTOR_SEARCH' as const
}

export const enumRunAgentMessageRole = {
   assistant: 'assistant' as const,
   user: 'user' as const
}

export const enumSsoIdentityProviderStatus = {
   Active: 'Active' as const,
   Error: 'Error' as const,
   Inactive: 'Inactive' as const
}

export const enumSettingsMenuItemScope = {
   USER: 'USER' as const,
   WORKSPACE: 'WORKSPACE' as const
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

export const enumSupportDriver = {
   FRONT: 'FRONT' as const,
   NONE: 'NONE' as const
}

export const enumUnsubscribeHostnameStatus = {
   ACTIVE: 'ACTIVE' as const,
   FAILED: 'FAILED' as const,
   PENDING: 'PENDING' as const
}

export const enumUnsubscribeTopicVisibility = {
   PRIVATE: 'PRIVATE' as const,
   PUBLIC: 'PUBLIC' as const
}

export const enumUsageOperationType = {
   AI_CHAT_TOKEN: 'AI_CHAT_TOKEN' as const,
   AI_WORKFLOW_TOKEN: 'AI_WORKFLOW_TOKEN' as const,
   ALL: 'ALL' as const,
   API_REQUEST: 'API_REQUEST' as const,
   CALL_RECORDING: 'CALL_RECORDING' as const,
   CODE_EXECUTION: 'CODE_EXECUTION' as const,
   EMAIL_SEND: 'EMAIL_SEND' as const,
   MESSAGE_CAMPAIGN_SEND: 'MESSAGE_CAMPAIGN_SEND' as const,
   RECORD_WRITE: 'RECORD_WRITE' as const,
   STORAGE_FILE: 'STORAGE_FILE' as const,
   SUBSCRIPTION: 'SUBSCRIPTION' as const,
   WEBHOOK_CALL: 'WEBHOOK_CALL' as const,
   WEB_SEARCH: 'WEB_SEARCH' as const,
   WORKFLOW_EXECUTION: 'WORKFLOW_EXECUTION' as const
}

export const enumUsageResourceType = {
   AI: 'AI' as const,
   API: 'API' as const,
   APP: 'APP' as const,
   EMAIL: 'EMAIL' as const,
   LOGIC_FUNCTION: 'LOGIC_FUNCTION' as const,
   RECORD: 'RECORD' as const,
   STORAGE: 'STORAGE' as const,
   WEBHOOK: 'WEBHOOK' as const,
   WORKFLOW: 'WORKFLOW' as const
}

export const enumUsageUnit = {
   BYTE: 'BYTE' as const,
   COMPLEXITY: 'COMPLEXITY' as const,
   CREDIT: 'CREDIT' as const,
   FILE: 'FILE' as const,
   INVOCATION: 'INVOCATION' as const,
   MILLISECOND: 'MILLISECOND' as const,
   MINUTE: 'MINUTE' as const,
   RECORD: 'RECORD' as const,
   REQUEST: 'REQUEST' as const,
   SEAT: 'SEAT' as const,
   TOKEN: 'TOKEN' as const
}

export const enumViewCalendarLayout = {
   DAY: 'DAY' as const,
   MONTH: 'MONTH' as const,
   WEEK: 'WEEK' as const
}

export const enumViewFilterGroupLogicalOperator = {
   AND: 'AND' as const,
   NOT: 'NOT' as const,
   OR: 'OR' as const
}

export const enumViewFilterOperand = {
   CONTAINS: 'CONTAINS' as const,
   DOES_NOT_CONTAIN: 'DOES_NOT_CONTAIN' as const,
   GREATER_THAN_OR_EQUAL: 'GREATER_THAN_OR_EQUAL' as const,
   IS: 'IS' as const,
   IS_AFTER: 'IS_AFTER' as const,
   IS_BEFORE: 'IS_BEFORE' as const,
   IS_EMPTY: 'IS_EMPTY' as const,
   IS_IN_FUTURE: 'IS_IN_FUTURE' as const,
   IS_IN_PAST: 'IS_IN_PAST' as const,
   IS_NOT: 'IS_NOT' as const,
   IS_NOT_EMPTY: 'IS_NOT_EMPTY' as const,
   IS_NOT_NULL: 'IS_NOT_NULL' as const,
   IS_RELATIVE: 'IS_RELATIVE' as const,
   IS_TODAY: 'IS_TODAY' as const,
   LESS_THAN_OR_EQUAL: 'LESS_THAN_OR_EQUAL' as const,
   VECTOR_SEARCH: 'VECTOR_SEARCH' as const
}

export const enumViewKey = {
   INDEX: 'INDEX' as const
}

export const enumViewOpenRecordIn = {
   RECORD_PAGE: 'RECORD_PAGE' as const,
   SIDE_PANEL: 'SIDE_PANEL' as const
}

export const enumViewSortDirection = {
   ASC: 'ASC' as const,
   DESC: 'DESC' as const
}

export const enumViewType = {
   CALENDAR: 'CALENDAR' as const,
   CALENDAR_WIDGET: 'CALENDAR_WIDGET' as const,
   FIELDS_WIDGET: 'FIELDS_WIDGET' as const,
   KANBAN: 'KANBAN' as const,
   KANBAN_WIDGET: 'KANBAN_WIDGET' as const,
   LIST: 'LIST' as const,
   LIST_WIDGET: 'LIST_WIDGET' as const,
   TABLE: 'TABLE' as const,
   TABLE_WIDGET: 'TABLE_WIDGET' as const
}

export const enumViewVisibility = {
   UNLISTED: 'UNLISTED' as const,
   WORKSPACE: 'WORKSPACE' as const
}

export const enumWidgetConfigurationType = {
   AGGREGATE_CHART: 'AGGREGATE_CHART' as const,
   BAR_CHART: 'BAR_CHART' as const,
   CALENDAR: 'CALENDAR' as const,
   CALL_RECORDING_SUMMARY: 'CALL_RECORDING_SUMMARY' as const,
   CALL_RECORDING_TRANSCRIPT: 'CALL_RECORDING_TRANSCRIPT' as const,
   CHAT: 'CHAT' as const,
   CHAT_THREADS: 'CHAT_THREADS' as const,
   EMAILS: 'EMAILS' as const,
   EMAIL_THREAD: 'EMAIL_THREAD' as const,
   FIELD: 'FIELD' as const,
   FIELDS: 'FIELDS' as const,
   FIELD_RICH_TEXT: 'FIELD_RICH_TEXT' as const,
   FILES: 'FILES' as const,
   FORM_FIELD: 'FORM_FIELD' as const,
   FRONT_COMPONENT: 'FRONT_COMPONENT' as const,
   IFRAME: 'IFRAME' as const,
   LINE_CHART: 'LINE_CHART' as const,
   MESSAGE_CAMPAIGN_BODY: 'MESSAGE_CAMPAIGN_BODY' as const,
   MESSAGE_CAMPAIGN_DETAILS: 'MESSAGE_CAMPAIGN_DETAILS' as const,
   NOTES: 'NOTES' as const,
   PIE_CHART: 'PIE_CHART' as const,
   RECORD_TABLE: 'RECORD_TABLE' as const,
   STANDALONE_RICH_TEXT: 'STANDALONE_RICH_TEXT' as const,
   TASKS: 'TASKS' as const,
   TIMELINE: 'TIMELINE' as const,
   VIEW: 'VIEW' as const,
   WORKFLOW: 'WORKFLOW' as const,
   WORKFLOW_RUN: 'WORKFLOW_RUN' as const,
   WORKFLOW_VERSION: 'WORKFLOW_VERSION' as const
}

export const enumWidgetType = {
   CALENDAR: 'CALENDAR' as const,
   CALL_RECORDING_SUMMARY: 'CALL_RECORDING_SUMMARY' as const,
   CALL_RECORDING_TRANSCRIPT: 'CALL_RECORDING_TRANSCRIPT' as const,
   CHAT: 'CHAT' as const,
   CHAT_THREADS: 'CHAT_THREADS' as const,
   EMAILS: 'EMAILS' as const,
   EMAIL_THREAD: 'EMAIL_THREAD' as const,
   FIELD: 'FIELD' as const,
   FIELDS: 'FIELDS' as const,
   FIELD_RICH_TEXT: 'FIELD_RICH_TEXT' as const,
   FILES: 'FILES' as const,
   FORM_FIELD: 'FORM_FIELD' as const,
   FRONT_COMPONENT: 'FRONT_COMPONENT' as const,
   GRAPH: 'GRAPH' as const,
   IFRAME: 'IFRAME' as const,
   MESSAGE_CAMPAIGN_BODY: 'MESSAGE_CAMPAIGN_BODY' as const,
   MESSAGE_CAMPAIGN_DETAILS: 'MESSAGE_CAMPAIGN_DETAILS' as const,
   NOTES: 'NOTES' as const,
   RECORD_TABLE: 'RECORD_TABLE' as const,
   STANDALONE_RICH_TEXT: 'STANDALONE_RICH_TEXT' as const,
   TASKS: 'TASKS' as const,
   TIMELINE: 'TIMELINE' as const,
   VIEW: 'VIEW' as const,
   WORKFLOW: 'WORKFLOW' as const,
   WORKFLOW_RUN: 'WORKFLOW_RUN' as const,
   WORKFLOW_VERSION: 'WORKFLOW_VERSION' as const
}

export const enumWorkspaceActivationStatus = {
   ACTIVE: 'ACTIVE' as const,
   CREATED: 'CREATED' as const,
   INACTIVE: 'INACTIVE' as const,
   ONGOING_CREATION: 'ONGOING_CREATION' as const,
   PENDING_CREATION: 'PENDING_CREATION' as const,
   SUSPENDED: 'SUSPENDED' as const
}

export const enumWorkspaceCompanyEnrichmentOutcome = {
   matched: 'matched' as const,
   transientError: 'transientError' as const,
   unavailable: 'unavailable' as const
}

export const enumWorkspaceDiscoverability = {
   HIDDEN: 'HIDDEN' as const,
   MEMBERS_AND_INVITEES: 'MEMBERS_AND_INVITEES' as const,
   PUBLIC: 'PUBLIC' as const
}

export const enumWorkspaceMemberDateFormatEnum = {
   DAY_FIRST: 'DAY_FIRST' as const,
   MONTH_FIRST: 'MONTH_FIRST' as const,
   SYSTEM: 'SYSTEM' as const,
   YEAR_FIRST: 'YEAR_FIRST' as const
}

export const enumWorkspaceMemberNumberFormatEnum = {
   APOSTROPHE_AND_DOT: 'APOSTROPHE_AND_DOT' as const,
   COMMAS_AND_DOT: 'COMMAS_AND_DOT' as const,
   DOTS_AND_COMMA: 'DOTS_AND_COMMA' as const,
   SPACES_AND_COMMA: 'SPACES_AND_COMMA' as const,
   SYSTEM: 'SYSTEM' as const
}

export const enumWorkspaceMemberTimeFormatEnum = {
   HOUR_12: 'HOUR_12' as const,
   HOUR_24: 'HOUR_24' as const,
   SYSTEM: 'SYSTEM' as const
}

export const enumWorkspacePersonEnrichmentOutcome = {
   matched: 'matched' as const,
   transientError: 'transientError' as const,
   unavailable: 'unavailable' as const
}

export const enumWorkspaceSetupChatOutcome = {
   ALREADY_STARTED: 'ALREADY_STARTED' as const,
   STARTED: 'STARTED' as const,
   UNAVAILABLE: 'UNAVAILABLE' as const
}
