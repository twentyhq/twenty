// Presentational helpers for the 1:1 Runner hero — pipeline metadata, money/date
// formatting, and the detailsSnapshot parser. Ported from the in-sandbox
// one-on-one-runner-panel.tsx so the fork stays self-contained (no cross-repo
// imports). Pure functions only; no I/O.

import { type Detail, type Money } from '@/propel/types/oneOnOne';

// Pipeline → short label, record route (nameSingular), and a hue for the colour-
// coded badge. nameSingulars verified against the propel repo's src/objects/*.
export const PIPELINE: Record<
  string,
  { label: string; ns: string; hue: number }
> = {
  RCBI_OPPORTUNITY: { label: 'RCBI', ns: 'rcbiOpportunity', hue: 300 },
  SECONDARY_OPPORTUNITY: {
    label: 'Secondary',
    ns: 'secondaryOpportunity',
    hue: 264,
  },
  SELL_OPPORTUNITY: { label: 'Sell', ns: 'sellOpportunity', hue: 200 },
  INSTITUTIONAL_OPPORTUNITY: {
    label: 'Institutional',
    ns: 'institutionalOpportunity',
    hue: 50,
  },
  OFFPLAN_OPPORTUNITY: { label: 'Off-plan', ns: 'offPlanOpportunity', hue: 75 },
  DEAL: { label: 'Deal', ns: 'deal', hue: 155 },
};

export const pipeOf = (
  t?: string | null,
): { label: string; ns: string; hue: number } | null =>
  t != null && t !== '' ? (PIPELINE[t] ?? null) : null;

// Deep-link to the full lead record (Twenty's /object/:nameSingular/:id pattern).
export const recordUrl = (l: {
  leadObjectType?: string | null;
  leadRecordId?: string | null;
}): string | null => {
  const p = pipeOf(l.leadObjectType);
  return p && l.leadRecordId != null && l.leadRecordId !== ''
    ? `/object/${p.ns}/${l.leadRecordId}`
    : null;
};

// Normalize a RAW_JSON detailsSnapshot (parsed array or JSON string) into a clean
// Detail[]. Returns [] for anything malformed.
export const parseDetails = (
  raw: Detail[] | string | null | undefined,
): Detail[] => {
  let v: unknown = raw;
  if (typeof v === 'string') {
    try {
      v = JSON.parse(v);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(v)) return [];
  return v
    .filter(
      (d): d is Detail =>
        d != null &&
        typeof d === 'object' &&
        typeof (d as Detail).label === 'string' &&
        typeof (d as Detail).value === 'string',
    )
    .map((d) => ({ label: d.label, value: d.value }));
};

export const fmtMoney = (m: Money): string => {
  if (!m || m.amountMicros == null) return '—';
  const n = Number(m.amountMicros) / 1_000_000;
  if (!Number.isFinite(n)) return '—';
  try {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: m.currencyCode ?? 'AED',
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${m.currencyCode ?? 'AED'} ${Math.round(n).toLocaleString()}`;
  }
};

export const relDay = (iso?: string | null): string => {
  if (iso == null || iso === '') return '—';
  const d = Date.parse(iso);
  if (Number.isNaN(d)) return '—';
  const days = Math.floor((Date.now() - d) / 86_400_000);
  return days <= 0 ? 'today' : days === 1 ? '1 day ago' : `${days} days ago`;
};

// ── Booking helpers (mirror one-on-one-hub-panel.tsx) ────────────────────────

export const OOO_DAYS: { v: string; short: string }[] = [
  { v: 'MON', short: 'Mon' },
  { v: 'TUE', short: 'Tue' },
  { v: 'WED', short: 'Wed' },
  { v: 'THU', short: 'Thu' },
  { v: 'FRI', short: 'Fri' },
  { v: 'SAT', short: 'Sat' },
  { v: 'SUN', short: 'Sun' },
];

// The CURRENT week's Monday (UTC) — must match the hub route's weekOf so a booking
// lands in the week the hub is showing.
export const currentWeekMonday = (): string => {
  const now = new Date();
  const dow = now.getUTCDay();
  const back = dow === 0 ? 6 : dow - 1;
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - back),
  );
  return d.toISOString().slice(0, 10);
};

export const dayLabel = (iso: string): string =>
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Dubai',
  }).format(new Date(iso));

export const timeLabel = (iso: string): string =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Dubai',
  }).format(new Date(iso));
