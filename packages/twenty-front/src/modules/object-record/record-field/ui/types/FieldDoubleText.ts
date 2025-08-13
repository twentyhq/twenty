import { type z } from 'zod';

import { type DoubleTextTypeResolver } from './resolvers/DoubleTextTypeResolver';

export type FieldDoubleText = z.infer<typeof DoubleTextTypeResolver>;
