import { type CoreSchema } from 'twenty-client-sdk/core';
import { z } from 'zod';

import { isHttpUrl } from 'src/modules/shared/utils/http-url.util';

export const saveContentSchema = z.object({
  caseStudies: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      clientName: z.string().optional(),
      headline: z.string().optional(),
      bodyMarkdown: z.string().optional(),
      caseStudyLink: z
        .string()
        .refine((value) => value === '' || isHttpUrl(value), {
          message: 'URL must use http or https',
        })
        .optional(),
      coverImageUrl: z.string().optional(),
      published: z.boolean().optional(),
    }),
  ).max(50, 'Too many case studies in a single request (max 50)'),
});

export type SaveContentInput = z.infer<typeof saveContentSchema>;

export type CaseStudyItem = SaveContentInput['caseStudies'][number];

export type CaseStudyRow = {
  id: string;
  name: string | null;
  clientName: string | null;
  headline: string | null;
  bodyMarkdown: string | null;
  coverImageUrl: string | null;
  caseStudyLink: string | null;
  status: string | null;
};

// Partner self-controls visibility: published → APPROVED (public), draft → WIP (hidden).
// Ownership (partnerId/partnerUser) and contentType are stamped server-side by the
// on-partner-content-created trigger, never written by the caller — so a partner cannot
// repoint a case study onto another partner's public marketplace profile.
// Create and update share every field mapping; they diverge only on how status is
// derived, so keep the common fields here and let each add its own status handling.
const buildContentBaseData = (item: CaseStudyItem) => ({
  name: item.name,
  clientName: item.clientName,
  headline: item.headline,
  body: { markdown: item.bodyMarkdown ?? '' },
  caseStudyLink: item.caseStudyLink ? { primaryLinkUrl: item.caseStudyLink } : undefined,
  coverImageUrl: item.coverImageUrl,
});

export function buildContentCreateData(
  item: CaseStudyItem,
): CoreSchema.PartnerContentCreateInput {
  return { ...buildContentBaseData(item), status: item.published ? 'APPROVED' : 'WIP' };
}

export function buildContentUpdateData(
  item: CaseStudyItem,
): CoreSchema.PartnerContentUpdateInput {
  return {
    ...buildContentBaseData(item),
    // Only touch status when the caller specified published; a partial edit must not unpublish an APPROVED case study.
    ...(item.published !== undefined ? { status: item.published ? 'APPROVED' : 'WIP' } : {}),
  };
}
