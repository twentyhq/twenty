import { isObject } from '@sniptt/guards';
import {
  type InputJsonSchema,
  jsonSchemaToInputSchema,
} from 'twenty-shared/logic-function';
import { type InputSchema } from 'twenty-shared/workflow';

// Cached MCP schemas arrive as untyped JSON; anything but an object schema yields no fields.
export const getMcpToolInputSchema = (
  toolInputSchema: unknown,
): InputSchema | undefined =>
  isObject(toolInputSchema)
    ? jsonSchemaToInputSchema(toolInputSchema as InputJsonSchema)
    : undefined;
