# Advanced Agent Operations Platform - Implementation Guide

## Overview

This document provides a comprehensive guide for transforming Twenty CRM into an Advanced Agent Operations Platform for Real Estate, Mortgage, Transaction Coordinator, and Property Management businesses.

⚠️ **Important**: This is a multi-month development effort requiring a team of developers. This guide breaks it down into manageable phases and provides architectural patterns.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Phase 1: Data Layer](#phase-1-data-layer)
3. [Phase 2: Layout System](#phase-2-layout-system)
4. [Phase 3: Business Type Selector](#phase-3-business-type-selector)
5. [Phase 4: Email System](#phase-4-email-system)
6. [Phase 5: Transaction Management](#phase-5-transaction-management)
7. [Phase 6: Document & E-Signature](#phase-6-document--e-signature)
8. [Phase 7: Resource Center](#phase-7-resource-center)
9. [Phase 8: AI Assistant](#phase-8-ai-assistant)
10. [Phase 9: Automation Engine](#phase-9-automation-engine)
11. [Implementation Roadmap](#implementation-roadmap)

---

## Architecture Overview

Twenty CRM uses a **metadata-driven architecture** where:

- **Workspace Entities** define data models as TypeScript classes
- **Metadata Builders** generate database schemas and GraphQL APIs automatically
- **Standard Objects** are registered in a central constant file
- **Database migrations** are generated automatically from metadata changes

### Technology Stack

- **Backend**: NestJS + TypeORM + PostgreSQL + GraphQL
- **Frontend**: React 18 + TypeScript + Recoil + Emotion
- **Build Tool**: Nx monorepo with Yarn 4
- **Database**: PostgreSQL (primary), Redis (caching)

---

## Phase 1: Data Layer

### 1.1 Understanding Workspace Entities

Workspace entities are the core data models in Twenty. Each entity extends `BaseWorkspaceEntity` which provides standard fields (`id`, `createdAt`, `updatedAt`, `deletedAt`).

**File Location Pattern**:
```
packages/twenty-server/src/modules/[module-name]/standard-objects/[entity-name].workspace-entity.ts
```

**Example**: Property Workspace Entity (already created)

```typescript
// packages/twenty-server/src/modules/property/standard-objects/property.workspace-entity.ts
import {
  type ActorMetadata,
  type AddressMetadata,
  FieldMetadataType,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { type TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const ADDRESS_FIELD_NAME = 'address';
const PROPERTY_TYPE_FIELD_NAME = 'propertyType';

export const SEARCH_FIELDS_FOR_PROPERTY: FieldTypeAndNameMetadata[] = [
  { name: ADDRESS_FIELD_NAME, type: FieldMetadataType.ADDRESS },
  { name: PROPERTY_TYPE_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class PropertyWorkspaceEntity extends BaseWorkspaceEntity {
  address: AddressMetadata;
  propertyType: string | null;
  status: string | null;
  mlsNumber: string | null;
  listPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  yearBuilt: number | null;
  description: string | null;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  company: EntityRelation<CompanyWorkspaceEntity> | null;
  companyId: string | null;
  owner: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  ownerId: string | null;
  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;
  taskTargets: EntityRelation<TaskTargetWorkspaceEntity[]>;
  noteTargets: EntityRelation<NoteTargetWorkspaceEntity[]>;
  attachments: EntityRelation<AttachmentWorkspaceEntity[]>;
  timelineActivities: EntityRelation<TimelineActivityWorkspaceEntity[]>;
  searchVector: string;
}
```

### 1.2 Required Entities to Add

Based on the specification, these entities need to be created following the same pattern:

#### Business Configuration
- **BusinessType** - Business type definitions
- **UserPreferences** - User preferences (layout, business type, theme, notifications)

#### Real Estate Specific
- ✅ **Property** - Property listings (example created above)
- **Mortgage** - Loan/mortgage records
- **Transaction** - Real estate transactions

#### Transaction Management
- **ChecklistTemplate** - Template definitions
- **ChecklistItem** - Individual checklist items
- **Checklist** - Instance of a checklist for a transaction

#### Documents & E-Signature
- **Folder** - Document folder structure
- **Document** - Document records
- **SignatureRequest** - E-signature requests

#### Email & Marketing
- **EmailTemplate** - Email template definitions
- **EmailBlock** - Reusable email blocks
- **EmailCampaign** - Campaign records
- **EmailSequence** - Drip sequence definitions
- **ConnectedEmail** - Connected email accounts (Gmail/Outlook)

#### Automations
- **AutomationRule** - Automation definitions
- **ActionPlan** - Multi-step action plans

#### Resources
- **Resource** - Resource library items
- **ResourceCategory** - Resource categories

#### AI Assistant
- **ICalebConversation** - AI chat conversations
- **ICalebSettings** - AI configuration per user

### 1.3 Registering New Entities

After creating a workspace entity, it must be registered in multiple places:

#### Step 1: Add Universal Identifier

**File**: `packages/twenty-shared/src/metadata/standard-object-ids.ts`

```typescript
export const STANDARD_OBJECT_IDS = {
  // ... existing objects
  property: '20202020-prop-4001-8001-property00001',
  mortgage: '20202020-mort-4001-8001-mortgage00001',
  transaction: '20202020-tran-4001-8001-transact00001',
  // ... add more
} as const;
```

⚠️ **Important**: Generate unique UUIDs for each entity. These are permanent identifiers.

#### Step 2: Define Field IDs

**File**: `packages/twenty-server/src/engine/workspace-manager/workspace-migration/constant/standard-field-ids.ts`

```typescript
export const PROPERTY_STANDARD_FIELD_IDS = {
  address: '20202020-f001-4001-8001-prop-address01',
  propertyType: '20202020-f002-4001-8001-prop-type0001',
  status: '20202020-f003-4001-8001-prop-status01',
  mlsNumber: '20202020-f004-4001-8001-prop-mls00001',
  listPrice: '20202020-f005-4001-8001-prop-price001',
  bedrooms: '20202020-f006-4001-8001-prop-bedroom',
  bathrooms: '20202020-f007-4001-8001-prop-bathrm1',
  squareFeet: '20202020-f008-4001-8001-prop-sqft001',
  yearBuilt: '20202020-f009-4001-8001-prop-year001',
  description: '20202020-f010-4001-8001-prop-desc001',
  position: '20202020-f011-4001-8001-prop-pos0001',
  createdBy: '20202020-f012-4001-8001-prop-crtby01',
  updatedBy: '20202020-f013-4001-8001-prop-updby01',
  company: '20202020-f014-4001-8001-prop-company',
  companyId: '20202020-f015-4001-8001-prop-compid1',
  owner: '20202020-f016-4001-8001-prop-owner01',
  ownerId: '20202020-f017-4001-8001-prop-ownerid',
  favorites: '20202020-f018-4001-8001-prop-favs001',
  taskTargets: '20202020-f019-4001-8001-prop-tasks1',
  noteTargets: '20202020-f020-4001-8001-prop-notes1',
  attachments: '20202020-f021-4001-8001-prop-attach',
  timelineActivities: '20202020-f022-4001-8001-prop-time01',
  searchVector: '20202020-f023-4001-8001-prop-search',
};
```

#### Step 3: Register in STANDARD_OBJECTS

**File**: `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant.ts`

Add an entry to the `STANDARD_OBJECTS` constant (around line 36):

```typescript
export const STANDARD_OBJECTS = {
  // ... existing objects
  property: {
    universalIdentifier: STANDARD_OBJECT_IDS.property,
    fields: {
      id: { universalIdentifier: '20202020-prop-id01-8001-property00001' },
      createdAt: { universalIdentifier: '20202020-prop-crAt-8001-property00001' },
      updatedAt: { universalIdentifier: '20202020-prop-upAt-8001-property00001' },
      deletedAt: { universalIdentifier: '20202020-prop-dlAt-8001-property00001' },
      address: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.address },
      propertyType: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.propertyType },
      status: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.status },
      mlsNumber: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.mlsNumber },
      listPrice: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.listPrice },
      bedrooms: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.bedrooms },
      bathrooms: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.bathrooms },
      squareFeet: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.squareFeet },
      yearBuilt: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.yearBuilt },
      description: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.description },
      position: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.position },
      createdBy: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.createdBy },
      updatedBy: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.updatedBy },
      company: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.company },
      companyId: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.companyId },
      owner: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.owner },
      ownerId: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.ownerId },
      favorites: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.favorites },
      taskTargets: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.taskTargets },
      noteTargets: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.noteTargets },
      attachments: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.attachments },
      timelineActivities: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.timelineActivities },
      searchVector: { universalIdentifier: PROPERTY_STANDARD_FIELD_IDS.searchVector },
    },
    indexes: {
      companyIdIndex: { universalIdentifier: '20202020-idx1-4001-8001-prop-comp01' },
      ownerIdIndex: { universalIdentifier: '20202020-idx2-4001-8001-prop-owner1' },
    },
  },
};
```

#### Step 4: Create Metadata Builder

**File**: `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/object-metadata/create-standard-flat-object-metadata.util.ts`

Add to `STANDARD_FLAT_OBJECT_METADATA_BUILDERS_BY_OBJECT_NAME`:

```typescript
export const STANDARD_FLAT_OBJECT_METADATA_BUILDERS_BY_OBJECT_NAME = {
  // ... existing builders
  property: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'property'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'property',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.property.universalIdentifier,
        nameSingular: 'property',
        namePlural: 'properties',
        labelSingular: 'Property',
        labelPlural: 'Properties',
        description: 'A real estate property',
        icon: 'IconHome',
        isSearchable: true,
        labelIdentifierFieldMetadataName: 'address',
        imageIdentifierFieldMetadataName: null,
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
};
```

#### Step 5: Create Field Metadata Computer

**File**: `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/compute-property-standard-flat-field-metadata.util.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import {
  createStandardFieldFlatMetadata,
  type CreateStandardFieldArgs,
} from './create-standard-field-flat-metadata.util';
import {
  createStandardRelationFieldFlatMetadata,
  type CreateStandardRelationFieldArgs,
} from './create-standard-relation-field-flat-metadata.util';

export const computePropertyStandardFlatFieldMetadata = (
  args: Omit<CreateStandardFieldArgs, 'context'> &
    Omit<CreateStandardRelationFieldArgs, 'context'>,
) => [
  createStandardFieldFlatMetadata({
    ...args,
    context: {
      universalIdentifier: STANDARD_OBJECTS.property.fields.address.universalIdentifier,
      name: 'address',
      label: 'Address',
      description: 'Property address',
      icon: 'IconMap',
      type: FieldMetadataType.ADDRESS,
      defaultValue: null,
    },
  }),
  createStandardFieldFlatMetadata({
    ...args,
    context: {
      universalIdentifier: STANDARD_OBJECTS.property.fields.propertyType.universalIdentifier,
      name: 'propertyType',
      label: 'Property Type',
      description: 'Type of property (Single Family, Condo, etc.)',
      icon: 'IconBuildingSkyscraper',
      type: FieldMetadataType.TEXT,
      defaultValue: null,
    },
  }),
  // ... add all other fields
  createStandardRelationFieldFlatMetadata({
    ...args,
    context: {
      universalIdentifier: STANDARD_OBJECTS.property.fields.company.universalIdentifier,
      relationObjectName: 'company',
      relationFieldName: 'properties',
      name: 'company',
      label: 'Company',
      description: 'Property company',
      icon: 'IconBuildingSkyscraper',
      isNullable: true,
    },
  }),
  // ... add other relations
];
```

#### Step 6: Create Index Metadata Computer

Follow the pattern in `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/index/compute-company-standard-flat-index-metadata.util.ts`

#### Step 7: Create View Metadata

Follow the pattern in `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-company-views.util.ts` to create default views for the Property object.

### 1.4 Syncing Metadata to Database

Once all metadata is defined, Twenty automatically syncs it to the database:

```bash
# Reset database and sync metadata
npx nx database:reset twenty-server

# Or sync metadata for existing workspace
npx nx run twenty-server:command workspace:sync-metadata
```

This will:
1. Compare existing metadata with new metadata
2. Generate database migrations
3. Create/update tables, columns, indexes
4. Update workspace cache

---

## Phase 2: Layout System

### 2.1 Create UserPreferences Entity

Create `UserPreferencesWorkspaceEntity` to store user preferences including layout choice.

### 2.2 Layout Provider Context

**File**: `packages/twenty-front/src/modules/app/contexts/LayoutContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';

type LayoutType = 'side' | 'top';

type LayoutContextType = {
  layout: LayoutType;
  setLayout: (layout: LayoutType) => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [layout, setLayoutState] = useState<LayoutType>('side');

  useEffect(() => {
    // Load from user preferences
    const stored = localStorage.getItem('layoutPreference') as LayoutType;
    if (stored) {
      setLayoutState(stored);
    }
  }, []);

  const setLayout = (newLayout: LayoutType) => {
    setLayoutState(newLayout);
    localStorage.setItem('layoutPreference', newLayout);
    // TODO: Update user preferences in database
  };

  return (
    <LayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider');
  }
  return context;
};
```

### 2.3 Create Top Navigation Layout

**File**: `packages/twenty-front/src/modules/page-layout/components/TopNavLayout.tsx`

```typescript
import styled from '@emotion/styled';
import { useNavigate, Outlet } from 'react-router-dom';

const TopNavContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const NavBar = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(2, 4)};
  background: ${({ theme }) => theme.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const Logo = styled.div`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  flex: 1;
`;

const NavLink = styled.button<{ isActive?: boolean }>`
  padding: ${({ theme }) => theme.spacing(2, 3)};
  background: ${({ isActive, theme }) =>
    isActive ? theme.background.transparent.light : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow: auto;
`;

export const TopNavLayout = () => {
  const navigate = useNavigate();

  return (
    <TopNavContainer>
      <NavBar>
        <Logo>Twenty</Logo>
        <NavLinks>
          <NavLink onClick={() => navigate('/objects/companies')}>
            Companies
          </NavLink>
          <NavLink onClick={() => navigate('/objects/people')}>
            People
          </NavLink>
          <NavLink onClick={() => navigate('/objects/opportunities')}>
            Opportunities
          </NavLink>
          <NavLink onClick={() => navigate('/objects/properties')}>
            Properties
          </NavLink>
          <NavLink onClick={() => navigate('/tasks')}>
            Tasks
          </NavLink>
          <NavLink onClick={() => navigate('/settings/profile')}>
            Settings
          </NavLink>
        </NavLinks>
      </NavBar>
      <ContentArea>
        <Outlet />
      </ContentArea>
    </TopNavContainer>
  );
};
```

### 2.4 Layout Toggle Component

Add toggle in Settings page to switch between layouts.

---

## Phase 3: Business Type Selector

### 3.1 Business Type Entity

Create `BusinessTypeWorkspaceEntity` with fields:
- `name`: string
- `modules`: JSON array of enabled modules
- `defaultWorkflows`: JSON array
- `terminology`: JSON object for customized labels

### 3.2 Onboarding Flow

**File**: `packages/twenty-front/src/pages/onboarding/BusinessTypeSelector.tsx`

```typescript
import { useState } from 'react';
import styled from '@emotion/styled';
import { IconBuilding, IconHome, IconChecklist, IconBriefcase } from '@tabler/icons-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing(8)};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xxl};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing(4)};
  max-width: 800px;
`;

const Card = styled.button<{ isSelected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(6)};
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.background.transparent.light : theme.background.primary};
  border: 2px solid
    ${({ isSelected, theme }) =>
      isSelected ? theme.color.blue : theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.color.blue};
    transform: translateY(-2px);
  }
`;

const CardIcon = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => theme.color.blue};
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.lg};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const CardDescription = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

type BusinessType = 'real-estate' | 'mortgage' | 'transaction-coordinator' | 'property-management';

export const BusinessTypeSelector = () => {
  const [selected, setSelected] = useState<BusinessType | null>(null);

  const businessTypes = [
    {
      id: 'real-estate' as BusinessType,
      icon: <IconHome size={48} />,
      title: 'Real Estate Agent',
      description: 'Full CRM, transactions, marketing automation',
    },
    {
      id: 'mortgage' as BusinessType,
      icon: <IconBriefcase size={48} />,
      title: 'Mortgage/Loan Officer',
      description: 'Loan pipeline, documents, compliance tracking',
    },
    {
      id: 'transaction-coordinator' as BusinessType,
      icon: <IconChecklist size={48} />,
      title: 'Transaction Coordinator',
      description: 'Checklists, documents, deadlines, timelines',
    },
    {
      id: 'property-management' as BusinessType,
      icon: <IconBuilding size={48} />,
      title: 'Property Management',
      description: 'Properties, tenants, leases, maintenance',
    },
  ];

  const handleContinue = () => {
    if (selected) {
      // Save to user preferences
      // TODO: Implement GraphQL mutation
      console.log('Selected business type:', selected);
    }
  };

  return (
    <Container>
      <Title>What describes your business best?</Title>
      <Subtitle>
        This helps us customize your experience with relevant features and terminology
      </Subtitle>
      <Grid>
        {businessTypes.map((type) => (
          <Card
            key={type.id}
            isSelected={selected === type.id}
            onClick={() => setSelected(type.id)}
          >
            <CardIcon>{type.icon}</CardIcon>
            <CardTitle>{type.title}</CardTitle>
            <CardDescription>{type.description}</CardDescription>
          </Card>
        ))}
      </Grid>
      {selected && (
        <button onClick={handleContinue} style={{ marginTop: '2rem' }}>
          Continue
        </button>
      )}
    </Container>
  );
};
```

---

## Phase 4: Email System

### 4.1 Email Block Components

Create reusable email block components. Each block should:
- Be configurable
- Render to HTML for email clients
- Support responsive design
- Have a visual editor

**Example Header Block**:

```typescript
// packages/twenty-front/src/modules/email/components/blocks/HeaderBlock.tsx
import styled from '@emotion/styled';

type HeaderBlockProps = {
  logoUrl?: string;
  links?: Array<{ label: string; url: string }>;
  backgroundColor?: string;
};

export const HeaderBlock = ({
  logoUrl,
  links = [],
  backgroundColor = '#ffffff',
}: HeaderBlockProps) => {
  return (
    <div style={{ backgroundColor, padding: '20px' }}>
      <table width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td>
            {logoUrl && <img src={logoUrl} alt="Logo" height="40" />}
          </td>
          <td align="right">
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                style={{
                  color: '#333',
                  textDecoration: 'none',
                  marginLeft: '20px',
                }}
              >
                {link.label}
              </a>
            ))}
          </td>
        </tr>
      </table>
    </div>
  );
};
```

### 4.2 Email Builder

Create a drag-and-drop email builder using a library like `react-dnd` or `dnd-kit`.

### 4.3 Email Templates

Store email templates in `EmailTemplateWorkspaceEntity` with:
- Template name
- Subject line
- JSON representation of blocks
- Merge field mappings

---

## Phase 5: Transaction Management

### 5.1 Checklist Templates

Pre-built checklist templates stored as JSON:

```typescript
const BUYER_TRANSACTION_CHECKLIST = {
  name: 'Buyer Transaction',
  items: [
    { title: 'Pre-approval letter received', order: 1, daysFromStart: 0 },
    { title: 'Buyer agency agreement signed', order: 2, daysFromStart: 0 },
    { title: 'Property search criteria confirmed', order: 3, daysFromStart: 0 },
    { title: 'Offer prepared', order: 4, daysFromStart: 7 },
    // ... more items
  ],
};
```

### 5.2 Timeline Component

Create a visual timeline component showing transaction progress:

```typescript
// packages/twenty-front/src/modules/transactions/components/TransactionTimeline.tsx
```

---

## Phase 6: Document & E-Signature

### 6.1 Document Structure

Implement folder hierarchy with permissions.

### 6.2 E-Signature Component

Create signature capture using HTML canvas:

```typescript
// packages/twenty-front/src/modules/documents/components/SignatureCapture.tsx
import { useRef, useState } from 'react';

export const SignatureCapture = ({ onSave }: { onSave: (dataUrl: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ border: '1px solid #ccc', cursor: 'crosshair' }}
      />
      <button onClick={save}>Save Signature</button>
    </div>
  );
};
```

---

## Phase 7: Resource Center

### 7.1 Resource Entity

Create `ResourceWorkspaceEntity` with:
- Name, type, url/file
- Category
- Upload date, uploader
- Download count
- Shared with (permissions)

### 7.2 Upload Component

Use Twenty's existing file upload infrastructure.

---

## Phase 8: AI Assistant (iCaleb)

### 8.1 Chat Interface

Create a floating chat widget using existing Twenty UI components.

### 8.2 AI Integration

Options for AI backend:
1. **OpenAI API** - User provides API key
2. **Anthropic Claude** - User provides API key  
3. **Local LLM** - Ollama or similar
4. **Azure OpenAI** - Enterprise option

### 8.3 Context Awareness

Pass relevant context to AI:
- Current page/object
- Recent activity
- Related records

---

## Phase 9: Automation Engine

### 9.1 Workflow Builder

Use a visual workflow builder library like:
- `react-flow` - Most popular
- `reactflow/reactflow`
- Custom solution

### 9.2 Automation Execution

Leverage Twenty's existing workflow engine in:
`packages/twenty-server/src/modules/workflow/`

---

## Implementation Roadmap

### Timeline Estimate

| Phase | Estimated Time | Priority |
|-------|---------------|----------|
| Phase 1: Data Layer (5 entities) | 2-3 weeks | 🔴 Critical |
| Phase 2: Layout System | 1 week | 🟡 High |
| Phase 3: Business Type Selector | 1 week | 🟡 High |
| Phase 4: Email System | 3-4 weeks | 🟠 Medium |
| Phase 5: Transaction Management | 2-3 weeks | 🟠 Medium |
| Phase 6: Documents & E-Signature | 2-3 weeks | 🟠 Medium |
| Phase 7: Resource Center | 1 week | 🟢 Low |
| Phase 8: AI Assistant | 2-3 weeks | 🟢 Low |
| Phase 9: Automation Engine | 2-3 weeks | 🟢 Low |
| **Total** | **16-24 weeks** | |

### Team Requirements

- **Backend Developers**: 2-3 (NestJS, TypeORM, GraphQL)
- **Frontend Developers**: 2-3 (React, TypeScript, Recoil)
- **UI/UX Designer**: 1 (Design system, user flows)
- **QA Engineer**: 1 (Testing, automation)
- **Project Manager**: 1 (Coordination, planning)

### Development Approach

1. **Agile Sprints**: 2-week sprints
2. **Incremental Delivery**: Ship Phase 1-3 first, then iterate
3. **User Feedback**: Beta testing after each phase
4. **Documentation**: Continuous documentation updates

---

## Testing Strategy

### Backend Testing
```bash
# Unit tests
npx nx test twenty-server

# Integration tests
npx nx run twenty-server:test:integration:with-db-reset
```

### Frontend Testing
```bash
# Unit tests
npx nx test twenty-front

# Storybook visual testing
npx nx storybook:test twenty-front
```

### E2E Testing
```bash
# Playwright tests
npx nx e2e twenty-e2e-testing
```

---

## Deployment Considerations

### Infrastructure
- PostgreSQL 13+ (primary database)
- Redis (caching, sessions)
- S3-compatible storage (documents, attachments)
- Email SMTP server (campaigns)

### Scaling
- Horizontal scaling with load balancer
- Database read replicas
- CDN for static assets
- Queue workers for background jobs

---

## Security Considerations

### Data Protection
- Encrypt sensitive data at rest
- SSL/TLS for data in transit
- Regular security audits
- GDPR/CCPA compliance

### Access Control
- Role-based permissions
- Field-level security
- Audit logging
- Session management

---

## Conclusion

This transformation is a significant undertaking that will take a dedicated team several months to complete. However, the result will be a powerful, customizable platform for real estate and mortgage professionals.

**Key Success Factors**:
1. Start with core data layer
2. Iterate incrementally
3. Gather user feedback early
4. Maintain code quality
5. Document everything
6. Plan for scalability

For questions or assistance, refer to the [Twenty documentation](https://docs.twenty.com/) or join the [Twenty Discord community](https://discord.gg/twenty).
