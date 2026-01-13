# Journey-CRM Query Patterns

> **Agent:** journey-crm-specialist
> **Purpose:** SQL and RPC patterns for CRM-Journey integration

---

## Journey Template Queries

### QR-001: Get Active CRM Journey Templates
```sql
SELECT code, name, version, states, transitions
FROM journey_templates
WHERE is_active = true
  AND code LIKE '%crm%' OR code LIKE '%onboarding%' OR code LIKE '%customer%'
ORDER BY updated_at DESC;
```

### QR-002: List Journeys by Entity Type
```sql
SELECT
  ji.id,
  ji.template_code,
  ji.current_state,
  ji.status,
  ji.context_data->>'name' as entity_name,
  ji.started_at
FROM journey_instances ji
WHERE ji.entity_type = $1  -- 'employee', 'customer', 'lead'
  AND ji.status = 'active'
ORDER BY ji.started_at DESC;
```

---

## RPC Patterns

### RPC-001: Start Employee Onboarding Journey
```typescript
await supabase.rpc('journey_start', {
  p_template_code: 'employee_onboarding',
  p_profile_id: profileId,
  p_entity_type: 'employee',
  p_entity_id: employeeId,
  p_context_data: {
    name: employee.name,
    email: employee.email,
    department: employee.department,
    start_date: employee.start_date,
    crm_contact_id: crmContactId  // Link to CRM
  },
  p_created_by: 'crm_sync'
});
```

### RPC-002: Transition with CRM Context
```typescript
await supabase.rpc('journey_transition', {
  p_journey_id: journeyId,
  p_to_state: 'training',
  p_event_name: 'documents_complete',
  p_payload: {
    documents_verified: true,
    crm_stage: 'training',
    verified_by: managerId
  },
  p_triggered_by: 'crm_webhook'
});
```

### RPC-003: Update CRM Action Status
```typescript
// When CRM confirms update
await supabase.rpc('journey_action_update', {
  p_journey_id: journeyId,
  p_action_name: 'update_crm_stage',
  p_status: 'completed',
  p_result: {
    crm_response: response,
    crm_record_id: recordId,
    updated_at: new Date().toISOString()
  }
});
```

---

## Sync Queries

### QR-003: Pending CRM Objectives
```sql
SELECT
  o.id,
  o.journey_instance_id,
  o.action_name,
  o.action_type,
  o.scheduled_for,
  o.attempts,
  ji.context_data->>'crm_contact_id' as crm_contact_id
FROM objectives o
JOIN journey_instances ji ON o.journey_instance_id = ji.id
WHERE o.status = 'pending'
  AND o.action_type IN ('crm_update', 'crm_create', 'crm_sync')
  AND o.scheduled_for <= NOW()
ORDER BY o.scheduled_for ASC;
```

### QR-004: Journey-CRM Sync Status
```sql
SELECT
  ji.id as journey_id,
  ji.template_code,
  ji.current_state,
  ji.context_data->>'crm_contact_id' as crm_id,
  ji.context_data->>'crm_last_sync' as last_sync,
  ji.updated_at as journey_updated
FROM journey_instances ji
WHERE ji.entity_type IN ('employee', 'customer')
  AND ji.status = 'active'
  AND (
    ji.context_data->>'crm_last_sync' IS NULL
    OR (ji.context_data->>'crm_last_sync')::timestamptz < ji.updated_at - interval '1 hour'
  );
```

---

## Write Patterns

### QW-001: Log CRM Sync Event
```sql
INSERT INTO crm_sync_log (
  journey_id,
  crm_system,
  crm_record_id,
  sync_type,
  direction,
  payload,
  status,
  created_at
) VALUES (
  $1,           -- journey_id
  'twenty',     -- crm_system
  $2,           -- crm_record_id
  'stage_update',
  'journey_to_crm',
  $3::jsonb,    -- payload
  'success',
  NOW()
);
```
