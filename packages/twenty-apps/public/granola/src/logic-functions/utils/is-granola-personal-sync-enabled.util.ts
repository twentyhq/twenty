export const isGranolaPersonalSyncEnabled = (): boolean =>
  process.env.GRANOLA_PERSONAL_SYNC_ENABLED === 'true';
