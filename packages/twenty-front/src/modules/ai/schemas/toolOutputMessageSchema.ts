import { z } from 'zod';

export const ToolOutputMessageSchema = z.object({ message: z.string() });
