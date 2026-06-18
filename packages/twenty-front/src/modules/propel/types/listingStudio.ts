// Listing Studio hero — shared types (S2).
//
// Mirror of the CRM route surface (propel-crm-integration
// src/listing-studio/studio-routes.ts). The hero owns draft state CLIENT-SIDE in
// S2 (React + localStorage); the routes are stateless proxies. These shapes are
// duplicated here (not imported) because the fork and the CRM app are separate
// repos — the same reason the S1 client mirrors the PF enums verbatim.

// The 6 steps of the Studio flow (lane spec §3). The rail renders them in order.
export const STUDIO_STEPS = [
  'intake',
  'details',
  'photos',
  'writeup',
  'permit',
  'publish',
] as const;
export type StudioStep = (typeof STUDIO_STEPS)[number];

// Two entry points (spec §3): A = blank from documents; B = from a CRM property.
export type StudioEntry = 'scratch' | 'property';

// The subset of CRM `property` facts the Studio collects/edits. All optional —
// entry A starts empty; entry B prefills what the property knows.
export interface StudioFacts {
  name?: string;
  assetClass?: string;
  community?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string;
  sizeSqft?: number;
  plotSqft?: number;
  /** AED whole units (NOT micros). */
  askingPriceAed?: number;
  floor?: string;
  unitNumber?: string;
  parking?: number;
  view?: string;
  completionStatus?: string;
  tenure?: string;
}

// A Studio draft as the hero owns it. `draftId` is client-minted in S2.
export interface StudioDraft {
  draftId: string;
  entry: StudioEntry;
  propertyId?: string;
  facts: StudioFacts;
  step: StudioStep;
}

// The PF-vocabulary projection the preview pane renders (spec §6). Built server-
// side by /listing-studio/preview from the S1 CRM→PF transforms; every field
// optional so the card "builds as you go" (spec §16).
export interface StudioPreview {
  category?: string;
  type?: string;
  bedrooms?: string;
  bathrooms?: string;
  size?: number;
  projectStatus?: string;
  furnishingType?: string;
  priceAed?: number;
  locationLabel?: string;
  title?: string;
}

// ── Route response envelopes (the CRM routes return { ok, ... } | error) ──────
export interface StudioStartResponse {
  ok: boolean;
  draft?: StudioDraft;
  error?: string;
}
export interface StudioSaveResponse {
  ok: boolean;
  draftId?: string;
  step?: StudioStep;
  accepted?: StudioFacts;
  error?: string;
}
export interface StudioPreviewResponse {
  ok: boolean;
  preview?: StudioPreview;
  error?: string;
}

// A CRM property the entry-B picker lists. Read from the CRM via the standard
// records GraphQL (not a Propel route) by useStudioPropertyPicker.
export interface StudioPropertyOption {
  id: string;
  name: string;
  community?: string | null;
  bedrooms?: number | null;
}
