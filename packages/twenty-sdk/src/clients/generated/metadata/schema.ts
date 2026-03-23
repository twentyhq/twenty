// @ts-nocheck
export type Scalars = {
    Boolean: boolean,
    ConnectionCursor: any,
    DateTime: string,
    Float: number,
    ID: string,
    Int: number,
    JSON: Record<string, unknown>,
    JSONObject: any,
    String: string,
    UUID: string,
    Upload: File,
}

export interface AISystemPromptPreview {
    estimatedTokenCount: Scalars['Int']
    sections: AISystemPromptSection[]
    __typename: 'AISystemPromptPreview'
}

export interface AISystemPromptSection {
    content: Scalars['String']
    estimatedTokenCount: Scalars['Int']
    title: Scalars['String']
    __typename: 'AISystemPromptSection'
}

export interface AdminAIModelConfig {
    contextWindowTokens?: Scalars['Float']
    dataResidency?: Scalars['String']
    inputCostPerMillionTokens?: Scalars['Float']
    isAdminEnabled: Scalars['Boolean']
    isAvailable: Scalars['Boolean']
    isDeprecated?: Scalars['Boolean']
    isRecommended?: Scalars['Boolean']
    label: Scalars['String']
    maxOutputTokens?: Scalars['Float']
    modelFamily?: ModelFamily
    modelFamilyLabel?: Scalars['String']
    modelId: Scalars['String']
    name?: Scalars['String']
    outputCostPerMillionTokens?: Scalars['Float']
    providerLabel?: Scalars['String']
    providerName?: Scalars['String']
    sdkPackage?: Scalars['String']
    __typename: 'AdminAIModelConfig'
}

export interface AdminAIModels {
    defaultFastModelId?: Scalars['String']
    defaultSmartModelId?: Scalars['String']
    models: AdminAIModelConfig[]
    __typename: 'AdminAIModels'
}

export interface AdminPanelHealthServiceData {
    description: Scalars['String']
    details?: Scalars['String']
    errorMessage?: Scalars['String']
    id: HealthIndicatorId
    label: Scalars['String']
    queues?: AdminPanelWorkerQueueHealth[]
    status: AdminPanelHealthServiceStatus
    __typename: 'AdminPanelHealthServiceData'
}

export type AdminPanelHealthServiceStatus = 'OPERATIONAL' | 'OUTAGE'

export interface AdminPanelWorkerQueueHealth {
    id: Scalars['String']
    queueName: Scalars['String']
    status: AdminPanelHealthServiceStatus
    __typename: 'AdminPanelWorkerQueueHealth'
}

export interface Agent {
    applicationId?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    description?: Scalars['String']
    evaluationInputs: Scalars['String'][]
    icon?: Scalars['String']
    id: Scalars['UUID']
    isCustom: Scalars['Boolean']
    label: Scalars['String']
    modelConfiguration?: Scalars['JSON']
    modelId: Scalars['String']
    name: Scalars['String']
    prompt: Scalars['String']
    responseFormat?: Scalars['JSON']
    roleId?: Scalars['UUID']
    updatedAt: Scalars['DateTime']
    __typename: 'Agent'
}

export interface AgentChatThread {
    contextWindowTokens?: Scalars['Int']
    conversationSize: Scalars['Int']
    createdAt: Scalars['DateTime']
    id: Scalars['UUID']
    title?: Scalars['String']
    totalInputCredits: Scalars['Float']
    totalInputTokens: Scalars['Int']
    totalOutputCredits: Scalars['Float']
    totalOutputTokens: Scalars['Int']
    updatedAt: Scalars['DateTime']
    __typename: 'AgentChatThread'
}

export interface AgentChatThreadConnection {
    /** Array of edges. */
    edges: AgentChatThreadEdge[]
    /** Paging information */
    pageInfo: PageInfo
    __typename: 'AgentChatThreadConnection'
}

export interface AgentChatThreadEdge {
    /** Cursor for this node. */
    cursor: Scalars['ConnectionCursor']
    /** The node containing the AgentChatThread */
    node: AgentChatThread
    __typename: 'AgentChatThreadEdge'
}

export type AgentChatThreadSortFields = 'id' | 'updatedAt'

export interface AgentMessage {
    agentId?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    id: Scalars['UUID']
    parts: AgentMessagePart[]
    role: Scalars['String']
    threadId: Scalars['UUID']
    turnId: Scalars['UUID']
    __typename: 'AgentMessage'
}

export interface AgentMessagePart {
    createdAt: Scalars['DateTime']
    errorDetails?: Scalars['JSON']
    errorMessage?: Scalars['String']
    fileFilename?: Scalars['String']
    fileId?: Scalars['UUID']
    fileMediaType?: Scalars['String']
    fileUrl?: Scalars['String']
    id: Scalars['UUID']
    messageId: Scalars['UUID']
    orderIndex: Scalars['Int']
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

export interface AgentTurn {
    agentId?: Scalars['UUID']
    createdAt: Scalars['DateTime']
    evaluations: AgentTurnEvaluation[]
    id: Scalars['UUID']
    messages: AgentMessage[]
    threadId: Scalars['UUID']
    __typename: 'AgentTurn'
}

export interface AgentTurnEvaluation {
    comment?: Scalars['String']
    createdAt: Scalars['DateTime']
    id: Scalars['UUID']
    score: Scalars['Int']
    turnId: Scalars['UUID']
    __typename: 'AgentTurnEvaluation'
}

export interface AggregateChartConfiguration {
    aggregateFieldMetadataId: Scalars['UUID']
    aggregateOperation: AggregateOperations
    configurationType: WidgetConfigurationType
    description?: Scalars['String']
    displayDataLabel?: Scalars['Boolean']
    filter?: Scalars['JSON']
    firstDayOfTheWeek?: Scalars['Int']
    format?: Scalars['String']
    label?: Scalars['String']
    prefix?: Scalars['String']
    ratioAggregateConfig?: RatioAggregateConfig
    suffix?: Scalars['String']
    timezone?: Scalars['String']
    __typename: 'AggregateChartConfiguration'
}

export type AggregateOperations = 'AVG' | 'COUNT' | 'COUNT_EMPTY' | 'COUNT_FALSE' | 'COUNT_NOT_EMPTY' | 'COUNT_TRUE' | 'COUNT_UNIQUE_VALUES' | 'MAX' | 'MIN' | 'PERCENTAGE_EMPTY' | 'PERCENTAGE_NOT_EMPTY' | 'SUM'

export type AiModelRole = 'FAST' | 'SMART'

export type AllMetadataName = 'agent' | 'commandMenuItem' | 'fieldMetadata' | 'frontComponent' | 'index' | 'logicFunction' | 'navigationMenuItem' | 'objectMetadata' | 'objectPermission' | 'pageLayout' | 'pageLayoutTab' | 'pageLayoutWidget' | 'permissionFlag' | 'role' | 'roleTarget' | 'rowLevelPermissionPredicate' | 'rowLevelPermissionPredicateGroup' | 'skill' | 'view' | 'viewField' | 'viewFieldGroup' | 'viewFilter' | 'viewFilterGroup' | 'viewGroup' | 'viewSort' | 'webhook'

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

export interface AppToken {
    createdAt: Scalars['DateTime']
    expiresAt: Scalars['DateTime']
    id: Scalars['UUID']
    type: Scalars['String']
    updatedAt: Scalars['DateTime']
    __typename: 'AppToken'
}

export interface Application {
    agents: Agent[]
    applicationRegistration?: ApplicationRegistrationSummary
    applicationRegistrationId?: Scalars['UUID']
    applicationVariables: ApplicationVariable[]
    availablePackages: Scalars['JSON']
    canBeUninstalled: Scalars['Boolean']
    defaultLogicFunctionRole?: Role
    defaultRoleId?: Scalars['String']
    description?: Scalars['String']
    id: Scalars['UUID']
    logicFunctions: LogicFunction[]
    name: Scalars['String']
    objects: Object[]
    packageJsonChecksum?: Scalars['String']
    packageJsonFileId?: Scalars['UUID']
    settingsCustomTabFrontComponentId?: Scalars['UUID']
    universalIdentifier: Scalars['String']
    version?: Scalars['String']
    yarnLockChecksum?: Scalars['String']
    yarnLockFileId?: Scalars['UUID']
    __typename: 'Application'
}

export interface ApplicationRegistration {
    author?: Scalars['String']
    createdAt: Scalars['DateTime']
    description?: Scalars['String']
    id: Scalars['UUID']
    isFeatured: Scalars['Boolean']
    isListed: Scalars['Boolean']
    latestAvailableVersion?: Scalars['String']
    logoUrl?: Scalars['String']
    name: Scalars['String']
    oAuthClientId: Scalars['String']
    oAuthRedirectUris: Scalars['String'][]
    oAuthScopes: Scalars['String'][]
    ownerWorkspaceId?: Scalars['UUID']
    sourcePackage?: Scalars['String']
    sourceType: ApplicationRegistrationSourceType
    termsUrl?: Scalars['String']
    universalIdentifier: Scalars['String']
    updatedAt: Scalars['DateTime']
    websiteUrl?: Scalars['String']
    __typename: 'ApplicationRegistration'
}

export type ApplicationRegistrationSourceType = 'LOCAL' | 'NPM' | 'OAUTH_ONLY' | 'TARBALL'

export interface ApplicationRegistrationStats {
    activeInstalls: Scalars['Int']
    mostInstalledVersion?: Scalars['String']
    versionDistribution: VersionDistributionEntry[]
    __typename: 'ApplicationRegistrationStats'
}

export interface ApplicationRegistrationSummary {
    id: Scalars['UUID']
    latestAvailableVersion?: Scalars['String']
    sourceType: ApplicationRegistrationSourceType
    __typename: 'ApplicationRegistrationSummary'
}

export interface ApplicationRegistrationVariable {
    createdAt: Scalars['DateTime']
    description: Scalars['String']
    id: Scalars['UUID']
    isFilled: Scalars['Boolean']
    isRequired: Scalars['Boolean']
    isSecret: Scalars['Boolean']
    key: Scalars['String']
    updatedAt: Scalars['DateTime']
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
    isSecret: Scalars['Boolean']
    key: Scalars['String']
    value: Scalars['String']
    __typename: 'ApplicationVariable'
}

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
    trialPeriods: BillingTrialPeriod[]
    __typename: 'Billing'
}

