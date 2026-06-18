// Client for the Social Posting Calendar composer's GENERATIVE image affordance.
//
// Thin wrapper over callPropelRoute('/marketing/social/ai-image', { body }) that
// normalizes the route's { ok, url, prompt, optimizedPrompt } payload OR error
// envelope into a discriminated outcome the composer can branch on without knowing
// the wire shape. A null response (network / non-2xx) maps to a generic, retryable
// error. The route reads event.body, so the payload is wrapped as { body: {...} },
// the same convention savePost/uploadMedia/aiCopy use.

import { callPropelRoute } from '@/propel/lib/callPropelRoute';
import {
  type AiImageResponse,
  type SocialImageAspect,
} from '@/propel/types/socialAiImage';

const ROUTE = '/marketing/social/ai-image';

// Known error codes from the route (mirrors marketing-io envelopes). Unknown codes
// fall through to a generic message but are never swallowed.
const AI_IMAGE_ERROR_FALLBACK: Record<string, string> = {
  ENV_MISSING: 'Image generation is not configured on this environment.',
  COMPLIANCE_BLOCK:
    'That reads like a request for a photo of a real property. This makes brand graphics — try describing a stat card, festive post, or branded design.',
  TEMPLATE_INVALID: 'The image could not be generated — try rephrasing the prompt.',
  MEDIA_UPLOAD_FAILED: "The image was generated but couldn't be stored — try again.",
  NOT_FOUND: "That isn't available — check your access.",
};

export type GenerateImageOutcome =
  | { ok: true; url: string; prompt: string; optimizedPrompt: string | null }
  | { ok: false; message: string; operatorAction: string | null };

// Plain boolean (NOT a type predicate): the success/error response shapes share
// optional fields, so a predicate would mis-narrow. The success check below
// re-validates the shape.
const isEnvelopeError = (res: unknown): boolean =>
  typeof res === 'object' &&
  res !== null &&
  (res as { ok?: unknown }).ok !== true &&
  typeof (res as { code?: unknown }).code === 'string';

const networkFail = (): GenerateImageOutcome => ({
  ok: false,
  message: "Couldn't reach the image service. Check your connection and try again.",
  operatorAction: null,
});

const envelopeFail = (res: AiImageResponse): GenerateImageOutcome => {
  const code = res.code ?? 'UNKNOWN';
  const message =
    (typeof res.error === 'string' && res.error) ||
    AI_IMAGE_ERROR_FALLBACK[code] ||
    'Something went wrong generating the image.';
  return { ok: false, message, operatorAction: res.operatorAction ?? null };
};

// Generate one brand/graphic image from a prompt (+ optional aspect / brand hints).
// One image per call (pay-per-image) — the route never loops.
export const generateImage = async (args: {
  prompt: string;
  aspect: SocialImageAspect;
  brandHints?: string | null;
}): Promise<GenerateImageOutcome> => {
  const res = await callPropelRoute<AiImageResponse>(ROUTE, {
    body: {
      prompt: args.prompt,
      aspect: args.aspect,
      ...(args.brandHints && args.brandHints.trim()
        ? { brandHints: args.brandHints.trim() }
        : {}),
    },
  });
  if (res === null) return networkFail();
  if (isEnvelopeError(res)) return envelopeFail(res);
  if (res.ok === true && typeof res.url === 'string') {
    return {
      ok: true,
      url: res.url,
      prompt: typeof res.prompt === 'string' ? res.prompt : args.prompt,
      optimizedPrompt:
        typeof res.optimizedPrompt === 'string' ? res.optimizedPrompt : null,
    };
  }
  return {
    ok: false,
    message: 'Something went wrong generating the image.',
    operatorAction: null,
  };
};
