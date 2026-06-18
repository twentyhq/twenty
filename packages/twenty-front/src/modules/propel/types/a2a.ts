// A2A Studio hero — shared types (Plane 3, lane #15 subtask 15.3).
//
// These mirror the SUBSET of the Propel `/a2a/*` route surface this hero consumes.
// The canonical contracts live in the OTHER repo (propel-crm-integration
// src/logic-functions/a2a-studio-*-route.ts), which proxy doc-service's
// `/v1/a2a/*` steps. We deliberately do NOT import across repos — this file is the
// fork-local copy of only what the hero reads/writes, the same convention the
// other heroes follow (oneOnOne.ts, listingStudio.ts).
//
// Every route fails soft: callPropelRoute returns the parsed body on 2xx, else
// null. The route bodies carry their own `{ error?, missing? }` envelope (the
// A2A-local plain shape, NOT the marketing union), so the hook can distinguish a
// 422 not-ready (a `missing` checklist) from a transport failure (null).

// ── The flow step machine (design §4 / plan §3.4) ────────────────────────────
// prepare → (signEmbed | bakeJunior) → send → done, with a terminal error.
// `bakeJunior` is the non-RERA branch: there is no our-side embed to sign because
// finalize-our-side removes our recipient (targeted bake), so it skips straight to
// send once the bake returns.
export type A2AStep =
  | 'prepare'
  | 'signEmbed'
  | 'bakeJunior'
  | 'send'
  | 'done'
  | 'error';

// Variant A = Sell opportunity / seller-rep (template 1); Variant B = Secondary
// opportunity / buyer-rep (template 3). Deep-linked from the Plane-2 entry.
export type A2AVariant = 'A' | 'B';

// ── Prepare form (design §5 A2APrepareForm) ──────────────────────────────────
// CRM-prefilled required + optional fields. Most fields are optional (the agent
// fills the rest in the embedded Documenso editor); only the minimal set gates
// "Create draft". All scalar — no composite/relation types cross the wire here.
export interface A2APrefill {
  // Required-ish (the form surfaces these first; the route validates).
  propertyName?: string;
  propertyPriceAed?: number;
  commissionPercent?: number;
  // Optional extras the agent can override before drafting.
  buyerName?: string;
  remarks?: string;
  counterpartyEmail?: string;
}

// The body POSTed to /a2a/create-draft. `opportunityId` is passed straight
// through — the proxy forwards it; doc-service derives identity from the
// opportunity/viewing owner (we never send an acting-id).
export interface CreateDraftRequest extends A2APrefill {
  opportunityId: string;
  variant: A2AVariant;
}

// ── Route response envelopes ─────────────────────────────────────────────────
// Shared not-ready / error fields every route may return.
export interface A2ARouteError {
  error?: string;
  /** 422 readiness checklist: which CRM fields doc-service still needs. */
  missing?: string[];
}

// create-draft → the draft handles the hero needs to drive the rest of the flow.
export interface CreateDraftResponse extends A2ARouteError {
  a2aDocumentId?: string;
  documensoDocumentId?: string;
  /** Recipient signing token for OUR side — feeds EmbedSignDocument. */
  ourRecipientToken?: string;
  /** Counterparty signing token + URL — used by SendPanel (copy link). */
  counterpartyRecipientToken?: string;
  counterpartySigningUrl?: string;
  /** True when the acting agent personally holds a BRN → signs in the embed. */
  isRera?: boolean;
  /** Echo of the resolved prefill, so the form can reflect what was applied. */
  prefill?: A2APrefill;
}

// finalize-our-side (junior bake) → no-op for RERA, bake for juniors.
export interface FinalizeResponse extends A2ARouteError {
  baked?: boolean;
  reason?: string;
}

// The send channels the agent can pick (design §5 SendPanel / D4).
export type SendChannel = 'whatsapp' | 'email' | 'copyLink';

export interface SendRequest {
  a2aDocumentId: string;
  channels: SendChannel[];
  counterpartyPersonId?: string;
  /** Forwarded for the WhatsApp-first delivery wired in doc-service. */
  counterpartyPhone?: string;
  counterpartyEmail?: string;
}

export interface SendResponse extends A2ARouteError {
  ok?: boolean;
  /** Echo so the panel can show/copy the live counterparty link post-send. */
  counterpartySigningUrl?: string;
  status?: A2ADocumentStatus;
}

// status poll → drives A2AStatusStrip + the flip to `done`.
export type A2ADocumentStatus =
  | 'DRAFT'
  | 'OUT_FOR_SIGNATURE'
  | 'SIGNED'
  | 'VOIDED';

export interface StatusResponse extends A2ARouteError {
  status?: A2ADocumentStatus;
  signedPdfUrl?: string | null;
  auditUrl?: string | null;
  counterpartySigningUrl?: string | null;
}

export interface DiscardResponse extends A2ARouteError {
  ok?: boolean;
}

// ── Counterparty Person (design §5 ContactRunner / D5) ───────────────────────
// The counterparty broker, stored as a Person and linked via the
// `counterpartyPerson` relation. Read/created over the core GraphQL bridge
// (a2aCrm.ts), with the agent's own session token (propel-rls respected).
export interface CounterpartyPerson {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  brokerage?: string | null;
}

// What the ContactRunner drawer collects to create/link a counterparty.
export interface CounterpartyDraft {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  brokerage: string;
}
