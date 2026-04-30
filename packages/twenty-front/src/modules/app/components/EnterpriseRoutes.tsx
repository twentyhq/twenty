import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

// Helpdesk
const TicketList = lazy(() =>
  import('@/enterprise-helpdesk/components/TicketList').then((module) => ({
    default: module.TicketList,
  })),
);

// Inventory
const StockDashboard = lazy(() =>
  import('@/enterprise-inventory/components/StockDashboard').then((module) => ({
    default: module.StockDashboard,
  })),
);

// Accounting
const ChartOfAccounts = lazy(() =>
  import('@/enterprise-accounting/components/ChartOfAccounts').then(
    (module) => ({
      default: module.ChartOfAccounts,
    }),
  ),
);

// HRM
const EmployeeDirectory = lazy(() =>
  import('@/enterprise-hrm/components/EmployeeDirectory').then((module) => ({
    default: module.EmployeeDirectory,
  })),
);

// Projects
const ProjectList = lazy(() =>
  import('@/enterprise-projects/components/ProjectList').then((module) => ({
    default: module.ProjectList,
  })),
);

// Fleet
const FleetMap = lazy(() =>
  import('@/enterprise-fleet/components/FleetMap').then((module) => ({
    default: module.FleetMap,
  })),
);

// E-Commerce
const OrderList = lazy(() =>
  import('@/enterprise-ecommerce/components/OrderList').then((module) => ({
    default: module.OrderList,
  })),
);

// PRM
const PartnerList = lazy(() =>
  import('@/enterprise-prm/components/PartnerList').then((module) => ({
    default: module.PartnerList,
  })),
);

// CLM
const ContractList = lazy(() =>
  import('@/enterprise-clm/components/ContractList').then((module) => ({
    default: module.ContractList,
  })),
);

// FSM
const WorkOrderList = lazy(() =>
  import('@/enterprise-fsm/components/WorkOrderList').then((module) => ({
    default: module.WorkOrderList,
  })),
);

// Procurement
const PurchaseRequestList = lazy(() =>
  import('@/enterprise-procurement/components/PurchaseRequestList').then(
    (module) => ({
      default: module.PurchaseRequestList,
    }),
  ),
);

// Events
const EventList = lazy(() =>
  import('@/enterprise-events/components/EventList').then((module) => ({
    default: module.EventList,
  })),
);

// LMS
const CourseCatalog = lazy(() =>
  import('@/enterprise-lms/components/CourseCatalog').then((module) => ({
    default: module.CourseCatalog,
  })),
);

// Marketing
const CampaignList = lazy(() =>
  import('@/enterprise-marketing/components/CampaignList').then((module) => ({
    default: module.CampaignList,
  })),
);

// VoIP
const CallLog = lazy(() =>
  import('@/enterprise-voip/components/CallLog').then((module) => ({
    default: module.CallLog,
  })),
);

// AI
const AIAgentList = lazy(() =>
  import('@/enterprise-ai/components/AIAgentList').then((module) => ({
    default: module.AIAgentList,
  })),
);

// Accounts Receivable
const InvoiceList = lazy(() =>
  import('@/enterprise-ar/components/InvoiceList').then((module) => ({
    default: module.InvoiceList,
  })),
);

// Billing
const TenantList = lazy(() =>
  import('@/enterprise-billing/components/TenantList').then((module) => ({
    default: module.TenantList,
  })),
);

// Fiscal
const FiscalDashboard = lazy(() =>
  import('@/enterprise-fiscal/components/FiscalDashboard').then((module) => ({
    default: module.FiscalDashboard,
  })),
);

// Banking
const BankConnections = lazy(() =>
  import('@/enterprise-banking/components/BankConnections').then((module) => ({
    default: module.BankConnections,
  })),
);

// Incidents
const IncidentList = lazy(() =>
  import('@/enterprise-incidents/components/IncidentList').then((module) => ({
    default: module.IncidentList,
  })),
);

// Sales Execution
const PipelineBoard = lazy(() =>
  import('@/enterprise-sales-execution/components/PipelineBoard').then(
    (module) => ({
      default: module.PipelineBoard,
    }),
  ),
);

// Customer Success
const HealthScoreList = lazy(() =>
  import('@/enterprise-customer-success/components/HealthScoreList').then(
    (module) => ({
      default: module.HealthScoreList,
    }),
  ),
);

// CPQ
const PriceBookList = lazy(() =>
  import('@/enterprise-cpq/components/PriceBookList').then((module) => ({
    default: module.PriceBookList,
  })),
);

// ABM
const TargetAccountList = lazy(() =>
  import('@/enterprise-abm/components/TargetAccountList').then((module) => ({
    default: module.TargetAccountList,
  })),
);

