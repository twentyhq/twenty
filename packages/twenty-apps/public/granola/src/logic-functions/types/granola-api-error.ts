import { z } from 'zod';

const GRANOLA_ERROR_BODY_SCHEMA = z.object({
  details: z
    .array(z.object({ field: z.string().optional(), issue: z.string() }))
    .optional(),
});

const GRANOLA_API_ERROR_MESSAGE_BY_STATUS: Record<number, string> = {
  400: 'Granola rejected the request. Check the selected scopes and folders.',
  401: 'Key rejected by Granola.',
  403: 'Granola denied access. Check API scopes and workspace permissions.',
  404: 'Granola resource not found, or webhooks are unavailable for this plan.',
  413: 'Granola transcript is too large to include inline.',
};

export type GranolaApiErrorDetail = { field?: string; issue: string };

export class GranolaApiError extends Error {
  readonly status: number;
  readonly details: GranolaApiErrorDetail[];

  constructor({ status, body }: { status: number; body?: unknown }) {
    super(
      GRANOLA_API_ERROR_MESSAGE_BY_STATUS[status] ??
        `Granola request failed (HTTP ${status}).`,
    );
    this.name = 'GranolaApiError';
    this.status = status;

    const parsedBody = GRANOLA_ERROR_BODY_SCHEMA.safeParse(body);

    this.details = parsedBody.success ? (parsedBody.data.details ?? []) : [];
  }
}
