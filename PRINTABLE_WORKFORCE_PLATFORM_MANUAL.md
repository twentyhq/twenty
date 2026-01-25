# ═══════════════════════════════════════════════════════════════════════════════
#           WORKFORCE OPERATIONS PLATFORM - PRINTABLE MANUAL
#                    ONE PLATFORM • MANY WORKSPACES
# ═══════════════════════════════════════════════════════════════════════════════

**Document Version**: 1.0
**Date**: January 25, 2026
**Status**: PLANNING PHASE (NOT YET BUILT)

---

# SECTION 1: PLATFORM ARCHITECTURE

## 1.1 Core Concept

```
ONE SYSTEM (Single URL Login)
└── Multiple Role-Based Workspaces
    ├── Agent Workspace
    ├── Transaction Coordinator Workspace
    ├── Mortgage Workspace
    ├── Property Management Workspace
    ├── Marketing Workspace
    ├── Operations / Admin Workspace
    ├── Finance / Accounting Workspace
    └── Leadership Workspace
```

**Key Principle**: Data is shared. Experience is not.

- Everyone logs into the SAME URL
- The system reshapes itself based on ROLE
- Same record, different lens per role

---

# SECTION 2: WORKSPACE DEFINITIONS

## 2.1 Agent Workspace (Real Estate)

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Generate revenue |
| **Sees** | My leads, My deals, My tasks, My deadlines, My commissions |
| **Does NOT See** | Company settings, Other agents' data, Accounting, System automations |
| **Primary Views** | Deal pipeline (Kanban), Today's tasks, Upcoming closings |

### Agent Permissions
- ✅ Sees only their deals
- ✅ Sees next 7 days of deadlines
- ✅ Can upload docs, add notes, send emails
- ✅ Can share transactions, add contributor, invite, assign roles
- ❌ Cannot delete transactions not owned
- ❌ Cannot access other agents' data

---

## 2.2 Transaction Coordinator Workspace

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Move deals safely to closing |
| **Sees** | All transactions, Checklists, Missing documents, Deadlines, Shared notes |
| **Does NOT See** | Marketing campaigns, Lead generation, Commissions |
| **Primary Views** | Transaction list (status-based), Checklist progress, Document folders |

### TC Permissions
- ✅ Sees all transactions
- ✅ Sees checklist progress
- ✅ Controls document folders
- ❌ Cannot edit commissions

---

## 2.3 Mortgage / Lending Workspace

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Loan progress + compliance |
| **Sees** | Loan files, Required documents, Conditions, Closing timelines, Communication logs |
| **Does NOT See** | Agent pipelines, Marketing campaigns |
| **Primary Views** | Loan pipeline, Condition checklist, Borrower document status |

---

## 2.4 Property Management Workspace

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Manage assets, not sales |
| **Sees** | Properties, Units, Tenants, Maintenance requests, Vendors |
| **Does NOT See** | Deals, Offers, Marketing emails |
| **Primary Views** | Property list, Maintenance board, Open tickets |

---

## 2.5 Marketing Workspace

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Generate & nurture demand |
| **Sees** | Campaigns, Email templates, Text templates, Lead sources, Performance analytics |
| **Does NOT See** | Transaction checklists, Internal notes |
| **Primary Views** | Email builder (blocks + HTML), Campaign scheduler, Lead source dashboards |

---

## 2.6 Operations / Admin Workspace

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Keep the company running |
| **Sees** | Users & roles, Automations, System health, Audit logs |
| **Does NOT See** | Agent pipelines (unless needed) |
| **Primary Views** | User management, Automation rules, Error alerts |

### Admin Permissions
- ✅ Sees company-wide metrics
- ✅ Controls permissions
- ✅ Access to audit logs
- ✅ Full system configuration

---

## 2.7 Finance / Accounting Workspace

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Money, compliance, reporting |
| **Sees** | Commissions, Fees, Vendor payments, Closing statements |
| **Does NOT See** | Daily task noise, Marketing campaigns |
| **Primary Views** | Financial records, Payout schedules, Reports |

---

## 2.8 Leadership / Owner Workspace

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Decision-making, not execution |
| **Sees** | KPIs, Bottlenecks, Risk alerts, Team performance |
| **Does NOT See** | Daily task noise |
| **Primary Views** | Company dashboard, Exception reports, Forecasts |

---

# SECTION 3: TEAM STRUCTURE

## 3.1 Multi-Team Architecture

```
Company Platform (One System)
├── Team A (Agent/Partner owns)
│   ├── Agent (Team Owner)
│   ├── Assistants
│   ├── Transaction Coordinators
│   ├── Marketing Support
│   └── Custom Roles
├── Team B
│   └── ...
└── Team C
    └── ...
```

### Team Rules
- Each Agent/Partner owns a Team
- Data is scoped to Teams (prevents cross-team interference)
- Leadership has cross-team visibility (if granted)
- Users can belong to multiple teams (with context switching)
- Automations execute within Team context

---

# SECTION 4: EMAIL & TEMPLATE SYSTEM

## 4.1 Template Hierarchy

```
Email Templates
├── Company Default (Admin creates, read-only for users)
├── Team Templates (shared within team)
├── All Shared Templates (shared to everyone)
└── Personal Templates (private to user)
```

## 4.2 Template Sharing Rules

| Template Type | Created By | Visibility |
|---------------|------------|------------|
| Company Default | Admin | Everyone (read-only) |
| Team Shared | Any team member | Team members only |
| All Shared | Any user | Everyone |
| Private | Any user | Creator only |

