import { z } from 'zod';

export const ToolOutputResultSchema = z.object({ result: z.unknown() });
