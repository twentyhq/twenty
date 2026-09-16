import { z } from 'zod';
import { credentialsSchema } from '../validation-schemas/credentialsSchema';

export type Credentials = z.infer<typeof credentialsSchema>;
