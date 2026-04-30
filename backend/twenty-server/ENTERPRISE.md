# CCG Central -- Enterprise CRM Platform

## Overview

CCG Central is a comprehensive enterprise CRM platform built as a fork of [Twenty CRM](https://twenty.com). It extends the open-source core with 42+ enterprise modules targeting multi-tenant SaaS deployments for Latin American markets.

### Platform Statistics

| Metric | Count |
|--------|-------|
| Total resolver files | 95+ |
| Total controller files | 49 |
| Service files (core-modules) | 100+ |
| Entity files (core-modules) | 92 |
| Feature flag keys | 59 |
| Frontend settings pages (modules) | 20 |
| Enterprise modules (backend) | 42+ |
| Supported LATAM countries | 7 (CO, MX, DO, CL, PE, AR, BR) |

### Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL 16, Redis 7, GraphQL (code-first)
- **Frontend**: React 18, TypeScript, Jotai, Linaria, Vite, Lingui
- **Monorepo**: Nx workspace, Yarn 4
- **VoIP**: Asterisk PBX (SIP, ARI, AMI)
- **AI**: Multi-provider LLM client (OpenAI, Anthropic, Google)
- **Infrastructure**: Docker Compose, Nginx API Gateway
- **Queue**: BullMQ for background job processing

---

## Architecture

### Design Principles

1. **Zero cross-module dependencies** -- every enterprise module is self-contained and extractable to a microservice without refactoring.
2. **workspaceId on every entity** -- all data is tenant-scoped, prepared for PostgreSQL Row Level Security (RLS).
3. **Feature flags for module activation** -- each module has a corresponding `FeatureFlagKey` entry. Modules are activated/deactivated per workspace via `SaaSPlatformService`.
4. **Event bus bridge** -- cross-module communication happens through `SaaSPlatformService.emitEvent()`, which writes to the `saas_event_log` table and routes events to target modules asynchronously.
5. **Monolith-ready for microservice extraction** -- the modular NestJS architecture means any module directory can be extracted into its own service with minimal changes.

### Module Registration

All enterprise modules are registered in `core-engine.module.ts`. Each module follows this structure:

```
engine/core-modules/<module-name>/
  <module-name>.module.ts       # NestJS module definition
  <module-name>.entity.ts       # TypeORM entities
  <module-name>.service.ts      # Business logic
  <module-name>.resolver.ts     # GraphQL queries and mutations
  <module-name>.controller.ts   # REST endpoints (optional)
```

### Multi-Tenancy

Every entity includes a `workspaceId` column indexed for fast lookups. The `SaaSPlatformService` enforces:

- Tenant status checks (trial, active, past_due, suspended, cancelled)
- Module activation checks before allowing access
- Usage tracking and limit enforcement
- Plan-based module entitlements

### Event Routing

The event bus routes events based on type:

```
deal.closed     -> accounts_receivable, inventory, accounting, project, fleet
invoice.paid    -> accounting, fintech
invoice.overdue -> accounts_receivable
ticket.created  -> support_ticket, knowledge_base
employee.hired  -> hrm, lms, it_assets
order.created   -> inventory, fleet, ecommerce
contract.expiring -> clm, accounts_receivable
call.completed  -> asterisk
```

Events have retry logic (max 3 retries) and status tracking (pending/processed/failed).

---

## Module Catalog

### 1. Sales Execution

**Directory**: `engine/core-modules/sales-execution/`
**Feature Flag**: Part of core enterprise
**Entities**: `TerritoryEntity` (`territory.entity.ts`), `DealOperationsEntity` (`deal-operations.entity.ts`)

**Resolver Queries**:
- `territories` -> `[TerritoryDTO]` -- List all territories
- `territorySummary` -> `TerritorySummaryDTO` -- Aggregate territory metrics
- `getQuota` -> `QuotaDTO` -- Get quota for a user/period
- `quotaOverview` -> `QuotaOverviewDTO` -- Team-level quota attainment
- `blueprints` -> `[BlueprintDTO]` -- List deal blueprints
- `blueprintSummary` -> `BlueprintSummaryDTO` -- Blueprint compliance stats
- `validateDealStage` -> `ValidationResultDTO` -- Validate deal progression

**Resolver Mutations**:
- `createTerritory` -> `TerritoryDTO`
- `updateTerritory` -> `TerritoryDTO`
- `assignAccountToTerritory` -> `TerritoryDTO`
- `createQuota` -> `QuotaDTO`
- `updateQuotaProgress` -> `QuotaDTO`
- `createBlueprint` -> `BlueprintDTO`
- `markStepComplete` -> `Boolean`

---

### 2. Customer Success

**Directory**: `engine/core-modules/customer-success/`
**Feature Flag**: Part of core enterprise
**Entities**: `HealthScoreEntity` (`health-score.entity.ts`), `CustomerSuccessProgramsEntity` (`customer-success-programs.entity.ts`)

**Resolver Queries**:
- `getHealthScore` -> `HealthDTO` -- Customer health score (nullable)
- `getPlaybooks` -> `[PlaybookDTO]` -- List CS playbooks
- `getQBRs` -> `[QBRDTO]` -- List Quarterly Business Reviews
- `getExpansionRevenueSummary` -> `ExpansionRevenueSummaryDTO`
- `getCustomerSuccessSummary` -> `CustomerSuccessSummaryDTO`

**Resolver Mutations**:
- `calculateHealthScore` -> `HealthDTO`
- `createNPSSurvey` -> `NPSSurveyDTO`
- `submitNPSResponse` -> `NPSSurveyDTO`
- `createPlaybook` -> `PlaybookDTO`
- `executePlaybook` -> `PlaybookDTO`
- `createQBR` -> `QBRDTO`
- `completeQBR` -> `QBRDTO`
- `trackExpansionRevenue` -> `ExpansionRevenueDTO`

---

### 3. CPQ (Configure, Price, Quote)

**Directory**: `engine/core-modules/cpq/`
**Feature Flag**: Part of core enterprise
**Entities**: `PriceBookEntity` (`price-book.entity.ts`)

**Resolver Queries**:
- `getQuoteLineItems` -> `[QuoteLineItemDTO]`

**Resolver Mutations**:
- `createPriceBook` -> `PriceBookDTO`
- `addProductPricing` -> `ProductPricingDTO`
- `createQuote` -> `QuoteDTO`
- `addQuoteLineItem` -> `QuoteLineItemDTO`
- `submitForApproval` -> `QuoteDTO`
- `approveQuote` -> `QuoteDTO`
- `generatePDF` -> `Boolean`

---

### 4. ABM (Account-Based Marketing)

**Directory**: `engine/core-modules/abm/`
**Feature Flag**: Part of core enterprise
**Entities**: `TargetAccountEntity` (`target-account.entity.ts`)

**Resolver Queries**:
- `getTargetAccounts` -> `[TargetAccountDTO]`
- `getTargetAccountSummary` -> `TargetAccountSummaryDTO`
- `getEngagementCount` -> `Int`
- `getABMCampaigns` -> `[ABMCampaignDTO]`

**Resolver Mutations**:
- `addTargetAccount` -> `TargetAccountDTO`
- `updateTargetAccountTier` -> `TargetAccountDTO`
- `updateTargetAccountStatus` -> `TargetAccountDTO`
- `setAccountOwner` -> `TargetAccountDTO`
- `logEngagement` -> `TargetAccountDTO`
- `createABMCampaign` -> `ABMCampaignDTO`
- `removeTargetAccount` -> `Boolean`

---

### 5. Omnichannel Communications

**Directory**: `engine/core-modules/omnicanal/`
**Feature Flag**: Part of core enterprise
**Entities**: `SMSEntity` (`sms.entity.ts`), `SequenceEntity` (`sequence.entity.ts`), `SequenceEnrollmentEntity` (`sequence-enrollment.entity.ts`), `WhatsAppEntity` (`whatsapp.entity.ts`), `UnifiedInboxEntity` (`unified-inbox.entity.ts`)

**REST Controller**: `omnicanal.controller.ts`

**Resolver Queries**:
- `getConversations` -> `[ConversationDTO]`
- `getMessages` -> `[MessageDTO]`
- `getInboxMetrics` -> `InboxMetricsDTO`
- `getChatWidgetConfig` -> `ChatWidgetDTO`
- `getSocialSignals` -> `[SocialSignalDTO]`
- `getSequenceMessages` -> `[MessageDTO]`

**Resolver Mutations**:
- `sendMessage` -> `MessageDTO`
- `sendWhatsAppMessage` -> `MessageDTO`
- `createConversation` -> `ConversationDTO`
- `assignConversation` -> `ConversationDTO`
- `closeConversation` -> `ConversationDTO`
- `markAsRead` -> `Boolean`
- `saveChatWidgetConfig` -> `ChatWidgetDTO`
- `embedChatWidget` -> `Boolean`
- `bookMeetingFromChat` -> `BookMeetingResultDTO`

---

### 6. AI/ML Engine

**Directory**: `engine/core-modules/ai-ml/`
**Feature Flag**: `IS_AI_ENABLED`
**Entities**: `PredictiveLeadScoringEntity`, `SentimentAnalysisEntity`, `NLPQueryEntity`, `NextBestActionEntity`, `ICPFitEntity`, `AIEmailWriterEntity`, `AutoEnrichmentEntity`, `DealLossIntelligenceEntity`, `MeetingBriefingEntity`

**Resolver Queries**:
- `getLeadScoreModels` -> `[LeadScoreModelDTO]`
- `getLeadScoreModel` -> `LeadScoreModelDTO`
- `getLeadPrediction` -> `LeadPredictionDTO`
- `getLeadPredictions` -> `[LeadPredictionDTO]`
- `getICPCriteria` -> `[ICPCriteriaDTO]`
- `getEnrichmentConfig` -> `EnrichmentConfigDTO`

**Resolver Mutations**:
- `createLeadScoreModel` -> `LeadScoreModelDTO`
- `updateLeadScoreModel` -> `LeadScoreModelDTO`
- `trainLeadScoreModel` -> `LeadScoreModelDTO`
- `activateLeadScoreModel` -> `LeadScoreModelDTO`
- `scoreAllLeads` -> `Boolean`
- `batchScoreLeads` -> `Boolean`
- `analyzeSentiment` -> `SentimentResultDTO`
- `generateMeetingBriefing` -> `MeetingBriefingDTO`
- `setICPCriteria` -> `ICPCriteriaDTO`
- `analyzeDealHealth` -> `DealHealthDTO`

---

### 7. BI & Analytics

**Directory**: `engine/core-modules/bi-analytics/`
**Feature Flag**: Part of core enterprise
**Entities**: `DashboardWidgetsEntity` (`dashboard-widgets.entity.ts`)

**Resolver Queries**:
- `getWidgets` -> `[WidgetDTO]`
- `getReports` -> `[ReportDTO]`
- `executeReport` -> `[ReportResultDTO]`
- `getKPIData` -> `KPIDataDTO`
- `getTimeSeries` -> `[TimeSeriesPointDTO]`
- `getTopPerformers` -> `[TopPerformerDTO]`

**Resolver Mutations**:
- `createWidget` -> `WidgetDTO`
- `deleteWidget` -> `Boolean`
- `createReport` -> `ReportDTO`

---

### 8. AI Agents

**Directory**: `engine/core-modules/ai-agents/`
**Feature Flag**: Part of core enterprise
**Entities**: `SdrAgentEntity`, `CsmAgentEntity`, `DealQualificationAgentEntity`, `MeetingNotesAgentEntity`, `DataHygieneAgentEntity`, `ProspectingResearchAgentEntity`, `CompetitiveIntelligenceAgentEntity`, `ContractIntelligenceAgentEntity`

**Resolver Queries**:
- `getSdrAgents` -> `[SdrAgentDTO]`
- `getDataHygieneAgents` -> `[DataHygieneAgentDTO]`

**Resolver Mutations**:
- `createSdrAgent` -> `SdrAgentDTO`
- `updateSdrAgent` -> `SdrAgentDTO`
- `runSdrAgent` -> `SdrAgentDTO`
- `runRetentionPlaybook` -> `RetentionActionDTO`
- `qualifyDeal` -> `DealQualificationDTO`
- `generateBattleCard` -> `BattleCardDTO`

---

### 9. Accounts Receivable

**Directory**: `engine/core-modules/accounts-receivable/`
**Feature Flag**: `IS_MODULE_ACCOUNTS_RECEIVABLE_ENABLED`
**Entities**: `AccountsReceivableEntity` (`accounts-receivable.entity.ts`), `CustomerPortalEntity` (`customer-portal.entity.ts`)

**REST Controller**: `accounts-receivable.controller.ts`

**Resolver Queries**:
- `getARMetrics` -> `ARMetricsDTO`
- `getCashForecast` -> `[CashForecastDTO]`

**Resolver Mutations**:
- `createInvoice` -> `InvoiceDTO`
- `markInvoicePaid` -> `InvoiceDTO`
- `sendPaymentReminder` -> `Boolean`
- `escalateToCollections` -> `Boolean`
- `runDunningCycle` -> `Int`
- `applyPayment` -> `Int`

---

### 10. IT Asset Management

**Directory**: `engine/core-modules/it-asset-management/`
**Feature Flag**: `IS_MODULE_IT_ASSETS_ENABLED`
**Entities**: `ITAssetEntity` (`it-asset.entity.ts`)

**Resolver Queries**:
- `calculateDepreciation` -> `Float`
- `getAssetsExpiringSoon` -> `[ITAssetDTO]`
- `getLicenseUtilization` -> `[LicenseUtilizationDTO]`
- `getSaaSSpend` -> `SaaSSpendDTO`

**Resolver Mutations**:
- `registerAsset` -> `ITAssetDTO`
- `updateAssetStatus` -> `ITAssetDTO`
- `createChangeRequest` -> `ChangeRequestDTO`

---

### 11. Trade & Import

**Directory**: `engine/core-modules/trade-import/`
**Feature Flag**: `IS_MODULE_TRADE_IMPORT_ENABLED`
**Entities**: `TradeImportEntity` (`trade-import.entity.ts`)

**Resolver Queries**:
- `getTradeAnalytics` -> `TradeAnalyticsDTO`
- `getCarbonFootprint` -> `CarbonFootprintDTO`

**Resolver Mutations**:
- `createPurchaseOrder` -> `PurchaseOrderDTO`
- `createShipment` -> `ShipmentDTO`
- `calculateLandedCost` -> `LandedCostDTO`
- `runOCRExtraction` -> `[OCRResultDTO]`

---

### 12. Accounting Integration

**Directory**: `engine/core-modules/accounting-integration/`
**Feature Flag**: `IS_MODULE_ACCOUNTING_ENABLED`
**Entities**: `AccountingIntegrationEntity` (`accounting-integration.entity.ts`)

**Resolver Queries**:
- `calculateTax` -> `TaxCalculationDTO`
- `getPLByClient` -> `[PLByClientDTO]`

**Resolver Mutations**:
- `connectAccountingSystem` -> `AccountingConnectionDTO`
- `createRevenueSchedule` -> `RevenueScheduleDTO`
- `calculateCommission` -> `CommissionDTO`

---

### 13. FinTech Layer

**Directory**: `engine/core-modules/fintech/`
**Feature Flag**: `IS_MODULE_FINTECH_ENABLED`
**Entities**: `FintechEntity` (`fintech.entity.ts`)
**REST Controller**: `fintech.controller.ts`

**Resolver Mutations**:
- `createPaymentLink` -> `PaymentLinkDTO`
- `emitElectronicInvoice` -> `ElectronicInvoiceDTO`
- `registerPartnerChannel` -> `PartnerChannelDTO`
- `reconcilePayments` -> `ReconciliationDTO`

**Dependencies**: Requires `accounts_receivable` module

---

### 14. HRM & Payroll

**Directory**: `engine/core-modules/hrm/`
**Feature Flag**: `IS_MODULE_HRM_ENABLED`
**Entities**: `HRMEntity` (`hrm.entity.ts`)

**Resolver Queries**:
- `getOrgChart` -> `[OrgChartNodeDTO]`
- `getENPS` -> `ENPSDTO`
- `getWorkforceAnalytics` -> `WorkforceAnalyticsDTO`

**Resolver Mutations**:
- `createEmployee` -> `EmployeeDTO`
- `runPayroll` -> `PayrollRecordDTO`
- `createPerformanceReview` -> `PerformanceReviewDTO`
- `requestLeave` -> `LeaveRequestDTO`
- `approveLeave` -> `LeaveRequestDTO`

---

### 15. Contract Lifecycle Management (CLM)

**Directory**: `engine/core-modules/contract-lifecycle/`
**Feature Flag**: `IS_MODULE_CLM_ENABLED`
**Entities**: `ContractLifecycleEntity` (`contract-lifecycle.entity.ts`)

**Resolver Queries**:
- `getRiskScore` -> `RiskScoreDTO`
- `getContractsExpiring` -> `[CLMContractDTO]`
- `getCLMAnalytics` -> `CLMAnalyticsDTO`

**Resolver Mutations**:
- `createContract` -> `CLMContractDTO`
- `updateContract` -> `CLMContractDTO`
- `requestApproval` -> `CLMContractDTO`
- `signContract` -> `CLMContractDTO`

---

### 16. Field Service Management

**Directory**: `engine/core-modules/field-service/`
**Feature Flag**: `IS_MODULE_FIELD_SERVICE_ENABLED`
**Entities**: `FieldServiceEntity` (`field-service.entity.ts`)

**Resolver Queries**:
- `getFieldServiceAnalytics` -> `FieldServiceAnalyticsDTO`

**Resolver Mutations**:
- `createWorkOrder` -> `WorkOrderDTO`
- `assignWorkOrder` -> `WorkOrderDTO`
- `updateWorkOrderStatus` -> `WorkOrderDTO`
- `completeWorkOrder` -> `WorkOrderDTO`
- `registerTechnician` -> `TechnicianDTO`

---

### 17. Procurement

**Directory**: `engine/core-modules/procurement/`
**Feature Flag**: `IS_MODULE_PROCUREMENT_ENABLED`
**Entities**: `ProcurementEntity` (`procurement.entity.ts`)

**Resolver Queries**:
- `compareRFQResponses` -> `[RFQComparisonDTO]`
- `getSpendByCategory` -> `[SpendByCategoryDTO]`

**Resolver Mutations**:
- `createPurchaseRequest` -> `PurchaseRequestDTO`
- `approvePurchaseRequest` -> `PurchaseRequestDTO`
- `createRFQ` -> `RFQDTO`
- `submitRFQResponse` -> `RFQDTO`

**Dependencies**: Requires `inventory` module

---

### 18. Event Management

**Directory**: `engine/core-modules/event-management/`
**Feature Flag**: `IS_MODULE_EVENTS_ENABLED`
**Entities**: `EventManagementEntity` (`event-management.entity.ts`)
**REST Controller**: `event-management.controller.ts`

**Resolver Queries**:
- `getEventROI` -> `EventROIDTO`

**Resolver Mutations**:
- `createEvent` -> `CRMEventDTO`
- `registerForEvent` -> `EventRegistrationDTO`
- `checkInAttendee` -> `EventRegistrationDTO`
- `cancelRegistration` -> `EventRegistrationDTO`
- `cloneEvent` -> `CRMEventDTO`

---

### 19. Learning Management System (LMS)

**Directory**: `engine/core-modules/lms/`
**Feature Flag**: `IS_MODULE_LMS_ENABLED`
**Entities**: `LMSEntity` (`lms.entity.ts`)

**Resolver Queries**:
- `getTrainingROI` -> `TrainingROIDTO`

**Resolver Mutations**:
- `createCourse` -> `LMSCourseDTO`
- `enrollUser` -> `LMSEnrollmentDTO`
- `completeLesson` -> `LMSEnrollmentDTO`
- `submitQuizAttempt` -> `LMSEnrollmentDTO`

---

### 20. Fleet & Logistics

**Directory**: `engine/core-modules/fleet/`
**Feature Flag**: `IS_MODULE_FLEET_ENABLED`
**Entities**: `FleetEntity` (`fleet.entity.ts`)
**REST Controller**: `fleet.controller.ts`

**Resolver Queries**:
- `getFleetAnalytics` -> `FleetAnalyticsDTO`
- `getDriverPerformance` -> `[DriverPerformanceDTO]`
- `getCostPerDelivery` -> `[CostPerDeliveryDTO]`

**Resolver Mutations**:
- `registerVehicle` -> `FleetVehicleDTO`
- `registerDriver` -> `FleetDriverDTO`
- `createDelivery` -> `FleetDeliveryDTO`
- `assignDeliveryToDriver` -> `FleetDeliveryDTO`
- `optimizeRoute` -> `FleetRouteDTO`
- `confirmDelivery` -> `FleetDeliveryDTO`
- `logFuelEntry` -> `FuelLogDTO`

---

### 21. VoIP & Telephony (Asterisk)

**Directory**: `engine/core-modules/asterisk/`
**Feature Flag**: `IS_MODULE_ASTERISK_ENABLED`
**Entities**: `AsteriskEntity` (`asterisk.entity.ts`)
**REST Controller**: `asterisk.controller.ts`

**Resolver Queries**:
- `getCallAnalytics` -> `CallAnalyticsDTO`

**Resolver Mutations**:
- `registerAsteriskServer` -> `AsteriskServerDTO`
- `initiateCall` -> `CallLogDTO`
- `endCall` -> `CallLogDTO`
- `createSIPExtension` -> `SIPExtensionDTO`
- `createCallQueue` -> `CallQueueDTO`
- `createDialerCampaign` -> `DialerCampaignDTO`

**Infrastructure**: Integrated with Asterisk PBX via ARI (Asterisk REST Interface) and AMI. Docker Compose includes the Asterisk service with SIP (5060), ARI (8088), AMI (5038), and RTP media ports.

---

### 22. Partner Relationship Management (PRM)

**Directory**: `engine/core-modules/prm/`
**Feature Flag**: `IS_MODULE_PRM_ENABLED`
**Entities**: `PRMEntity` (`prm.entity.ts`)

**Resolver Queries**:
- `getChannelAnalytics` -> `ChannelAnalyticsDTO`
- `getPartnerLeaderboard` -> `[PartnerLeaderboardEntryDTO]`

**Resolver Mutations**:
- `onboardPartner` -> `PartnerDTO`
- `updatePartnerTier` -> `PartnerDTO`
- `certifyPartner` -> `PartnerDTO`
- `registerDeal` -> `DealRegistrationDTO`
- `approveDealRegistration` -> `DealRegistrationDTO`
- `submitMDFRequest` -> `MDFRequestDTO`

---

### 23. E-Commerce

**Directory**: `engine/core-modules/ecommerce/`
**Feature Flag**: `IS_MODULE_ECOMMERCE_ENABLED`
**Entities**: `EcommerceEntity` (`ecommerce.entity.ts`)
**REST Controller**: `ecommerce.controller.ts`

**Resolver Queries**:
- `searchProducts` -> `[ECommerceProductDTO]`
- `getCohortRetention` -> `[CohortRetentionDTO]`
- `getEcommerceAnalytics` -> `ECommerceAnalyticsDTO`
- `calculateCLV` -> `Float`

**Resolver Mutations**:
- `createProduct` -> `ECommerceProductDTO`
- `createOrder` -> `ECommerceOrderDTO`
- `updateOrderStatus` -> `ECommerceOrderDTO`
- `recoverAbandonedCart` -> `AbandonedCartDTO`
- `enrollLoyalty` -> `LoyaltyMemberDTO`

---

### 24. SaaS Platform (Tenant Management)

**Directory**: `engine/core-modules/saas-platform/`
**Feature Flag**: Part of core platform
**Entities**: `TenantConfigEntity`, `TenantModuleEntity`, `ModuleCatalogEntity`, `FiscalConfigEntity`, `EventLogEntity` (all in `saas-platform.entity.ts`)
**REST Controller**: `saas-platform.controller.ts`

**Resolver Queries**:
- `getActiveModules` -> `[TenantModuleDTO]`
- `calculateMonthlyInvoice` -> `MonthlyInvoiceDTO`
- `getAdminDashboard` -> `AdminDashboardDTO`

**Resolver Mutations**:
- `provisionTenant` -> `TenantConfigDTO`
- `updatePlan` -> `TenantConfigDTO`
- `activateModule` -> `TenantModuleDTO`
- `deactivateModule` -> `TenantModuleDTO`
- `seedModuleCatalog` -> `Int`

**Service Methods** (`SaaSPlatformService`):
- `provisionTenant()` -- Creates tenant config, activates plan-included modules, sets up fiscal connector
- `updatePlan()` -- Upgrades/downgrades plan, adjusts module entitlements
- `suspendTenant()` / `reactivateTenant()` -- Account lifecycle
- `activateModule()` / `deactivateModule()` -- Module management with dependency checks
- `checkModuleAccess()` -- Middleware guard for module-protected endpoints
- `trackUsage()` -- Usage metering (users, storage, call minutes, employees)
- `calculateMonthlyInvoice()` -- Per-module billing with tax calculation
- `emitEvent()` / `processEvents()` -- Cross-module event bus
- `setupFiscalConnector()` -- Country-specific tax authority integration
- `seedModuleCatalog()` -- Initialize the 21 module catalog entries

---

### 25. Support Ticket (Helpdesk)

**Directory**: `modules/support-ticket/`
**Feature Flag**: `IS_MODULE_SUPPORT_TICKET_ENABLED`

**Resolver Queries**:
- `getTicketsByStatus` -> `[SupportTicketDTO]`
- `getTicketMetrics` -> `TicketMetricsDTO`

**Resolver Mutations**:
- `createTicket` -> `SupportTicketDTO`
- `assignTicket` -> `SupportTicketDTO`
- `updateTicketStatus` -> `SupportTicketDTO`
- `escalateTicket` -> `SupportTicketDTO`
- `addComment` -> `TicketCommentDTO`
- `mergeTickets` -> `SupportTicketDTO`

---

### 26. Knowledge Base

**Directory**: `modules/knowledge-base/`
**Feature Flag**: `IS_MODULE_KNOWLEDGE_BASE_ENABLED`

**Resolver Queries**:
- `searchArticles` -> `[KBArticleDTO]`
- `getArticlesByCategory` -> `[KBArticleDTO]`
- `getDeflectionRate` -> `Int`

**Resolver Mutations**:
- `createCategory` -> `KBCategoryDTO`
- `createArticle` -> `KBArticleDTO`
- `updateArticle` -> `KBArticleDTO`

---

### 27. Inventory Management

**Directory**: `modules/inventory/`
**Feature Flag**: `IS_MODULE_INVENTORY_ENABLED`

**Resolver Queries**:
- `getLowStockItems` -> `[ProductStockDTO]`
- `getStockValuation` -> `StockValuationDTO`

**Resolver Mutations**:
- `createWarehouse` -> `WarehouseDTO`
- `addStock` -> `ProductStockDTO`
- `transferStock` -> `ProductStockDTO`
- `reserveStock` -> `ProductStockDTO`
- `runReorderCheck` -> `Boolean`
- `registerSupplier` -> `SupplierDTO`

---

### 28. Marketing Campaigns

**Directory**: `modules/marketing-campaign/`
**Feature Flag**: `IS_MODULE_MARKETING_ENABLED`

**Resolver Queries**:
- `getCampaignROI` -> `CampaignROIDTO`

**Resolver Mutations**:
- `createCampaign` -> `MarketingCampaignDTO`
- `launchCampaign` -> `MarketingCampaignDTO`
- `scoreLead` -> `LeadScoreDTO`
- `updateLeadScore` -> `LeadScoreDTO`
- `attributeConversion` -> `Boolean`

---

### 29. Gamification

**Directory**: `modules/gamification/`
**Feature Flag**: `IS_MODULE_GAMIFICATION_ENABLED`

**Resolver Queries**:
- `getLeaderboard` -> `[LeaderboardEntryDTO]`
- `getActiveChallenges` -> `[SalesChallengeDTO]`

**Resolver Mutations**:
- `recordAchievement` -> `LeaderboardEntryDTO`
- `awardBadge` -> `BadgeDTO`
- `createChallenge` -> `SalesChallengeDTO`

---

### 30. Project Management

**Directory**: `modules/project/`
**Feature Flag**: `IS_MODULE_PROJECT_ENABLED`

**Resolver Queries**:
- `getGanttData` -> `[GanttItemDTO]`
- `getProjectPL` -> `ProjectPLDTO`
- `getProjectHealth` -> `ProjectHealthDTO`

**Resolver Mutations**:
- `createProject` -> `ProjectDTO`
- `createTask` -> `ProjectTaskDTO`
- `updateTaskStatus` -> `ProjectTaskDTO`
- `logTime` -> `TimeEntryDTO`
- `addRisk` -> `ProjectRiskDTO`

---

### 31. AI Governance

**Directory**: `engine/core-modules/ai-governance/`
**Feature Flag**: `IS_MODULE_AI_GOVERNANCE_ENABLED`
**Entities**: `AIGovernanceEntity` (`ai-governance.entity.ts`)

**Resolver Queries**:
- `getModelConfigs` -> `[ModelConfigDTO]`
- `getUsageCost` -> `UsageCostDTO`
- `getPIILeakages` -> `[PIILeakageDTO]`
- `getAIAuditLog` -> `[AIAuditEntryDTO]`

**Resolver Mutations**:
- `logAIUsage` -> `AIUsageLogDTO`
- `maskPII` -> `MaskPIIResultDTO`
- `enforceGovernance` -> `GovernanceResultDTO`

**Key Service**: `LLMClientService` (`llm-client.service.ts`) -- See [AI/LLM Integration](#aillm-integration) section.

---

### 32. Hyper-Personalization

**Directory**: `engine/core-modules/hyper-personalization/`
**Feature Flag**: `IS_MODULE_HYPER_PERSONALIZATION_ENABLED`
**Entities**: `HyperPersonalizationEntity` (`hyper-personalization.entity.ts`)

**Resolver Queries**:
- `getPersonalizedContent` -> `PersonalizedContentDTO`
- `getSegmentRecommendations` -> `[SegmentRecommendationDTO]`
- `getPersonalizationScore` -> `Float`

**Resolver Mutations**:
- `createProfile` -> `PersonalizationProfileDTO`
- `addPersonalizationRule` -> `PersonalizationRuleDTO`
- `trackEvent` -> `PersonalizationEventDTO`

---

### 33. PLG Intelligence

**Directory**: `engine/core-modules/plg-intelligence/`
**Feature Flag**: `IS_MODULE_PLG_INTELLIGENCE_ENABLED`
**Entities**: `PLGIntelligenceEntity` (`plg-intelligence.entity.ts`)

**Resolver Queries**:
- `getTrialMetrics` -> `TrialMetricsDTO`
- `getConversionPrediction` -> `ConversionPredictionDTO`
- `getFeatureUsage` -> `[FeatureUsageDTO]`

**Resolver Mutations**:
- `trackProductUsage` -> `ProductUsageEventDTO`
- `calculatePQLScore` -> `PQLScoreDTO`

---

### 34. Banking LATAM

**Directory**: `engine/core-modules/banking-latam/`
**Feature Flag**: `IS_MODULE_BANKING_LATAM_ENABLED`
**Entities**: `BankingLatamEntity` (`banking-latam.entity.ts`)
**REST Controller**: `banking-latam.controller.ts`

**Resolver Queries**:
- `getTransactions` -> `[BankTransactionDTO]`
- `getBankingAnalytics` -> `BankingAnalyticsDTO`

**Resolver Mutations**:
- `connectBankAccount` -> `BankConnectionDTO`
- `reconcileTransactions` -> `BankReconciliationDTO`
- `generatePaymentFile` -> `PaymentFileDTO`

---

### 35. Incident Management

**Directory**: `engine/core-modules/incident-management/`
**Feature Flag**: `IS_MODULE_INCIDENT_MANAGEMENT_ENABLED`
**Entities**: `IncidentManagementEntity` (`incident-management.entity.ts`)

**Resolver Queries**:
- `getActiveIncidents` -> `[IncidentDTO]`
- `getMTTRMetrics` -> `MTTRMetricsDTO`

**Resolver Mutations**:
- `createIncident` -> `IncidentDTO`
- `updateSeverity` -> `IncidentDTO`
- `addTimelineEntry` -> `IncidentTimelineDTO`
- `createPostmortem` -> `PostmortemDTO`
- `resolveIncident` -> `IncidentDTO`

---

### 36. Revenue Waterfall

**Directory**: `engine/core-modules/revenue-waterfall/`
**Feature Flag**: `IS_MODULE_REVENUE_WATERFALL_ENABLED`
**Entities**: `RevenueWaterfallEntity` (`revenue-waterfall.entity.ts`)

**Resolver Queries**:
- `getARRBreakdown` -> `ARRBreakdownDTO`
- `getNRRTrend` -> `[NRRPeriodDTO]`
- `getRevenueSegments` -> `[RevenueSegmentDTO]`

**Resolver Mutations**:
- `createWaterfall` -> `RevenueWaterfallDTO`
- `logBooking` -> `BookingEntryDTO`
- `logChurn` -> `ChurnEntryDTO`
- `logExpansion` -> `ExpansionEntryDTO`

---

### 37. Sales Coaching

**Directory**: `engine/core-modules/sales-coaching/`
**Feature Flag**: `IS_MODULE_SALES_COACHING_ENABLED`
**Entities**: `SalesCoachingEntity` (`sales-coaching.entity.ts`)

**Resolver Queries**:
- `getSkillGaps` -> `[SkillGapDTO]`
- `getTeamBenchmarks` -> `[TeamBenchmarkDTO]`
- `getTrainingSuggestions` -> `[TrainingSuggestionDTO]`

**Resolver Mutations**:
- `createCoachingSession` -> `CoachingSessionDTO`
- `reviewCall` -> `CallReviewDTO`
- `generateScorecard` -> `RepScorecardDTO`

---

### 38. Tenant Wizard

**Directory**: `engine/core-modules/tenant-wizard/`
**Feature Flag**: `IS_MODULE_TENANT_WIZARD_ENABLED`
**Entities**: `TenantWizardEntity` (`tenant-wizard.entity.ts`)

**Resolver Queries**:
- `getWizardSteps` -> `[WizardStepDTO]`
- `getWizardProgress` -> `WizardProgressDTO`
- `validateSetup` -> `ValidationResultDTO`

**Resolver Mutations**:
- `completeWizardStep` -> `WizardProgressDTO`
- `applyIndustryTemplate` -> `IndustryTemplateDTO`
- `seedDemoData` -> `DemoDataResultDTO`

---

### 39. Mobile Native

**Directory**: `engine/core-modules/mobile-native/`
**Feature Flag**: `IS_MODULE_MOBILE_NATIVE_ENABLED`
**Entities**: `MobileNativeEntity` (`mobile-native.entity.ts`)

**Resolver Queries**:
- `validateBiometric` -> `BiometricValidationDTO`
- `getNearbyClients` -> `[NearbyClientDTO]`

**Resolver Mutations**:
- `registerSession` -> `MobileSessionDTO`
- `enqueueOfflineAction` -> `OfflineQueueDTO`
- `syncOfflineQueue` -> `SyncResultDTO`
- `checkinLocation` -> `LocationCheckinDTO`

---

### 40. Data Residency

**Directory**: `engine/core-modules/data-residency/`
**Entities**: `DataResidencyEntity` (`data-residency.entity.ts`)

**Resolver Queries**:
- `getDataResidencyConfig` -> `DataResidencyConfigDTO`
- `getRegionInfo` -> `RegionInfoDTO`

**Resolver Mutations**:
- `setDataResidency` -> `DataResidencyConfigDTO`
- `updatePrimaryRegion` -> `DataResidencyConfigDTO`
- `enableReplication` -> `DataResidencyConfigDTO`
- `requestDataDeletion` -> `DataResidencyConfigDTO`
- `initiateRegionMigration` -> `DataResidencyConfigDTO`

---

### 41. Mobile (App Management)

**Directory**: `engine/core-modules/mobile/`
**Entities**: `MobileAppEntity` (`mobile-app.entity.ts`)

**Resolver Queries**:
- `getMobileDevices` -> `[MobileDeviceDTO]`
- `getMobileApps` -> `[MobileAppDTO]`

**Resolver Mutations**:
- `registerMobileApp` -> `MobileAppDTO`
- `registerDevice` -> `MobileDeviceDTO`
- `sendPushNotification` -> `PushNotificationResultDTO`

---

### 42. Additional Infrastructure Modules

#### Offline Sync
**Directory**: `engine/core-modules/offline-sync/`
**Entity**: `OfflineSyncEntity` (`offline-sync.entity.ts`)
**REST Controller**: `offline-sync.controller.ts`

#### Sandbox
**Directory**: `engine/core-modules/sandbox/`
**Entity**: `SandboxEntity` (`sandbox.entity.ts`)
**REST Controller**: `sandbox.controller.ts`

#### Integration Hub
**Directory**: `engine/core-modules/integration/`
**Entity**: `IntegrationEntity` (`entities/integration.entity.ts`)
**REST Controller**: `integration.controller.ts`

---

## API Reference

### REST Endpoints

| Method | Path | Controller | Purpose | Auth |
|--------|------|-----------|---------|------|
| ALL | `/api/` | `rest-api-core.controller.ts` | Core CRUD API | Yes |
| ALL | `/metadata/` | `rest-api-metadata.controller.ts` | Metadata API | Yes |
| GET | `/healthz` | `health.controller.ts` | Health check | No |
| GET/POST | `/api/auth/*` | Auth controllers | Authentication | Varies |
| POST | `/api/auth/google` | `google-auth.controller.ts` | Google OAuth | No |
| POST | `/api/auth/microsoft` | `microsoft-auth.controller.ts` | Microsoft OAuth | No |
| POST | `/api/auth/sso` | `sso-auth.controller.ts` | SSO authentication | No |
| ALL | `/api/files/*` | `file.controller.ts` | File upload/download | Yes |
| GET | `/open-api/*` | `open-api.controller.ts` | OpenAPI spec | No |
| POST | `/api/billing/webhook` | `billing-webhook.controller.ts` | Stripe webhooks | Webhook |
| ALL | `/ari/*` | Nginx proxy | Asterisk ARI API | Yes |
| ALL | `/api/fiscal/*` | Via Nginx | Fiscal API (rate limited) | Yes |
| POST | `/mcp/*` | `mcp-server.controller.ts` | MCP protocol | Yes |
| POST | `/mcp/core/*` | `mcp-core.controller.ts` | MCP core operations | Yes |

---

## SaaS Platform

### Tenant Provisioning Flow

1. User signs up via Twenty CRM auth flow
2. Admin calls `provisionTenant` mutation with company name, country, and plan
3. System creates `TenantConfigEntity` with:
   - 14-day trial period
   - Country-specific currency and timezone
   - Plan-appropriate usage limits
4. Plan-included modules are automatically activated
5. If country supports electronic invoicing, fiscal connector is initialized in test mode
6. Event `tenant.provisioned` is emitted to the event bus

### Module Activation/Deactivation

- Modules have dependency checks (e.g., `trade_import` requires `inventory`)
- Deactivation checks reverse dependencies before allowing
- Each activation/deactivation is logged as an event
- Billing type is set from the module catalog (flat, per_user, per_employee, usage)

### Plan Tiers

| Feature | Starter | Professional | Enterprise | Custom |
|---------|---------|-------------|------------|--------|
| Max Users | 3 | 25 | 999 | 9,999 |
| Storage | 10 GB | 100 GB | 1 TB | 5 TB |
| Call Minutes | 100 | 1,000 | 10,000 | 99,999 |
| Max Employees | 0 | 50 | 500 | 9,999 |
| Included Modules | 2 | 6 | All 21 | All + Custom |

**Starter modules**: support_ticket, knowledge_base
**Professional adds**: marketing, inventory, project, gamification
**Enterprise**: All modules included

### Billing Calculation

Monthly invoice is calculated per module:
- **Flat rate**: Fixed USD price per module
- **Per user**: Price x active users
- **Per employee**: Price x employees (HRM)
- **Usage-based**: Price x metered units (e.g., call minutes for Asterisk)

Country-specific tax rates are applied automatically:
- CO: 19% IVA | MX: 16% IVA | DO: 18% ITBIS | CL: 19% IVA
- PE: 18% IGV | AR: 21% IVA | BR: 18% (ICMS+ISS+PIS/COFINS)

### Usage Tracking

Tracked metrics: `users`, `storage`, `call_minutes`, `employees`. Limits are enforced in real time -- exceeding a limit throws `ForbiddenException` with an upgrade message.

---

## AI/LLM Integration

### LLM Client Architecture

**File**: `engine/core-modules/ai-governance/llm-client.service.ts`

The `LLMClientService` provides a unified interface for calling multiple LLM providers:

```typescript
type LLMProvider = 'openai' | 'anthropic' | 'google';

interface LLMRequest {
  provider: LLMProvider;
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}
```

### Supported Providers

| Provider | Models | Cost per 1M tokens (input/output) |
|----------|--------|-----------------------------------|
| OpenAI | gpt-4o | $2.50 / $10.00 |
| Anthropic | claude-sonnet-4-20250514 | $3.00 / $15.00 |
| Google | gemini-2.5-pro | $1.25 / $5.00 |

### API Key Resolution

1. Check `ModelConfigEntity` for workspace-specific API key
2. Fall back to environment variables: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY`

### Usage Logging

Every LLM call is logged to `AIUsageLogEntity` with:
- Workspace ID, user ID, feature name
- Provider, model, input/output tokens
- Cost calculation, latency in milliseconds
- Success/failure status, error messages
- PII detection flags

Monthly spend is tracked per model configuration and updated after each successful call.

### AI Governance Pipeline

1. **PII Masking** (`maskPII` mutation) -- Detects and masks personally identifiable information before sending to LLM
2. **Cost Tracking** -- Per-workspace monthly spend tracking with configurable budgets
3. **Audit Trail** -- Full audit log of all AI interactions
4. **Model Configuration** -- Per-workspace model enablement and API key storage
5. **PIILeakage Detection** -- Monitoring for PII in LLM responses

### AI-Powered Features

- **Predictive Lead Scoring** -- ML-based lead prioritization
- **Sentiment Analysis** -- Customer communication analysis
- **NLP Query** -- Natural language database queries
- **Next Best Action** -- AI-recommended sales actions
- **ICP Fit** -- Ideal Customer Profile matching
- **AI Email Writer** -- Automated email composition
- **Auto Enrichment** -- Contact/company data enrichment
- **Deal Loss Intelligence** -- Post-loss analysis
- **Meeting Briefing** -- Pre-meeting context generation
- **Deal Health** -- AI-powered deal risk assessment

### AI Agents

6 specialized agents plus 2 intelligence agents:
- **SDR Agent** -- Automated prospecting and outreach
- **CSM Agent** -- Customer success automation
- **Deal Qualification Agent** -- BANT/MEDDIC analysis
- **Meeting Notes Agent** -- Automated note-taking and action items
- **Data Hygiene Agent** -- CRM data quality maintenance
- **Prospecting Research Agent** -- Company/contact research
- **Competitive Intelligence Agent** -- Competitor analysis and battle cards
- **Contract Intelligence Agent** -- Contract analysis and risk detection

---

## LATAM Fiscal Compliance

### Supported Countries and Tax Authorities

| Country | Authority | Standard | Tax | Provider | Status |
|---------|-----------|----------|-----|----------|--------|
| Colombia | DIAN | UBL 2.1, XAdES | IVA 19% + ReteFuente 4% + ICA 0.69% | `dian_direct` | Ready |
| Mexico | SAT | CFDI 4.0 via PAC | IVA 16% + ISR 10% | `pac_edicom` | Ready |
| Dominican Republic | DGII | e-CF, SOAP | ITBIS 18% | `dgii_direct` | Ready |
| Chile | SII | DTE, REST | IVA 19% | `sii_direct` | Config |
| Peru | SUNAT | UBL, CDR | IGV 18% | `sunat_direct` | Config |
| Argentina | AFIP | FE, WSFE | IVA 21% + IIBB 3.5% | `afip_direct` | Config |
| Brazil | SEFAZ | NF-e | ICMS 18% + ISS 5% + PIS/COFINS 9.25% | `sefaz_direct` | Config |

### Feature Flags per Country

```
IS_FISCAL_DIAN_CO_ENABLED    -- Colombia
IS_FISCAL_SAT_MX_ENABLED     -- Mexico
IS_FISCAL_DGII_RD_ENABLED    -- Dominican Republic
IS_FISCAL_SII_CL_ENABLED     -- Chile
IS_FISCAL_SUNAT_PE_ENABLED   -- Peru
IS_FISCAL_AFIP_AR_ENABLED    -- Argentina
IS_FISCAL_NFE_BR_ENABLED     -- Brazil
```

### Tax Rules Configuration

Tax rules are stored per workspace/country in `FiscalConfigEntity.taxRules` as an array:
```json
[
  { "name": "IVA", "rate": 19, "type": "vat" },
  { "name": "ReteFuente", "rate": 4, "type": "withholding" },
  { "name": "ICA", "rate": 0.69, "type": "municipal" }
]
```

### Electronic Invoicing Flow

1. Invoice is created via Accounts Receivable module
2. FinTech layer calls `emitElectronicInvoice` with invoice data
3. System retrieves fiscal config for the workspace/country
4. Invoice number is generated with country-specific format
5. XML is signed with the workspace's digital certificate
6. Document is submitted to the tax authority (DIAN/SAT/DGII/etc.)
7. Response (acceptance/rejection) is logged
8. Counters are updated: `invoicesSent`, `invoicesAccepted`, `invoicesRejected`

### Certificate Management

Digital certificates are stored per-workspace in `FiscalConfigEntity`:
- `certificatePath` -- Path to the .p12/.pfx certificate file
- `certificatePassword` -- Encrypted password for the certificate
- `resolutionNumber` -- Authorization number from the tax authority
- `resolutionExpiry` -- Expiration date of the resolution
- `invoicePrefix` -- Country-specific prefix for invoice numbering

---

## Infrastructure

### Docker Compose (`docker-compose.saas.yml`)

Full production stack with 6 services:

```
ccg-gateway     -- Nginx API Gateway (ports 80, 443)
ccg-crm         -- Twenty Server (NestJS, all modules)
ccg-worker      -- BullMQ Worker (background jobs)
ccg-front       -- Twenty Frontend (React)
ccg-asterisk    -- Asterisk PBX (SIP 5060, ARI 8088, AMI 5038, RTP 10000-10100)
ccg-postgres    -- PostgreSQL 16 Alpine
ccg-redis       -- Redis 7 Alpine (256MB, allkeys-lru)
```

**Volumes**: `postgres-data`, `redis-data`, `twenty-data`, `asterisk-recordings`
**Network**: `ccg-network` (bridge)

### Nginx API Gateway

**File**: `packages/twenty-docker/gateway/nginx.conf`

Key features:
- **Wildcard tenant routing**: `tenant1.ccgcentral.com` extracts subdomain into `$tenant_subdomain`
- **Rate limiting zones**:
  - `tenant_api`: 100 req/s per tenant (burst 50)
  - `login`: 5 req/min per IP (burst 3)
  - `fiscal`: 10 req/s per tenant (burst 5, 60s timeout for slow tax authorities)
- **Security headers**: X-Frame-Options, X-Content-Type-Options, XSS-Protection, HSTS
- **WebSocket support**: ARI events, frontend HMR/real-time
- **CORS**: Dynamic origin, all methods, credentials allowed
- **Upstream keepalive**: 32 connections to Twenty API

### PostgreSQL

- Version 16 Alpine
- Init script: `init-db.sql` (RLS policies, audit triggers)
- Health check: `pg_isready` every 10s

### Redis

- Version 7 Alpine
- Memory limit: 256MB
- Eviction policy: allkeys-lru
- Used for: session storage, cache, BullMQ job queues

### Asterisk PBX

- Image: `andrius/asterisk:latest-ari`
- Configuration files mounted read-only:
  - `sip.conf` -- SIP trunk and extension configuration
  - `extensions.conf` -- Dial plan
  - `ari.conf` -- ARI REST API configuration
  - `manager.conf` -- AMI configuration
- Recordings volume: `asterisk-recordings`

---

## Development Guide

### How to Add a New Enterprise Module

1. **Create the module directory**:
   ```
   packages/twenty-server/src/engine/core-modules/<module-name>/
   ```

2. **Create the entity** (`<module-name>.entity.ts`):
   ```typescript
   @Entity('module_<table_name>')
   @Index(['workspaceId'])
   export class MyModuleEntity {
     @PrimaryGeneratedColumn('uuid') id: string;
     @Column({ nullable: false }) workspaceId: string;
     // ... module-specific columns
     @CreateDateColumn() createdAt: Date;
     @UpdateDateColumn() updatedAt: Date;
   }
   ```

3. **Create the service** (`<module-name>.service.ts`):
   ```typescript
   @Injectable()
   export class MyModuleService {
     constructor(
       @InjectRepository(MyModuleEntity)
       private readonly repo: Repository<MyModuleEntity>,
     ) {}
     // Business logic methods
   }
   ```

4. **Create the resolver** (`<module-name>.resolver.ts`):
   ```typescript
   @MetadataResolver()
   @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
   export class MyModuleResolver {
     constructor(private readonly service: MyModuleService) {}

     @Query(() => MyDTO)
     async getMyData(@AuthWorkspace() workspace: WorkspaceEntity) {
       return this.service.getData(workspace.id);
     }
   }
   ```

5. **Create the NestJS module** (`<module-name>.module.ts`):
   ```typescript
   @Module({
     imports: [TypeOrmModule.forFeature([MyModuleEntity])],
     providers: [MyModuleService, MyModuleResolver],
     exports: [MyModuleService],
   })
   export class MyModuleModule {}
   ```

6. **Register in `core-engine.module.ts`** -- Add the module to the imports array.

7. **Add feature flag** -- Add a new entry to `FeatureFlagKey` in `packages/twenty-shared/src/types/FeatureFlagKey.ts`:
   ```typescript
   IS_MODULE_MY_MODULE_ENABLED = 'IS_MODULE_MY_MODULE_ENABLED',
   ```

8. **Add to SaaS platform** -- Update `MODULE_FLAG_MAP` in `saas-platform.service.ts`.

9. **Add to module catalog** -- Add entry to `seedModuleCatalog()` in `saas-platform.service.ts`.

10. **Generate migration**:
    ```bash
    npx nx run twenty-server:typeorm migration:generate src/database/typeorm/core/migrations/common/add-my-module -d src/database/typeorm/core/core.datasource.ts
    ```

### How to Add a Frontend Settings Page

1. Create component in `packages/twenty-front/src/pages/settings/modules/components/SettingsModule<Name>.tsx`
2. Use `SubMenuTopBarContainer` for consistent layout
3. Use Linaria `styled` components for styling
4. Use Lingui `useLingui()` for i18n
5. Add route in the settings router

### How to Add a Fiscal Country

1. Add feature flag: `IS_FISCAL_<AUTHORITY>_<CC>_ENABLED` to `FeatureFlagKey.ts`
2. Add country code to `CountryCode` enum in `saas-platform.entity.ts`
3. Add currency mapping in `COUNTRY_CURRENCY`
4. Add tax rate in `COUNTRY_TAX`
5. Add timezone in `COUNTRY_TIMEZONE`
6. Add default tax rules in `getDefaultTaxRules()`
7. Add fiscal provider in `getDefaultFiscalProvider()`
8. Add country to `fiscalCountries` array in `provisionTenant()`

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `packages/twenty-server/src/engine/core-modules/` | All enterprise module backends |
| `packages/twenty-server/src/modules/` | Additional module backends (support, KB, inventory, etc.) |
| `packages/twenty-shared/src/types/FeatureFlagKey.ts` | All feature flags (59 total) |
| `packages/twenty-server/src/engine/core-modules/saas-platform/saas-platform.service.ts` | Tenant management, billing, events |
| `packages/twenty-server/src/engine/core-modules/saas-platform/saas-platform.entity.ts` | SaaS data model (5 entities) |
| `packages/twenty-server/src/engine/core-modules/ai-governance/llm-client.service.ts` | Multi-provider LLM client |
| `packages/twenty-docker/docker-compose.saas.yml` | Production deployment stack |
| `packages/twenty-docker/gateway/nginx.conf` | API Gateway configuration |
| `packages/twenty-docker/init-db.sql` | Database init (RLS, triggers) |
| `packages/twenty-front/src/pages/settings/modules/` | Frontend settings pages (20 pages) |
| `backend/twenty-server/project.json` | Nx project configuration |
