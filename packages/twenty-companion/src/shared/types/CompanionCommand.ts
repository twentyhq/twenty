import { z } from 'zod';
import { commandSchema } from '../validation-schemas/commandSchema';

export type CompanionCommand = z.infer<typeof commandSchema>;
