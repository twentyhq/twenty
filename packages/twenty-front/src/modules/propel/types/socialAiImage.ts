// Types for the Social Posting Calendar composer's GENERATIVE image affordance.
//
// Mirrors the CRM app route POST /marketing/social/ai-image
// (src/logic-functions/social-ai-image-route.ts in propel-crm-integration). One
// action: text-to-image brand/graphic generation. Returns either an `ok` payload
// (the stored image URL + the original/optimized prompts) or the shared marketing
// error envelope ({ error, code, operatorAction }). NON-property graphics only —
// a prompt that reads as a photoreal real-property request comes back as
// COMPLIANCE_BLOCK and the composer surfaces that, never a fabricated image.

// The four social aspect ratios the route accepts (mapped server-side to the
// gpt-image size param). 'square' is the safe default (works on every network).
export type SocialImageAspect = 'square' | 'portrait' | 'landscape' | 'story';

// The marketing-io error envelope (HTTP 200 with a code).
export interface AiImageEnvelopeError {
  error?: string;
  code?: string;
  operatorAction?: string;
}

// Success: { ok, url, prompt, optimizedPrompt? } — url is the stored (signed) B2
// link the composer attaches as media; prompt is the operator's original; optimized
// is the cheap-LLM-refined prompt (null when the optimizer was unavailable).
export interface AiImageResponse extends AiImageEnvelopeError {
  ok?: boolean;
  url?: string;
  contentType?: string;
  aspect?: SocialImageAspect;
  prompt?: string;
  optimizedPrompt?: string | null;
}
