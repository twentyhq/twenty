import { type OutputSchemaField } from '@/ai/types/OutputSchemaField';
import { v4 } from 'uuid';

export const createDefaultOutputSchemaField = (): OutputSchemaField => ({
  id: v4(),
  name: '',
  description: '',
  type: 'string',
});
