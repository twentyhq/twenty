import { type OutputSchemaField } from '@/ai/constants/OutputFieldTypeOptions';
import { v4 } from 'uuid';

export const createDefaultOutputSchemaField = (): OutputSchemaField => ({
  id: v4(),
  name: '',
  description: '',
  type: 'string',
});
