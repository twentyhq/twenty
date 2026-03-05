/* @license Enterprise */

export type BillingExecutionType =
  | 'workflow_execution'
  | 'code_execution'
  | 'ai_token'
  | 'app_invocation';

export type BillingDimensions = {
  execution_type: BillingExecutionType;
  resource_id?: string | null;
  execution_context_1?: string | null;
};
