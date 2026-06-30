// Shared slug helper. Algorithm is intentionally kept simple (no NFKD
// normalization) so that slugs produced by the import script and by the
// partner-application handler are byte-for-byte identical. The import uses
// slug as an idempotency/upsert key (partnerIdBySlug), so the algorithm must
// never change for existing data.
export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
