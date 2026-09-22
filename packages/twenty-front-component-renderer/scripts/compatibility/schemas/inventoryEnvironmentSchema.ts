import { z } from 'zod';

export const inventoryEnvironmentSchema = z.strictObject({
  collectedAt: z.iso.datetime(),
  playwrightVersion: z.string().min(1),
  chromiumVersion: z.string().min(1),
  chromiumRevision: z.string().min(1),
  executablePath: z.string().min(1),
  platform: z.string().min(1),
  architecture: z.string().min(1),
  operatingSystemRelease: z.string().min(1),
  nodeVersion: z.string().min(1),
  commit: z.string().min(1),
  isWorkingTreeDirty: z.boolean(),
  lockfileSha256: z.string().min(1),
  launch: z.strictObject({
    headless: z.literal(true),
    args: z.array(z.string()),
  }),
  context: z.strictObject({
    viewport: z.strictObject({
      width: z.number().positive(),
      height: z.number().positive(),
    }),
    locale: z.string().min(1),
    timezoneId: z.string().min(1),
    colorScheme: z.literal('light'),
    deviceScaleFactor: z.literal(1),
    serviceWorkers: z.literal('allow'),
  }),
  origin: z.string().url(),
  userAgent: z.string().min(1),
  isSecureContext: z.boolean(),
});
