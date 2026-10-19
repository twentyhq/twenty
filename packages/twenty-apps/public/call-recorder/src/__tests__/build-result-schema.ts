import { z } from 'zod';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const buildResultSchema = z.object({
  manifest: z.looseObject({
    application: z.looseObject({
      universalIdentifier: z.literal(APPLICATION_UNIVERSAL_IDENTIFIER),
    }),
    logicFunctions: z
      .array(z.looseObject({ universalIdentifier: z.string().min(1) }))
      .min(1),
  }),
});

export type BuildManifest = z.infer<typeof buildResultSchema>['manifest'];
