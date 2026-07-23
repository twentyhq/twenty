import { z } from 'zod';

import {
  PARTNER_COUNTRY_VALUES,
  PARTNER_LANGUAGE_VALUES,
  PARTNER_SCOPE_VALUES,
  PARTNER_TYPE_OF_TEAM_VALUES,
  TWENTY_EXPERIENCE_NOTES_MIN_LENGTH,
  TWENTY_EXPERIENCE_VALUES,
} from 'src/modules/partner/constants/partner-option-values.constant';
import { isHttpUrl } from 'src/modules/shared/utils/http-url.util';

// The request contract. zod is the single source of truth: it validates the
// incoming body at runtime and the input type is inferred from it, so the two
// can never drift. Enum-valued fields are constrained to the same option sets
// the Partner object accepts.
export const submitPartnerApplicationSchema = z
  .object({
    firstName: z.string().trim().min(1),
    lastName: z.string(),
    email: z.string().trim().min(1),
    companyName: z.string().trim().min(1),
    domainName: z.string().optional(),
    linkedin: z.string().optional(),
    city: z.string().optional(),
    country: z.enum(PARTNER_COUNTRY_VALUES).optional(),
    languages: z.array(z.enum(PARTNER_LANGUAGE_VALUES)).optional(),
    typeOfTeam: z.enum(PARTNER_TYPE_OF_TEAM_VALUES).optional(),
    partnerScope: z.array(z.enum(PARTNER_SCOPE_VALUES)).optional(),
    skills: z.array(z.string()).optional(),
    applicationNotes: z.string().optional(),
    twentyExperience: z.array(z.enum(TWENTY_EXPERIENCE_VALUES)).optional(),
    // Apply narrative floor at the API boundary (defense in depth vs website).
    twentyExperienceNotes: z
      .string()
      .trim()
      .min(TWENTY_EXPERIENCE_NOTES_MIN_LENGTH)
      .optional(),
    twentyExperienceProofLink: z
      .string()
      .trim()
      .refine(isHttpUrl, { message: 'URL must use http or https' })
      .optional(),
    hourlyRate: z.number().optional(),
    projectBudgetMin: z.number().optional(),
    calendarLink: z.string().optional(),
  })
  .superRefine((data, context) => {
    const hasMilestones = (data.twentyExperience?.length ?? 0) > 0;
    const hasNotes = data.twentyExperienceNotes !== undefined;
    const hasProof = data.twentyExperienceProofLink !== undefined;
    const anyExperienceSet = hasMilestones || hasNotes || hasProof;

    if (!anyExperienceSet) {
      return;
    }

    // When any experience field is present, require the full triad (website parity).
    if (!hasMilestones) {
      context.addIssue({
        code: 'custom',
        message: 'At least one Twenty experience milestone is required.',
        path: ['twentyExperience'],
      });
    }

    if (!hasNotes) {
      context.addIssue({
        code: 'custom',
        message: `Twenty experience notes must be at least ${TWENTY_EXPERIENCE_NOTES_MIN_LENGTH} characters.`,
        path: ['twentyExperienceNotes'],
      });
    }

    if (!hasProof) {
      context.addIssue({
        code: 'custom',
        message: 'Twenty experience proof link is required.',
        path: ['twentyExperienceProofLink'],
      });
    }
  });

export type SubmitPartnerApplicationInput = z.infer<
  typeof submitPartnerApplicationSchema
>;