export interface BillingEndTrialPeriod {
    /** Billing portal URL for payment method update (returned when no payment method exists) */
    billingPortalUrl?: Scalars['String']
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

export type BillingEntitlementKey = 'AUDIT_LOGS' | 'CUSTOM_DOMAIN' | 'RLS' | 'SSO'

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

export interface BillingMeteredProductUsage {
    grantedCredits: Scalars['Float']
    periodEnd: Scalars['DateTime']
    periodStart: Scalars['DateTime']
    productKey: BillingProductKey
    rolloverCredits: Scalars['Float']
    totalGrantedCredits: Scalars['Float']
    unitPriceCents: Scalars['Float']
    usedCredits: Scalars['Float']
    __typename: 'BillingMeteredProductUsage'
}

export interface BillingPlan {
    licensedProducts: BillingLicensedProduct[]
    meteredProducts: BillingMeteredProduct[]
    planKey: BillingPlanKey
    __typename: 'BillingPlan'
}


/** The different billing plans available */
export type BillingPlanKey = 'ENTERPRISE' | 'PRO'

export interface BillingPriceLicensed {
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
export type BillingProductKey = 'BASE_PRODUCT' | 'WORKFLOW_NODE_EXECUTION'

export interface BillingProductMetadata {
    planKey: BillingPlanKey
    priceUsageBased: BillingUsageType
    productKey: BillingProductKey
    __typename: 'BillingProductMetadata'
}

export interface BillingSession {
    url?: Scalars['String']
    __typename: 'BillingSession'
}

export interface BillingSubscription {
    billingSubscriptionItems?: BillingSubscriptionItem[]
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
    hasReachedCurrentPeriodCap: Scalars['Boolean']
    id: Scalars['UUID']
    quantity?: Scalars['Float']
    stripePriceId: Scalars['String']
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

export interface CheckUserExist {
    availableWorkspacesCount: Scalars['Float']
    exists: Scalars['Boolean']
    isEmailVerified: Scalars['Boolean']
    __typename: 'CheckUserExist'
}

export interface ClientAIModelConfig {
    dataResidency?: Scalars['String']
    inputCostPerMillionTokensInCredits: Scalars['Float']
    isDeprecated?: Scalars['Boolean']
    isRecommended?: Scalars['Boolean']
    label: Scalars['String']
    modelFamily?: ModelFamily
    modelFamilyLabel?: Scalars['String']
    modelId: Scalars['String']
    nativeCapabilities?: NativeModelCapabilities
    outputCostPerMillionTokensInCredits: Scalars['Float']
    providerName?: Scalars['String']
    sdkPackage?: Scalars['String']
    __typename: 'ClientAIModelConfig'
}

export interface ClientConfig {
    aiModels: ClientAIModelConfig[]
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
    frontDomain: Scalars['String']
    isAttachmentPreviewEnabled: Scalars['Boolean']
    isClickHouseConfigured: Scalars['Boolean']
    isCloudflareIntegrationEnabled: Scalars['Boolean']
    isConfigVariablesInDbEnabled: Scalars['Boolean']
    isEmailVerificationRequired: Scalars['Boolean']
    isGoogleCalendarEnabled: Scalars['Boolean']
    isGoogleMessagingEnabled: Scalars['Boolean']
    isImapSmtpCaldavEnabled: Scalars['Boolean']
    isMicrosoftCalendarEnabled: Scalars['Boolean']
    isMicrosoftMessagingEnabled: Scalars['Boolean']
    isMultiWorkspaceEnabled: Scalars['Boolean']
    publicFeatureFlags: PublicFeatureFlag[]
    sentry: Sentry
    signInPrefilled: Scalars['Boolean']
    support: Support
    __typename: 'ClientConfig'
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
    createdAt: Scalars['DateTime']
    engineComponentKey?: EngineComponentKey
    frontComponent?: FrontComponent
    frontComponentId?: Scalars['UUID']
    hotKeys?: Scalars['String'][]
    icon?: Scalars['String']
    id: Scalars['UUID']
    isPinned: Scalars['Boolean']
    label: Scalars['String']
    position: Scalars['Float']
    shortLabel?: Scalars['String']
    updatedAt: Scalars['DateTime']
    workflowVersionId?: Scalars['UUID']
    __typename: 'CommandMenuItem'
}

export type CommandMenuItemAvailabilityType = 'FALLBACK' | 'GLOBAL' | 'RECORD_SELECTION'

export type ConfigSource = 'DATABASE' | 'DEFAULT' | 'ENVIRONMENT'

export interface ConfigVariable {
    description: Scalars['String']
    isEnvOnly: Scalars['Boolean']
    isSensitive: Scalars['Boolean']
    name: Scalars['String']
    options?: Scalars['JSON']
    source: ConfigSource
    type: ConfigVariableType
    value?: Scalars['JSON']
    __typename: 'ConfigVariable'
}

export type ConfigVariableType = 'ARRAY' | 'BOOLEAN' | 'ENUM' | 'JSON' | 'NUMBER' | 'STRING'

export interface ConfigVariables {
    groups: ConfigVariablesGroupData[]
    __typename: 'ConfigVariables'
}

export type ConfigVariablesGroup = 'ADVANCED_SETTINGS' | 'ANALYTICS_CONFIG' | 'AWS_SES_SETTINGS' | 'BILLING_CONFIG' | 'CAPTCHA_CONFIG' | 'CLOUDFLARE_CONFIG' | 'CODE_INTERPRETER_CONFIG' | 'EMAIL_SETTINGS' | 'GOOGLE_AUTH' | 'LLM' | 'LOGGING' | 'LOGIC_FUNCTION_CONFIG' | 'MICROSOFT_AUTH' | 'RATE_LIMITING' | 'SERVER_CONFIG' | 'SSL' | 'STORAGE_CONFIG' | 'SUPPORT_CHAT_CONFIG' | 'TOKENS_DURATION'

export interface ConfigVariablesGroupData {
    description: Scalars['String']
    isHiddenOnLoad: Scalars['Boolean']
    name: ConfigVariablesGroup
    variables: ConfigVariable[]
    __typename: 'ConfigVariablesGroupData'
}

export interface ConnectedAccountDTO {
    authFailedAt?: Scalars['DateTime']
    createdAt: Scalars['DateTime']
    handle: Scalars['String']
    handleAliases?: Scalars['String'][]
    id: Scalars['UUID']
    lastCredentialsRefreshedAt?: Scalars['DateTime']
    lastSignedInAt?: Scalars['DateTime']
    provider: Scalars['String']
    scopes?: Scalars['String'][]
    updatedAt: Scalars['DateTime']
    userWorkspaceId: Scalars['UUID']
    __typename: 'ConnectedAccountDTO'
}

export interface ConnectedImapSmtpCaldavAccount {
    accountOwnerId: Scalars['UUID']
    connectionParameters?: ImapSmtpCaldavConnectionParameters
    handle: Scalars['String']
    id: Scalars['UUID']
    provider: Scalars['String']
    __typename: 'ConnectedImapSmtpCaldavAccount'
}

export interface ConnectionParametersOutput {
    host: Scalars['String']
    password: Scalars['String']
    port: Scalars['Float']
    secure?: Scalars['Boolean']
    username?: Scalars['String']
    __typename: 'ConnectionParametersOutput'
}

export interface CreateApplicationRegistration {
    applicationRegistration: ApplicationRegistration
    clientSecret: Scalars['String']
    __typename: 'CreateApplicationRegistration'
}


/** Database Event Action */
export type DatabaseEventAction = 'CREATED' | 'DELETED' | 'DESTROYED' | 'RESTORED' | 'UPDATED' | 'UPSERTED'

export interface DeleteJobsResponse {
    deletedCount: Scalars['Int']
    results: JobOperationResult[]
    __typename: 'DeleteJobsResponse'
}

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

export interface EditSso {
    id: Scalars['UUID']
    issuer: Scalars['String']
    name: Scalars['String']
    status: SSOIdentityProviderStatus
    type: IdentityProviderType
    __typename: 'EditSso'
}

export interface EmailPasswordResetLink {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'EmailPasswordResetLink'
}

export interface EmailingDomain {
    createdAt: Scalars['DateTime']
    domain: Scalars['String']
    driver: EmailingDomainDriver
    id: Scalars['UUID']
    status: EmailingDomainStatus
    updatedAt: Scalars['DateTime']
    verificationRecords?: VerificationRecord[]
    verifiedAt?: Scalars['DateTime']
    __typename: 'EmailingDomain'
}

export type EmailingDomainDriver = 'AWS_SES'

export type EmailingDomainStatus = 'FAILED' | 'PENDING' | 'TEMPORARY_FAILURE' | 'VERIFIED'

export interface EmailsConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'EmailsConfiguration'
}

export type EngineComponentKey = 'ACTIVATE_WORKFLOW' | 'ADD_NODE_WORKFLOW' | 'ADD_TO_FAVORITES' | 'ASK_AI' | 'CANCEL_DASHBOARD_LAYOUT' | 'CREATE_NEW_RECORD' | 'CREATE_NEW_VIEW' | 'DEACTIVATE_WORKFLOW' | 'DELETE_MULTIPLE_RECORDS' | 'DELETE_SINGLE_RECORD' | 'DESTROY_MULTIPLE_RECORDS' | 'DESTROY_SINGLE_RECORD' | 'DISCARD_DRAFT_WORKFLOW' | 'DUPLICATE_DASHBOARD' | 'DUPLICATE_WORKFLOW' | 'EDIT_DASHBOARD_LAYOUT' | 'EDIT_RECORD_PAGE_LAYOUT' | 'EXPORT_FROM_RECORD_INDEX' | 'EXPORT_FROM_RECORD_SHOW' | 'EXPORT_MULTIPLE_RECORDS' | 'EXPORT_NOTE_TO_PDF' | 'EXPORT_VIEW' | 'GO_TO_COMPANIES' | 'GO_TO_DASHBOARDS' | 'GO_TO_NOTES' | 'GO_TO_OPPORTUNITIES' | 'GO_TO_PEOPLE' | 'GO_TO_RUNS' | 'GO_TO_SETTINGS' | 'GO_TO_TASKS' | 'GO_TO_WORKFLOWS' | 'HIDE_DELETED_RECORDS' | 'IMPORT_RECORDS' | 'MERGE_MULTIPLE_RECORDS' | 'NAVIGATE_TO_NEXT_RECORD' | 'NAVIGATE_TO_PREVIOUS_RECORD' | 'REMOVE_FROM_FAVORITES' | 'RESTORE_MULTIPLE_RECORDS' | 'RESTORE_SINGLE_RECORD' | 'SAVE_DASHBOARD_LAYOUT' | 'SEARCH_RECORDS' | 'SEARCH_RECORDS_FALLBACK' | 'SEE_ACTIVE_VERSION_WORKFLOW' | 'SEE_DELETED_RECORDS' | 'SEE_RUNS_WORKFLOW' | 'SEE_RUNS_WORKFLOW_VERSION' | 'SEE_VERSIONS_WORKFLOW' | 'SEE_VERSIONS_WORKFLOW_VERSION' | 'SEE_VERSION_WORKFLOW_RUN' | 'SEE_WORKFLOW_WORKFLOW_RUN' | 'SEE_WORKFLOW_WORKFLOW_VERSION' | 'STOP_WORKFLOW_RUN' | 'TEST_WORKFLOW' | 'TIDY_UP_WORKFLOW' | 'UPDATE_MULTIPLE_RECORDS' | 'USE_AS_DRAFT_WORKFLOW_VERSION' | 'VIEW_PREVIOUS_AI_CHATS'

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

export type EventLogTable = 'OBJECT_EVENT' | 'PAGEVIEW' | 'USAGE_EVENT' | 'WORKSPACE_EVENT'

export interface EventSubscription {
    eventStreamId: Scalars['String']
    metadataEvents: MetadataEvent[]
    objectRecordEventsWithQueryIds: ObjectRecordEventWithQueryIds[]
    __typename: 'EventSubscription'
}

export interface FeatureFlag {
    key: FeatureFlagKey
    value: Scalars['Boolean']
    __typename: 'FeatureFlag'
}

export type FeatureFlagKey = 'IS_AI_ENABLED' | 'IS_APPLICATION_ENABLED' | 'IS_ATTACHMENT_MIGRATED' | 'IS_COMMAND_MENU_ITEM_ENABLED' | 'IS_CONNECTED_ACCOUNT_MIGRATED' | 'IS_DASHBOARD_V2_ENABLED' | 'IS_DATE_TIME_WHOLE_DAY_FILTER_ENABLED' | 'IS_DIRECT_GRAPHQL_EXECUTION_ENABLED' | 'IS_DRAFT_EMAIL_ENABLED' | 'IS_EMAILING_DOMAIN_ENABLED' | 'IS_JSON_FILTER_ENABLED' | 'IS_JUNCTION_RELATIONS_ENABLED' | 'IS_MARKETPLACE_ENABLED' | 'IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED' | 'IS_NAVIGATION_MENU_ITEM_ENABLED' | 'IS_NOTE_TARGET_MIGRATED' | 'IS_PUBLIC_DOMAIN_ENABLED' | 'IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED' | 'IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED' | 'IS_RICH_TEXT_V1_MIGRATED' | 'IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED' | 'IS_TASK_TARGET_MIGRATED' | 'IS_UNIQUE_INDEXES_ENABLED' | 'IS_USAGE_ANALYTICS_ENABLED'

export interface Field {
    applicationId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    defaultValue?: Scalars['JSON']
    description?: Scalars['String']
    icon?: Scalars['String']
    id: Scalars['UUID']
    isActive?: Scalars['Boolean']
    isCustom?: Scalars['Boolean']
    isLabelSyncedWithName?: Scalars['Boolean']
    isNullable?: Scalars['Boolean']
    isSystem?: Scalars['Boolean']
    isUIReadOnly?: Scalars['Boolean']
    isUnique?: Scalars['Boolean']
    label: Scalars['String']
    morphId?: Scalars['UUID']
    morphRelations?: Relation[]
    name: Scalars['String']
    object?: Object
    options?: Scalars['JSON']
    relation?: Relation
    settings?: Scalars['JSON']
    standardOverrides?: StandardOverrides
    type: FieldMetadataType
    universalIdentifier: Scalars['String']
    updatedAt: Scalars['DateTime']
    __typename: 'Field'
}

export interface FieldConfiguration {
    configurationType: WidgetConfigurationType
    fieldDisplayMode: FieldDisplayMode
    fieldMetadataId: Scalars['String']
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
export type FieldDisplayMode = 'CARD' | 'FIELD' | 'VIEW'

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

export type FileFolder = 'AgentChat' | 'AppTarball' | 'Attachment' | 'BuiltFrontComponent' | 'BuiltLogicFunction' | 'CorePicture' | 'Dependencies' | 'File' | 'FilesField' | 'PersonPicture' | 'ProfilePicture' | 'PublicAsset' | 'Source' | 'Workflow' | 'WorkspaceLogo'

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

export interface FrontComponent {
    applicationId: Scalars['UUID']
    applicationTokenPair?: ApplicationTokenPair
    builtComponentChecksum: Scalars['String']
    builtComponentPath: Scalars['String']
    componentName: Scalars['String']
    createdAt: Scalars['DateTime']
    description?: Scalars['String']
    id: Scalars['UUID']
    isHeadless: Scalars['Boolean']
    name: Scalars['String']
    sourceComponentPath: Scalars['String']
    universalIdentifier?: Scalars['UUID']
    updatedAt: Scalars['DateTime']
    __typename: 'FrontComponent'
}

export interface FrontComponentConfiguration {
    configurationType: WidgetConfigurationType
    frontComponentId: Scalars['UUID']
    __typename: 'FrontComponentConfiguration'
}

export interface FullName {
    firstName: Scalars['String']
    lastName: Scalars['String']
    __typename: 'FullName'
}

export interface GaugeChartConfiguration {
    aggregateFieldMetadataId: Scalars['UUID']
    aggregateOperation: AggregateOperations
    color?: Scalars['String']
    configurationType: WidgetConfigurationType
    description?: Scalars['String']
    displayDataLabel?: Scalars['Boolean']
    filter?: Scalars['JSON']
    firstDayOfTheWeek?: Scalars['Int']
    timezone?: Scalars['String']
    __typename: 'GaugeChartConfiguration'
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

export type HealthIndicatorId = 'app' | 'connectedAccount' | 'database' | 'redis' | 'worker'

export type IdentityProviderType = 'OIDC' | 'SAML'

export interface IframeConfiguration {
    configurationType: WidgetConfigurationType
    url?: Scalars['String']
    __typename: 'IframeConfiguration'
}

export interface ImapSmtpCaldavConnectionParameters {
    CALDAV?: ConnectionParametersOutput
    IMAP?: ConnectionParametersOutput
    SMTP?: ConnectionParametersOutput
    __typename: 'ImapSmtpCaldavConnectionParameters'
}

export interface ImapSmtpCaldavConnectionSuccess {
    connectedAccountId: Scalars['String']
    success: Scalars['Boolean']
    __typename: 'ImapSmtpCaldavConnectionSuccess'
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
    indexFieldMetadatas: IndexIndexFieldMetadatasConnection
    indexType: IndexType
    indexWhereClause?: Scalars['String']
    isCustom?: Scalars['Boolean']
    isUnique: Scalars['Boolean']
    name: Scalars['String']
    objectMetadata: IndexObjectMetadataConnection
    updatedAt: Scalars['DateTime']
    __typename: 'Index'
}

export interface IndexConnection {
    /** Array of edges. */
    edges: IndexEdge[]
    /** Paging information */
    pageInfo: PageInfo
    __typename: 'IndexConnection'
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
    updatedAt: Scalars['DateTime']
    __typename: 'IndexField'
}

export interface IndexFieldEdge {
    /** Cursor for this node. */
    cursor: Scalars['ConnectionCursor']
    /** The node containing the IndexField */
    node: IndexField
    __typename: 'IndexFieldEdge'
}

export interface IndexIndexFieldMetadatasConnection {
    /** Array of edges. */
    edges: IndexFieldEdge[]
    /** Paging information */
    pageInfo: PageInfo
    __typename: 'IndexIndexFieldMetadatasConnection'
}

export interface IndexObjectMetadataConnection {
    /** Array of edges. */
    edges: ObjectEdge[]
    /** Paging information */
    pageInfo: PageInfo
    __typename: 'IndexObjectMetadataConnection'
}


/** Type of the index */
export type IndexType = 'BTREE' | 'GIN'

export interface InitiateTwoFactorAuthenticationProvisioning {
    uri: Scalars['String']
    __typename: 'InitiateTwoFactorAuthenticationProvisioning'
}

export interface InvalidatePassword {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'InvalidatePassword'
}

export interface JobOperationResult {
    error?: Scalars['String']
    jobId: Scalars['String']
    success: Scalars['Boolean']
    __typename: 'JobOperationResult'
}


/** Job state in the queue */
export type JobState = 'ACTIVE' | 'COMPLETED' | 'DELAYED' | 'FAILED' | 'PRIORITIZED' | 'WAITING' | 'WAITING_CHILDREN'

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
    id: Scalars['String']
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
    createdAt: Scalars['DateTime']
    cronTriggerSettings?: Scalars['JSON']
    databaseEventTriggerSettings?: Scalars['JSON']
    description?: Scalars['String']
    handlerName: Scalars['String']
    httpRouteTriggerSettings?: Scalars['JSON']
    id: Scalars['UUID']
    isTool: Scalars['Boolean']
    name: Scalars['String']
    runtime: Scalars['String']
    sourceHandlerPath: Scalars['String']
    timeoutSeconds: Scalars['Float']
    toolInputSchema?: Scalars['JSON']
    universalIdentifier?: Scalars['UUID']
    updatedAt: Scalars['DateTime']
    __typename: 'LogicFunction'
}

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
    __typename: 'LogicFunctionLogs'
}

export interface LoginToken {
    loginToken: AuthToken
    __typename: 'LoginToken'
}

export interface MarketplaceApp {
    aboutDescription: Scalars['String']
    author: Scalars['String']
    category: Scalars['String']
    defaultRole?: MarketplaceAppDefaultRole
    description: Scalars['String']
    fields: MarketplaceAppField[]
    frontComponents: MarketplaceAppFrontComponent[]
    icon: Scalars['String']
    id: Scalars['String']
    isFeatured: Scalars['Boolean']
    logicFunctions: MarketplaceAppLogicFunction[]
    logo?: Scalars['String']
    name: Scalars['String']
    objects: MarketplaceAppObject[]
    providers: Scalars['String'][]
    screenshots: Scalars['String'][]
    sourcePackage?: Scalars['String']
    termsUrl?: Scalars['String']
    version: Scalars['String']
    websiteUrl?: Scalars['String']
    __typename: 'MarketplaceApp'
}

export interface MarketplaceAppDefaultRole {
    canAccessAllTools: Scalars['Boolean']
    canDestroyAllObjectRecords: Scalars['Boolean']
    canReadAllObjectRecords: Scalars['Boolean']
    canSoftDeleteAllObjectRecords: Scalars['Boolean']
    canUpdateAllObjectRecords: Scalars['Boolean']
    canUpdateAllSettings: Scalars['Boolean']
    description?: Scalars['String']
    fieldPermissions: MarketplaceAppRoleFieldPermission[]
    id: Scalars['String']
    label: Scalars['String']
    objectPermissions: MarketplaceAppRoleObjectPermission[]
    permissionFlags: Scalars['String'][]
    __typename: 'MarketplaceAppDefaultRole'
}

export interface MarketplaceAppField {
    description?: Scalars['String']
    icon?: Scalars['String']
    label: Scalars['String']
    name: Scalars['String']
    objectUniversalIdentifier?: Scalars['String']
    type: Scalars['String']
    universalIdentifier?: Scalars['String']
    __typename: 'MarketplaceAppField'
}

export interface MarketplaceAppFrontComponent {
    description?: Scalars['String']
    name: Scalars['String']
    __typename: 'MarketplaceAppFrontComponent'
}

export interface MarketplaceAppLogicFunction {
    description?: Scalars['String']
    name: Scalars['String']
    timeoutSeconds?: Scalars['Int']
    __typename: 'MarketplaceAppLogicFunction'
}

export interface MarketplaceAppObject {
    description?: Scalars['String']
    fields: MarketplaceAppField[]
    icon?: Scalars['String']
    labelPlural: Scalars['String']
    labelSingular: Scalars['String']
    namePlural: Scalars['String']
    nameSingular: Scalars['String']
    universalIdentifier: Scalars['String']
    __typename: 'MarketplaceAppObject'
}

export interface MarketplaceAppRoleFieldPermission {
    canReadFieldValue?: Scalars['Boolean']
    canUpdateFieldValue?: Scalars['Boolean']
    fieldUniversalIdentifier: Scalars['String']
    objectUniversalIdentifier: Scalars['String']
    __typename: 'MarketplaceAppRoleFieldPermission'
}

export interface MarketplaceAppRoleObjectPermission {
    canDestroyObjectRecords?: Scalars['Boolean']
    canReadObjectRecords?: Scalars['Boolean']
    canSoftDeleteObjectRecords?: Scalars['Boolean']
    canUpdateObjectRecords?: Scalars['Boolean']
    objectUniversalIdentifier: Scalars['String']
    __typename: 'MarketplaceAppRoleObjectPermission'
}

export interface MessageChannel {
    connectedAccountId: Scalars['UUID']
    contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy
    createdAt: Scalars['DateTime']
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

export type MessageChannelType = 'EMAIL' | 'SMS'

export type MessageChannelVisibility = 'METADATA' | 'SHARE_EVERYTHING' | 'SUBJECT'

export interface MessageFolder {
    createdAt: Scalars['DateTime']
    externalId?: Scalars['String']
    id: Scalars['UUID']
    isSentFolder: Scalars['Boolean']
    isSynced: Scalars['Boolean']
    messageChannelId: Scalars['UUID']
    name?: Scalars['String']
    parentFolderId?: Scalars['UUID']
    pendingSyncAction: MessageFolderPendingSyncAction
    updatedAt: Scalars['DateTime']
    __typename: 'MessageFolder'
}

export type MessageFolderImportPolicy = 'ALL_FOLDERS' | 'SELECTED_FOLDERS'

export type MessageFolderPendingSyncAction = 'FOLDER_DELETION' | 'NONE'

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
    isCustom: Scalars['Boolean']
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

export interface ModelsDevModelSuggestion {
    cacheCreationCostPerMillionTokens?: Scalars['Float']
    cachedInputCostPerMillionTokens?: Scalars['Float']
    contextWindowTokens: Scalars['Float']
    inputCostPerMillionTokens: Scalars['Float']
    maxOutputTokens: Scalars['Float']
    modalities: Scalars['String'][]
    modelId: Scalars['String']
    name: Scalars['String']
    outputCostPerMillionTokens: Scalars['Float']
    supportsReasoning: Scalars['Boolean']
    __typename: 'ModelsDevModelSuggestion'
}

export interface ModelsDevProviderSuggestion {
    id: Scalars['String']
    modelCount: Scalars['Float']
    npm: Scalars['String']
    __typename: 'ModelsDevProviderSuggestion'
}

export interface Mutation {
    activateSkill: Skill
    activateWorkspace: Workspace
    addAiProvider: Scalars['Boolean']
    addModelToProvider: Scalars['Boolean']
    addQueryToEventStream: Scalars['Boolean']
    assignRoleToAgent: Scalars['Boolean']
    assignRoleToApiKey: Scalars['Boolean']
    authorizeApp: AuthorizeApp
    cancelSwitchBillingInterval: BillingUpdate
    cancelSwitchBillingPlan: BillingUpdate
    cancelSwitchMeteredPrice: BillingUpdate
    checkCustomDomainValidRecords?: DomainValidRecords
    checkPublicDomainValidRecords?: DomainValidRecords
    checkoutSession: BillingSession
    createApiKey: ApiKey
    createApplicationRegistration: CreateApplicationRegistration
    createApplicationRegistrationVariable: ApplicationRegistrationVariable
    createApprovedAccessDomain: ApprovedAccessDomain
    createChatThread: AgentChatThread
    createCommandMenuItem: CommandMenuItem
    createDatabaseConfigVariable: Scalars['Boolean']
    createDevelopmentApplication: DevelopmentApplication
    createEmailingDomain: EmailingDomain
    createFrontComponent: FrontComponent
    createManyViewFieldGroups: ViewFieldGroup[]
    createManyViewFields: ViewField[]
    createManyViewGroups: ViewGroup[]
    createNavigationMenuItem: NavigationMenuItem
    createOIDCIdentityProvider: SetupSso
    createObjectEvent: Analytics
    createOneAgent: Agent
    createOneAppToken: AppToken
    createOneField: Field
    createOneLogicFunction: LogicFunction
    createOneObject: Object
    createOneRole: Role
    createPageLayout: PageLayout
    createPageLayoutTab: PageLayoutTab
    createPageLayoutWidget: PageLayoutWidget
    createPublicDomain: PublicDomain
    createSAMLIdentityProvider: SetupSso
    createSkill: Skill
    createView: View
    createViewField: ViewField
    createViewFieldGroup: ViewFieldGroup
    createViewFilter: ViewFilter
    createViewFilterGroup: ViewFilterGroup
    createViewGroup: ViewGroup
    createViewSort: ViewSort
    createWebhook: Webhook
    deactivateSkill: Skill
    deleteApplicationRegistration: Scalars['Boolean']
    deleteApplicationRegistrationVariable: Scalars['Boolean']
    deleteApprovedAccessDomain: Scalars['Boolean']
    deleteCommandMenuItem: CommandMenuItem
    deleteConnectedAccount: ConnectedAccountDTO
    deleteCurrentWorkspace: Workspace
    deleteDatabaseConfigVariable: Scalars['Boolean']
    deleteEmailingDomain: Scalars['Boolean']
    deleteFrontComponent: FrontComponent
    deleteJobs: DeleteJobsResponse
    deleteNavigationMenuItem: NavigationMenuItem
    deleteOneAgent: Agent
    deleteOneField: Field
    deleteOneLogicFunction: LogicFunction
    deleteOneObject: Object
    deleteOneRole: Scalars['String']
    deletePublicDomain: Scalars['Boolean']
    deleteSSOIdentityProvider: DeleteSso
    deleteSkill: Skill
    deleteTwoFactorAuthenticationMethod: DeleteTwoFactorAuthenticationMethod
    deleteUser: User
    deleteUserFromWorkspace: UserWorkspace
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
    disablePostgresProxy: PostgresCredentials
    duplicateDashboard: DuplicatedDashboard
    editSSOIdentityProvider: EditSso
    emailPasswordResetLink: EmailPasswordResetLink
    enablePostgresProxy: PostgresCredentials
    endSubscriptionTrialPeriod: BillingEndTrialPeriod
    evaluateAgentTurn: AgentTurnEvaluation
    executeOneLogicFunction: LogicFunctionExecutionResult
    generateApiKeyToken: ApiKeyToken
    generateApplicationToken: ApplicationTokenPair
    generateTransientToken: TransientToken
    getAuthTokensFromLoginToken: AuthTokens
    getAuthTokensFromOTP: AuthTokens
    getAuthorizationUrlForSSO: GetAuthorizationUrlForSSO
    getLoginTokenFromCredentials: LoginToken
    impersonate: Impersonate
    initiateOTPProvisioning: InitiateTwoFactorAuthenticationProvisioning
    initiateOTPProvisioningForAuthenticatedUser: InitiateTwoFactorAuthenticationProvisioning
    installApplication: Scalars['Boolean']
    installMarketplaceApp: Scalars['Boolean']
    refreshEnterpriseValidityToken: Scalars['Boolean']
    removeAiProvider: Scalars['Boolean']
    removeModelFromProvider: Scalars['Boolean']
    removeQueryFromEventStream: Scalars['Boolean']
    removeRoleFromAgent: Scalars['Boolean']
    renewApplicationToken: ApplicationTokenPair
    renewToken: AuthTokens
    resendEmailVerificationToken: ResendEmailVerificationToken
    resendWorkspaceInvitation: SendInvitations
    retryJobs: RetryJobsResponse
    revokeApiKey?: ApiKey
    rotateApplicationRegistrationClientSecret: RotateClientSecret
    runEvaluationInput: AgentTurn
    runWorkspaceMigration: Scalars['Boolean']
    saveImapSmtpCaldavAccount: ImapSmtpCaldavConnectionSuccess
    sendInvitations: SendInvitations
    setAdminAiModelEnabled: Scalars['Boolean']
    setAdminAiModelRecommended: Scalars['Boolean']
    setAdminDefaultAiModel: Scalars['Boolean']
    setEnterpriseKey: EnterpriseLicenseInfoDTO
    setMeteredSubscriptionPrice: BillingUpdate
    signIn: AvailableWorkspacesAndAccessTokens
    signUp: AvailableWorkspacesAndAccessTokens
    signUpInNewWorkspace: SignUp
    signUpInWorkspace: SignUp
    skipBookOnboardingStep: OnboardingStepSuccess
    skipSyncEmailOnboardingStep: OnboardingStepSuccess
    startChannelSync: ChannelSyncSuccess
    switchBillingPlan: BillingUpdate
    switchSubscriptionInterval: BillingUpdate
    syncApplication: WorkspaceMigration
    trackAnalytics: Analytics
    transferApplicationRegistrationOwnership: ApplicationRegistration
    uninstallApplication: Scalars['Boolean']
    updateApiKey?: ApiKey
    updateApplicationRegistration: ApplicationRegistration
    updateApplicationRegistrationVariable: ApplicationRegistrationVariable
    updateCalendarChannel: CalendarChannel
    updateCommandMenuItem: CommandMenuItem
    updateDatabaseConfigVariable: Scalars['Boolean']
    updateFrontComponent: FrontComponent
    updateLabPublicFeatureFlag: FeatureFlag
    updateMessageChannel: MessageChannel
    updateMessageFolder: MessageFolder
    updateMessageFolders: MessageFolder[]
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
    updateUserEmail: Scalars['Boolean']
    updateView: View
    updateViewField: ViewField
    updateViewFieldGroup: ViewFieldGroup
    updateViewFilter: ViewFilter
    updateViewFilterGroup: ViewFilterGroup
    updateViewGroup: ViewGroup
    updateViewSort: ViewSort
    updateWebhook: Webhook
    updateWorkspace: Workspace
    updateWorkspaceFeatureFlag: Scalars['Boolean']
    updateWorkspaceMemberRole: WorkspaceMember
    upgradeApplication: Scalars['Boolean']
    uploadAIChatFile: FileWithSignedUrl
    uploadAppTarball: ApplicationRegistration
    uploadApplicationFile: File
    uploadFilesFieldFile: FileWithSignedUrl
    uploadFilesFieldFileByUniversalIdentifier: FileWithSignedUrl
    uploadWorkflowFile: FileWithSignedUrl
    uploadWorkspaceLogo: FileWithSignedUrl
    uploadWorkspaceMemberProfilePicture: FileWithSignedUrl
    upsertFieldPermissions: FieldPermission[]
    upsertFieldsWidget: View
    upsertObjectPermissions: ObjectPermission[]
    upsertPermissionFlags: PermissionFlag[]
    upsertRowLevelPermissionPredicates: UpsertRowLevelPermissionPredicatesResult
    userLookupAdminPanel: UserLookup
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

export type NavigationMenuItemType = 'FOLDER' | 'LINK' | 'OBJECT' | 'RECORD' | 'VIEW'

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
    isCustom: Scalars['Boolean']
    isLabelSyncedWithName: Scalars['Boolean']
    isRemote: Scalars['Boolean']
    isSearchable: Scalars['Boolean']
    isSystem: Scalars['Boolean']
    isUIReadOnly: Scalars['Boolean']
    labelIdentifierFieldMetadataId?: Scalars['UUID']
    labelPlural: Scalars['String']
    labelSingular: Scalars['String']
    namePlural: Scalars['String']
    nameSingular: Scalars['String']
    shortcut?: Scalars['String']
    standardOverrides?: ObjectStandardOverrides
    universalIdentifier: Scalars['String']
    updatedAt: Scalars['DateTime']
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

export interface ObjectStandardOverrides {
    color?: Scalars['String']
    description?: Scalars['String']
    icon?: Scalars['String']
    labelPlural?: Scalars['String']
    labelSingular?: Scalars['String']
    translations?: Scalars['JSON']
    __typename: 'ObjectStandardOverrides'
}


/** Onboarding status */
export type OnboardingStatus = 'BOOK_ONBOARDING' | 'COMPLETED' | 'INVITE_TEAM' | 'PLAN_REQUIRED' | 'PROFILE_CREATION' | 'SYNC_EMAIL' | 'WORKSPACE_ACTIVATION'

export interface OnboardingStepSuccess {
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'OnboardingStepSuccess'
}

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
    createdAt: Scalars['DateTime']
    defaultTabToFocusOnMobileAndSidePanelId?: Scalars['UUID']
    deletedAt?: Scalars['DateTime']
    id: Scalars['UUID']
    name: Scalars['String']
    objectMetadataId?: Scalars['UUID']
    tabs?: PageLayoutTab[]
    type: PageLayoutType
    updatedAt: Scalars['DateTime']
    __typename: 'PageLayout'
}

export interface PageLayoutTab {
    applicationId: Scalars['UUID']
    createdAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    icon?: Scalars['String']
    id: Scalars['UUID']
    isOverridden: Scalars['Boolean']
    layoutMode?: PageLayoutTabLayoutMode
    pageLayoutId: Scalars['UUID']
    position: Scalars['Float']
    title: Scalars['String']
    updatedAt: Scalars['DateTime']
    widgets?: PageLayoutWidget[]
    __typename: 'PageLayoutTab'
}

export type PageLayoutTabLayoutMode = 'CANVAS' | 'GRID' | 'VERTICAL_LIST'

export type PageLayoutType = 'DASHBOARD' | 'RECORD_INDEX' | 'RECORD_PAGE'

export interface PageLayoutWidget {
    conditionalDisplay?: Scalars['JSON']
    configuration: WidgetConfiguration
    createdAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    gridPosition: GridPosition
    id: Scalars['UUID']
    isOverridden: Scalars['Boolean']
    objectMetadataId?: Scalars['UUID']
    pageLayoutTabId: Scalars['UUID']
    position?: PageLayoutWidgetPosition
    title: Scalars['String']
    type: WidgetType
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

export interface PageLayoutWidgetVerticalListPosition {
    index: Scalars['Int']
    layoutMode: PageLayoutTabLayoutMode
    __typename: 'PageLayoutWidgetVerticalListPosition'
}

export interface PermissionFlag {
    flag: PermissionFlagType
    id: Scalars['UUID']
    roleId: Scalars['UUID']
    __typename: 'PermissionFlag'
}

export type PermissionFlagType = 'AI' | 'AI_SETTINGS' | 'API_KEYS_AND_WEBHOOKS' | 'APPLICATIONS' | 'BILLING' | 'CODE_INTERPRETER_TOOL' | 'CONNECTED_ACCOUNTS' | 'DATA_MODEL' | 'DOWNLOAD_FILE' | 'EXPORT_CSV' | 'HTTP_REQUEST_TOOL' | 'IMPERSONATE' | 'IMPORT_CSV' | 'LAYOUTS' | 'MARKETPLACE_APPS' | 'PROFILE_INFORMATION' | 'ROLES' | 'SECURITY' | 'SEND_EMAIL_TOOL' | 'SSO_BYPASS' | 'UPLOAD_FILE' | 'VIEWS' | 'WORKFLOWS' | 'WORKSPACE' | 'WORKSPACE_MEMBERS'

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
    id: Scalars['String']
    value: Scalars['Float']
    __typename: 'PieChartDataItem'
}

export interface PlaceDetailsResult {
    city?: Scalars['String']
    country?: Scalars['String']
    location?: Location
    postcode?: Scalars['String']
    state?: Scalars['String']
    __typename: 'PlaceDetailsResult'
}

export interface PostgresCredentials {
    id: Scalars['UUID']
    password: Scalars['String']
    user: Scalars['String']
    workspaceId: Scalars['UUID']
    __typename: 'PostgresCredentials'
}

export interface PublicApplicationRegistration {
    id: Scalars['UUID']
    logoUrl?: Scalars['String']
    name: Scalars['String']
    oAuthScopes: Scalars['String'][]
    websiteUrl?: Scalars['String']
    __typename: 'PublicApplicationRegistration'
}

export interface PublicDomain {
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
    imagePath?: Scalars['String']
    label: Scalars['String']
    __typename: 'PublicFeatureFlagMetadata'
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

export interface Query {
    agentTurns: AgentTurn[]
    apiKey?: ApiKey
    apiKeys: ApiKey[]
    applicationRegistrationTarballUrl?: Scalars['String']
    barChartData: BarChartData
    billingPortalSession: BillingSession
    chatMessages: AgentMessage[]
    chatThread: AgentChatThread
    chatThreads: AgentChatThreadConnection
    checkUserExists: CheckUserExist
    checkWorkspaceInviteHashIsValid: WorkspaceInviteHashValid
    commandMenuItem?: CommandMenuItem
    commandMenuItems: CommandMenuItem[]
    connectedAccounts: ConnectedAccountDTO[]
    currentUser: User
    currentWorkspace: Workspace
    enterpriseCheckoutSession?: Scalars['String']
    enterprisePortalSession?: Scalars['String']
    enterpriseSubscriptionStatus?: EnterpriseSubscriptionStatusDTO
    eventLogs: EventLogQueryResult
    field: Field
    fields: FieldConnection
    findAllApplicationRegistrations: ApplicationRegistration[]
    findApplicationRegistrationByClientId?: PublicApplicationRegistration
    findApplicationRegistrationByUniversalIdentifier?: ApplicationRegistration
    findApplicationRegistrationStats: ApplicationRegistrationStats
    findApplicationRegistrationVariables: ApplicationRegistrationVariable[]
    findManyAgents: Agent[]
    findManyApplicationRegistrations: ApplicationRegistration[]
    findManyApplications: Application[]
    findManyLogicFunctions: LogicFunction[]
    findManyMarketplaceApps: MarketplaceApp[]
    findManyPublicDomains: PublicDomain[]
    findOneAgent: Agent
    findOneApplication: Application
    findOneApplicationRegistration: ApplicationRegistration
    findOneLogicFunction: LogicFunction
    findOneMarketplaceApp: MarketplaceApp
    findWorkspaceFromInviteHash: Workspace
    findWorkspaceInvitations: WorkspaceInvitation[]
    frontComponent?: FrontComponent
    frontComponents: FrontComponent[]
    getAISystemPromptPreview: AISystemPromptPreview
    getAddressDetails: PlaceDetailsResult
    getAdminAiModels: AdminAIModels
    getAiProviders: Scalars['JSON']
    getApprovedAccessDomains: ApprovedAccessDomain[]
    getAutoCompleteAddress: AutocompleteResult[]
    getAvailablePackages: Scalars['JSON']
    getConfigVariablesGrouped: ConfigVariables
    getConnectedImapSmtpCaldavAccount: ConnectedImapSmtpCaldavAccount
    getDatabaseConfigVariable: ConfigVariable
    getEmailingDomains: EmailingDomain[]
    getIndicatorHealthStatus: AdminPanelHealthServiceData
    getLogicFunctionSourceCode?: Scalars['String']
    getMeteredProductsUsage: BillingMeteredProductUsage[]
    getModelsDevProviders: ModelsDevProviderSuggestion[]
    getModelsDevSuggestions: ModelsDevModelSuggestion[]
    getPageLayout?: PageLayout
    getPageLayoutTab: PageLayoutTab
    getPageLayoutTabs: PageLayoutTab[]
    getPageLayoutWidget: PageLayoutWidget
    getPageLayoutWidgets: PageLayoutWidget[]
    getPageLayouts: PageLayout[]
    getPostgresCredentials?: PostgresCredentials
    getPublicWorkspaceDataByDomain: PublicWorkspaceData
    getQueueJobs: QueueJobsResponse
    getQueueMetrics: QueueMetricsData
    getRoles: Role[]
    getSSOIdentityProviders: FindAvailableSSOIDP[]
    getSystemHealthStatus: SystemHealth
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
    index: Index
    indexMetadatas: IndexConnection
    lineChartData: LineChartData
    listPlans: BillingPlan[]
    minimalMetadata: MinimalMetadata
    myCalendarChannels: CalendarChannel[]
    myConnectedAccounts: ConnectedAccountDTO[]
    myMessageChannels: MessageChannel[]
    myMessageFolders: MessageFolder[]
    navigationMenuItem?: NavigationMenuItem
    navigationMenuItems: NavigationMenuItem[]
    object: Object
    objectRecordCounts: ObjectRecordCount[]
    objects: ObjectConnection
    pieChartData: PieChartData
    skill?: Skill
    skills: Skill[]
    validatePasswordResetToken: ValidatePasswordResetToken
    versionInfo: VersionInfo
    webhook?: Webhook
    webhooks: Webhook[]
    __typename: 'Query'
}

export interface QueueJob {
    attemptsMade: Scalars['Float']
    data?: Scalars['JSON']
    failedReason?: Scalars['String']
    finishedOn?: Scalars['Float']
    id: Scalars['String']
    logs?: Scalars['String'][]
    name: Scalars['String']
    processedOn?: Scalars['Float']
    returnValue?: Scalars['JSON']
    stackTrace?: Scalars['String'][]
    state: JobState
    timestamp?: Scalars['Float']
    __typename: 'QueueJob'
}

export interface QueueJobsResponse {
    count: Scalars['Float']
    hasMore: Scalars['Boolean']
    jobs: QueueJob[]
    retentionConfig: QueueRetentionConfig
    totalCount: Scalars['Float']
    __typename: 'QueueJobsResponse'
}

export interface QueueMetricsData {
    data: QueueMetricsSeries[]
    details?: WorkerQueueMetrics
    queueName: Scalars['String']
    timeRange: QueueMetricsTimeRange
    workers: Scalars['Float']
    __typename: 'QueueMetricsData'
}

export interface QueueMetricsDataPoint {
    x: Scalars['Float']
    y: Scalars['Float']
    __typename: 'QueueMetricsDataPoint'
}

export interface QueueMetricsSeries {
    data: QueueMetricsDataPoint[]
    id: Scalars['String']
    __typename: 'QueueMetricsSeries'
}

export type QueueMetricsTimeRange = 'FourHours' | 'OneDay' | 'OneHour' | 'SevenDays' | 'TwelveHours'

export interface QueueRetentionConfig {
    completedMaxAge: Scalars['Float']
    completedMaxCount: Scalars['Float']
    failedMaxAge: Scalars['Float']
    failedMaxCount: Scalars['Float']
    __typename: 'QueueRetentionConfig'
}

export interface RatioAggregateConfig {
    fieldMetadataId: Scalars['UUID']
    optionValue: Scalars['String']
    __typename: 'RatioAggregateConfig'
}

export interface RecordIdentifier {
    id: Scalars['UUID']
    imageIdentifier?: Scalars['String']
    labelIdentifier: Scalars['String']
    __typename: 'RecordIdentifier'
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

export interface RetryJobsResponse {
    results: JobOperationResult[]
    retriedCount: Scalars['Int']
    __typename: 'RetryJobsResponse'
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
    permissionFlags?: PermissionFlag[]
    rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroup[]
    rowLevelPermissionPredicates?: RowLevelPermissionPredicate[]
    universalIdentifier?: Scalars['UUID']
    workspaceMembers: WorkspaceMember[]
    __typename: 'Role'
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

export interface SendInvitations {
    errors: Scalars['String'][]
    result: WorkspaceInvitation[]
    /** Boolean that confirms query was dispatched */
    success: Scalars['Boolean']
    __typename: 'SendInvitations'
}

export interface Sentry {
    dsn?: Scalars['String']
    environment?: Scalars['String']
    release?: Scalars['String']
    __typename: 'Sentry'
}

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
    label: Scalars['String']
    name: Scalars['String']
    updatedAt: Scalars['DateTime']
    __typename: 'Skill'
}


/** Sort Directions */
export type SortDirection = 'ASC' | 'DESC'


/** Sort Nulls Options */
export type SortNulls = 'NULLS_FIRST' | 'NULLS_LAST'

export interface StandaloneRichTextConfiguration {
    body: RichTextBody
    configurationType: WidgetConfigurationType
    __typename: 'StandaloneRichTextConfiguration'
}

export interface StandardOverrides {
    description?: Scalars['String']
    icon?: Scalars['String']
    label?: Scalars['String']
    translations?: Scalars['JSON']
    __typename: 'StandardOverrides'
}

export interface Subscription {
    logicFunctionLogs: LogicFunctionLogs
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

export interface SystemHealth {
    services: SystemHealthService[]
    __typename: 'SystemHealth'
}

export interface SystemHealthService {
    id: HealthIndicatorId
    label: Scalars['String']
    status: AdminPanelHealthServiceStatus
    __typename: 'SystemHealthService'
}

export interface TasksConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'TasksConfiguration'
}

export interface TimelineConfiguration {
    configurationType: WidgetConfigurationType
    __typename: 'TimelineConfiguration'
}

export interface ToolIndexEntry {
    category: Scalars['String']
    description: Scalars['String']
    inputSchema?: Scalars['JSON']
    name: Scalars['String']
    objectName?: Scalars['String']
    __typename: 'ToolIndexEntry'
}

export interface TransientToken {
    transientToken: AuthToken
    __typename: 'TransientToken'
}

export interface TwoFactorAuthenticationMethodSummary {
    status: Scalars['String']
    strategy: Scalars['String']
    twoFactorAuthenticationMethodId: Scalars['UUID']
    __typename: 'TwoFactorAuthenticationMethodSummary'
}

export interface UpsertRowLevelPermissionPredicatesResult {
    predicateGroups: RowLevelPermissionPredicateGroup[]
    predicates: RowLevelPermissionPredicate[]
    __typename: 'UpsertRowLevelPermissionPredicatesResult'
}

export interface UsageAnalytics {
    periodEnd: Scalars['DateTime']
    periodStart: Scalars['DateTime']
    timeSeries: UsageTimeSeries[]
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

export interface UsageTimeSeries {
    creditsUsed: Scalars['Float']
    date: Scalars['String']
    __typename: 'UsageTimeSeries'
}

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
    defaultAvatarUrl?: Scalars['String']
    deletedAt?: Scalars['DateTime']
    deletedWorkspaceMembers?: DeletedWorkspaceMember[]
    disabled?: Scalars['Boolean']
    email: Scalars['String']
    firstName: Scalars['String']
    hasPassword: Scalars['Boolean']
    id: Scalars['UUID']
    isEmailVerified: Scalars['Boolean']
    lastName: Scalars['String']
    locale: Scalars['String']
    onboardingStatus?: OnboardingStatus
    supportUserHash?: Scalars['String']
    updatedAt: Scalars['DateTime']
    userVars?: Scalars['JSONObject']
    userWorkspaces: UserWorkspace[]
    workspaceMember?: WorkspaceMember
    workspaceMembers?: WorkspaceMember[]
    workspaces: UserWorkspace[]
    __typename: 'User'
}

export interface UserInfo {
    email: Scalars['String']
    firstName?: Scalars['String']
    id: Scalars['UUID']
    lastName?: Scalars['String']
    __typename: 'UserInfo'
}

export interface UserLookup {
    user: UserInfo
    workspaces: WorkspaceInfo[]
    __typename: 'UserLookup'
}

export interface UserWorkspace {
    createdAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    id: Scalars['UUID']
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

export interface VerificationRecord {
    key: Scalars['String']
    priority?: Scalars['Float']
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

export interface VersionInfo {
    currentVersion?: Scalars['String']
    latestVersion: Scalars['String']
    __typename: 'VersionInfo'
}

export interface View {
    anyFieldFilterValue?: Scalars['String']
    calendarFieldMetadataId?: Scalars['UUID']
    calendarLayout?: ViewCalendarLayout
    createdAt: Scalars['DateTime']
    createdByUserWorkspaceId?: Scalars['UUID']
    deletedAt?: Scalars['DateTime']
    icon: Scalars['String']
    id: Scalars['UUID']
    isCompact: Scalars['Boolean']
    isCustom: Scalars['Boolean']
    kanbanAggregateOperation?: AggregateOperations
    kanbanAggregateOperationFieldMetadataId?: Scalars['UUID']
    key?: ViewKey
    mainGroupByFieldMetadataId?: Scalars['UUID']
    name: Scalars['String']
    objectMetadataId: Scalars['UUID']
    openRecordIn: ViewOpenRecordIn
    position: Scalars['Float']
    shouldHideEmptyGroups: Scalars['Boolean']
    type: ViewType
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
    createdAt: Scalars['DateTime']
    deletedAt?: Scalars['DateTime']
    fieldMetadataId: Scalars['UUID']
    id: Scalars['UUID']
    isOverridden: Scalars['Boolean']
    isVisible: Scalars['Boolean']
    position: Scalars['Float']
    size: Scalars['Float']
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
    updatedAt: Scalars['DateTime']
    viewId: Scalars['UUID']
    workspaceId: Scalars['UUID']
    __typename: 'ViewSort'
}

export type ViewSortDirection = 'ASC' | 'DESC'

export type ViewType = 'CALENDAR' | 'FIELDS_WIDGET' | 'KANBAN' | 'TABLE'

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

export type WidgetConfiguration = (AggregateChartConfiguration | BarChartConfiguration | CalendarConfiguration | EmailsConfiguration | FieldConfiguration | FieldRichTextConfiguration | FieldsConfiguration | FilesConfiguration | FrontComponentConfiguration | GaugeChartConfiguration | IframeConfiguration | LineChartConfiguration | NotesConfiguration | PieChartConfiguration | StandaloneRichTextConfiguration | TasksConfiguration | TimelineConfiguration | ViewConfiguration | WorkflowConfiguration | WorkflowRunConfiguration | WorkflowVersionConfiguration) & { __isUnion?: true }

export type WidgetConfigurationType = 'AGGREGATE_CHART' | 'BAR_CHART' | 'CALENDAR' | 'EMAILS' | 'FIELD' | 'FIELDS' | 'FIELD_RICH_TEXT' | 'FILES' | 'FRONT_COMPONENT' | 'GAUGE_CHART' | 'IFRAME' | 'LINE_CHART' | 'NOTES' | 'PIE_CHART' | 'STANDALONE_RICH_TEXT' | 'TASKS' | 'TIMELINE' | 'VIEW' | 'WORKFLOW' | 'WORKFLOW_RUN' | 'WORKFLOW_VERSION'

export type WidgetType = 'CALENDAR' | 'EMAILS' | 'FIELD' | 'FIELDS' | 'FIELD_RICH_TEXT' | 'FILES' | 'FRONT_COMPONENT' | 'GRAPH' | 'IFRAME' | 'NOTES' | 'STANDALONE_RICH_TEXT' | 'TASKS' | 'TIMELINE' | 'VIEW' | 'WORKFLOW' | 'WORKFLOW_RUN' | 'WORKFLOW_VERSION'

export interface WorkerQueueMetrics {
    active: Scalars['Float']
    completed: Scalars['Float']
    completedData?: Scalars['Float'][]
    delayed: Scalars['Float']
    failed: Scalars['Float']
    failedData?: Scalars['Float'][]
    failureRate: Scalars['Float']
    waiting: Scalars['Float']
    __typename: 'WorkerQueueMetrics'
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

export interface Workspace {
    activationStatus: WorkspaceActivationStatus
    aiAdditionalInstructions?: Scalars['String']
    allowImpersonation: Scalars['Boolean']
    billingEntitlements: BillingEntitlement[]
    billingSubscriptions: BillingSubscription[]
    createdAt: Scalars['DateTime']
    currentBillingSubscription?: BillingSubscription
    customDomain?: Scalars['String']
    databaseSchema: Scalars['String']
    databaseUrl: Scalars['String']
    defaultRole?: Role
    deletedAt?: Scalars['DateTime']
    displayName?: Scalars['String']
    editableProfileFields?: Scalars['String'][]
    enabledAiModelIds?: Scalars['String'][]
    eventLogRetentionDays: Scalars['Float']
    fastModel: Scalars['String']
    featureFlags?: FeatureFlag[]
    hasValidEnterpriseKey: Scalars['Boolean']
    hasValidEnterpriseValidityToken: Scalars['Boolean']
    hasValidSignedEnterpriseKey: Scalars['Boolean']
    id: Scalars['UUID']
    inviteHash?: Scalars['String']
    isCustomDomainEnabled: Scalars['Boolean']
    isGoogleAuthBypassEnabled: Scalars['Boolean']
    isGoogleAuthEnabled: Scalars['Boolean']
    isMicrosoftAuthBypassEnabled: Scalars['Boolean']
    isMicrosoftAuthEnabled: Scalars['Boolean']
    isPasswordAuthBypassEnabled: Scalars['Boolean']
    isPasswordAuthEnabled: Scalars['Boolean']
    isPublicInviteLinkEnabled: Scalars['Boolean']
    isTwoFactorAuthenticationEnforced: Scalars['Boolean']
    logo?: Scalars['String']
    logoFileId?: Scalars['UUID']
    metadataVersion: Scalars['Float']
    routerModel: Scalars['String']
    smartModel: Scalars['String']
    subdomain: Scalars['String']
    trashRetentionDays: Scalars['Float']
    updatedAt: Scalars['DateTime']
    useRecommendedModels: Scalars['Boolean']
    version?: Scalars['String']
    viewFields?: ViewField[]
    viewFilterGroups?: ViewFilterGroup[]
    viewFilters?: ViewFilter[]
    viewGroups?: ViewGroup[]
    viewSorts?: ViewSort[]
    views?: View[]
    workspaceCustomApplication?: Application
    workspaceCustomApplicationId: Scalars['String']
    workspaceMembersCount?: Scalars['Float']
    workspaceUrls: WorkspaceUrls
    __typename: 'Workspace'
}

export type WorkspaceActivationStatus = 'ACTIVE' | 'INACTIVE' | 'ONGOING_CREATION' | 'PENDING_CREATION' | 'SUSPENDED'

export interface WorkspaceInfo {
    allowImpersonation: Scalars['Boolean']
    featureFlags: FeatureFlag[]
    id: Scalars['UUID']
    logo?: Scalars['String']
    name: Scalars['String']
    totalUsers: Scalars['Float']
    users: UserInfo[]
    workspaceUrls: WorkspaceUrls
    __typename: 'WorkspaceInfo'
}

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
    roles?: Role[]
    timeFormat?: WorkspaceMemberTimeFormatEnum
    timeZone?: Scalars['String']
    userEmail: Scalars['String']
    userWorkspaceId?: Scalars['UUID']
    __typename: 'WorkspaceMember'
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

export type WorkspaceMigrationActionType = 'create' | 'delete' | 'update'

export interface WorkspaceNameAndId {
    displayName?: Scalars['String']
    id: Scalars['UUID']
    __typename: 'WorkspaceNameAndId'
}

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

export interface AISystemPromptPreviewGenqlSelection{
    estimatedTokenCount?: boolean | number
    sections?: AISystemPromptSectionGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AISystemPromptSectionGenqlSelection{
    content?: boolean | number
    estimatedTokenCount?: boolean | number
    title?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ActivateWorkspaceInput {displayName?: (Scalars['String'] | null)}

export interface AddQuerySubscriptionInput {eventStreamId: Scalars['String'],operationSignature: Scalars['JSON'],queryId: Scalars['String']}

export interface AdminAIModelConfigGenqlSelection{
    contextWindowTokens?: boolean | number
    dataResidency?: boolean | number
    inputCostPerMillionTokens?: boolean | number
    isAdminEnabled?: boolean | number
    isAvailable?: boolean | number
    isDeprecated?: boolean | number
    isRecommended?: boolean | number
    label?: boolean | number
    maxOutputTokens?: boolean | number
    modelFamily?: boolean | number
    modelFamilyLabel?: boolean | number
    modelId?: boolean | number
    name?: boolean | number
    outputCostPerMillionTokens?: boolean | number
    providerLabel?: boolean | number
    providerName?: boolean | number
    sdkPackage?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AdminAIModelsGenqlSelection{
    defaultFastModelId?: boolean | number
    defaultSmartModelId?: boolean | number
    models?: AdminAIModelConfigGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AdminPanelHealthServiceDataGenqlSelection{
    description?: boolean | number
    details?: boolean | number
    errorMessage?: boolean | number
    id?: boolean | number
    label?: boolean | number
    queues?: AdminPanelWorkerQueueHealthGenqlSelection
    status?: boolean | number
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

export interface AgentGenqlSelection{
    applicationId?: boolean | number
    createdAt?: boolean | number
    description?: boolean | number
    evaluationInputs?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    isCustom?: boolean | number
    label?: boolean | number
    modelConfiguration?: boolean | number
    modelId?: boolean | number
    name?: boolean | number
    prompt?: boolean | number
    responseFormat?: boolean | number
    roleId?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatThreadGenqlSelection{
    contextWindowTokens?: boolean | number
    conversationSize?: boolean | number
    createdAt?: boolean | number
    id?: boolean | number
    title?: boolean | number
    totalInputCredits?: boolean | number
    totalInputTokens?: boolean | number
    totalOutputCredits?: boolean | number
    totalOutputTokens?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatThreadConnectionGenqlSelection{
    /** Array of edges. */
    edges?: AgentChatThreadEdgeGenqlSelection
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatThreadEdgeGenqlSelection{
    /** Cursor for this node. */
    cursor?: boolean | number
    /** The node containing the AgentChatThread */
    node?: AgentChatThreadGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentChatThreadFilter {and?: (AgentChatThreadFilter[] | null),id?: (UUIDFilterComparison | null),or?: (AgentChatThreadFilter[] | null),updatedAt?: (DateFieldComparison | null)}

export interface AgentChatThreadSort {direction: SortDirection,field: AgentChatThreadSortFields,nulls?: (SortNulls | null)}

export interface AgentIdInput {
/** The id of the agent. */
id: Scalars['UUID']}

export interface AgentMessageGenqlSelection{
    agentId?: boolean | number
    createdAt?: boolean | number
    id?: boolean | number
    parts?: AgentMessagePartGenqlSelection
    role?: boolean | number
    threadId?: boolean | number
    turnId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentMessagePartGenqlSelection{
    createdAt?: boolean | number
    errorDetails?: boolean | number
    errorMessage?: boolean | number
    fileFilename?: boolean | number
    fileId?: boolean | number
    fileMediaType?: boolean | number
    fileUrl?: boolean | number
    id?: boolean | number
    messageId?: boolean | number
    orderIndex?: boolean | number
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

export interface AgentTurnGenqlSelection{
    agentId?: boolean | number
    createdAt?: boolean | number
    evaluations?: AgentTurnEvaluationGenqlSelection
    id?: boolean | number
    messages?: AgentMessageGenqlSelection
    threadId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AgentTurnEvaluationGenqlSelection{
    comment?: boolean | number
    createdAt?: boolean | number
    id?: boolean | number
    score?: boolean | number
    turnId?: boolean | number
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
    format?: boolean | number
    label?: boolean | number
    prefix?: boolean | number
    ratioAggregateConfig?: RatioAggregateConfigGenqlSelection
    suffix?: boolean | number
    timezone?: boolean | number
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

export interface AppTokenGenqlSelection{
    createdAt?: boolean | number
    expiresAt?: boolean | number
    id?: boolean | number
    type?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationGenqlSelection{
    agents?: AgentGenqlSelection
    applicationRegistration?: ApplicationRegistrationSummaryGenqlSelection
    applicationRegistrationId?: boolean | number
    applicationVariables?: ApplicationVariableGenqlSelection
    availablePackages?: boolean | number
    canBeUninstalled?: boolean | number
    defaultLogicFunctionRole?: RoleGenqlSelection
    defaultRoleId?: boolean | number
    description?: boolean | number
    id?: boolean | number
    logicFunctions?: LogicFunctionGenqlSelection
    name?: boolean | number
    objects?: ObjectGenqlSelection
    packageJsonChecksum?: boolean | number
    packageJsonFileId?: boolean | number
    settingsCustomTabFrontComponentId?: boolean | number
    universalIdentifier?: boolean | number
    version?: boolean | number
    yarnLockChecksum?: boolean | number
    yarnLockFileId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationRegistrationGenqlSelection{
    author?: boolean | number
    createdAt?: boolean | number
    description?: boolean | number
    id?: boolean | number
    isFeatured?: boolean | number
    isListed?: boolean | number
    latestAvailableVersion?: boolean | number
    logoUrl?: boolean | number
    name?: boolean | number
    oAuthClientId?: boolean | number
    oAuthRedirectUris?: boolean | number
    oAuthScopes?: boolean | number
    ownerWorkspaceId?: boolean | number
    sourcePackage?: boolean | number
    sourceType?: boolean | number
    termsUrl?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    websiteUrl?: boolean | number
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

export interface ApplicationRegistrationSummaryGenqlSelection{
    id?: boolean | number
    latestAvailableVersion?: boolean | number
    sourceType?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ApplicationRegistrationVariableGenqlSelection{
    createdAt?: boolean | number
    description?: boolean | number
    id?: boolean | number
    isFilled?: boolean | number
    isRequired?: boolean | number
    isSecret?: boolean | number
    key?: boolean | number
    updatedAt?: boolean | number
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
    isSecret?: boolean | number
    key?: boolean | number
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
    trialPeriods?: BillingTrialPeriodGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingEndTrialPeriodGenqlSelection{
    /** Billing portal URL for payment method update (returned when no payment method exists) */
    billingPortalUrl?: boolean | number
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

export interface BillingMeteredProductUsageGenqlSelection{
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

export interface BillingPlanGenqlSelection{
    licensedProducts?: BillingLicensedProductGenqlSelection
    meteredProducts?: BillingMeteredProductGenqlSelection
    planKey?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BillingPriceLicensedGenqlSelection{
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
    planKey?: boolean | number
    priceUsageBased?: boolean | number
    productKey?: boolean | number
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
    hasReachedCurrentPeriodCap?: boolean | number
    id?: boolean | number
    quantity?: boolean | number
    stripePriceId?: boolean | number
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

export interface CheckUserExistGenqlSelection{
    availableWorkspacesCount?: boolean | number
    exists?: boolean | number
    isEmailVerified?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ClientAIModelConfigGenqlSelection{
    dataResidency?: boolean | number
    inputCostPerMillionTokensInCredits?: boolean | number
    isDeprecated?: boolean | number
    isRecommended?: boolean | number
    label?: boolean | number
    modelFamily?: boolean | number
    modelFamilyLabel?: boolean | number
    modelId?: boolean | number
    nativeCapabilities?: NativeModelCapabilitiesGenqlSelection
    outputCostPerMillionTokensInCredits?: boolean | number
    providerName?: boolean | number
    sdkPackage?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ClientConfigGenqlSelection{
    aiModels?: ClientAIModelConfigGenqlSelection
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
    frontDomain?: boolean | number
    isAttachmentPreviewEnabled?: boolean | number
    isClickHouseConfigured?: boolean | number
    isCloudflareIntegrationEnabled?: boolean | number
    isConfigVariablesInDbEnabled?: boolean | number
    isEmailVerificationRequired?: boolean | number
    isGoogleCalendarEnabled?: boolean | number
    isGoogleMessagingEnabled?: boolean | number
    isImapSmtpCaldavEnabled?: boolean | number
    isMicrosoftCalendarEnabled?: boolean | number
    isMicrosoftMessagingEnabled?: boolean | number
    isMultiWorkspaceEnabled?: boolean | number
    publicFeatureFlags?: PublicFeatureFlagGenqlSelection
    sentry?: SentryGenqlSelection
    signInPrefilled?: boolean | number
    support?: SupportGenqlSelection
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
    createdAt?: boolean | number
    engineComponentKey?: boolean | number
    frontComponent?: FrontComponentGenqlSelection
    frontComponentId?: boolean | number
    hotKeys?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    isPinned?: boolean | number
    label?: boolean | number
    position?: boolean | number
    shortLabel?: boolean | number
    updatedAt?: boolean | number
    workflowVersionId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ConfigVariableGenqlSelection{
    description?: boolean | number
    isEnvOnly?: boolean | number
    isSensitive?: boolean | number
    name?: boolean | number
    options?: boolean | number
    source?: boolean | number
    type?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ConfigVariablesGenqlSelection{
    groups?: ConfigVariablesGroupDataGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ConfigVariablesGroupDataGenqlSelection{
    description?: boolean | number
    isHiddenOnLoad?: boolean | number
    name?: boolean | number
    variables?: ConfigVariableGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ConnectedAccountDTOGenqlSelection{
    authFailedAt?: boolean | number
    createdAt?: boolean | number
    handle?: boolean | number
    handleAliases?: boolean | number
    id?: boolean | number
    lastCredentialsRefreshedAt?: boolean | number
    lastSignedInAt?: boolean | number
    provider?: boolean | number
    scopes?: boolean | number
    updatedAt?: boolean | number
    userWorkspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ConnectedImapSmtpCaldavAccountGenqlSelection{
    accountOwnerId?: boolean | number
    connectionParameters?: ImapSmtpCaldavConnectionParametersGenqlSelection
    handle?: boolean | number
    id?: boolean | number
    provider?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ConnectionParameters {host: Scalars['String'],password: Scalars['String'],port: Scalars['Float'],secure?: (Scalars['Boolean'] | null),username?: (Scalars['String'] | null)}

export interface ConnectionParametersOutputGenqlSelection{
    host?: boolean | number
    password?: boolean | number
    port?: boolean | number
    secure?: boolean | number
    username?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CreateAgentInput {description?: (Scalars['String'] | null),evaluationInputs?: (Scalars['String'][] | null),icon?: (Scalars['String'] | null),label: Scalars['String'],modelConfiguration?: (Scalars['JSON'] | null),modelId: Scalars['String'],name?: (Scalars['String'] | null),prompt: Scalars['String'],responseFormat?: (Scalars['JSON'] | null),roleId?: (Scalars['UUID'] | null)}

export interface CreateApiKeyInput {expiresAt: Scalars['String'],name: Scalars['String'],revokedAt?: (Scalars['String'] | null),roleId: Scalars['UUID']}

export interface CreateAppTokenInput {expiresAt: Scalars['DateTime']}

export interface CreateApplicationRegistrationGenqlSelection{
    applicationRegistration?: ApplicationRegistrationGenqlSelection
    clientSecret?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CreateApplicationRegistrationInput {author?: (Scalars['String'] | null),description?: (Scalars['String'] | null),logoUrl?: (Scalars['String'] | null),name: Scalars['String'],oAuthRedirectUris?: (Scalars['String'][] | null),oAuthScopes?: (Scalars['String'][] | null),termsUrl?: (Scalars['String'] | null),universalIdentifier?: (Scalars['String'] | null),websiteUrl?: (Scalars['String'] | null)}

export interface CreateApplicationRegistrationVariableInput {applicationRegistrationId: Scalars['String'],description?: (Scalars['String'] | null),isSecret?: (Scalars['Boolean'] | null),key: Scalars['String'],value: Scalars['String']}

export interface CreateApprovedAccessDomainInput {domain: Scalars['String'],email: Scalars['String']}

export interface CreateCommandMenuItemInput {availabilityObjectMetadataId?: (Scalars['UUID'] | null),availabilityType?: (CommandMenuItemAvailabilityType | null),conditionalAvailabilityExpression?: (Scalars['String'] | null),engineComponentKey?: (EngineComponentKey | null),frontComponentId?: (Scalars['UUID'] | null),hotKeys?: (Scalars['String'][] | null),icon?: (Scalars['String'] | null),isPinned?: (Scalars['Boolean'] | null),label: Scalars['String'],position?: (Scalars['Float'] | null),shortLabel?: (Scalars['String'] | null),workflowVersionId?: (Scalars['UUID'] | null)}

export interface CreateFieldInput {defaultValue?: (Scalars['JSON'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),isActive?: (Scalars['Boolean'] | null),isCustom?: (Scalars['Boolean'] | null),isLabelSyncedWithName?: (Scalars['Boolean'] | null),isNullable?: (Scalars['Boolean'] | null),isRemoteCreation?: (Scalars['Boolean'] | null),isSystem?: (Scalars['Boolean'] | null),isUIReadOnly?: (Scalars['Boolean'] | null),isUnique?: (Scalars['Boolean'] | null),label: Scalars['String'],morphRelationsCreationPayload?: (Scalars['JSON'][] | null),name: Scalars['String'],objectMetadataId: Scalars['UUID'],options?: (Scalars['JSON'] | null),relationCreationPayload?: (Scalars['JSON'] | null),settings?: (Scalars['JSON'] | null),type: FieldMetadataType}

export interface CreateFrontComponentInput {builtComponentChecksum: Scalars['String'],builtComponentPath: Scalars['String'],componentName: Scalars['String'],description?: (Scalars['String'] | null),id?: (Scalars['UUID'] | null),name: Scalars['String'],sourceComponentPath: Scalars['String']}

export interface CreateLogicFunctionFromSourceInput {cronTriggerSettings?: (Scalars['JSON'] | null),databaseEventTriggerSettings?: (Scalars['JSON'] | null),description?: (Scalars['String'] | null),httpRouteTriggerSettings?: (Scalars['JSON'] | null),id?: (Scalars['UUID'] | null),isTool?: (Scalars['Boolean'] | null),name: Scalars['String'],source?: (Scalars['JSON'] | null),timeoutSeconds?: (Scalars['Float'] | null),toolInputSchema?: (Scalars['JSON'] | null),universalIdentifier?: (Scalars['UUID'] | null)}

export interface CreateNavigationMenuItemInput {color?: (Scalars['String'] | null),folderId?: (Scalars['UUID'] | null),icon?: (Scalars['String'] | null),id?: (Scalars['UUID'] | null),link?: (Scalars['String'] | null),name?: (Scalars['String'] | null),position?: (Scalars['Float'] | null),targetObjectMetadataId?: (Scalars['UUID'] | null),targetRecordId?: (Scalars['UUID'] | null),type: NavigationMenuItemType,userWorkspaceId?: (Scalars['UUID'] | null),viewId?: (Scalars['UUID'] | null)}

export interface CreateObjectInput {color?: (Scalars['String'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),isLabelSyncedWithName?: (Scalars['Boolean'] | null),isRemote?: (Scalars['Boolean'] | null),labelPlural: Scalars['String'],labelSingular: Scalars['String'],namePlural: Scalars['String'],nameSingular: Scalars['String'],primaryKeyColumnType?: (Scalars['String'] | null),primaryKeyFieldMetadataSettings?: (Scalars['JSON'] | null),shortcut?: (Scalars['String'] | null),skipNameField?: (Scalars['Boolean'] | null)}

export interface CreateOneAppTokenInput {
/** The record to create */
appToken: CreateAppTokenInput}

export interface CreateOneFieldMetadataInput {
/** The record to create */
field: CreateFieldInput}

export interface CreateOneObjectInput {
/** The object to create */
object: CreateObjectInput}

export interface CreatePageLayoutInput {name: Scalars['String'],objectMetadataId?: (Scalars['UUID'] | null),type?: (PageLayoutType | null)}

export interface CreatePageLayoutTabInput {layoutMode?: (PageLayoutTabLayoutMode | null),pageLayoutId: Scalars['UUID'],position?: (Scalars['Float'] | null),title: Scalars['String']}

export interface CreatePageLayoutWidgetInput {configuration: Scalars['JSON'],gridPosition: GridPositionInput,objectMetadataId?: (Scalars['UUID'] | null),pageLayoutTabId: Scalars['UUID'],position?: (Scalars['JSON'] | null),title: Scalars['String'],type: WidgetType}

export interface CreateRoleInput {canAccessAllTools?: (Scalars['Boolean'] | null),canBeAssignedToAgents?: (Scalars['Boolean'] | null),canBeAssignedToApiKeys?: (Scalars['Boolean'] | null),canBeAssignedToUsers?: (Scalars['Boolean'] | null),canDestroyAllObjectRecords?: (Scalars['Boolean'] | null),canReadAllObjectRecords?: (Scalars['Boolean'] | null),canSoftDeleteAllObjectRecords?: (Scalars['Boolean'] | null),canUpdateAllObjectRecords?: (Scalars['Boolean'] | null),canUpdateAllSettings?: (Scalars['Boolean'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),id?: (Scalars['String'] | null),label: Scalars['String']}

export interface CreateSkillInput {content: Scalars['String'],description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),id?: (Scalars['UUID'] | null),label: Scalars['String'],name: Scalars['String']}

export interface CreateViewFieldGroupInput {id?: (Scalars['UUID'] | null),isVisible?: (Scalars['Boolean'] | null),name: Scalars['String'],position?: (Scalars['Float'] | null),viewId: Scalars['UUID']}

export interface CreateViewFieldInput {aggregateOperation?: (AggregateOperations | null),fieldMetadataId: Scalars['UUID'],id?: (Scalars['UUID'] | null),isVisible?: (Scalars['Boolean'] | null),position?: (Scalars['Float'] | null),size?: (Scalars['Float'] | null),viewFieldGroupId?: (Scalars['UUID'] | null),viewId: Scalars['UUID']}

export interface CreateViewFilterGroupInput {id?: (Scalars['UUID'] | null),logicalOperator?: (ViewFilterGroupLogicalOperator | null),parentViewFilterGroupId?: (Scalars['UUID'] | null),positionInViewFilterGroup?: (Scalars['Float'] | null),viewId: Scalars['UUID']}

export interface CreateViewFilterInput {fieldMetadataId: Scalars['UUID'],id?: (Scalars['UUID'] | null),operand?: (ViewFilterOperand | null),positionInViewFilterGroup?: (Scalars['Float'] | null),subFieldName?: (Scalars['String'] | null),value: Scalars['JSON'],viewFilterGroupId?: (Scalars['UUID'] | null),viewId: Scalars['UUID']}

export interface CreateViewGroupInput {fieldValue: Scalars['String'],id?: (Scalars['UUID'] | null),isVisible?: (Scalars['Boolean'] | null),position?: (Scalars['Float'] | null),viewId: Scalars['UUID']}

export interface CreateViewInput {anyFieldFilterValue?: (Scalars['String'] | null),calendarFieldMetadataId?: (Scalars['UUID'] | null),calendarLayout?: (ViewCalendarLayout | null),icon: Scalars['String'],id?: (Scalars['UUID'] | null),isCompact?: (Scalars['Boolean'] | null),kanbanAggregateOperation?: (AggregateOperations | null),kanbanAggregateOperationFieldMetadataId?: (Scalars['UUID'] | null),key?: (ViewKey | null),mainGroupByFieldMetadataId?: (Scalars['UUID'] | null),name: Scalars['String'],objectMetadataId: Scalars['UUID'],openRecordIn?: (ViewOpenRecordIn | null),position?: (Scalars['Float'] | null),shouldHideEmptyGroups?: (Scalars['Boolean'] | null),type?: (ViewType | null),visibility?: (ViewVisibility | null)}

export interface CreateViewSortInput {direction?: (ViewSortDirection | null),fieldMetadataId: Scalars['UUID'],id?: (Scalars['UUID'] | null),viewId: Scalars['UUID']}

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

export interface DateFieldComparison {between?: (DateFieldComparisonBetween | null),eq?: (Scalars['DateTime'] | null),gt?: (Scalars['DateTime'] | null),gte?: (Scalars['DateTime'] | null),in?: (Scalars['DateTime'][] | null),is?: (Scalars['Boolean'] | null),isNot?: (Scalars['Boolean'] | null),lt?: (Scalars['DateTime'] | null),lte?: (Scalars['DateTime'] | null),neq?: (Scalars['DateTime'] | null),notBetween?: (DateFieldComparisonBetween | null),notIn?: (Scalars['DateTime'][] | null)}

export interface DateFieldComparisonBetween {lower: Scalars['DateTime'],upper: Scalars['DateTime']}

export interface DeleteApprovedAccessDomainInput {id: Scalars['UUID']}

export interface DeleteJobsResponseGenqlSelection{
    deletedCount?: boolean | number
    results?: JobOperationResultGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface DeleteOneFieldInput {
/** The id of the field to delete. */
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

export interface EmailAccountConnectionParameters {CALDAV?: (ConnectionParameters | null),IMAP?: (ConnectionParameters | null),SMTP?: (ConnectionParameters | null)}

export interface EmailPasswordResetLinkGenqlSelection{
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EmailingDomainGenqlSelection{
    createdAt?: boolean | number
    domain?: boolean | number
    driver?: boolean | number
    id?: boolean | number
    status?: boolean | number
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

export interface EventLogFiltersInput {dateRange?: (EventLogDateRangeInput | null),eventType?: (Scalars['String'] | null),objectMetadataId?: (Scalars['String'] | null),recordId?: (Scalars['String'] | null),userWorkspaceId?: (Scalars['String'] | null)}

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
    isCustom?: boolean | number
    isLabelSyncedWithName?: boolean | number
    isNullable?: boolean | number
    isSystem?: boolean | number
    isUIReadOnly?: boolean | number
    isUnique?: boolean | number
    label?: boolean | number
    morphId?: boolean | number
    morphRelations?: RelationGenqlSelection
    name?: boolean | number
    object?: ObjectGenqlSelection
    options?: boolean | number
    relation?: RelationGenqlSelection
    settings?: boolean | number
    standardOverrides?: StandardOverridesGenqlSelection
    type?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FieldConfigurationGenqlSelection{
    configurationType?: boolean | number
    fieldDisplayMode?: boolean | number
    fieldMetadataId?: boolean | number
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

export interface FieldFilter {and?: (FieldFilter[] | null),id?: (UUIDFilterComparison | null),isActive?: (BooleanFieldComparison | null),isCustom?: (BooleanFieldComparison | null),isSystem?: (BooleanFieldComparison | null),isUIReadOnly?: (BooleanFieldComparison | null),or?: (FieldFilter[] | null)}

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

export interface FrontComponentGenqlSelection{
    applicationId?: boolean | number
    applicationTokenPair?: ApplicationTokenPairGenqlSelection
    builtComponentChecksum?: boolean | number
    builtComponentPath?: boolean | number
    componentName?: boolean | number
    createdAt?: boolean | number
    description?: boolean | number
    id?: boolean | number
    isHeadless?: boolean | number
    name?: boolean | number
    sourceComponentPath?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FrontComponentConfigurationGenqlSelection{
    configurationType?: boolean | number
    frontComponentId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FullNameGenqlSelection{
    firstName?: boolean | number
    lastName?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface GaugeChartConfigurationGenqlSelection{
    aggregateFieldMetadataId?: boolean | number
    aggregateOperation?: boolean | number
    color?: boolean | number
    configurationType?: boolean | number
    description?: boolean | number
    displayDataLabel?: boolean | number
    filter?: boolean | number
    firstDayOfTheWeek?: boolean | number
    timezone?: boolean | number
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

export interface GridPositionGenqlSelection{
    column?: boolean | number
    columnSpan?: boolean | number
    row?: boolean | number
    rowSpan?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface GridPositionInput {column: Scalars['Float'],columnSpan: Scalars['Float'],row: Scalars['Float'],rowSpan: Scalars['Float']}

export interface IframeConfigurationGenqlSelection{
    configurationType?: boolean | number
    url?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ImapSmtpCaldavConnectionParametersGenqlSelection{
    CALDAV?: ConnectionParametersOutputGenqlSelection
    IMAP?: ConnectionParametersOutputGenqlSelection
    SMTP?: ConnectionParametersOutputGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ImapSmtpCaldavConnectionSuccessGenqlSelection{
    connectedAccountId?: boolean | number
    success?: boolean | number
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
    indexFieldMetadatas?: (IndexIndexFieldMetadatasConnectionGenqlSelection & { __args: {
    /** Specify to filter the records returned. */
    filter: IndexFieldFilter, 
    /** Limit or page results. */
    paging: CursorPaging} })
    indexType?: boolean | number
    indexWhereClause?: boolean | number
    isCustom?: boolean | number
    isUnique?: boolean | number
    name?: boolean | number
    objectMetadata?: (IndexObjectMetadataConnectionGenqlSelection & { __args: {
    /** Specify to filter the records returned. */
    filter: ObjectFilter, 
    /** Limit or page results. */
    paging: CursorPaging} })
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IndexConnectionGenqlSelection{
    /** Array of edges. */
    edges?: IndexEdgeGenqlSelection
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
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
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IndexFieldEdgeGenqlSelection{
    /** Cursor for this node. */
    cursor?: boolean | number
    /** The node containing the IndexField */
    node?: IndexFieldGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IndexFieldFilter {and?: (IndexFieldFilter[] | null),fieldMetadataId?: (UUIDFilterComparison | null),id?: (UUIDFilterComparison | null),or?: (IndexFieldFilter[] | null)}

export interface IndexFilter {and?: (IndexFilter[] | null),id?: (UUIDFilterComparison | null),isCustom?: (BooleanFieldComparison | null),or?: (IndexFilter[] | null)}

export interface IndexIndexFieldMetadatasConnectionGenqlSelection{
    /** Array of edges. */
    edges?: IndexFieldEdgeGenqlSelection
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IndexObjectMetadataConnectionGenqlSelection{
    /** Array of edges. */
    edges?: ObjectEdgeGenqlSelection
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
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

export interface JobOperationResultGenqlSelection{
    error?: boolean | number
    jobId?: boolean | number
    success?: boolean | number
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
    id?: boolean | number
    label?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LocationGenqlSelection{
    lat?: boolean | number
    lng?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LogicFunctionGenqlSelection{
    applicationId?: boolean | number
    createdAt?: boolean | number
    cronTriggerSettings?: boolean | number
    databaseEventTriggerSettings?: boolean | number
    description?: boolean | number
    handlerName?: boolean | number
    httpRouteTriggerSettings?: boolean | number
    id?: boolean | number
    isTool?: boolean | number
    name?: boolean | number
    runtime?: boolean | number
    sourceHandlerPath?: boolean | number
    timeoutSeconds?: boolean | number
    toolInputSchema?: boolean | number
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
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
    aboutDescription?: boolean | number
    author?: boolean | number
    category?: boolean | number
    defaultRole?: MarketplaceAppDefaultRoleGenqlSelection
    description?: boolean | number
    fields?: MarketplaceAppFieldGenqlSelection
    frontComponents?: MarketplaceAppFrontComponentGenqlSelection
    icon?: boolean | number
    id?: boolean | number
    isFeatured?: boolean | number
    logicFunctions?: MarketplaceAppLogicFunctionGenqlSelection
    logo?: boolean | number
    name?: boolean | number
    objects?: MarketplaceAppObjectGenqlSelection
    providers?: boolean | number
    screenshots?: boolean | number
    sourcePackage?: boolean | number
    termsUrl?: boolean | number
    version?: boolean | number
    websiteUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MarketplaceAppDefaultRoleGenqlSelection{
    canAccessAllTools?: boolean | number
    canDestroyAllObjectRecords?: boolean | number
    canReadAllObjectRecords?: boolean | number
    canSoftDeleteAllObjectRecords?: boolean | number
    canUpdateAllObjectRecords?: boolean | number
    canUpdateAllSettings?: boolean | number
    description?: boolean | number
    fieldPermissions?: MarketplaceAppRoleFieldPermissionGenqlSelection
    id?: boolean | number
    label?: boolean | number
    objectPermissions?: MarketplaceAppRoleObjectPermissionGenqlSelection
    permissionFlags?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MarketplaceAppFieldGenqlSelection{
    description?: boolean | number
    icon?: boolean | number
    label?: boolean | number
    name?: boolean | number
    objectUniversalIdentifier?: boolean | number
    type?: boolean | number
    universalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MarketplaceAppFrontComponentGenqlSelection{
    description?: boolean | number
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MarketplaceAppLogicFunctionGenqlSelection{
    description?: boolean | number
    name?: boolean | number
    timeoutSeconds?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MarketplaceAppObjectGenqlSelection{
    description?: boolean | number
    fields?: MarketplaceAppFieldGenqlSelection
    icon?: boolean | number
    labelPlural?: boolean | number
    labelSingular?: boolean | number
    namePlural?: boolean | number
    nameSingular?: boolean | number
    universalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MarketplaceAppRoleFieldPermissionGenqlSelection{
    canReadFieldValue?: boolean | number
    canUpdateFieldValue?: boolean | number
    fieldUniversalIdentifier?: boolean | number
    objectUniversalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MarketplaceAppRoleObjectPermissionGenqlSelection{
    canDestroyObjectRecords?: boolean | number
    canReadObjectRecords?: boolean | number
    canSoftDeleteObjectRecords?: boolean | number
    canUpdateObjectRecords?: boolean | number
    objectUniversalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MessageChannelGenqlSelection{
    connectedAccountId?: boolean | number
    contactAutoCreationPolicy?: boolean | number
    createdAt?: boolean | number
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

export interface MetadataEventGenqlSelection{
    metadataName?: boolean | number
    properties?: ObjectRecordEventPropertiesGenqlSelection
    recordId?: boolean | number
    type?: boolean | number
    updatedCollectionHash?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

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
    isCustom?: boolean | number
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

export interface ModelsDevModelSuggestionGenqlSelection{
    cacheCreationCostPerMillionTokens?: boolean | number
    cachedInputCostPerMillionTokens?: boolean | number
    contextWindowTokens?: boolean | number
    inputCostPerMillionTokens?: boolean | number
    maxOutputTokens?: boolean | number
    modalities?: boolean | number
    modelId?: boolean | number
    name?: boolean | number
    outputCostPerMillionTokens?: boolean | number
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

export interface MutationGenqlSelection{
    activateSkill?: (SkillGenqlSelection & { __args: {id: Scalars['UUID']} })
    activateWorkspace?: (WorkspaceGenqlSelection & { __args: {data: ActivateWorkspaceInput} })
    addAiProvider?: { __args: {providerConfig: Scalars['JSON'], providerName: Scalars['String']} }
    addModelToProvider?: { __args: {modelConfig: Scalars['JSON'], providerName: Scalars['String']} }
    addQueryToEventStream?: { __args: {input: AddQuerySubscriptionInput} }
    assignRoleToAgent?: { __args: {agentId: Scalars['UUID'], roleId: Scalars['UUID']} }
    assignRoleToApiKey?: { __args: {apiKeyId: Scalars['UUID'], roleId: Scalars['UUID']} }
    authorizeApp?: (AuthorizeAppGenqlSelection & { __args: {clientId: Scalars['String'], codeChallenge?: (Scalars['String'] | null), redirectUrl: Scalars['String'], scope?: (Scalars['String'] | null), state?: (Scalars['String'] | null)} })
    cancelSwitchBillingInterval?: BillingUpdateGenqlSelection
    cancelSwitchBillingPlan?: BillingUpdateGenqlSelection
    cancelSwitchMeteredPrice?: BillingUpdateGenqlSelection
    checkCustomDomainValidRecords?: DomainValidRecordsGenqlSelection
    checkPublicDomainValidRecords?: (DomainValidRecordsGenqlSelection & { __args: {domain: Scalars['String']} })
    checkoutSession?: (BillingSessionGenqlSelection & { __args: {plan: BillingPlanKey, recurringInterval: SubscriptionInterval, requirePaymentMethod: Scalars['Boolean'], successUrlPath?: (Scalars['String'] | null)} })
    createApiKey?: (ApiKeyGenqlSelection & { __args: {input: CreateApiKeyInput} })
    createApplicationRegistration?: (CreateApplicationRegistrationGenqlSelection & { __args: {input: CreateApplicationRegistrationInput} })
    createApplicationRegistrationVariable?: (ApplicationRegistrationVariableGenqlSelection & { __args: {input: CreateApplicationRegistrationVariableInput} })
    createApprovedAccessDomain?: (ApprovedAccessDomainGenqlSelection & { __args: {input: CreateApprovedAccessDomainInput} })
    createChatThread?: AgentChatThreadGenqlSelection
    createCommandMenuItem?: (CommandMenuItemGenqlSelection & { __args: {input: CreateCommandMenuItemInput} })
    createDatabaseConfigVariable?: { __args: {key: Scalars['String'], value: Scalars['JSON']} }
    createDevelopmentApplication?: (DevelopmentApplicationGenqlSelection & { __args: {name: Scalars['String'], universalIdentifier: Scalars['String']} })
    createEmailingDomain?: (EmailingDomainGenqlSelection & { __args: {domain: Scalars['String'], driver: EmailingDomainDriver} })
    createFrontComponent?: (FrontComponentGenqlSelection & { __args: {input: CreateFrontComponentInput} })
    createManyViewFieldGroups?: (ViewFieldGroupGenqlSelection & { __args: {inputs: CreateViewFieldGroupInput[]} })
    createManyViewFields?: (ViewFieldGenqlSelection & { __args: {inputs: CreateViewFieldInput[]} })
    createManyViewGroups?: (ViewGroupGenqlSelection & { __args: {inputs: CreateViewGroupInput[]} })
    createNavigationMenuItem?: (NavigationMenuItemGenqlSelection & { __args: {input: CreateNavigationMenuItemInput} })
    createOIDCIdentityProvider?: (SetupSsoGenqlSelection & { __args: {input: SetupOIDCSsoInput} })
    createObjectEvent?: (AnalyticsGenqlSelection & { __args: {event: Scalars['String'], objectMetadataId: Scalars['UUID'], properties?: (Scalars['JSON'] | null), recordId: Scalars['UUID']} })
    createOneAgent?: (AgentGenqlSelection & { __args: {input: CreateAgentInput} })
    createOneAppToken?: (AppTokenGenqlSelection & { __args: {input: CreateOneAppTokenInput} })
    createOneField?: (FieldGenqlSelection & { __args: {input: CreateOneFieldMetadataInput} })
    createOneLogicFunction?: (LogicFunctionGenqlSelection & { __args: {input: CreateLogicFunctionFromSourceInput} })
    createOneObject?: (ObjectGenqlSelection & { __args: {input: CreateOneObjectInput} })
    createOneRole?: (RoleGenqlSelection & { __args: {createRoleInput: CreateRoleInput} })
    createPageLayout?: (PageLayoutGenqlSelection & { __args: {input: CreatePageLayoutInput} })
    createPageLayoutTab?: (PageLayoutTabGenqlSelection & { __args: {input: CreatePageLayoutTabInput} })
    createPageLayoutWidget?: (PageLayoutWidgetGenqlSelection & { __args: {input: CreatePageLayoutWidgetInput} })
    createPublicDomain?: (PublicDomainGenqlSelection & { __args: {domain: Scalars['String']} })
    createSAMLIdentityProvider?: (SetupSsoGenqlSelection & { __args: {input: SetupSAMLSsoInput} })
    createSkill?: (SkillGenqlSelection & { __args: {input: CreateSkillInput} })
    createView?: (ViewGenqlSelection & { __args: {input: CreateViewInput} })
    createViewField?: (ViewFieldGenqlSelection & { __args: {input: CreateViewFieldInput} })
    createViewFieldGroup?: (ViewFieldGroupGenqlSelection & { __args: {input: CreateViewFieldGroupInput} })
    createViewFilter?: (ViewFilterGenqlSelection & { __args: {input: CreateViewFilterInput} })
    createViewFilterGroup?: (ViewFilterGroupGenqlSelection & { __args: {input: CreateViewFilterGroupInput} })
    createViewGroup?: (ViewGroupGenqlSelection & { __args: {input: CreateViewGroupInput} })
    createViewSort?: (ViewSortGenqlSelection & { __args: {input: CreateViewSortInput} })
    createWebhook?: (WebhookGenqlSelection & { __args: {input: CreateWebhookInput} })
    deactivateSkill?: (SkillGenqlSelection & { __args: {id: Scalars['UUID']} })
    deleteApplicationRegistration?: { __args: {id: Scalars['String']} }
    deleteApplicationRegistrationVariable?: { __args: {id: Scalars['String']} }
    deleteApprovedAccessDomain?: { __args: {input: DeleteApprovedAccessDomainInput} }
    deleteCommandMenuItem?: (CommandMenuItemGenqlSelection & { __args: {id: Scalars['UUID']} })
    deleteConnectedAccount?: (ConnectedAccountDTOGenqlSelection & { __args: {id: Scalars['UUID']} })
    deleteCurrentWorkspace?: WorkspaceGenqlSelection
    deleteDatabaseConfigVariable?: { __args: {key: Scalars['String']} }
    deleteEmailingDomain?: { __args: {id: Scalars['String']} }
    deleteFrontComponent?: (FrontComponentGenqlSelection & { __args: {id: Scalars['UUID']} })
    deleteJobs?: (DeleteJobsResponseGenqlSelection & { __args: {jobIds: Scalars['String'][], queueName: Scalars['String']} })
    deleteNavigationMenuItem?: (NavigationMenuItemGenqlSelection & { __args: {id: Scalars['UUID']} })
    deleteOneAgent?: (AgentGenqlSelection & { __args: {input: AgentIdInput} })
    deleteOneField?: (FieldGenqlSelection & { __args: {input: DeleteOneFieldInput} })
    deleteOneLogicFunction?: (LogicFunctionGenqlSelection & { __args: {input: LogicFunctionIdInput} })
    deleteOneObject?: (ObjectGenqlSelection & { __args: {input: DeleteOneObjectInput} })
    deleteOneRole?: { __args: {roleId: Scalars['UUID']} }
    deletePublicDomain?: { __args: {domain: Scalars['String']} }
    deleteSSOIdentityProvider?: (DeleteSsoGenqlSelection & { __args: {input: DeleteSsoInput} })
    deleteSkill?: (SkillGenqlSelection & { __args: {id: Scalars['UUID']} })
    deleteTwoFactorAuthenticationMethod?: (DeleteTwoFactorAuthenticationMethodGenqlSelection & { __args: {twoFactorAuthenticationMethodId: Scalars['UUID']} })
    deleteUser?: UserGenqlSelection
    deleteUserFromWorkspace?: (UserWorkspaceGenqlSelection & { __args: {workspaceMemberIdToDelete: Scalars['String']} })
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
    disablePostgresProxy?: PostgresCredentialsGenqlSelection
    duplicateDashboard?: (DuplicatedDashboardGenqlSelection & { __args: {id: Scalars['UUID']} })
    editSSOIdentityProvider?: (EditSsoGenqlSelection & { __args: {input: EditSsoInput} })
    emailPasswordResetLink?: (EmailPasswordResetLinkGenqlSelection & { __args: {email: Scalars['String'], workspaceId?: (Scalars['UUID'] | null)} })
    enablePostgresProxy?: PostgresCredentialsGenqlSelection
    endSubscriptionTrialPeriod?: BillingEndTrialPeriodGenqlSelection
    evaluateAgentTurn?: (AgentTurnEvaluationGenqlSelection & { __args: {turnId: Scalars['UUID']} })
    executeOneLogicFunction?: (LogicFunctionExecutionResultGenqlSelection & { __args: {input: ExecuteOneLogicFunctionInput} })
    generateApiKeyToken?: (ApiKeyTokenGenqlSelection & { __args: {apiKeyId: Scalars['UUID'], expiresAt: Scalars['String']} })
    generateApplicationToken?: (ApplicationTokenPairGenqlSelection & { __args: {applicationId: Scalars['UUID']} })
    generateTransientToken?: TransientTokenGenqlSelection
    getAuthTokensFromLoginToken?: (AuthTokensGenqlSelection & { __args: {loginToken: Scalars['String'], origin: Scalars['String']} })
    getAuthTokensFromOTP?: (AuthTokensGenqlSelection & { __args: {captchaToken?: (Scalars['String'] | null), loginToken: Scalars['String'], origin: Scalars['String'], otp: Scalars['String']} })
    getAuthorizationUrlForSSO?: (GetAuthorizationUrlForSSOGenqlSelection & { __args: {input: GetAuthorizationUrlForSSOInput} })
    getLoginTokenFromCredentials?: (LoginTokenGenqlSelection & { __args: {captchaToken?: (Scalars['String'] | null), email: Scalars['String'], locale?: (Scalars['String'] | null), origin: Scalars['String'], password: Scalars['String'], verifyEmailRedirectPath?: (Scalars['String'] | null)} })
    impersonate?: (ImpersonateGenqlSelection & { __args: {userId: Scalars['UUID'], workspaceId: Scalars['UUID']} })
    initiateOTPProvisioning?: (InitiateTwoFactorAuthenticationProvisioningGenqlSelection & { __args: {loginToken: Scalars['String'], origin: Scalars['String']} })
    initiateOTPProvisioningForAuthenticatedUser?: InitiateTwoFactorAuthenticationProvisioningGenqlSelection
    installApplication?: { __args: {appRegistrationId: Scalars['String'], version?: (Scalars['String'] | null)} }
    installMarketplaceApp?: { __args: {universalIdentifier: Scalars['String'], version?: (Scalars['String'] | null)} }
    refreshEnterpriseValidityToken?: boolean | number
    removeAiProvider?: { __args: {providerName: Scalars['String']} }
    removeModelFromProvider?: { __args: {modelName: Scalars['String'], providerName: Scalars['String']} }
    removeQueryFromEventStream?: { __args: {input: RemoveQueryFromEventStreamInput} }
    removeRoleFromAgent?: { __args: {agentId: Scalars['UUID']} }
    renewApplicationToken?: (ApplicationTokenPairGenqlSelection & { __args: {applicationRefreshToken: Scalars['String']} })
    renewToken?: (AuthTokensGenqlSelection & { __args: {appToken: Scalars['String']} })
    resendEmailVerificationToken?: (ResendEmailVerificationTokenGenqlSelection & { __args: {email: Scalars['String'], origin: Scalars['String']} })
    resendWorkspaceInvitation?: (SendInvitationsGenqlSelection & { __args: {appTokenId: Scalars['String']} })
    retryJobs?: (RetryJobsResponseGenqlSelection & { __args: {jobIds: Scalars['String'][], queueName: Scalars['String']} })
    revokeApiKey?: (ApiKeyGenqlSelection & { __args: {input: RevokeApiKeyInput} })
    rotateApplicationRegistrationClientSecret?: (RotateClientSecretGenqlSelection & { __args: {id: Scalars['String']} })
    runEvaluationInput?: (AgentTurnGenqlSelection & { __args: {agentId: Scalars['UUID'], input: Scalars['String']} })
    runWorkspaceMigration?: { __args: {workspaceMigration: WorkspaceMigrationInput} }
    saveImapSmtpCaldavAccount?: (ImapSmtpCaldavConnectionSuccessGenqlSelection & { __args: {accountOwnerId: Scalars['UUID'], connectionParameters: EmailAccountConnectionParameters, handle: Scalars['String'], id?: (Scalars['UUID'] | null)} })
    sendInvitations?: (SendInvitationsGenqlSelection & { __args: {emails: Scalars['String'][], roleId?: (Scalars['UUID'] | null)} })
    setAdminAiModelEnabled?: { __args: {enabled: Scalars['Boolean'], modelId: Scalars['String']} }
    setAdminAiModelRecommended?: { __args: {modelId: Scalars['String'], recommended: Scalars['Boolean']} }
    setAdminDefaultAiModel?: { __args: {modelId: Scalars['String'], role: AiModelRole} }
    setEnterpriseKey?: (EnterpriseLicenseInfoDTOGenqlSelection & { __args: {enterpriseKey: Scalars['String']} })
    setMeteredSubscriptionPrice?: (BillingUpdateGenqlSelection & { __args: {priceId: Scalars['String']} })
    signIn?: (AvailableWorkspacesAndAccessTokensGenqlSelection & { __args: {captchaToken?: (Scalars['String'] | null), email: Scalars['String'], locale?: (Scalars['String'] | null), password: Scalars['String'], verifyEmailRedirectPath?: (Scalars['String'] | null)} })
    signUp?: (AvailableWorkspacesAndAccessTokensGenqlSelection & { __args: {captchaToken?: (Scalars['String'] | null), email: Scalars['String'], locale?: (Scalars['String'] | null), password: Scalars['String'], verifyEmailRedirectPath?: (Scalars['String'] | null)} })
    signUpInNewWorkspace?: SignUpGenqlSelection
    signUpInWorkspace?: (SignUpGenqlSelection & { __args: {captchaToken?: (Scalars['String'] | null), email: Scalars['String'], locale?: (Scalars['String'] | null), password: Scalars['String'], verifyEmailRedirectPath?: (Scalars['String'] | null), workspaceId?: (Scalars['UUID'] | null), workspaceInviteHash?: (Scalars['String'] | null), workspacePersonalInviteToken?: (Scalars['String'] | null)} })
    skipBookOnboardingStep?: OnboardingStepSuccessGenqlSelection
    skipSyncEmailOnboardingStep?: OnboardingStepSuccessGenqlSelection
    startChannelSync?: (ChannelSyncSuccessGenqlSelection & { __args: {connectedAccountId: Scalars['UUID']} })
    switchBillingPlan?: BillingUpdateGenqlSelection
    switchSubscriptionInterval?: BillingUpdateGenqlSelection
    syncApplication?: (WorkspaceMigrationGenqlSelection & { __args: {manifest: Scalars['JSON']} })
    trackAnalytics?: (AnalyticsGenqlSelection & { __args: {event?: (Scalars['String'] | null), name?: (Scalars['String'] | null), properties?: (Scalars['JSON'] | null), type: AnalyticsType} })
    transferApplicationRegistrationOwnership?: (ApplicationRegistrationGenqlSelection & { __args: {applicationRegistrationId: Scalars['String'], targetWorkspaceSubdomain: Scalars['String']} })
    uninstallApplication?: { __args: {universalIdentifier: Scalars['String']} }
    updateApiKey?: (ApiKeyGenqlSelection & { __args: {input: UpdateApiKeyInput} })
    updateApplicationRegistration?: (ApplicationRegistrationGenqlSelection & { __args: {input: UpdateApplicationRegistrationInput} })
    updateApplicationRegistrationVariable?: (ApplicationRegistrationVariableGenqlSelection & { __args: {input: UpdateApplicationRegistrationVariableInput} })
    updateCalendarChannel?: (CalendarChannelGenqlSelection & { __args: {input: UpdateCalendarChannelInput} })
    updateCommandMenuItem?: (CommandMenuItemGenqlSelection & { __args: {input: UpdateCommandMenuItemInput} })
    updateDatabaseConfigVariable?: { __args: {key: Scalars['String'], value: Scalars['JSON']} }
    updateFrontComponent?: (FrontComponentGenqlSelection & { __args: {input: UpdateFrontComponentInput} })
    updateLabPublicFeatureFlag?: (FeatureFlagGenqlSelection & { __args: {input: UpdateLabPublicFeatureFlagInput} })
    updateMessageChannel?: (MessageChannelGenqlSelection & { __args: {input: UpdateMessageChannelInput} })
    updateMessageFolder?: (MessageFolderGenqlSelection & { __args: {input: UpdateMessageFolderInput} })
    updateMessageFolders?: (MessageFolderGenqlSelection & { __args: {input: UpdateMessageFoldersInput} })
    updateNavigationMenuItem?: (NavigationMenuItemGenqlSelection & { __args: {input: UpdateOneNavigationMenuItemInput} })
    updateOneAgent?: (AgentGenqlSelection & { __args: {input: UpdateAgentInput} })
    updateOneApplicationVariable?: { __args: {applicationId: Scalars['UUID'], key: Scalars['String'], value: Scalars['String']} }
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
    updateUserEmail?: { __args: {newEmail: Scalars['String'], verifyEmailRedirectPath?: (Scalars['String'] | null)} }
    updateView?: (ViewGenqlSelection & { __args: {id: Scalars['String'], input: UpdateViewInput} })
    updateViewField?: (ViewFieldGenqlSelection & { __args: {input: UpdateViewFieldInput} })
    updateViewFieldGroup?: (ViewFieldGroupGenqlSelection & { __args: {input: UpdateViewFieldGroupInput} })
    updateViewFilter?: (ViewFilterGenqlSelection & { __args: {input: UpdateViewFilterInput} })
    updateViewFilterGroup?: (ViewFilterGroupGenqlSelection & { __args: {id: Scalars['String'], input: UpdateViewFilterGroupInput} })
    updateViewGroup?: (ViewGroupGenqlSelection & { __args: {input: UpdateViewGroupInput} })
    updateViewSort?: (ViewSortGenqlSelection & { __args: {input: UpdateViewSortInput} })
    updateWebhook?: (WebhookGenqlSelection & { __args: {input: UpdateWebhookInput} })
    updateWorkspace?: (WorkspaceGenqlSelection & { __args: {data: UpdateWorkspaceInput} })
    updateWorkspaceFeatureFlag?: { __args: {featureFlag: Scalars['String'], value: Scalars['Boolean'], workspaceId: Scalars['UUID']} }
    updateWorkspaceMemberRole?: (WorkspaceMemberGenqlSelection & { __args: {roleId: Scalars['UUID'], workspaceMemberId: Scalars['UUID']} })
    upgradeApplication?: { __args: {appRegistrationId: Scalars['String'], targetVersion: Scalars['String']} }
    uploadAIChatFile?: (FileWithSignedUrlGenqlSelection & { __args: {file: Scalars['Upload']} })
    uploadAppTarball?: (ApplicationRegistrationGenqlSelection & { __args: {file: Scalars['Upload'], universalIdentifier?: (Scalars['String'] | null)} })
    uploadApplicationFile?: (FileGenqlSelection & { __args: {applicationUniversalIdentifier: Scalars['String'], file: Scalars['Upload'], fileFolder: FileFolder, filePath: Scalars['String']} })
    uploadFilesFieldFile?: (FileWithSignedUrlGenqlSelection & { __args: {fieldMetadataId: Scalars['String'], file: Scalars['Upload']} })
    uploadFilesFieldFileByUniversalIdentifier?: (FileWithSignedUrlGenqlSelection & { __args: {fieldMetadataUniversalIdentifier: Scalars['String'], file: Scalars['Upload']} })
    uploadWorkflowFile?: (FileWithSignedUrlGenqlSelection & { __args: {file: Scalars['Upload']} })
    uploadWorkspaceLogo?: (FileWithSignedUrlGenqlSelection & { __args: {file: Scalars['Upload']} })
    uploadWorkspaceMemberProfilePicture?: (FileWithSignedUrlGenqlSelection & { __args: {file: Scalars['Upload']} })
    upsertFieldPermissions?: (FieldPermissionGenqlSelection & { __args: {upsertFieldPermissionsInput: UpsertFieldPermissionsInput} })
    upsertFieldsWidget?: (ViewGenqlSelection & { __args: {input: UpsertFieldsWidgetInput} })
    upsertObjectPermissions?: (ObjectPermissionGenqlSelection & { __args: {upsertObjectPermissionsInput: UpsertObjectPermissionsInput} })
    upsertPermissionFlags?: (PermissionFlagGenqlSelection & { __args: {upsertPermissionFlagsInput: UpsertPermissionFlagsInput} })
    upsertRowLevelPermissionPredicates?: (UpsertRowLevelPermissionPredicatesResultGenqlSelection & { __args: {input: UpsertRowLevelPermissionPredicatesInput} })
    userLookupAdminPanel?: (UserLookupGenqlSelection & { __args: {userIdentifier: Scalars['String']} })
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
    isCustom?: boolean | number
    isLabelSyncedWithName?: boolean | number
    isRemote?: boolean | number
    isSearchable?: boolean | number
    isSystem?: boolean | number
    isUIReadOnly?: boolean | number
    labelIdentifierFieldMetadataId?: boolean | number
    labelPlural?: boolean | number
    labelSingular?: boolean | number
    namePlural?: boolean | number
    nameSingular?: boolean | number
    shortcut?: boolean | number
    standardOverrides?: ObjectStandardOverridesGenqlSelection
    universalIdentifier?: boolean | number
    updatedAt?: boolean | number
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

export interface ObjectFilter {and?: (ObjectFilter[] | null),id?: (UUIDFilterComparison | null),isActive?: (BooleanFieldComparison | null),isCustom?: (BooleanFieldComparison | null),isRemote?: (BooleanFieldComparison | null),isSearchable?: (BooleanFieldComparison | null),isSystem?: (BooleanFieldComparison | null),isUIReadOnly?: (BooleanFieldComparison | null),or?: (ObjectFilter[] | null)}

export interface ObjectIndexMetadatasConnectionGenqlSelection{
    /** Array of edges. */
    edges?: IndexEdgeGenqlSelection
    /** Paging information */
    pageInfo?: PageInfoGenqlSelection
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

export interface ObjectStandardOverridesGenqlSelection{
    color?: boolean | number
    description?: boolean | number
    icon?: boolean | number
    labelPlural?: boolean | number
    labelSingular?: boolean | number
    translations?: boolean | number
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
    createdAt?: boolean | number
    defaultTabToFocusOnMobileAndSidePanelId?: boolean | number
    deletedAt?: boolean | number
    id?: boolean | number
    name?: boolean | number
    objectMetadataId?: boolean | number
    tabs?: PageLayoutTabGenqlSelection
    type?: boolean | number
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
    isOverridden?: boolean | number
    layoutMode?: boolean | number
    pageLayoutId?: boolean | number
    position?: boolean | number
    title?: boolean | number
    updatedAt?: boolean | number
    widgets?: PageLayoutWidgetGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageLayoutWidgetGenqlSelection{
    conditionalDisplay?: boolean | number
    configuration?: WidgetConfigurationGenqlSelection
    createdAt?: boolean | number
    deletedAt?: boolean | number
    gridPosition?: GridPositionGenqlSelection
    id?: boolean | number
    isOverridden?: boolean | number
    objectMetadataId?: boolean | number
    pageLayoutTabId?: boolean | number
    position?: PageLayoutWidgetPositionGenqlSelection
    title?: boolean | number
    type?: boolean | number
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
    index?: boolean | number
    layoutMode?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PermissionFlagGenqlSelection{
    flag?: boolean | number
    id?: boolean | number
    roleId?: boolean | number
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
    id?: boolean | number
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
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PostgresCredentialsGenqlSelection{
    id?: boolean | number
    password?: boolean | number
    user?: boolean | number
    workspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PublicApplicationRegistrationGenqlSelection{
    id?: boolean | number
    logoUrl?: boolean | number
    name?: boolean | number
    oAuthScopes?: boolean | number
    websiteUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PublicDomainGenqlSelection{
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
    imagePath?: boolean | number
    label?: boolean | number
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

export interface QueryGenqlSelection{
    agentTurns?: (AgentTurnGenqlSelection & { __args: {agentId: Scalars['UUID']} })
    apiKey?: (ApiKeyGenqlSelection & { __args: {input: GetApiKeyInput} })
    apiKeys?: ApiKeyGenqlSelection
    applicationRegistrationTarballUrl?: { __args: {id: Scalars['String']} }
    barChartData?: (BarChartDataGenqlSelection & { __args: {input: BarChartDataInput} })
    billingPortalSession?: (BillingSessionGenqlSelection & { __args?: {returnUrlPath?: (Scalars['String'] | null)} })
    chatMessages?: (AgentMessageGenqlSelection & { __args: {threadId: Scalars['UUID']} })
    chatThread?: (AgentChatThreadGenqlSelection & { __args: {id: Scalars['UUID']} })
    chatThreads?: (AgentChatThreadConnectionGenqlSelection & { __args: {
    /** Specify to filter the records returned. */
    filter: AgentChatThreadFilter, 
    /** Limit or page results. */
    paging: CursorPaging, 
    /** Specify to sort results. */
    sorting: AgentChatThreadSort[]} })
    checkUserExists?: (CheckUserExistGenqlSelection & { __args: {captchaToken?: (Scalars['String'] | null), email: Scalars['String']} })
    checkWorkspaceInviteHashIsValid?: (WorkspaceInviteHashValidGenqlSelection & { __args: {inviteHash: Scalars['String']} })
    commandMenuItem?: (CommandMenuItemGenqlSelection & { __args: {id: Scalars['UUID']} })
    commandMenuItems?: CommandMenuItemGenqlSelection
    connectedAccounts?: ConnectedAccountDTOGenqlSelection
    currentUser?: UserGenqlSelection
    currentWorkspace?: WorkspaceGenqlSelection
    enterpriseCheckoutSession?: { __args: {billingInterval?: (Scalars['String'] | null)} } | boolean | number
    enterprisePortalSession?: { __args: {returnUrlPath?: (Scalars['String'] | null)} } | boolean | number
    enterpriseSubscriptionStatus?: EnterpriseSubscriptionStatusDTOGenqlSelection
    eventLogs?: (EventLogQueryResultGenqlSelection & { __args: {input: EventLogQueryInput} })
    field?: (FieldGenqlSelection & { __args: {
    /** The id of the record to find. */
    id: Scalars['UUID']} })
    fields?: (FieldConnectionGenqlSelection & { __args: {
    /** Specify to filter the records returned. */
    filter: FieldFilter, 
    /** Limit or page results. */
    paging: CursorPaging} })
    findAllApplicationRegistrations?: ApplicationRegistrationGenqlSelection
    findApplicationRegistrationByClientId?: (PublicApplicationRegistrationGenqlSelection & { __args: {clientId: Scalars['String']} })
    findApplicationRegistrationByUniversalIdentifier?: (ApplicationRegistrationGenqlSelection & { __args: {universalIdentifier: Scalars['String']} })
    findApplicationRegistrationStats?: (ApplicationRegistrationStatsGenqlSelection & { __args: {id: Scalars['String']} })
    findApplicationRegistrationVariables?: (ApplicationRegistrationVariableGenqlSelection & { __args: {applicationRegistrationId: Scalars['String']} })
    findManyAgents?: AgentGenqlSelection
    findManyApplicationRegistrations?: ApplicationRegistrationGenqlSelection
    findManyApplications?: ApplicationGenqlSelection
    findManyLogicFunctions?: LogicFunctionGenqlSelection
    findManyMarketplaceApps?: MarketplaceAppGenqlSelection
    findManyPublicDomains?: PublicDomainGenqlSelection
    findOneAgent?: (AgentGenqlSelection & { __args: {input: AgentIdInput} })
    findOneApplication?: (ApplicationGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), universalIdentifier?: (Scalars['UUID'] | null)} })
    findOneApplicationRegistration?: (ApplicationRegistrationGenqlSelection & { __args: {id: Scalars['String']} })
    findOneLogicFunction?: (LogicFunctionGenqlSelection & { __args: {input: LogicFunctionIdInput} })
    findOneMarketplaceApp?: (MarketplaceAppGenqlSelection & { __args: {universalIdentifier: Scalars['String']} })
    findWorkspaceFromInviteHash?: (WorkspaceGenqlSelection & { __args: {inviteHash: Scalars['String']} })
    findWorkspaceInvitations?: WorkspaceInvitationGenqlSelection
    frontComponent?: (FrontComponentGenqlSelection & { __args: {id: Scalars['UUID']} })
    frontComponents?: FrontComponentGenqlSelection
    getAISystemPromptPreview?: AISystemPromptPreviewGenqlSelection
    getAddressDetails?: (PlaceDetailsResultGenqlSelection & { __args: {placeId: Scalars['String'], token: Scalars['String']} })
    getAdminAiModels?: AdminAIModelsGenqlSelection
    getAiProviders?: boolean | number
    getApprovedAccessDomains?: ApprovedAccessDomainGenqlSelection
    getAutoCompleteAddress?: (AutocompleteResultGenqlSelection & { __args: {address: Scalars['String'], country?: (Scalars['String'] | null), isFieldCity?: (Scalars['Boolean'] | null), token: Scalars['String']} })
    getAvailablePackages?: { __args: {input: LogicFunctionIdInput} }
    getConfigVariablesGrouped?: ConfigVariablesGenqlSelection
    getConnectedImapSmtpCaldavAccount?: (ConnectedImapSmtpCaldavAccountGenqlSelection & { __args: {id: Scalars['UUID']} })
    getDatabaseConfigVariable?: (ConfigVariableGenqlSelection & { __args: {key: Scalars['String']} })
    getEmailingDomains?: EmailingDomainGenqlSelection
    getIndicatorHealthStatus?: (AdminPanelHealthServiceDataGenqlSelection & { __args: {indicatorId: HealthIndicatorId} })
    getLogicFunctionSourceCode?: { __args: {input: LogicFunctionIdInput} }
    getMeteredProductsUsage?: BillingMeteredProductUsageGenqlSelection
    getModelsDevProviders?: ModelsDevProviderSuggestionGenqlSelection
    getModelsDevSuggestions?: (ModelsDevModelSuggestionGenqlSelection & { __args: {providerType: Scalars['String']} })
    getPageLayout?: (PageLayoutGenqlSelection & { __args: {id: Scalars['String']} })
    getPageLayoutTab?: (PageLayoutTabGenqlSelection & { __args: {id: Scalars['String']} })
    getPageLayoutTabs?: (PageLayoutTabGenqlSelection & { __args: {pageLayoutId: Scalars['String']} })
    getPageLayoutWidget?: (PageLayoutWidgetGenqlSelection & { __args: {id: Scalars['String']} })
    getPageLayoutWidgets?: (PageLayoutWidgetGenqlSelection & { __args: {pageLayoutTabId: Scalars['String']} })
    getPageLayouts?: (PageLayoutGenqlSelection & { __args?: {objectMetadataId?: (Scalars['String'] | null), pageLayoutType?: (PageLayoutType | null)} })
    getPostgresCredentials?: PostgresCredentialsGenqlSelection
    getPublicWorkspaceDataByDomain?: (PublicWorkspaceDataGenqlSelection & { __args?: {origin?: (Scalars['String'] | null)} })
    getQueueJobs?: (QueueJobsResponseGenqlSelection & { __args: {limit?: (Scalars['Int'] | null), offset?: (Scalars['Int'] | null), queueName: Scalars['String'], state: JobState} })
    getQueueMetrics?: (QueueMetricsDataGenqlSelection & { __args: {queueName: Scalars['String'], timeRange?: (QueueMetricsTimeRange | null)} })
    getRoles?: RoleGenqlSelection
    getSSOIdentityProviders?: FindAvailableSSOIDPGenqlSelection
    getSystemHealthStatus?: SystemHealthGenqlSelection
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
    index?: (IndexGenqlSelection & { __args: {
    /** The id of the record to find. */
    id: Scalars['UUID']} })
    indexMetadatas?: (IndexConnectionGenqlSelection & { __args: {
    /** Specify to filter the records returned. */
    filter: IndexFilter, 
    /** Limit or page results. */
    paging: CursorPaging} })
    lineChartData?: (LineChartDataGenqlSelection & { __args: {input: LineChartDataInput} })
    listPlans?: BillingPlanGenqlSelection
    minimalMetadata?: MinimalMetadataGenqlSelection
    myCalendarChannels?: (CalendarChannelGenqlSelection & { __args?: {connectedAccountId?: (Scalars['UUID'] | null)} })
    myConnectedAccounts?: ConnectedAccountDTOGenqlSelection
    myMessageChannels?: (MessageChannelGenqlSelection & { __args?: {connectedAccountId?: (Scalars['UUID'] | null)} })
    myMessageFolders?: (MessageFolderGenqlSelection & { __args?: {messageChannelId?: (Scalars['UUID'] | null)} })
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
    skill?: (SkillGenqlSelection & { __args: {id: Scalars['UUID']} })
    skills?: SkillGenqlSelection
    validatePasswordResetToken?: (ValidatePasswordResetTokenGenqlSelection & { __args: {passwordResetToken: Scalars['String']} })
    versionInfo?: VersionInfoGenqlSelection
    webhook?: (WebhookGenqlSelection & { __args: {id: Scalars['UUID']} })
    webhooks?: WebhookGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueueJobGenqlSelection{
    attemptsMade?: boolean | number
    data?: boolean | number
    failedReason?: boolean | number
    finishedOn?: boolean | number
    id?: boolean | number
    logs?: boolean | number
    name?: boolean | number
    processedOn?: boolean | number
    returnValue?: boolean | number
    stackTrace?: boolean | number
    state?: boolean | number
    timestamp?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueueJobsResponseGenqlSelection{
    count?: boolean | number
    hasMore?: boolean | number
    jobs?: QueueJobGenqlSelection
    retentionConfig?: QueueRetentionConfigGenqlSelection
    totalCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueueMetricsDataGenqlSelection{
    data?: QueueMetricsSeriesGenqlSelection
    details?: WorkerQueueMetricsGenqlSelection
    queueName?: boolean | number
    timeRange?: boolean | number
    workers?: boolean | number
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
    data?: QueueMetricsDataPointGenqlSelection
    id?: boolean | number
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

export interface RatioAggregateConfigGenqlSelection{
    fieldMetadataId?: boolean | number
    optionValue?: boolean | number
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

export interface ResendEmailVerificationTokenGenqlSelection{
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RetryJobsResponseGenqlSelection{
    results?: JobOperationResultGenqlSelection
    retriedCount?: boolean | number
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
    permissionFlags?: PermissionFlagGenqlSelection
    rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroupGenqlSelection
    rowLevelPermissionPredicates?: RowLevelPermissionPredicateGenqlSelection
    universalIdentifier?: boolean | number
    workspaceMembers?: WorkspaceMemberGenqlSelection
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

export interface SendInvitationsGenqlSelection{
    errors?: boolean | number
    result?: WorkspaceInvitationGenqlSelection
    /** Boolean that confirms query was dispatched */
    success?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SentryGenqlSelection{
    dsn?: boolean | number
    environment?: boolean | number
    release?: boolean | number
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

export interface SkillGenqlSelection{
    applicationId?: boolean | number
    content?: boolean | number
    createdAt?: boolean | number
    description?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    isActive?: boolean | number
    isCustom?: boolean | number
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

export interface StandardOverridesGenqlSelection{
    description?: boolean | number
    icon?: boolean | number
    label?: boolean | number
    translations?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SubscriptionGenqlSelection{
    logicFunctionLogs?: (LogicFunctionLogsGenqlSelection & { __args: {input: LogicFunctionLogsInput} })
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

export interface SystemHealthGenqlSelection{
    services?: SystemHealthServiceGenqlSelection
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

export interface ToolIndexEntryGenqlSelection{
    category?: boolean | number
    description?: boolean | number
    inputSchema?: boolean | number
    name?: boolean | number
    objectName?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TransientTokenGenqlSelection{
    transientToken?: AuthTokenGenqlSelection
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

export interface UUIDFilterComparison {eq?: (Scalars['UUID'] | null),gt?: (Scalars['UUID'] | null),gte?: (Scalars['UUID'] | null),iLike?: (Scalars['UUID'] | null),in?: (Scalars['UUID'][] | null),is?: (Scalars['Boolean'] | null),isNot?: (Scalars['Boolean'] | null),like?: (Scalars['UUID'] | null),lt?: (Scalars['UUID'] | null),lte?: (Scalars['UUID'] | null),neq?: (Scalars['UUID'] | null),notILike?: (Scalars['UUID'] | null),notIn?: (Scalars['UUID'][] | null),notLike?: (Scalars['UUID'] | null)}

export interface UpdateAgentInput {description?: (Scalars['String'] | null),evaluationInputs?: (Scalars['String'][] | null),icon?: (Scalars['String'] | null),id: Scalars['UUID'],label?: (Scalars['String'] | null),modelConfiguration?: (Scalars['JSON'] | null),modelId?: (Scalars['String'] | null),name?: (Scalars['String'] | null),prompt?: (Scalars['String'] | null),responseFormat?: (Scalars['JSON'] | null),roleId?: (Scalars['UUID'] | null)}

export interface UpdateApiKeyInput {expiresAt?: (Scalars['String'] | null),id: Scalars['UUID'],name?: (Scalars['String'] | null),revokedAt?: (Scalars['String'] | null)}

export interface UpdateApplicationRegistrationInput {id: Scalars['String'],update: UpdateApplicationRegistrationPayload}

export interface UpdateApplicationRegistrationPayload {author?: (Scalars['String'] | null),description?: (Scalars['String'] | null),isListed?: (Scalars['Boolean'] | null),logoUrl?: (Scalars['String'] | null),name?: (Scalars['String'] | null),oAuthRedirectUris?: (Scalars['String'][] | null),oAuthScopes?: (Scalars['String'][] | null),termsUrl?: (Scalars['String'] | null),websiteUrl?: (Scalars['String'] | null)}

export interface UpdateApplicationRegistrationVariableInput {id: Scalars['String'],update: UpdateApplicationRegistrationVariablePayload}

export interface UpdateApplicationRegistrationVariablePayload {description?: (Scalars['String'] | null),value?: (Scalars['String'] | null)}

export interface UpdateCalendarChannelInput {id: Scalars['UUID'],update: UpdateCalendarChannelInputUpdates}

export interface UpdateCalendarChannelInputUpdates {contactAutoCreationPolicy?: (CalendarChannelContactAutoCreationPolicy | null),isContactAutoCreationEnabled?: (Scalars['Boolean'] | null),isSyncEnabled?: (Scalars['Boolean'] | null),visibility?: (CalendarChannelVisibility | null)}

export interface UpdateCommandMenuItemInput {availabilityObjectMetadataId?: (Scalars['UUID'] | null),availabilityType?: (CommandMenuItemAvailabilityType | null),engineComponentKey?: (EngineComponentKey | null),hotKeys?: (Scalars['String'][] | null),icon?: (Scalars['String'] | null),id: Scalars['UUID'],isPinned?: (Scalars['Boolean'] | null),label?: (Scalars['String'] | null),position?: (Scalars['Float'] | null),shortLabel?: (Scalars['String'] | null)}

export interface UpdateFieldInput {defaultValue?: (Scalars['JSON'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),isActive?: (Scalars['Boolean'] | null),isLabelSyncedWithName?: (Scalars['Boolean'] | null),isNullable?: (Scalars['Boolean'] | null),isSystem?: (Scalars['Boolean'] | null),isUIReadOnly?: (Scalars['Boolean'] | null),isUnique?: (Scalars['Boolean'] | null),label?: (Scalars['String'] | null),morphRelationsUpdatePayload?: (Scalars['JSON'][] | null),name?: (Scalars['String'] | null),options?: (Scalars['JSON'] | null),settings?: (Scalars['JSON'] | null),universalIdentifier?: (Scalars['String'] | null)}

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

export interface UpdateLogicFunctionFromSourceInputUpdates {cronTriggerSettings?: (Scalars['JSON'] | null),databaseEventTriggerSettings?: (Scalars['JSON'] | null),description?: (Scalars['String'] | null),handlerName?: (Scalars['String'] | null),httpRouteTriggerSettings?: (Scalars['JSON'] | null),isTool?: (Scalars['Boolean'] | null),name?: (Scalars['String'] | null),sourceHandlerCode?: (Scalars['String'] | null),sourceHandlerPath?: (Scalars['String'] | null),timeoutSeconds?: (Scalars['Float'] | null),toolInputSchema?: (Scalars['JSON'] | null)}

export interface UpdateMessageChannelInput {id: Scalars['UUID'],update: UpdateMessageChannelInputUpdates}

export interface UpdateMessageChannelInputUpdates {contactAutoCreationPolicy?: (MessageChannelContactAutoCreationPolicy | null),excludeGroupEmails?: (Scalars['Boolean'] | null),excludeNonProfessionalEmails?: (Scalars['Boolean'] | null),isContactAutoCreationEnabled?: (Scalars['Boolean'] | null),isSyncEnabled?: (Scalars['Boolean'] | null),messageFolderImportPolicy?: (MessageFolderImportPolicy | null),visibility?: (MessageChannelVisibility | null)}

export interface UpdateMessageFolderInput {id: Scalars['UUID'],update: UpdateMessageFolderInputUpdates}

export interface UpdateMessageFolderInputUpdates {isSynced?: (Scalars['Boolean'] | null)}

export interface UpdateMessageFoldersInput {ids: Scalars['UUID'][],update: UpdateMessageFolderInputUpdates}

export interface UpdateNavigationMenuItemInput {color?: (Scalars['String'] | null),folderId?: (Scalars['UUID'] | null),icon?: (Scalars['String'] | null),link?: (Scalars['String'] | null),name?: (Scalars['String'] | null),position?: (Scalars['Float'] | null)}

export interface UpdateObjectPayload {color?: (Scalars['String'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),imageIdentifierFieldMetadataId?: (Scalars['UUID'] | null),isActive?: (Scalars['Boolean'] | null),isLabelSyncedWithName?: (Scalars['Boolean'] | null),labelIdentifierFieldMetadataId?: (Scalars['UUID'] | null),labelPlural?: (Scalars['String'] | null),labelSingular?: (Scalars['String'] | null),namePlural?: (Scalars['String'] | null),nameSingular?: (Scalars['String'] | null),shortcut?: (Scalars['String'] | null)}

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

export interface UpdatePageLayoutWidgetInput {conditionalDisplay?: (Scalars['JSON'] | null),configuration?: (Scalars['JSON'] | null),gridPosition?: (GridPositionInput | null),objectMetadataId?: (Scalars['UUID'] | null),position?: (Scalars['JSON'] | null),title?: (Scalars['String'] | null),type?: (WidgetType | null)}

export interface UpdatePageLayoutWidgetWithIdInput {conditionalDisplay?: (Scalars['JSON'] | null),configuration?: (Scalars['JSON'] | null),gridPosition: GridPositionInput,id: Scalars['UUID'],objectMetadataId?: (Scalars['UUID'] | null),pageLayoutTabId: Scalars['UUID'],position?: (Scalars['JSON'] | null),title: Scalars['String'],type: WidgetType}

export interface UpdatePageLayoutWithTabsInput {name: Scalars['String'],objectMetadataId?: (Scalars['UUID'] | null),tabs: UpdatePageLayoutTabWithWidgetsInput[],type: PageLayoutType}

export interface UpdateRoleInput {
/** The id of the role to update */
id: Scalars['UUID'],update: UpdateRolePayload}

export interface UpdateRolePayload {canAccessAllTools?: (Scalars['Boolean'] | null),canBeAssignedToAgents?: (Scalars['Boolean'] | null),canBeAssignedToApiKeys?: (Scalars['Boolean'] | null),canBeAssignedToUsers?: (Scalars['Boolean'] | null),canDestroyAllObjectRecords?: (Scalars['Boolean'] | null),canReadAllObjectRecords?: (Scalars['Boolean'] | null),canSoftDeleteAllObjectRecords?: (Scalars['Boolean'] | null),canUpdateAllObjectRecords?: (Scalars['Boolean'] | null),canUpdateAllSettings?: (Scalars['Boolean'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),label?: (Scalars['String'] | null)}

export interface UpdateSkillInput {content?: (Scalars['String'] | null),description?: (Scalars['String'] | null),icon?: (Scalars['String'] | null),id: Scalars['UUID'],isActive?: (Scalars['Boolean'] | null),label?: (Scalars['String'] | null),name?: (Scalars['String'] | null)}

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

export interface UpdateViewFilterInputUpdates {fieldMetadataId?: (Scalars['UUID'] | null),operand?: (ViewFilterOperand | null),positionInViewFilterGroup?: (Scalars['Float'] | null),subFieldName?: (Scalars['String'] | null),value?: (Scalars['JSON'] | null),viewFilterGroupId?: (Scalars['UUID'] | null)}

export interface UpdateViewGroupInput {
/** The id of the view group to update */
id: Scalars['UUID'],
/** The view group to update */
update: UpdateViewGroupInputUpdates}

export interface UpdateViewGroupInputUpdates {fieldMetadataId?: (Scalars['UUID'] | null),fieldValue?: (Scalars['String'] | null),isVisible?: (Scalars['Boolean'] | null),position?: (Scalars['Float'] | null)}

export interface UpdateViewInput {anyFieldFilterValue?: (Scalars['String'] | null),calendarFieldMetadataId?: (Scalars['UUID'] | null),calendarLayout?: (ViewCalendarLayout | null),icon?: (Scalars['String'] | null),id?: (Scalars['UUID'] | null),isCompact?: (Scalars['Boolean'] | null),kanbanAggregateOperation?: (AggregateOperations | null),kanbanAggregateOperationFieldMetadataId?: (Scalars['UUID'] | null),mainGroupByFieldMetadataId?: (Scalars['UUID'] | null),name?: (Scalars['String'] | null),openRecordIn?: (ViewOpenRecordIn | null),position?: (Scalars['Float'] | null),shouldHideEmptyGroups?: (Scalars['Boolean'] | null),type?: (ViewType | null),visibility?: (ViewVisibility | null)}

export interface UpdateViewSortInput {
/** The id of the view sort to update */
id: Scalars['UUID'],
/** The view sort to update */
update: UpdateViewSortInputUpdates}

export interface UpdateViewSortInputUpdates {direction?: (ViewSortDirection | null)}

export interface UpdateWebhookInput {
/** The id of the webhook to update */
id: Scalars['UUID'],
/** The webhook fields to update */
update: UpdateWebhookInputUpdates}

export interface UpdateWebhookInputUpdates {description?: (Scalars['String'] | null),operations?: (Scalars['String'][] | null),secret?: (Scalars['String'] | null),targetUrl?: (Scalars['String'] | null)}

export interface UpdateWorkspaceInput {aiAdditionalInstructions?: (Scalars['String'] | null),allowImpersonation?: (Scalars['Boolean'] | null),customDomain?: (Scalars['String'] | null),defaultRoleId?: (Scalars['UUID'] | null),displayName?: (Scalars['String'] | null),editableProfileFields?: (Scalars['String'][] | null),enabledAiModelIds?: (Scalars['String'][] | null),eventLogRetentionDays?: (Scalars['Float'] | null),fastModel?: (Scalars['String'] | null),inviteHash?: (Scalars['String'] | null),isGoogleAuthBypassEnabled?: (Scalars['Boolean'] | null),isGoogleAuthEnabled?: (Scalars['Boolean'] | null),isMicrosoftAuthBypassEnabled?: (Scalars['Boolean'] | null),isMicrosoftAuthEnabled?: (Scalars['Boolean'] | null),isPasswordAuthBypassEnabled?: (Scalars['Boolean'] | null),isPasswordAuthEnabled?: (Scalars['Boolean'] | null),isPublicInviteLinkEnabled?: (Scalars['Boolean'] | null),isTwoFactorAuthenticationEnforced?: (Scalars['Boolean'] | null),logo?: (Scalars['String'] | null),smartModel?: (Scalars['String'] | null),subdomain?: (Scalars['String'] | null),trashRetentionDays?: (Scalars['Float'] | null),useRecommendedModels?: (Scalars['Boolean'] | null)}

export interface UpsertFieldPermissionsInput {fieldPermissions: FieldPermissionInput[],roleId: Scalars['UUID']}

export interface UpsertFieldsWidgetFieldInput {isVisible: Scalars['Boolean'],position: Scalars['Float'],
/** The id of the view field */
viewFieldId: Scalars['UUID']}

export interface UpsertFieldsWidgetGroupInput {fields: UpsertFieldsWidgetFieldInput[],id: Scalars['UUID'],isVisible: Scalars['Boolean'],name: Scalars['String'],position: Scalars['Float']}

export interface UpsertFieldsWidgetInput {
/** The ungrouped fields to upsert. When provided, all existing groups are deleted and fields are detached from groups. Mutually exclusive with "groups". */
fields?: (UpsertFieldsWidgetFieldInput[] | null),
/** The groups (with nested fields) to upsert. Mutually exclusive with "fields". */
groups?: (UpsertFieldsWidgetGroupInput[] | null),
/** The id of the fields widget whose groups and fields to upsert */
widgetId: Scalars['UUID']}

export interface UpsertObjectPermissionsInput {objectPermissions: ObjectPermissionInput[],roleId: Scalars['UUID']}

export interface UpsertPermissionFlagsInput {permissionFlagKeys: PermissionFlagType[],roleId: Scalars['UUID']}

export interface UpsertRowLevelPermissionPredicatesInput {objectMetadataId: Scalars['UUID'],predicateGroups: RowLevelPermissionPredicateGroupInput[],predicates: RowLevelPermissionPredicateInput[],roleId: Scalars['UUID']}

export interface UpsertRowLevelPermissionPredicatesResultGenqlSelection{
    predicateGroups?: RowLevelPermissionPredicateGroupGenqlSelection
    predicates?: RowLevelPermissionPredicateGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UsageAnalyticsGenqlSelection{
    periodEnd?: boolean | number
    periodStart?: boolean | number
    timeSeries?: UsageTimeSeriesGenqlSelection
    usageByOperationType?: UsageBreakdownItemGenqlSelection
    usageByUser?: UsageBreakdownItemGenqlSelection
    userDailyUsage?: UsageUserDailyGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UsageAnalyticsInput {periodEnd?: (Scalars['DateTime'] | null),periodStart?: (Scalars['DateTime'] | null),userWorkspaceId?: (Scalars['String'] | null)}

export interface UsageBreakdownItemGenqlSelection{
    creditsUsed?: boolean | number
    key?: boolean | number
    label?: boolean | number
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
    defaultAvatarUrl?: boolean | number
    deletedAt?: boolean | number
    deletedWorkspaceMembers?: DeletedWorkspaceMemberGenqlSelection
    disabled?: boolean | number
    email?: boolean | number
    firstName?: boolean | number
    hasPassword?: boolean | number
    id?: boolean | number
    isEmailVerified?: boolean | number
    lastName?: boolean | number
    locale?: boolean | number
    onboardingStatus?: boolean | number
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

export interface UserInfoGenqlSelection{
    email?: boolean | number
    firstName?: boolean | number
    id?: boolean | number
    lastName?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserLookupGenqlSelection{
    user?: UserInfoGenqlSelection
    workspaces?: WorkspaceInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserWorkspaceGenqlSelection{
    createdAt?: boolean | number
    deletedAt?: boolean | number
    id?: boolean | number
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

export interface VerificationRecordGenqlSelection{
    key?: boolean | number
    priority?: boolean | number
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

export interface VersionInfoGenqlSelection{
    currentVersion?: boolean | number
    latestVersion?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ViewGenqlSelection{
    anyFieldFilterValue?: boolean | number
    calendarFieldMetadataId?: boolean | number
    calendarLayout?: boolean | number
    createdAt?: boolean | number
    createdByUserWorkspaceId?: boolean | number
    deletedAt?: boolean | number
    icon?: boolean | number
    id?: boolean | number
    isCompact?: boolean | number
    isCustom?: boolean | number
    kanbanAggregateOperation?: boolean | number
    kanbanAggregateOperationFieldMetadataId?: boolean | number
    key?: boolean | number
    mainGroupByFieldMetadataId?: boolean | number
    name?: boolean | number
    objectMetadataId?: boolean | number
    openRecordIn?: boolean | number
    position?: boolean | number
    shouldHideEmptyGroups?: boolean | number
    type?: boolean | number
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
    createdAt?: boolean | number
    deletedAt?: boolean | number
    fieldMetadataId?: boolean | number
    id?: boolean | number
    isOverridden?: boolean | number
    isVisible?: boolean | number
    position?: boolean | number
    size?: boolean | number
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
    on_EmailsConfiguration?:EmailsConfigurationGenqlSelection,
    on_FieldConfiguration?:FieldConfigurationGenqlSelection,
    on_FieldRichTextConfiguration?:FieldRichTextConfigurationGenqlSelection,
    on_FieldsConfiguration?:FieldsConfigurationGenqlSelection,
    on_FilesConfiguration?:FilesConfigurationGenqlSelection,
    on_FrontComponentConfiguration?:FrontComponentConfigurationGenqlSelection,
    on_GaugeChartConfiguration?:GaugeChartConfigurationGenqlSelection,
    on_IframeConfiguration?:IframeConfigurationGenqlSelection,
    on_LineChartConfiguration?:LineChartConfigurationGenqlSelection,
    on_NotesConfiguration?:NotesConfigurationGenqlSelection,
    on_PieChartConfiguration?:PieChartConfigurationGenqlSelection,
    on_StandaloneRichTextConfiguration?:StandaloneRichTextConfigurationGenqlSelection,
    on_TasksConfiguration?:TasksConfigurationGenqlSelection,
    on_TimelineConfiguration?:TimelineConfigurationGenqlSelection,
    on_ViewConfiguration?:ViewConfigurationGenqlSelection,
    on_WorkflowConfiguration?:WorkflowConfigurationGenqlSelection,
    on_WorkflowRunConfiguration?:WorkflowRunConfigurationGenqlSelection,
    on_WorkflowVersionConfiguration?:WorkflowVersionConfigurationGenqlSelection,
    __typename?: boolean | number
}

export interface WorkerQueueMetricsGenqlSelection{
    active?: boolean | number
    completed?: boolean | number
    completedData?: boolean | number
    delayed?: boolean | number
    failed?: boolean | number
    failedData?: boolean | number
    failureRate?: boolean | number
    waiting?: boolean | number
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

export interface WorkspaceGenqlSelection{
    activationStatus?: boolean | number
    aiAdditionalInstructions?: boolean | number
    allowImpersonation?: boolean | number
    billingEntitlements?: BillingEntitlementGenqlSelection
    billingSubscriptions?: BillingSubscriptionGenqlSelection
    createdAt?: boolean | number
    currentBillingSubscription?: BillingSubscriptionGenqlSelection
    customDomain?: boolean | number
    databaseSchema?: boolean | number
    databaseUrl?: boolean | number
    defaultRole?: RoleGenqlSelection
    deletedAt?: boolean | number
    displayName?: boolean | number
    editableProfileFields?: boolean | number
    enabledAiModelIds?: boolean | number
    eventLogRetentionDays?: boolean | number
    fastModel?: boolean | number
    featureFlags?: FeatureFlagGenqlSelection
    hasValidEnterpriseKey?: boolean | number
    hasValidEnterpriseValidityToken?: boolean | number
    hasValidSignedEnterpriseKey?: boolean | number
    id?: boolean | number
    inviteHash?: boolean | number
    isCustomDomainEnabled?: boolean | number
    isGoogleAuthBypassEnabled?: boolean | number
    isGoogleAuthEnabled?: boolean | number
    isMicrosoftAuthBypassEnabled?: boolean | number
    isMicrosoftAuthEnabled?: boolean | number
    isPasswordAuthBypassEnabled?: boolean | number
    isPasswordAuthEnabled?: boolean | number
    isPublicInviteLinkEnabled?: boolean | number
    isTwoFactorAuthenticationEnforced?: boolean | number
    logo?: boolean | number
    logoFileId?: boolean | number
    metadataVersion?: boolean | number
    routerModel?: boolean | number
    smartModel?: boolean | number
    subdomain?: boolean | number
    trashRetentionDays?: boolean | number
    updatedAt?: boolean | number
    useRecommendedModels?: boolean | number
    version?: boolean | number
    viewFields?: ViewFieldGenqlSelection
    viewFilterGroups?: ViewFilterGroupGenqlSelection
    viewFilters?: ViewFilterGenqlSelection
    viewGroups?: ViewGroupGenqlSelection
    viewSorts?: ViewSortGenqlSelection
    views?: ViewGenqlSelection
    workspaceCustomApplication?: ApplicationGenqlSelection
    workspaceCustomApplicationId?: boolean | number
    workspaceMembersCount?: boolean | number
    workspaceUrls?: WorkspaceUrlsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceInfoGenqlSelection{
    allowImpersonation?: boolean | number
    featureFlags?: FeatureFlagGenqlSelection
    id?: boolean | number
    logo?: boolean | number
    name?: boolean | number
    totalUsers?: boolean | number
    users?: UserInfoGenqlSelection
    workspaceUrls?: WorkspaceUrlsGenqlSelection
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
    roles?: RoleGenqlSelection
    timeFormat?: boolean | number
    timeZone?: boolean | number
    userEmail?: boolean | number
    userWorkspaceId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceMigrationGenqlSelection{
    actions?: boolean | number
    applicationUniversalIdentifier?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface WorkspaceMigrationDeleteActionInput {metadataName: AllMetadataName,type: WorkspaceMigrationActionType,universalIdentifier: Scalars['String']}

export interface WorkspaceMigrationInput {actions: WorkspaceMigrationDeleteActionInput[]}

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


    const AISystemPromptPreview_possibleTypes: string[] = ['AISystemPromptPreview']
    export const isAISystemPromptPreview = (obj?: { __typename?: any } | null): obj is AISystemPromptPreview => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAISystemPromptPreview"')
      return AISystemPromptPreview_possibleTypes.includes(obj.__typename)
    }
    


    const AISystemPromptSection_possibleTypes: string[] = ['AISystemPromptSection']
    export const isAISystemPromptSection = (obj?: { __typename?: any } | null): obj is AISystemPromptSection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAISystemPromptSection"')
      return AISystemPromptSection_possibleTypes.includes(obj.__typename)
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
    


    const AdminPanelHealthServiceData_possibleTypes: string[] = ['AdminPanelHealthServiceData']
    export const isAdminPanelHealthServiceData = (obj?: { __typename?: any } | null): obj is AdminPanelHealthServiceData => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAdminPanelHealthServiceData"')
      return AdminPanelHealthServiceData_possibleTypes.includes(obj.__typename)
    }
    


    const AdminPanelWorkerQueueHealth_possibleTypes: string[] = ['AdminPanelWorkerQueueHealth']
    export const isAdminPanelWorkerQueueHealth = (obj?: { __typename?: any } | null): obj is AdminPanelWorkerQueueHealth => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAdminPanelWorkerQueueHealth"')
      return AdminPanelWorkerQueueHealth_possibleTypes.includes(obj.__typename)
    }
    


    const Agent_possibleTypes: string[] = ['Agent']
    export const isAgent = (obj?: { __typename?: any } | null): obj is Agent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgent"')
      return Agent_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatThread_possibleTypes: string[] = ['AgentChatThread']
    export const isAgentChatThread = (obj?: { __typename?: any } | null): obj is AgentChatThread => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatThread"')
      return AgentChatThread_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatThreadConnection_possibleTypes: string[] = ['AgentChatThreadConnection']
    export const isAgentChatThreadConnection = (obj?: { __typename?: any } | null): obj is AgentChatThreadConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatThreadConnection"')
      return AgentChatThreadConnection_possibleTypes.includes(obj.__typename)
    }
    


    const AgentChatThreadEdge_possibleTypes: string[] = ['AgentChatThreadEdge']
    export const isAgentChatThreadEdge = (obj?: { __typename?: any } | null): obj is AgentChatThreadEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentChatThreadEdge"')
      return AgentChatThreadEdge_possibleTypes.includes(obj.__typename)
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
    


    const AgentTurn_possibleTypes: string[] = ['AgentTurn']
    export const isAgentTurn = (obj?: { __typename?: any } | null): obj is AgentTurn => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentTurn"')
      return AgentTurn_possibleTypes.includes(obj.__typename)
    }
    


    const AgentTurnEvaluation_possibleTypes: string[] = ['AgentTurnEvaluation']
    export const isAgentTurnEvaluation = (obj?: { __typename?: any } | null): obj is AgentTurnEvaluation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAgentTurnEvaluation"')
      return AgentTurnEvaluation_possibleTypes.includes(obj.__typename)
    }
    


    const AggregateChartConfiguration_possibleTypes: string[] = ['AggregateChartConfiguration']
    export const isAggregateChartConfiguration = (obj?: { __typename?: any } | null): obj is AggregateChartConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAggregateChartConfiguration"')
      return AggregateChartConfiguration_possibleTypes.includes(obj.__typename)
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
    


    const AppToken_possibleTypes: string[] = ['AppToken']
    export const isAppToken = (obj?: { __typename?: any } | null): obj is AppToken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAppToken"')
      return AppToken_possibleTypes.includes(obj.__typename)
    }
    


    const Application_possibleTypes: string[] = ['Application']
    export const isApplication = (obj?: { __typename?: any } | null): obj is Application => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApplication"')
      return Application_possibleTypes.includes(obj.__typename)
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
    


    const CheckUserExist_possibleTypes: string[] = ['CheckUserExist']
    export const isCheckUserExist = (obj?: { __typename?: any } | null): obj is CheckUserExist => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCheckUserExist"')
      return CheckUserExist_possibleTypes.includes(obj.__typename)
    }
    


    const ClientAIModelConfig_possibleTypes: string[] = ['ClientAIModelConfig']
    export const isClientAIModelConfig = (obj?: { __typename?: any } | null): obj is ClientAIModelConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isClientAIModelConfig"')
      return ClientAIModelConfig_possibleTypes.includes(obj.__typename)
    }
    


    const ClientConfig_possibleTypes: string[] = ['ClientConfig']
    export const isClientConfig = (obj?: { __typename?: any } | null): obj is ClientConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isClientConfig"')
      return ClientConfig_possibleTypes.includes(obj.__typename)
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
    


    const ConfigVariable_possibleTypes: string[] = ['ConfigVariable']
    export const isConfigVariable = (obj?: { __typename?: any } | null): obj is ConfigVariable => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConfigVariable"')
      return ConfigVariable_possibleTypes.includes(obj.__typename)
    }
    


    const ConfigVariables_possibleTypes: string[] = ['ConfigVariables']
    export const isConfigVariables = (obj?: { __typename?: any } | null): obj is ConfigVariables => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConfigVariables"')
      return ConfigVariables_possibleTypes.includes(obj.__typename)
    }
    


    const ConfigVariablesGroupData_possibleTypes: string[] = ['ConfigVariablesGroupData']
    export const isConfigVariablesGroupData = (obj?: { __typename?: any } | null): obj is ConfigVariablesGroupData => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConfigVariablesGroupData"')
      return ConfigVariablesGroupData_possibleTypes.includes(obj.__typename)
    }
    


    const ConnectedAccountDTO_possibleTypes: string[] = ['ConnectedAccountDTO']
    export const isConnectedAccountDTO = (obj?: { __typename?: any } | null): obj is ConnectedAccountDTO => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConnectedAccountDTO"')
      return ConnectedAccountDTO_possibleTypes.includes(obj.__typename)
    }
    


    const ConnectedImapSmtpCaldavAccount_possibleTypes: string[] = ['ConnectedImapSmtpCaldavAccount']
    export const isConnectedImapSmtpCaldavAccount = (obj?: { __typename?: any } | null): obj is ConnectedImapSmtpCaldavAccount => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConnectedImapSmtpCaldavAccount"')
      return ConnectedImapSmtpCaldavAccount_possibleTypes.includes(obj.__typename)
    }
    


    const ConnectionParametersOutput_possibleTypes: string[] = ['ConnectionParametersOutput']
    export const isConnectionParametersOutput = (obj?: { __typename?: any } | null): obj is ConnectionParametersOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConnectionParametersOutput"')
      return ConnectionParametersOutput_possibleTypes.includes(obj.__typename)
    }
    


    const CreateApplicationRegistration_possibleTypes: string[] = ['CreateApplicationRegistration']
    export const isCreateApplicationRegistration = (obj?: { __typename?: any } | null): obj is CreateApplicationRegistration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCreateApplicationRegistration"')
      return CreateApplicationRegistration_possibleTypes.includes(obj.__typename)
    }
    


    const DeleteJobsResponse_possibleTypes: string[] = ['DeleteJobsResponse']
    export const isDeleteJobsResponse = (obj?: { __typename?: any } | null): obj is DeleteJobsResponse => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDeleteJobsResponse"')
      return DeleteJobsResponse_possibleTypes.includes(obj.__typename)
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
    


    const GaugeChartConfiguration_possibleTypes: string[] = ['GaugeChartConfiguration']
    export const isGaugeChartConfiguration = (obj?: { __typename?: any } | null): obj is GaugeChartConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isGaugeChartConfiguration"')
      return GaugeChartConfiguration_possibleTypes.includes(obj.__typename)
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
    


    const ImapSmtpCaldavConnectionParameters_possibleTypes: string[] = ['ImapSmtpCaldavConnectionParameters']
    export const isImapSmtpCaldavConnectionParameters = (obj?: { __typename?: any } | null): obj is ImapSmtpCaldavConnectionParameters => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isImapSmtpCaldavConnectionParameters"')
      return ImapSmtpCaldavConnectionParameters_possibleTypes.includes(obj.__typename)
    }
    


    const ImapSmtpCaldavConnectionSuccess_possibleTypes: string[] = ['ImapSmtpCaldavConnectionSuccess']
    export const isImapSmtpCaldavConnectionSuccess = (obj?: { __typename?: any } | null): obj is ImapSmtpCaldavConnectionSuccess => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isImapSmtpCaldavConnectionSuccess"')
      return ImapSmtpCaldavConnectionSuccess_possibleTypes.includes(obj.__typename)
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
    


    const IndexConnection_possibleTypes: string[] = ['IndexConnection']
    export const isIndexConnection = (obj?: { __typename?: any } | null): obj is IndexConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isIndexConnection"')
      return IndexConnection_possibleTypes.includes(obj.__typename)
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
    


    const IndexObjectMetadataConnection_possibleTypes: string[] = ['IndexObjectMetadataConnection']
    export const isIndexObjectMetadataConnection = (obj?: { __typename?: any } | null): obj is IndexObjectMetadataConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isIndexObjectMetadataConnection"')
      return IndexObjectMetadataConnection_possibleTypes.includes(obj.__typename)
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
    


    const JobOperationResult_possibleTypes: string[] = ['JobOperationResult']
    export const isJobOperationResult = (obj?: { __typename?: any } | null): obj is JobOperationResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isJobOperationResult"')
      return JobOperationResult_possibleTypes.includes(obj.__typename)
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
    


    const MarketplaceAppDefaultRole_possibleTypes: string[] = ['MarketplaceAppDefaultRole']
    export const isMarketplaceAppDefaultRole = (obj?: { __typename?: any } | null): obj is MarketplaceAppDefaultRole => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMarketplaceAppDefaultRole"')
      return MarketplaceAppDefaultRole_possibleTypes.includes(obj.__typename)
    }
    


    const MarketplaceAppField_possibleTypes: string[] = ['MarketplaceAppField']
    export const isMarketplaceAppField = (obj?: { __typename?: any } | null): obj is MarketplaceAppField => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMarketplaceAppField"')
      return MarketplaceAppField_possibleTypes.includes(obj.__typename)
    }
    


    const MarketplaceAppFrontComponent_possibleTypes: string[] = ['MarketplaceAppFrontComponent']
    export const isMarketplaceAppFrontComponent = (obj?: { __typename?: any } | null): obj is MarketplaceAppFrontComponent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMarketplaceAppFrontComponent"')
      return MarketplaceAppFrontComponent_possibleTypes.includes(obj.__typename)
    }
    


    const MarketplaceAppLogicFunction_possibleTypes: string[] = ['MarketplaceAppLogicFunction']
    export const isMarketplaceAppLogicFunction = (obj?: { __typename?: any } | null): obj is MarketplaceAppLogicFunction => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMarketplaceAppLogicFunction"')
      return MarketplaceAppLogicFunction_possibleTypes.includes(obj.__typename)
    }
    


    const MarketplaceAppObject_possibleTypes: string[] = ['MarketplaceAppObject']
    export const isMarketplaceAppObject = (obj?: { __typename?: any } | null): obj is MarketplaceAppObject => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMarketplaceAppObject"')
      return MarketplaceAppObject_possibleTypes.includes(obj.__typename)
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
    


    const MetadataEvent_possibleTypes: string[] = ['MetadataEvent']
    export const isMetadataEvent = (obj?: { __typename?: any } | null): obj is MetadataEvent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMetadataEvent"')
      return MetadataEvent_possibleTypes.includes(obj.__typename)
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
    


    const ObjectStandardOverrides_possibleTypes: string[] = ['ObjectStandardOverrides']
    export const isObjectStandardOverrides = (obj?: { __typename?: any } | null): obj is ObjectStandardOverrides => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isObjectStandardOverrides"')
      return ObjectStandardOverrides_possibleTypes.includes(obj.__typename)
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
    


    const PostgresCredentials_possibleTypes: string[] = ['PostgresCredentials']
    export const isPostgresCredentials = (obj?: { __typename?: any } | null): obj is PostgresCredentials => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPostgresCredentials"')
      return PostgresCredentials_possibleTypes.includes(obj.__typename)
    }
    


    const PublicApplicationRegistration_possibleTypes: string[] = ['PublicApplicationRegistration']
    export const isPublicApplicationRegistration = (obj?: { __typename?: any } | null): obj is PublicApplicationRegistration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicApplicationRegistration"')
      return PublicApplicationRegistration_possibleTypes.includes(obj.__typename)
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
    


    const PublicWorkspaceData_possibleTypes: string[] = ['PublicWorkspaceData']
    export const isPublicWorkspaceData = (obj?: { __typename?: any } | null): obj is PublicWorkspaceData => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicWorkspaceData"')
      return PublicWorkspaceData_possibleTypes.includes(obj.__typename)
    }
    


    const Query_possibleTypes: string[] = ['Query']
    export const isQuery = (obj?: { __typename?: any } | null): obj is Query => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuery"')
      return Query_possibleTypes.includes(obj.__typename)
    }
    


    const QueueJob_possibleTypes: string[] = ['QueueJob']
    export const isQueueJob = (obj?: { __typename?: any } | null): obj is QueueJob => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueueJob"')
      return QueueJob_possibleTypes.includes(obj.__typename)
    }
    


    const QueueJobsResponse_possibleTypes: string[] = ['QueueJobsResponse']
    export const isQueueJobsResponse = (obj?: { __typename?: any } | null): obj is QueueJobsResponse => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueueJobsResponse"')
      return QueueJobsResponse_possibleTypes.includes(obj.__typename)
    }
    


    const QueueMetricsData_possibleTypes: string[] = ['QueueMetricsData']
    export const isQueueMetricsData = (obj?: { __typename?: any } | null): obj is QueueMetricsData => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueueMetricsData"')
      return QueueMetricsData_possibleTypes.includes(obj.__typename)
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
    


    const QueueRetentionConfig_possibleTypes: string[] = ['QueueRetentionConfig']
    export const isQueueRetentionConfig = (obj?: { __typename?: any } | null): obj is QueueRetentionConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueueRetentionConfig"')
      return QueueRetentionConfig_possibleTypes.includes(obj.__typename)
    }
    


    const RatioAggregateConfig_possibleTypes: string[] = ['RatioAggregateConfig']
    export const isRatioAggregateConfig = (obj?: { __typename?: any } | null): obj is RatioAggregateConfig => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRatioAggregateConfig"')
      return RatioAggregateConfig_possibleTypes.includes(obj.__typename)
    }
    


    const RecordIdentifier_possibleTypes: string[] = ['RecordIdentifier']
    export const isRecordIdentifier = (obj?: { __typename?: any } | null): obj is RecordIdentifier => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRecordIdentifier"')
      return RecordIdentifier_possibleTypes.includes(obj.__typename)
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
    


    const RetryJobsResponse_possibleTypes: string[] = ['RetryJobsResponse']
    export const isRetryJobsResponse = (obj?: { __typename?: any } | null): obj is RetryJobsResponse => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRetryJobsResponse"')
      return RetryJobsResponse_possibleTypes.includes(obj.__typename)
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
    


    const SendInvitations_possibleTypes: string[] = ['SendInvitations']
    export const isSendInvitations = (obj?: { __typename?: any } | null): obj is SendInvitations => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSendInvitations"')
      return SendInvitations_possibleTypes.includes(obj.__typename)
    }
    


    const Sentry_possibleTypes: string[] = ['Sentry']
    export const isSentry = (obj?: { __typename?: any } | null): obj is Sentry => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSentry"')
      return Sentry_possibleTypes.includes(obj.__typename)
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
    


    const StandardOverrides_possibleTypes: string[] = ['StandardOverrides']
    export const isStandardOverrides = (obj?: { __typename?: any } | null): obj is StandardOverrides => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isStandardOverrides"')
      return StandardOverrides_possibleTypes.includes(obj.__typename)
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
    


    const SystemHealth_possibleTypes: string[] = ['SystemHealth']
    export const isSystemHealth = (obj?: { __typename?: any } | null): obj is SystemHealth => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSystemHealth"')
      return SystemHealth_possibleTypes.includes(obj.__typename)
    }
    


    const SystemHealthService_possibleTypes: string[] = ['SystemHealthService']
    export const isSystemHealthService = (obj?: { __typename?: any } | null): obj is SystemHealthService => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSystemHealthService"')
      return SystemHealthService_possibleTypes.includes(obj.__typename)
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
    


    const TwoFactorAuthenticationMethodSummary_possibleTypes: string[] = ['TwoFactorAuthenticationMethodSummary']
    export const isTwoFactorAuthenticationMethodSummary = (obj?: { __typename?: any } | null): obj is TwoFactorAuthenticationMethodSummary => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTwoFactorAuthenticationMethodSummary"')
      return TwoFactorAuthenticationMethodSummary_possibleTypes.includes(obj.__typename)
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
    


    const UserInfo_possibleTypes: string[] = ['UserInfo']
    export const isUserInfo = (obj?: { __typename?: any } | null): obj is UserInfo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUserInfo"')
      return UserInfo_possibleTypes.includes(obj.__typename)
    }
    


    const UserLookup_possibleTypes: string[] = ['UserLookup']
    export const isUserLookup = (obj?: { __typename?: any } | null): obj is UserLookup => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUserLookup"')
      return UserLookup_possibleTypes.includes(obj.__typename)
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
    


    const VersionInfo_possibleTypes: string[] = ['VersionInfo']
    export const isVersionInfo = (obj?: { __typename?: any } | null): obj is VersionInfo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isVersionInfo"')
      return VersionInfo_possibleTypes.includes(obj.__typename)
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
    


    const WidgetConfiguration_possibleTypes: string[] = ['AggregateChartConfiguration','BarChartConfiguration','CalendarConfiguration','EmailsConfiguration','FieldConfiguration','FieldRichTextConfiguration','FieldsConfiguration','FilesConfiguration','FrontComponentConfiguration','GaugeChartConfiguration','IframeConfiguration','LineChartConfiguration','NotesConfiguration','PieChartConfiguration','StandaloneRichTextConfiguration','TasksConfiguration','TimelineConfiguration','ViewConfiguration','WorkflowConfiguration','WorkflowRunConfiguration','WorkflowVersionConfiguration']
    export const isWidgetConfiguration = (obj?: { __typename?: any } | null): obj is WidgetConfiguration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWidgetConfiguration"')
      return WidgetConfiguration_possibleTypes.includes(obj.__typename)
    }
    


    const WorkerQueueMetrics_possibleTypes: string[] = ['WorkerQueueMetrics']
    export const isWorkerQueueMetrics = (obj?: { __typename?: any } | null): obj is WorkerQueueMetrics => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkerQueueMetrics"')
      return WorkerQueueMetrics_possibleTypes.includes(obj.__typename)
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
    


    const WorkspaceInfo_possibleTypes: string[] = ['WorkspaceInfo']
    export const isWorkspaceInfo = (obj?: { __typename?: any } | null): obj is WorkspaceInfo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceInfo"')
      return WorkspaceInfo_possibleTypes.includes(obj.__typename)
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
    

export const enumAdminPanelHealthServiceStatus = {
   OPERATIONAL: 'OPERATIONAL' as const,
   OUTAGE: 'OUTAGE' as const
}

export const enumAgentChatThreadSortFields = {
   id: 'id' as const,
   updatedAt: 'updatedAt' as const
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

export const enumAiModelRole = {
   FAST: 'FAST' as const,
   SMART: 'SMART' as const
}

export const enumAllMetadataName = {
   agent: 'agent' as const,
   commandMenuItem: 'commandMenuItem' as const,
   fieldMetadata: 'fieldMetadata' as const,
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
   roleTarget: 'roleTarget' as const,
   rowLevelPermissionPredicate: 'rowLevelPermissionPredicate' as const,
   rowLevelPermissionPredicateGroup: 'rowLevelPermissionPredicateGroup' as const,
   skill: 'skill' as const,
   view: 'view' as const,
   viewField: 'viewField' as const,
   viewFieldGroup: 'viewFieldGroup' as const,
   viewFilter: 'viewFilter' as const,
   viewFilterGroup: 'viewFilterGroup' as const,
   viewGroup: 'viewGroup' as const,
   viewSort: 'viewSort' as const,
   webhook: 'webhook' as const
}

export const enumAnalyticsType = {
   PAGEVIEW: 'PAGEVIEW' as const,
   TRACK: 'TRACK' as const
}

export const enumApplicationRegistrationSourceType = {
   LOCAL: 'LOCAL' as const,
   NPM: 'NPM' as const,
   OAUTH_ONLY: 'OAUTH_ONLY' as const,
   TARBALL: 'TARBALL' as const
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
   RLS: 'RLS' as const,
   SSO: 'SSO' as const
}

export const enumBillingPlanKey = {
   ENTERPRISE: 'ENTERPRISE' as const,
   PRO: 'PRO' as const
}

export const enumBillingProductKey = {
   BASE_PRODUCT: 'BASE_PRODUCT' as const,
   WORKFLOW_NODE_EXECUTION: 'WORKFLOW_NODE_EXECUTION' as const
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

export const enumCommandMenuItemAvailabilityType = {
   FALLBACK: 'FALLBACK' as const,
   GLOBAL: 'GLOBAL' as const,
   RECORD_SELECTION: 'RECORD_SELECTION' as const
}

export const enumConfigSource = {
   DATABASE: 'DATABASE' as const,
   DEFAULT: 'DEFAULT' as const,
   ENVIRONMENT: 'ENVIRONMENT' as const
}

export const enumConfigVariableType = {
   ARRAY: 'ARRAY' as const,
   BOOLEAN: 'BOOLEAN' as const,
   ENUM: 'ENUM' as const,
   JSON: 'JSON' as const,
   NUMBER: 'NUMBER' as const,
   STRING: 'STRING' as const
}

export const enumConfigVariablesGroup = {
   ADVANCED_SETTINGS: 'ADVANCED_SETTINGS' as const,
   ANALYTICS_CONFIG: 'ANALYTICS_CONFIG' as const,
   AWS_SES_SETTINGS: 'AWS_SES_SETTINGS' as const,
   BILLING_CONFIG: 'BILLING_CONFIG' as const,
   CAPTCHA_CONFIG: 'CAPTCHA_CONFIG' as const,
   CLOUDFLARE_CONFIG: 'CLOUDFLARE_CONFIG' as const,
   CODE_INTERPRETER_CONFIG: 'CODE_INTERPRETER_CONFIG' as const,
   EMAIL_SETTINGS: 'EMAIL_SETTINGS' as const,
   GOOGLE_AUTH: 'GOOGLE_AUTH' as const,
   LLM: 'LLM' as const,
   LOGGING: 'LOGGING' as const,
   LOGIC_FUNCTION_CONFIG: 'LOGIC_FUNCTION_CONFIG' as const,
   MICROSOFT_AUTH: 'MICROSOFT_AUTH' as const,
   RATE_LIMITING: 'RATE_LIMITING' as const,
   SERVER_CONFIG: 'SERVER_CONFIG' as const,
   SSL: 'SSL' as const,
   STORAGE_CONFIG: 'STORAGE_CONFIG' as const,
   SUPPORT_CHAT_CONFIG: 'SUPPORT_CHAT_CONFIG' as const,
   TOKENS_DURATION: 'TOKENS_DURATION' as const
}

export const enumDatabaseEventAction = {
   CREATED: 'CREATED' as const,
   DELETED: 'DELETED' as const,
   DESTROYED: 'DESTROYED' as const,
   RESTORED: 'RESTORED' as const,
   UPDATED: 'UPDATED' as const,
   UPSERTED: 'UPSERTED' as const
}

export const enumEmailingDomainDriver = {
   AWS_SES: 'AWS_SES' as const
}

export const enumEmailingDomainStatus = {
   FAILED: 'FAILED' as const,
   PENDING: 'PENDING' as const,
   TEMPORARY_FAILURE: 'TEMPORARY_FAILURE' as const,
   VERIFIED: 'VERIFIED' as const
}

export const enumEngineComponentKey = {
   ACTIVATE_WORKFLOW: 'ACTIVATE_WORKFLOW' as const,
   ADD_NODE_WORKFLOW: 'ADD_NODE_WORKFLOW' as const,
   ADD_TO_FAVORITES: 'ADD_TO_FAVORITES' as const,
   ASK_AI: 'ASK_AI' as const,
   CANCEL_DASHBOARD_LAYOUT: 'CANCEL_DASHBOARD_LAYOUT' as const,
   CREATE_NEW_RECORD: 'CREATE_NEW_RECORD' as const,
   CREATE_NEW_VIEW: 'CREATE_NEW_VIEW' as const,
   DEACTIVATE_WORKFLOW: 'DEACTIVATE_WORKFLOW' as const,
   DELETE_MULTIPLE_RECORDS: 'DELETE_MULTIPLE_RECORDS' as const,
   DELETE_SINGLE_RECORD: 'DELETE_SINGLE_RECORD' as const,
   DESTROY_MULTIPLE_RECORDS: 'DESTROY_MULTIPLE_RECORDS' as const,
   DESTROY_SINGLE_RECORD: 'DESTROY_SINGLE_RECORD' as const,
   DISCARD_DRAFT_WORKFLOW: 'DISCARD_DRAFT_WORKFLOW' as const,
   DUPLICATE_DASHBOARD: 'DUPLICATE_DASHBOARD' as const,
   DUPLICATE_WORKFLOW: 'DUPLICATE_WORKFLOW' as const,
   EDIT_DASHBOARD_LAYOUT: 'EDIT_DASHBOARD_LAYOUT' as const,
   EDIT_RECORD_PAGE_LAYOUT: 'EDIT_RECORD_PAGE_LAYOUT' as const,
   EXPORT_FROM_RECORD_INDEX: 'EXPORT_FROM_RECORD_INDEX' as const,
   EXPORT_FROM_RECORD_SHOW: 'EXPORT_FROM_RECORD_SHOW' as const,
   EXPORT_MULTIPLE_RECORDS: 'EXPORT_MULTIPLE_RECORDS' as const,
   EXPORT_NOTE_TO_PDF: 'EXPORT_NOTE_TO_PDF' as const,
   EXPORT_VIEW: 'EXPORT_VIEW' as const,
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
   MERGE_MULTIPLE_RECORDS: 'MERGE_MULTIPLE_RECORDS' as const,
   NAVIGATE_TO_NEXT_RECORD: 'NAVIGATE_TO_NEXT_RECORD' as const,
   NAVIGATE_TO_PREVIOUS_RECORD: 'NAVIGATE_TO_PREVIOUS_RECORD' as const,
   REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES' as const,
   RESTORE_MULTIPLE_RECORDS: 'RESTORE_MULTIPLE_RECORDS' as const,
   RESTORE_SINGLE_RECORD: 'RESTORE_SINGLE_RECORD' as const,
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
   STOP_WORKFLOW_RUN: 'STOP_WORKFLOW_RUN' as const,
   TEST_WORKFLOW: 'TEST_WORKFLOW' as const,
   TIDY_UP_WORKFLOW: 'TIDY_UP_WORKFLOW' as const,
   UPDATE_MULTIPLE_RECORDS: 'UPDATE_MULTIPLE_RECORDS' as const,
   USE_AS_DRAFT_WORKFLOW_VERSION: 'USE_AS_DRAFT_WORKFLOW_VERSION' as const,
   VIEW_PREVIOUS_AI_CHATS: 'VIEW_PREVIOUS_AI_CHATS' as const
}

export const enumEventLogTable = {
   OBJECT_EVENT: 'OBJECT_EVENT' as const,
   PAGEVIEW: 'PAGEVIEW' as const,
   USAGE_EVENT: 'USAGE_EVENT' as const,
   WORKSPACE_EVENT: 'WORKSPACE_EVENT' as const
}

export const enumFeatureFlagKey = {
   IS_AI_ENABLED: 'IS_AI_ENABLED' as const,
   IS_APPLICATION_ENABLED: 'IS_APPLICATION_ENABLED' as const,
   IS_ATTACHMENT_MIGRATED: 'IS_ATTACHMENT_MIGRATED' as const,
   IS_COMMAND_MENU_ITEM_ENABLED: 'IS_COMMAND_MENU_ITEM_ENABLED' as const,
   IS_CONNECTED_ACCOUNT_MIGRATED: 'IS_CONNECTED_ACCOUNT_MIGRATED' as const,
   IS_DASHBOARD_V2_ENABLED: 'IS_DASHBOARD_V2_ENABLED' as const,
   IS_DATE_TIME_WHOLE_DAY_FILTER_ENABLED: 'IS_DATE_TIME_WHOLE_DAY_FILTER_ENABLED' as const,
   IS_DIRECT_GRAPHQL_EXECUTION_ENABLED: 'IS_DIRECT_GRAPHQL_EXECUTION_ENABLED' as const,
   IS_DRAFT_EMAIL_ENABLED: 'IS_DRAFT_EMAIL_ENABLED' as const,
   IS_EMAILING_DOMAIN_ENABLED: 'IS_EMAILING_DOMAIN_ENABLED' as const,
   IS_JSON_FILTER_ENABLED: 'IS_JSON_FILTER_ENABLED' as const,
   IS_JUNCTION_RELATIONS_ENABLED: 'IS_JUNCTION_RELATIONS_ENABLED' as const,
   IS_MARKETPLACE_ENABLED: 'IS_MARKETPLACE_ENABLED' as const,
   IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED: 'IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED' as const,
   IS_NAVIGATION_MENU_ITEM_ENABLED: 'IS_NAVIGATION_MENU_ITEM_ENABLED' as const,
   IS_NOTE_TARGET_MIGRATED: 'IS_NOTE_TARGET_MIGRATED' as const,
   IS_PUBLIC_DOMAIN_ENABLED: 'IS_PUBLIC_DOMAIN_ENABLED' as const,
   IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED: 'IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED' as const,
   IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED: 'IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED' as const,
   IS_RICH_TEXT_V1_MIGRATED: 'IS_RICH_TEXT_V1_MIGRATED' as const,
   IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED: 'IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED' as const,
   IS_TASK_TARGET_MIGRATED: 'IS_TASK_TARGET_MIGRATED' as const,
   IS_UNIQUE_INDEXES_ENABLED: 'IS_UNIQUE_INDEXES_ENABLED' as const,
   IS_USAGE_ANALYTICS_ENABLED: 'IS_USAGE_ANALYTICS_ENABLED' as const
}

export const enumFieldDisplayMode = {
   CARD: 'CARD' as const,
   FIELD: 'FIELD' as const,
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
   Attachment: 'Attachment' as const,
   BuiltFrontComponent: 'BuiltFrontComponent' as const,
   BuiltLogicFunction: 'BuiltLogicFunction' as const,
   CorePicture: 'CorePicture' as const,
   Dependencies: 'Dependencies' as const,
   File: 'File' as const,
   FilesField: 'FilesField' as const,
   PersonPicture: 'PersonPicture' as const,
   ProfilePicture: 'ProfilePicture' as const,
   PublicAsset: 'PublicAsset' as const,
   Source: 'Source' as const,
   Workflow: 'Workflow' as const,
   WorkspaceLogo: 'WorkspaceLogo' as const
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

export const enumHealthIndicatorId = {
   app: 'app' as const,
   connectedAccount: 'connectedAccount' as const,
   database: 'database' as const,
   redis: 'redis' as const,
   worker: 'worker' as const
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
   EMAIL: 'EMAIL' as const,
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
   NONE: 'NONE' as const
}

export const enumMetadataEventAction = {
   CREATED: 'CREATED' as const,
   DELETED: 'DELETED' as const,
   UPDATED: 'UPDATED' as const
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
   RECORD: 'RECORD' as const,
   VIEW: 'VIEW' as const
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

export const enumOnboardingStatus = {
   BOOK_ONBOARDING: 'BOOK_ONBOARDING' as const,
   COMPLETED: 'COMPLETED' as const,
   INVITE_TEAM: 'INVITE_TEAM' as const,
   PLAN_REQUIRED: 'PLAN_REQUIRED' as const,
   PROFILE_CREATION: 'PROFILE_CREATION' as const,
   SYNC_EMAIL: 'SYNC_EMAIL' as const,
   WORKSPACE_ACTIVATION: 'WORKSPACE_ACTIVATION' as const
}

export const enumPageLayoutTabLayoutMode = {
   CANVAS: 'CANVAS' as const,
   GRID: 'GRID' as const,
   VERTICAL_LIST: 'VERTICAL_LIST' as const
}

export const enumPageLayoutType = {
   DASHBOARD: 'DASHBOARD' as const,
   RECORD_INDEX: 'RECORD_INDEX' as const,
   RECORD_PAGE: 'RECORD_PAGE' as const
}

export const enumPermissionFlagType = {
   AI: 'AI' as const,
   AI_SETTINGS: 'AI_SETTINGS' as const,
   API_KEYS_AND_WEBHOOKS: 'API_KEYS_AND_WEBHOOKS' as const,
   APPLICATIONS: 'APPLICATIONS' as const,
   BILLING: 'BILLING' as const,
   CODE_INTERPRETER_TOOL: 'CODE_INTERPRETER_TOOL' as const,
   CONNECTED_ACCOUNTS: 'CONNECTED_ACCOUNTS' as const,
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

export const enumQueueMetricsTimeRange = {
   FourHours: 'FourHours' as const,
   OneDay: 'OneDay' as const,
   OneHour: 'OneHour' as const,
   SevenDays: 'SevenDays' as const,
   TwelveHours: 'TwelveHours' as const
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

export const enumSsoIdentityProviderStatus = {
   Active: 'Active' as const,
   Error: 'Error' as const,
   Inactive: 'Inactive' as const
}

export const enumSortDirection = {
   ASC: 'ASC' as const,
   DESC: 'DESC' as const
}

export const enumSortNulls = {
   NULLS_FIRST: 'NULLS_FIRST' as const,
   NULLS_LAST: 'NULLS_LAST' as const
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
   FIELDS_WIDGET: 'FIELDS_WIDGET' as const,
   KANBAN: 'KANBAN' as const,
   TABLE: 'TABLE' as const
}

export const enumViewVisibility = {
   UNLISTED: 'UNLISTED' as const,
   WORKSPACE: 'WORKSPACE' as const
}

export const enumWidgetConfigurationType = {
   AGGREGATE_CHART: 'AGGREGATE_CHART' as const,
   BAR_CHART: 'BAR_CHART' as const,
   CALENDAR: 'CALENDAR' as const,
   EMAILS: 'EMAILS' as const,
   FIELD: 'FIELD' as const,
   FIELDS: 'FIELDS' as const,
   FIELD_RICH_TEXT: 'FIELD_RICH_TEXT' as const,
   FILES: 'FILES' as const,
   FRONT_COMPONENT: 'FRONT_COMPONENT' as const,
   GAUGE_CHART: 'GAUGE_CHART' as const,
   IFRAME: 'IFRAME' as const,
   LINE_CHART: 'LINE_CHART' as const,
   NOTES: 'NOTES' as const,
   PIE_CHART: 'PIE_CHART' as const,
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
   EMAILS: 'EMAILS' as const,
   FIELD: 'FIELD' as const,
   FIELDS: 'FIELDS' as const,
   FIELD_RICH_TEXT: 'FIELD_RICH_TEXT' as const,
   FILES: 'FILES' as const,
   FRONT_COMPONENT: 'FRONT_COMPONENT' as const,
   GRAPH: 'GRAPH' as const,
   IFRAME: 'IFRAME' as const,
   NOTES: 'NOTES' as const,
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
   INACTIVE: 'INACTIVE' as const,
   ONGOING_CREATION: 'ONGOING_CREATION' as const,
   PENDING_CREATION: 'PENDING_CREATION' as const,
   SUSPENDED: 'SUSPENDED' as const
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

export const enumWorkspaceMigrationActionType = {
   create: 'create' as const,
   delete: 'delete' as const,
   update: 'update' as const
}
