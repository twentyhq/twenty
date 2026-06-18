// Client for the Social Posting Calendar composer's AI copy bundle (S-AI).
//
// Thin wrappers over callPropelRoute('/marketing/social/ai-copy', { body }) — one
// per action — that normalize the route's { ok, ... } payload OR error envelope
// into a discriminated outcome the composer can branch on without knowing the wire
// shape. A null response (network / non-2xx) maps to a generic, retryable error.
//
// The route reads event.body, so every payload is wrapped as { body: {...} } —
// the same convention savePost/uploadMedia use.

import { callPropelRoute } from '@/propel/lib/callPropelRoute';
import {
  type AiCaptionResponse,
  type AiHashtagsResponse,
  type AiLintResponse,
  type ComplianceFlag,
  type SocialAiRewrite,
  type SocialAiTone,
} from '@/propel/types/socialAiCopy';

const ROUTE = '/marketing/social/ai-copy';

// Known error codes from the route (mirrors marketing-io envelopes). Unknown codes
// fall through to a generic message but are never swallowed.
const AI_ERROR_FALLBACK: Record<string, string> = {
  ENV_MISSING: 'AI copy is not configured on this environment.',
  TEMPLATE_INVALID: 'The AI could not produce usable copy — try again or write it manually.',
  NOT_FOUND: "That isn't available — attach a live listing or check your access.",
};

export type CaptionOutcome =
  | { ok: true; caption: string }
  | { ok: false; message: string; operatorAction: string | null };

export type HashtagsOutcome =
  | { ok: true; hashtags: string[] }
  | { ok: false; message: string; operatorAction: string | null };

export type LintOutcome =
  | { ok: true; flags: ComplianceFlag[] }
  | { ok: false; message: string; operatorAction: string | null };

// Plain boolean (NOT a type predicate): a predicate would narrow the success
// type to `never` in the else-branch, since the response interfaces share the
// optional error/code fields. The success checks below re-validate the shape.
const isEnvelopeError = (res: unknown): boolean =>
  typeof res === 'object' &&
  res !== null &&
  (res as { ok?: unknown }).ok !== true &&
  typeof (res as { code?: unknown }).code === 'string';

const networkFail = () => ({
  ok: false as const,
  message: "Couldn't reach the AI service. Check your connection and try again.",
  operatorAction: null,
});

const envelopeFail = (res: { error?: string; code?: string; operatorAction?: string }) => {
  const code = res.code ?? 'UNKNOWN';
  const message =
    (typeof res.error === 'string' && res.error) ||
    AI_ERROR_FALLBACK[code] ||
    'Something went wrong generating copy.';
  return { ok: false as const, message, operatorAction: res.operatorAction ?? null };
};

// draft — from a live listing's facts (server-resolved by listingId) + a tone.
export const aiDraft = async (args: {
  listingId: string;
  tone: SocialAiTone;
}): Promise<CaptionOutcome> => {
  const res = await callPropelRoute<AiCaptionResponse>(ROUTE, {
    body: { action: 'draft', listingId: args.listingId, tone: args.tone },
  });
  if (res === null) return networkFail();
  if (isEnvelopeError(res)) return envelopeFail(res);
  if (res.ok === true && typeof res.caption === 'string') return { ok: true, caption: res.caption };
  return { ok: false, message: 'Something went wrong generating copy.', operatorAction: null };
};

// rewrite — current copy + an instruction (shorter | punchier | add-cta). When a
// listing is attached the route re-grounds the result against the real listing.
export const aiRewrite = async (args: {
  copy: string;
  instruction: SocialAiRewrite;
  listingId: string | null;
}): Promise<CaptionOutcome> => {
  const res = await callPropelRoute<AiCaptionResponse>(ROUTE, {
    body: {
      action: 'rewrite',
      copy: args.copy,
      instruction: args.instruction,
      ...(args.listingId !== null ? { listingId: args.listingId } : {}),
    },
  });
  if (res === null) return networkFail();
  if (isEnvelopeError(res)) return envelopeFail(res);
  if (res.ok === true && typeof res.caption === 'string') return { ok: true, caption: res.caption };
  return { ok: false, message: 'Something went wrong rewriting the copy.', operatorAction: null };
};

// arabic — localize the current caption to Arabic. stripEmoji asks for plain text
// (some networks forbid emoji). Re-grounded against the listing when attached.
export const aiArabic = async (args: {
  copy: string;
  stripEmoji: boolean;
  listingId: string | null;
}): Promise<CaptionOutcome> => {
  const res = await callPropelRoute<AiCaptionResponse>(ROUTE, {
    body: {
      action: 'arabic',
      copy: args.copy,
      stripEmoji: args.stripEmoji,
      ...(args.listingId !== null ? { listingId: args.listingId } : {}),
    },
  });
  if (res === null) return networkFail();
  if (isEnvelopeError(res)) return envelopeFail(res);
  if (res.ok === true && typeof res.caption === 'string') return { ok: true, caption: res.caption };
  return { ok: false, message: 'Something went wrong translating the copy.', operatorAction: null };
};

// hashtags — relevant + location tags, grounded on the listing when attached.
export const aiHashtags = async (args: {
  listingId: string | null;
}): Promise<HashtagsOutcome> => {
  const res = await callPropelRoute<AiHashtagsResponse>(ROUTE, {
    body: { action: 'hashtags', ...(args.listingId !== null ? { listingId: args.listingId } : {}) },
  });
  if (res === null) return networkFail();
  if (isEnvelopeError(res)) return envelopeFail(res);
  if (res.ok === true && Array.isArray(res.hashtags)) return { ok: true, hashtags: res.hashtags };
  return { ok: false, message: 'Something went wrong generating hashtags.', operatorAction: null };
};

// compliance_lint — deterministic, no LLM key needed. Returns flagged spans.
export const aiLint = async (args: {
  copy: string;
  listingId: string | null;
}): Promise<LintOutcome> => {
  const res = await callPropelRoute<AiLintResponse>(ROUTE, {
    body: { action: 'compliance_lint', copy: args.copy, ...(args.listingId !== null ? { listingId: args.listingId } : {}) },
  });
  if (res === null) return networkFail();
  if (isEnvelopeError(res)) return envelopeFail(res);
  if (res.ok === true && Array.isArray(res.flags)) return { ok: true, flags: res.flags };
  return { ok: false, message: 'Something went wrong running the compliance check.', operatorAction: null };
};
