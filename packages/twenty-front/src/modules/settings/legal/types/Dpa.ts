export type DpaAgreementType = 'CLICK_THROUGH' | 'SIGNED';

export type DpaDocumentBlock = {
  kind: string;
  text: string;
  label?: string | null;
  value?: string | null;
};

export type DpaDocument = {
  title: string;
  lastUpdatedLabel: string;
  templateVersion: string;
  region: string;
  processorEntity: string;
  sccSectionActive: boolean;
  blocks: DpaDocumentBlock[];
};

export type DpaAgreement = {
  id: string;
  type: DpaAgreementType;
  templateVersion: string;
  region: string;
  processorEntity: string;
  customerLegalEntityName?: string | null;
  signatoryName?: string | null;
  signatoryTitle?: string | null;
  acceptedByEmail?: string | null;
  acceptedAt: string;
  createdAt: string;
};

export type GenerateSignedDpaResult = {
  downloadUrl: string;
  agreement: DpaAgreement;
};
