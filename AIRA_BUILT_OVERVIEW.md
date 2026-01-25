# ═══════════════════════════════════════════════════════════════════════════════
#                    AIRA PLATFORM - OVERVIEW OF WHAT'S BUILT
# ═══════════════════════════════════════════════════════════════════════════════

## 📊 ENTITIES CREATED (24 Total)

### Core Transaction Entities (6)

| Entity | File | Purpose |
|--------|------|---------|
| **Transaction** | `transaction.workspace-entity.ts` | Real estate deals (buyer, seller, lease) |
| **TransactionFolder** | `transaction-folder.workspace-entity.ts` | Folder structure with tabs (Overview, Files, Timeline, Checklist, Compliance, Finance) |
| **TransactionDocument** | `transaction-document.workspace-entity.ts` | Documents with e-signature tracking |
| **TimelineDate** | `timeline-date.workspace-entity.ts` | Key dates auto-populated from Texas standards |
| **Checklist** | `checklist.workspace-entity.ts` | Checklist templates (buyer, seller, etc.) |
| **ChecklistItem** | `checklist-item.workspace-entity.ts` | Individual checklist items with signatures |

### Marketing & Communications (4)

| Entity | File | Purpose |
|--------|------|---------|
| **EmailTemplate** | `email-template.workspace-entity.ts` | Email templates with blocks |
| **SmsTemplate** | `sms-template.workspace-entity.ts` | SMS/Text message templates |
| **Newsletter** | `newsletter.workspace-entity.ts` | Newsletter builder with 25+ block types |
| **EmailBlock** | `email-block.workspace-entity.ts` | Reusable HTML email blocks |

### Property & Social Media (2)

| Entity | File | Purpose |
|--------|------|---------|
| **PropertyPost** | `property-post.workspace-entity.ts` | AI-generated social posts (Just Listed, Just Sold, Open House) |
| **Campaign** | `campaign.workspace-entity.ts` | Marketing campaigns with analytics |

### Automation & Notifications (3)

| Entity | File | Purpose |
|--------|------|---------|
| **Automation** | `automation.workspace-entity.ts` | Triggers, conditions, actions |
| **Notification** | `notification.workspace-entity.ts` | In-app, email, SMS, push notifications |
| **Compliance** | `compliance.workspace-entity.ts` | Compliance tracking & audits |

### Team & Collaboration (4)

| Entity | File | Purpose |
|--------|------|---------|
| **Team** | `team.workspace-entity.ts` | Team structure & membership |
| **CustomRole** | `custom-role.workspace-entity.ts` | Role-based permissions |
| **Collaborator** | `collaborator.workspace-entity.ts` | Invite system for sharing folders |
| **Resource** | `resource.workspace-entity.ts` | Shareable files and templates |

### Mortgage & Finance (1)

| Entity | File | Purpose |
|--------|------|---------|
| **Mortgage** | `mortgage.workspace-entity.ts` | Loan applications & processing |

### Integrations (2)

| Entity | File | Purpose |
|--------|------|---------|
| **DriveSync** | `drive-sync.workspace-entity.ts` | Google Drive integration with folder templates |
| **LeadSource** | `lead-source.workspace-entity.ts` | Track lead sources & ROI |

### Pipeline (1)

| Entity | File | Purpose |
|--------|------|---------|
| **PipelineStage** | `pipeline-stage.workspace-entity.ts` | Customizable pipeline stages |

---

## 🔄 AUTOMATION TRIGGERS AVAILABLE

The **Automation** entity supports these trigger types:

| Trigger Type | Description |
|--------------|-------------|
| `record_created` | When any record is created |
| `record_updated` | When any record is updated |
| `field_changed` | When a specific field changes |
| `date_reached` | When a deadline/date is reached |
| `schedule` | On a schedule (daily, weekly, etc.) |
| `manual` | Manually triggered |
| `webhook` | External webhook |

### Action Types

| Action Type | Description |
|-------------|-------------|
| `send_email` | Send email from template |
| `send_sms` | Send SMS/text message |
| `create_task` | Create a new task |
| `update_record` | Update any record |
| `create_note` | Add a note |
| `notify` | Send notification |
| `webhook` | Call external webhook |
| `zapier` | Trigger Zapier automation |

---

## ✅ CHECKLIST SYSTEM

### Checklist Types

| Type | Use Case |
|------|----------|
| `buyer` | Buyer transaction checklist |
| `seller` | Seller transaction checklist |
| `mortgage` | Loan processing checklist |
| `lease` | Lease transaction checklist |
| `compliance` | Compliance audit checklist |
| `custom` | User-defined checklist |

