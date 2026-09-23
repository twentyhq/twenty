import { z } from 'zod';

export const inventorySandboxRuntimeSchema = z.enum(['react', 'preact']);