// Omnicanal
const UnifiedInbox = lazy(() =>
  import('@/enterprise-omnicanal/components/UnifiedInbox').then((module) => ({
    default: module.UnifiedInbox,
  })),
);

// Gamification
const Leaderboard = lazy(() =>
  import('@/enterprise-gamification/components/Leaderboard').then(
    (module) => ({
      default: module.Leaderboard,
    }),
  ),
);

// Revenue Waterfall
const WaterfallChart = lazy(() =>
  import('@/enterprise-revenue-waterfall/components/WaterfallChart').then(
    (module) => ({
      default: module.WaterfallChart,
    }),
  ),
);

// Sales Coaching
const CoachingSessions = lazy(() =>
  import('@/enterprise-sales-coaching/components/CoachingSessions').then(
    (module) => ({
      default: module.CoachingSessions,
    }),
  ),
);

// Hyper-Personalization
const PersonalizationRules = lazy(() =>
  import(
    '@/enterprise-hyper-personalization/components/PersonalizationRules'
  ).then((module) => ({
    default: module.PersonalizationRules,
  })),
);

// PLG Intelligence
const ProductUsage = lazy(() =>
  import('@/enterprise-plg-intelligence/components/ProductUsage').then(
    (module) => ({
      default: module.ProductUsage,
    }),
  ),
);

// IT Asset Management
const AssetRegistry = lazy(() =>
  import(
    '@/enterprise-it-asset-management/components/AssetRegistry'
  ).then((module) => ({
    default: module.AssetRegistry,
  })),
);

// Trade Import
const PurchaseOrderList = lazy(() =>
  import('@/enterprise-trade-import/components/PurchaseOrderList').then(
    (module) => ({
      default: module.PurchaseOrderList,
    }),
  ),
);

// Tenant Wizard
const WizardSteps = lazy(() =>
  import('@/enterprise-tenant-wizard/components/WizardSteps').then(
    (module) => ({
      default: module.WizardSteps,
    }),
  ),
);

// Data Residency
const RegionSelector = lazy(() =>
  import('@/enterprise-data-residency/components/RegionSelector').then(
    (module) => ({
      default: module.RegionSelector,
    }),
  ),
);

// Mobile Native
const SessionList = lazy(() =>
  import('@/enterprise-mobile-native/components/SessionList').then(
    (module) => ({
      default: module.SessionList,
    }),
  ),
);

const EnterpriseLoadingFallback = () => (
  <div style={{ padding: '24px', color: '#999' }}>Loading module...</div>
);

export const EnterpriseRoutes = () => (
  <Suspense fallback={<EnterpriseLoadingFallback />}>
    <Routes>
      <Route path="helpdesk" element={<TicketList />} />
      <Route path="inventory" element={<StockDashboard />} />
      <Route path="accounting" element={<ChartOfAccounts />} />
      <Route path="hrm" element={<EmployeeDirectory />} />
      <Route path="projects" element={<ProjectList />} />
      <Route path="fleet" element={<FleetMap />} />
      <Route path="ecommerce" element={<OrderList />} />
      <Route path="prm" element={<PartnerList />} />
      <Route path="clm" element={<ContractList />} />
      <Route path="fsm" element={<WorkOrderList />} />
      <Route path="procurement" element={<PurchaseRequestList />} />
      <Route path="events" element={<EventList />} />
      <Route path="lms" element={<CourseCatalog />} />
      <Route path="marketing" element={<CampaignList />} />
      <Route path="voip" element={<CallLog />} />
      <Route path="ai" element={<AIAgentList />} />
      <Route path="ar" element={<InvoiceList />} />
      <Route path="billing" element={<TenantList />} />
      <Route path="fiscal" element={<FiscalDashboard />} />
      <Route path="banking" element={<BankConnections />} />
      <Route path="incidents" element={<IncidentList />} />
      <Route path="sales" element={<PipelineBoard />} />
      <Route path="cs" element={<HealthScoreList />} />
      <Route path="cpq" element={<PriceBookList />} />
      <Route path="abm" element={<TargetAccountList />} />
      <Route path="omnicanal" element={<UnifiedInbox />} />
      <Route path="gamification" element={<Leaderboard />} />
      <Route path="revenue" element={<WaterfallChart />} />
      <Route path="coaching" element={<CoachingSessions />} />
      <Route path="personalization" element={<PersonalizationRules />} />
      <Route path="plg" element={<ProductUsage />} />
      <Route path="assets" element={<AssetRegistry />} />
      <Route path="trade" element={<PurchaseOrderList />} />
      <Route path="wizard" element={<WizardSteps />} />
      <Route path="residency" element={<RegionSelector />} />
      <Route path="mobile" element={<SessionList />} />
    </Routes>
  </Suspense>
);