## 4.3 Email Builder Requirements
- ✅ Drag & drop block editor
- ✅ HTML output (not proprietary)
- ✅ Saved templates by role
- ✅ Audit trail (who sent what, when)

---

# SECTION 5: REAL-TIME COLLABORATION RULES

## 5.1 Real-Time Updates

| Action | Type |
|--------|------|
| Deal status changes | Real-time |
| Task completion | Real-time |
| Notes added | Real-time |
| Checklist progress | Real-time |

## 5.2 Notification Triggers

| Trigger | Notification |
|---------|--------------|
| Overdue tasks | ✅ Yes |
| Stage changes | ✅ Yes |
| Missing documents | ✅ Yes |

## 5.3 NOT Real-Time (Async)

- Email drafts
- Template editing
- Bulk imports

---

# SECTION 6: DATA SAFETY & RECOVERY

## 6.1 Deletion Policy

| Rule | Setting |
|------|---------|
| Delete type | Soft delete (all critical entities) |
| Recovery window | 7-30 days |
| Document versioning | Yes |
| Admin restore | Yes |
| Backup verification | Weekly |

---

# SECTION 7: AI GUARDRAILS

## 7.1 AI CAN Do

- ✅ Suggest next steps
- ✅ Draft emails
- ✅ Summarize notes
- ✅ Flag risks

## 7.2 AI CANNOT Do

- ❌ Change data automatically
- ❌ Send emails without approval
- ❌ Delete records
- ❌ Change permissions

## 7.3 AI Behavior Per Workspace

| Workspace | AI Focus |
|-----------|----------|
| Agent | Follow-ups, deal health |
| TC | Missing items, risks |
| Marketing | Subject lines, copy |
| Leadership | Summaries, insights |

---

# SECTION 8: NON-TECHNICAL REQUIREMENTS

| Requirement | Standard |
|-------------|----------|
| Code visibility | None (no employee sees code) |
| Hosting configuration | None (no employee configures) |
| UI changes | Permission-based |
| Training time | ≤ 2 hours per role |

---

# SECTION 9: PHASE 0 - GO-LIVE CHECKLIST

Before going live, complete:

- [ ] Domain setup
- [ ] Login configured (Google Workspace)
- [ ] Role seeding complete
- [ ] Sample data loaded
- [ ] Initial templates created
- [ ] Rollout plan approved
- [ ] User training scheduled

---

# SECTION 10: SETTINGS & CUSTOMIZATION

## 10.1 Theme Settings

| Setting | Description |
|---------|-------------|
| Theme color | Changes ALL UI colors (including sidebars) |
| Logo | Custom company logo |
| Favicon | Custom browser icon |

## 10.2 Field Customization

Users should be able to:
- ✅ Add any label/field
- ✅ Choose field type (date, lookup, required, etc.)
- ✅ Configure field effects
- ✅ Add to Kanban boards
- ✅ Add to checklists
- ✅ Add to compliance flows

## 10.3 Menu Customization

- ✅ Show/hide menu items
- ✅ Add custom menu items
- ✅ Configure what each menu page shows
- ✅ Per-role menu configuration

## 10.4 Kanban Board Customization

- ✅ All boards on overview home are draggable
- ✅ Drag and drop card arrangement
- ✅ Customizable columns per board
- ✅ Per-role board views

---

# SECTION 11: SIDEBAR STRUCTURE

## 11.1 Navigation Rules

| Element | Location |
|---------|----------|
| Shortcuts | HOME page ONLY |
| Each menu item | Complete full workspace |

## 11.2 Per-Role Sidebar

Each role sees a DIFFERENT sidebar:
- Agent: Deals, Tasks, Leads, Closings
- TC: Transactions, Checklists, Documents
- Marketing: Campaigns, Templates, Analytics
- etc.

---

# SECTION 12: IMPLEMENTATION STATUS

## ⚠️ CURRENT STATUS: PLANNING ONLY

| Component | Status |
|-----------|--------|
| Documentation | ✅ Complete |
| Property Entity (example) | ✅ Created |
| Role-based workspaces | ❌ NOT BUILT |
| Email builder | ❌ NOT BUILT |
| Text/SMS integration | ❌ NOT BUILT |
| Working automations | ❌ NOT BUILT |
| AI integrations | ❌ NOT BUILT |
| Team management | ❌ NOT BUILT |

## 12.1 Estimated Build Timeline

| Phase | Duration |
|-------|----------|
| Phase 1: Data Layer | 2-3 weeks |
| Phase 2: UI/Layout | 1 week |
| Phase 3: Business Type | 1 week |
| Phase 4: Email System | 3-4 weeks |
| Phase 5: Transactions | 2-3 weeks |
| Phase 6: Documents | 2-3 weeks |
| Phase 7: Resources | 1 week |
| Phase 8: AI Assistant | 2-3 weeks |
| Phase 9: Automations | 2-3 weeks |
| **TOTAL** | **16-24 weeks** |

## 12.2 Team Requirements

- 6-8 professionals needed
- Full-time dedicated team

---

# ═══════════════════════════════════════════════════════════════════════════════
#                              END OF MANUAL
# ═══════════════════════════════════════════════════════════════════════════════

**IMPORTANT**: This manual describes the PLANNED system.
The actual platform is NOT YET BUILT.

To make this repository private:
1. Go to GitHub repository settings
2. Scroll to "Danger Zone"
3. Click "Change visibility"
4. Select "Make private"

Note: Twenty is open-source (Apache 2.0 license). Your customizations can be private,
but the base code remains open-source.

---

*Printed: January 25, 2026*
*Document: PRINTABLE_WORKFORCE_PLATFORM_MANUAL.md*
