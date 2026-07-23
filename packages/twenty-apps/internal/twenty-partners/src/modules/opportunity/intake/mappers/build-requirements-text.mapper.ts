import { z } from 'zod';

import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

export const submitClientBriefSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string(),
  email: z.string().trim().email(),
  companyName: z.string().trim().min(1),
  need: z.string().trim().min(1),
  requirements: z.string().optional(),
  hostingType: z.enum(['CLOUD', 'SELF_HOSTING']).optional(),
  country: z.string().optional(),
  languages: z.array(z.string()).optional(),
  seatCount: z.string().optional(),
  timeline: z.string().optional(),
  budgetRange: z.string().optional(),
});

export type SubmitClientBriefInput = z.infer<typeof submitClientBriefSchema>;

const HOSTING_LABEL: Record<'CLOUD' | 'SELF_HOSTING', string> = {
  CLOUD: 'Cloud',
  SELF_HOSTING: 'Self-hosting',
};

export function buildRequirementsText(input: SubmitClientBriefInput): string | null {
  const base = isNonEmptyString(input.requirements) ? input.requirements.trim() : '';
  const bullets: string[] = [];
  if (input.hostingType !== undefined) {
    bullets.push(`• Hosting: ${HOSTING_LABEL[input.hostingType]}`);
  }
  if (isNonEmptyString(input.seatCount)) bullets.push(`• Seats: ${input.seatCount.trim()}`);
  if (isNonEmptyString(input.country)) bullets.push(`• Country: ${input.country.trim()}`);
  if (input.languages !== undefined && input.languages.length > 0) {
    bullets.push(`• Languages: ${input.languages.join(', ')}`);
  }
  if (isNonEmptyString(input.timeline)) bullets.push(`• Timeline: ${input.timeline.trim()}`);
  if (isNonEmptyString(input.budgetRange)) bullets.push(`• Budget: ${input.budgetRange.trim()}`);
  if (bullets.length === 0) return base.length > 0 ? base : null;
  const block = `---\nAdditional context:\n${bullets.join('\n')}`;
  return base ? `${base}\n\n${block}` : block;
}
