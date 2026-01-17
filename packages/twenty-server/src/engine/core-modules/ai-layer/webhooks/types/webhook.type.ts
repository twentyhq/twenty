/**
 * Webhook types for AI Layer integration
 *
 * Aligns with SUCCESS AGENT identity model:
 * User → Profile → Contact → Lead
 */

export type ContactEventType = 'stage_changed' | 'created' | 'updated' | 'deleted';

export type CrmStage =
  | 'LEAD'
  | 'QUALIFIED'
  | 'CUSTOMER'
  | 'DOCUMENTS'
  | 'TRAINING'
  | 'ACTIVE'
  | 'CHURNED';

export type ContactWebhookPayload = {
  workspace_id: string;
  profile_id: string;
  contact_id: string;
  event_type: ContactEventType;
  crm_stage: CrmStage;
  relation_score?: number;
  source: 'twenty_crm';
  timestamp: string;
  metadata?: {
    previous_stage?: CrmStage;
    updated_fields?: string[];
    triggered_by?: string;
  };
};

export type WebhookResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export type JourneyTriggerPayload = {
  workspace_id: string;
  profile_id: string;
  contact_id: string;
  journey_template_id?: string;
  trigger_event: string;
  context?: Record<string, unknown>;
};
