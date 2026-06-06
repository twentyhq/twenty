// Legacy -> validated partnerScope category mapping. Single source of truth,
// shared by the migration script (rewrites existing records) and the TFT import
// (so it never writes retired legacy values back in).
export const LEGACY_SCOPE_MAP: Record<string, string> = {
  APPS: 'DEVELOPMENT',
  DATA_MODEL: 'SOLUTIONING',
  DATA_MIGRATION: 'SOLUTIONING',
  WORKFLOWS: 'SOLUTIONING',
  HOSTING_ENVIRONMENT: 'HOSTING',
};

export function mapLegacyScope(values: ReadonlyArray<string>): string[] {
  const out: string[] = [];
  for (const value of values) {
    const mapped = LEGACY_SCOPE_MAP[value] ?? value;
    if (!out.includes(mapped)) out.push(mapped);
  }
  return out;
}
