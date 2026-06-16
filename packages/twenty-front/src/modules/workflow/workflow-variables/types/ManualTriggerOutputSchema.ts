import { type RecordNode } from '@/workflow/workflow-variables/types/RecordNode';
import { type Node } from 'twenty-shared/workflow';

export type ManualTriggerOutputSchema = {
  payload?: RecordNode | Node;
  metadata: Node;
};
