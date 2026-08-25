import { type LinkClassification } from 'src/modules/partner/pre-review/utils/classify-link.util';

export type PartnerForPreReview = {
  id: string;
  name: string | null;
  city: string | null;
  country: string | null;
  typeOfTeam: string | null;
  partnerScope: string[] | null;
  skills: string[] | null;
  twentyExperience: string[] | null;
  twentyExperienceNotes: string | null;
  applicationNotes: string | null;
  hourlyRateAmountMicros: number | null;
  projectBudgetMinAmountMicros: number | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  proofUrl: string | null;
};

export type EvidenceSourceLabel = 'website' | 'linkedin' | 'proof';

export type EvidenceSource = {
  label: EvidenceSourceLabel;
  url: string;
  classification: LinkClassification;
  excerpt: string | null;
  videoTitle: string | null;
  videoDescription: string | null;
  videoThumbnailUrl: string | null;
  captionExcerpt: string | null;
  failureReason: string | null;
};

export type EvidencePack = {
  text: string;
  hasVerifiableProof: boolean;
  needsHumanLook: string[];
};
