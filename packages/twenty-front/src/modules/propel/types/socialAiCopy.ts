// Types for the Social Posting Calendar composer's AI copy bundle (S-AI).
//
// Mirrors the CRM app route POST /marketing/social/ai-copy
// (src/logic-functions/social-ai-copy-route.ts in propel-crm-integration). Five
// actions over one route; each returns either an `ok` payload or the shared
// marketing error envelope ({ error, code, operatorAction }). The composer never
// fabricates copy — a failed/missing-key call surfaces the operator message.

export type SocialAiTone = 'luxury' | 'friendly' | 'facts';
export type SocialAiRewrite = 'shorter' | 'punchier' | 'add-cta';

// The marketing-io error envelope (HTTP 200 with a code). Shared across actions.
export interface AiCopyEnvelopeError {
  error?: string;
  code?: string;
  operatorAction?: string;
}

// draft / rewrite / arabic all return { ok, caption }.
export interface AiCaptionResponse extends AiCopyEnvelopeError {
  ok?: boolean;
  caption?: string;
  tone?: SocialAiTone;
  instruction?: SocialAiRewrite;
}

// hashtags → { ok, hashtags: string[] }
export interface AiHashtagsResponse extends AiCopyEnvelopeError {
  ok?: boolean;
  hashtags?: string[];
}

// compliance_lint → { ok, flags: [] }
export type ComplianceSeverity = 'block' | 'warn' | 'info';

export interface ComplianceFlag {
  severity: ComplianceSeverity;
  /** the literal substring that tripped the rule ('' for advisories) */
  span: string;
  advice: string;
}

export interface AiLintResponse extends AiCopyEnvelopeError {
  ok?: boolean;
  flags?: ComplianceFlag[];
}
