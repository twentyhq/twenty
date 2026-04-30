export type FiscalCountry =
  | 'CO'
  | 'MX'
  | 'CL'
  | 'PE'
  | 'AR'
  | 'BR'
  | 'EC';

export type CertificateStatus =
  | 'valid'
  | 'expiring_soon'
  | 'expired'
  | 'not_configured';

export type FiscalInvoiceStatus =
  | 'pending'
  | 'signed'
  | 'sent_to_authority'
  | 'accepted'
  | 'rejected'
  | 'cancelled';

export type FiscalCountryStats = {
  country: FiscalCountry;
  countryName: string;
  totalInvoices: number;
  accepted: number;
  rejected: number;
  pending: number;
  certificateStatus: CertificateStatus;
  lastSyncAt: string | null;
};

export type FiscalCertificate = {
  id: string;
  country: FiscalCountry;
  issuer: string;
  serialNumber: string;
  status: CertificateStatus;
  validFrom: string;
  validUntil: string;
  uploadedAt: string;
  fileName: string;
};

export type InvoiceSequenceConfig = {
  id: string;
  country: FiscalCountry;
  prefix: string;
  currentSequence: number;
  rangeStart: number;
  rangeEnd: number;
  resolutionNumber: string | null;
  resolutionDate: string | null;
  isActive: boolean;
};
