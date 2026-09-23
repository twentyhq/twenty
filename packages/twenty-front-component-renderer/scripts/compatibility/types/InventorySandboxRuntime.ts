import { type z } from 'zod';

import { type inventorySandboxRuntimeSchema } from '../schemas/inventorySandboxRuntimeSchema';

export type InventorySandboxRuntime = z.infer<
  typeof inventorySandboxRuntimeSchema
>;
