import {
  nodeActionSchema,
  otherNodeActionSchema,
} from '@/chatbot/validation-schemas/nodeSchema';
import { z } from 'zod';

export type NodeAction = z.infer<typeof nodeActionSchema>;
export type NodeActionType = NodeAction['type'];

export type OtherNodeAction = z.infer<typeof otherNodeActionSchema>;
export type OtherNodeActionType = OtherNodeAction['type'];
