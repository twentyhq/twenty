// Local TypeScript contracts for the graduated Campaign / AI Builder hero.
//
// These mirror the SUBSET of the Propel serverless route payloads this hero
// reads/writes. The canonical shapes live in the OTHER repo
// (propel-crm-integration: src/shared/marketing-hub-types.ts, the
// src/logic-functions/marketing-* route files). We deliberately do NOT import
// across repos — this is the fork-local copy of only what the builder touches.
//
// Every server payload is presence-/optional-guarded: the routes follow a strict
// "never show data you don't have" contract (docs/MARKETING-CLOUD.md), so the UI
// renders only fields that are actually present and NEVER zero-fills.

export type RealChannel = 'EMAIL' | 'WHATSAPP';
export type TemplateLanguage = 'EN' | 'AR';

// ── /marketing/hub (the subset the builder needs for its pickers) ────────────
export interface SegmentOption {
  id: string;
  name: string;
  lastResolvedCount: number;
  lastResolvedLabel: string;
}

export interface ListingOption {
  id: string;
  name: string;
  permitOk: boolean;
}

export interface WaTemplateOption {
  id: string;
  name: string;
  languageCode: TemplateLanguage;
  category: string;
  bodyText: string;
  paramMap: string[];
  status: string;
  approved: boolean;
  rejectionReason: string;
}

export interface EmailTemplateOption {
  id: string;
  name: string;
  subject: string;
  bodyText: string;
  languageCode: string;
}

export interface CustomFieldOption {
  id: string;
  key: string;
  value: string;
  label: string;
}

// Only the slice of the hub payload the builder consumes (the full payload also
// carries boards/results the builder never reads — those stay absent here).
export interface CampaignBuilderHubPayload {
  tier?: string;
  segments?: SegmentOption[];
  listings?: ListingOption[];
  waTemplates?: WaTemplateOption[];
  emailTemplates?: EmailTemplateOption[];
  customFields?: CustomFieldOption[];
}

// ── Typed error envelope (marketing-io.envelope) ─────────────────────────────
// Every route returns either an `ok` payload OR an envelope with `error`/`code`/
// `operatorAction`. The UI shows operatorAction (plain coordinator language)
// when present, else error, never a raw stack.
export interface RouteEnvelopeError {
  error?: string;
  code?: string;
  operatorAction?: string;
}

// ── /marketing/draft-copy ────────────────────────────────────────────────────
export interface DraftCopyResponse extends RouteEnvelopeError {
  ok?: boolean;
  subject?: string;
  body?: string;
  permitWarning?: string;
}

// ── /marketing/save-campaign ─────────────────────────────────────────────────
export interface SaveCampaignResponse extends RouteEnvelopeError {
  ok?: boolean;
  campaignId?: string;
  status?: string;
}

// ── /marketing/test-send ─────────────────────────────────────────────────────
export interface TestSendResponse extends RouteEnvelopeError {
  ok?: boolean;
  sentTo?: string;
  subject?: string;
}

// ── /marketing/send-request ──────────────────────────────────────────────────
export interface SendRequestResponse extends RouteEnvelopeError {
  ok?: boolean;
  campaignId?: string;
  status?: string;
}

// ── /marketing/segment-preview ───────────────────────────────────────────────
export interface SegmentPreviewResponse extends RouteEnvelopeError {
  ok?: boolean;
  channel?: RealChannel;
  estimate?: number;
  description?: string;
  note?: string;
}

// ── /marketing/save-segment ──────────────────────────────────────────────────
export interface SaveSegmentResponse extends RouteEnvelopeError {
  ok?: boolean;
  segmentId?: string;
  estimate?: number;
  description?: string;
  channel?: RealChannel;
}

// ── /marketing/import-segment (two-phase: preview → commit) ───────────────────
export interface ImportColMap {
  email: number | null;
  phone: number | null;
  firstName: number | null;
  lastName: number | null;
  fullName: number | null;
}

export interface ImportPreviewResponse extends RouteEnvelopeError {
  ok?: boolean;
  mode?: string;
  headers?: string[];
  detected?: ImportColMap;
  sampleRows?: string[][];
  totalRows?: number;
  format?: string;
}

export interface ImportCommitResponse extends RouteEnvelopeError {
  ok?: boolean;
  segmentId?: string;
  name?: string;
  listSize?: number;
  matched?: number;
  created?: number;
  inFileDuplicates?: number;
  unusable?: number;
  createFailed?: number;
  capped?: boolean;
}

// ── Segment criteria (segment-resolver SegmentCriteriaV2) ─────────────────────
// The builder writes v2 only; the criteria editor produces { version: 2,
// sources?, lastTouchOlderThanDays? }. The resolver upconverts v1 forever.
export interface SegmentCriteriaV2 {
  version: 2;
  sources?: string[];
  lastTouchOlderThanDays?: number;
  personIds?: string[];
  lanes?: string[];
  budgetMin?: number;
  budgetMax?: number;
  locations?: string[];
  oppStages?: string[];
}

// ── /marketing/ai-build ──────────────────────────────────────────────────────
// The LLM proposes a plan; the server runs a TRUTH PASS (real segment count,
// permit/template/cap verification) before returning. The plan cards show the
// VERIFIED numbers (truth), never the LLM's own claims.
export interface AiPlan {
  channel: string;
  segmentCriteria: unknown;
  segmentDescription: string;
  estimatedAudience?: number | null;
  subject: string | null;
  body: string | null;
  whatsappTemplateId: string | null;
  scheduledAt: string | null;
  language: string;
}

export interface AiTruth {
  segmentCount: number | null;
  capExcludedEstimate: number;
  permitOk: boolean | null;
  permitWarning: string | null;
  templateApproved: boolean | null;
  templateWarning: string | null;
  sendWindowOk: boolean;
}

export interface AiBuildResponse extends RouteEnvelopeError {
  ok?: boolean;
  conversationId?: string;
  plan?: AiPlan | null;
  truth?: AiTruth | null;
  thinking?: string;
  question?: string | null;
}

export type AiChatRole = 'user' | 'assistant';
export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}
