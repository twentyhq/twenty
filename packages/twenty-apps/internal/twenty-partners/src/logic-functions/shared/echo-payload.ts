// Single source of truth for the reverse echo (Partners → TFT). Both the real-time
// trigger (on-opportunity-changed) and the cron backstop (reconcile-echoes) build the
// identical envelope, so it lives here — keeping the field set, the matchStatus scope,
// and especially the deep-link route in one place where they can't drift apart.

// The clean partner lifecycle that maps 1:1 to the TFT partnerMatchStatus field.
// Partners-internal vestige states (MANUAL_MATCH, AUTO_MATCH, MATCHED, IMPLEMENTING,
// RECONNECT_LATER) are intentionally not echoed — they're being retired separately.
export const ECHO_SCOPE = new Set([
  'TO_BE_MATCHED',
  'INTRODUCED_TO_A_PARTNER',
  'WORKING_WITH_A_PARTNER',
  'WON',
  'LOST',
]);

export type EchoOpportunity = {
  id: string;
  name?: string | null;
  matchStatus?: string | null;
  amount?: { amountMicros: number; currencyCode: string } | null;
  closeDate?: string | null;
  company?: { name?: string | null } | null;
  pointOfContact?: {
    name?: { firstName?: string; lastName?: string };
    emails?: { primaryEmail?: string };
  } | null;
};

// The record-show route on the partners workspace. NOTE: singular `/object/<singular>/<id>`
// (RecordShowPage in twenty-shared AppPath) — the plural `/objects/<plural>` is the table
// index and does not take a record id.
export function buildDeepLink(publicUrl: string, opportunityId: string): string {
  return `${publicUrl.replace(/\/$/, '')}/object/opportunity/${opportunityId}`;
}

// Build the reverse-echo payload from an opportunity's current state. Null/empty fields are
// omitted so the TFT side's Zod `.optional()` accepts them. `opp.id` is the partners-side id
// (used only for the deep link); `tftOpportunityId` is the matching id on the TFT side.
export function buildEchoPayload(
  opp: EchoOpportunity,
  tftOpportunityId: string,
  publicUrl: string,
) {
  const poc = opp.pointOfContact;
  const pocFirstName = poc?.name?.firstName ?? undefined;
  const pocLastName = poc?.name?.lastName ?? undefined;
  const pocEmail = poc?.emails?.primaryEmail || undefined;
  const pointOfContact =
    pocFirstName || pocLastName || pocEmail
      ? {
          ...(pocFirstName && { firstName: pocFirstName }),
          ...(pocLastName && { lastName: pocLastName }),
          ...(pocEmail && { email: pocEmail }),
        }
      : undefined;

  const matchStatus = opp.matchStatus ?? undefined;

  return {
    tftOpportunityId,
    ...(opp.name != null && { name: opp.name }),
    ...(opp.amount != null && { amount: opp.amount }),
    ...(opp.closeDate != null && { closeDate: opp.closeDate }),
    ...(opp.company?.name != null && { companyName: opp.company.name }),
    ...(pointOfContact && { pointOfContact }),
    ...(matchStatus && ECHO_SCOPE.has(matchStatus) && { matchStatus }),
    partnersDeepLink: buildDeepLink(publicUrl, opp.id),
  };
}