### Checklist Item Features

- ✅ Required items
- ✅ Document slots (upload required)
- ✅ Signature requirements
- ✅ Approval workflows
- ✅ Due dates & reminders
- ✅ Compliance tracking
- ✅ Section grouping
- ✅ Phase organization

---

## 📱 NOTIFICATION SYSTEM

### Notification Types

| Type | Description |
|------|-------------|
| `task_due` | Task deadline approaching |
| `deal_update` | Deal status changed |
| `checklist_complete` | Checklist item completed |
| `document_uploaded` | New document uploaded |
| `mention` | User mentioned |
| `reminder` | Scheduled reminder |
| `system` | System notification |

### Channels

| Channel | Description |
|---------|-------------|
| `in_app` | In-app notification |
| `email` | Email notification |
| `sms` | SMS/Text notification |
| `push` | Push notification |

---

## 📊 COMPLIANCE TRACKING

### Compliance Types

| Type | Description |
|------|-------------|
| `license` | License requirements |
| `disclosure` | Required disclosures |
| `audit` | Audit requirements |
| `training` | Training requirements |
| `policy` | Policy compliance |
| `regulation` | Regulatory compliance |

### Categories

- Legal
- Financial
- Regulatory
- Internal
- State
- Federal

---

## 📧 EMAIL & SMS TEMPLATES

### Template Features

| Feature | Email | SMS |
|---------|-------|-----|
| Merge fields | ✅ | ✅ |
| HTML support | ✅ | ❌ |
| Block editor | ✅ | ❌ |
| A/B testing | ✅ | ❌ |
| Usage tracking | ✅ | ✅ |

### Visibility Options

| Level | Description |
|-------|-------------|
| `private` | Only creator can see |
| `team` | Team members can see |
| `company` | All users can see |
| `default` | Company default template |

---

## 👥 ROLE-BASED ACCESS

### Built-in Role Types

| Role | Workspace | Data Scope |
|------|-----------|------------|
| `agent` | Agent Workspace | Own data |
| `tc` | Transaction Coordinator | All transactions |
| `admin` | Operations Workspace | All data |
| `mortgage` | Mortgage Workspace | Mortgage data |
| `marketing` | Marketing Workspace | Campaigns |
| `finance` | Finance Workspace | Financial data |
| `leadership` | Leadership Workspace | All data (read) |

### Permission Categories

- Data Access (view, edit, delete)
- Feature Access (settings, users, reports)
- Communication (email, SMS)
- AI Access

---

## 📈 PIPELINE STAGES

Each pipeline type (deal, transaction, mortgage, lead) can have custom stages with:

- Custom colors & icons
- Probability percentages
- Automation triggers on enter/exit
- Required fields to advance
- Required documents
- Expected duration

---

## 🗂️ FILE STRUCTURE

```
packages/twenty-server/src/modules/
├── automation/
│   └── standard-objects/automation.workspace-entity.ts
├── campaign/
│   └── standard-objects/campaign.workspace-entity.ts
├── checklist/
│   └── standard-objects/checklist.workspace-entity.ts
├── checklist-item/
│   └── standard-objects/checklist-item.workspace-entity.ts
├── compliance/
│   └── standard-objects/compliance.workspace-entity.ts
├── custom-role/
│   └── standard-objects/custom-role.workspace-entity.ts
├── document/
│   └── standard-objects/document.workspace-entity.ts
├── email-template/
│   └── standard-objects/email-template.workspace-entity.ts
├── lead-source/
│   └── standard-objects/lead-source.workspace-entity.ts
├── mortgage/
│   └── standard-objects/mortgage.workspace-entity.ts
├── notification/
│   └── standard-objects/notification.workspace-entity.ts
├── pipeline-stage/
│   └── standard-objects/pipeline-stage.workspace-entity.ts
├── property/
│   └── standard-objects/property.workspace-entity.ts
├── sms-template/
│   └── standard-objects/sms-template.workspace-entity.ts
├── team/
│   └── standard-objects/team.workspace-entity.ts
└── transaction/
    └── standard-objects/transaction.workspace-entity.ts
```

---

## ⚠️ WHAT'S NEXT

These entities are **data models** (database structure). To complete the app, you still need:

1. **Register entities** in Twenty's constants
2. **Create metadata builders** for field definitions
3. **Run database migrations**
4. **Build frontend components**
5. **Wire up automations**
6. **Build the UI for each workspace**

---

*This is the foundation. The structure is in place.*
