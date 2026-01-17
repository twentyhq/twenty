export type AILayerCriticality = 'info' | 'warning' | 'error' | 'critical';

export type AILayerTriggerType = 'webhook' | 'schedule' | 'manual' | 'event';

export type AILayerErrorReport = {
  // Required fields
  workspace_id: string;
  profile_id: string;
  error_type: string;
  error_message: string;
  criticality: AILayerCriticality;

  // Optional context
  workflow_id?: string;
  workflow_name?: string;
  execution_id?: string;
  failed_node?: string;
  trigger_type?: AILayerTriggerType;
  trigger_data?: Record<string, unknown>;
  stack_trace?: string;
  additional_context?: Record<string, unknown>;
};

export type AILayerErrorResponse = {
  success: boolean;
  recorded_at?: string;
  escalation_level?: AILayerCriticality;
  error?: string;
  _meta?: {
    duration_ms: number;
    workspace_id: string;
    profile_id: string;
  };
};
