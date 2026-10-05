import { type z } from 'zod';

import { type FindConnectedAccountsToolInputZodSchema } from 'src/engine/core-modules/tool/tools/email-tool/find-connected-accounts-tool.schema';

export type FindConnectedAccountsToolInput = z.infer<
  typeof FindConnectedAccountsToolInputZodSchema
>;
