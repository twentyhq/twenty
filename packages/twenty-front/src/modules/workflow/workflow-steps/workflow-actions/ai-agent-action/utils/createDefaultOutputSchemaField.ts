import { type OutputSchemaField } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/OutputSchemaField';
import { v4 } from 'uuid';

export const createDefaultOutputSchemaField = (): OutputSchemaField => ({
  id: v4(),
  name: '',
  description: '',
  type: 'string',
});
