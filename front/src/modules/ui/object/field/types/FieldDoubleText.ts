import { z } from 'zod';

import { DoubleTextTypeResolver } from './resolvers/DoubleTextTypeResolver';

export type FieldDoubleText = z.infer<typeof DoubleTextTypeResolver>;
