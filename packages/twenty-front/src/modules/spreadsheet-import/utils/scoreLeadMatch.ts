export type LeadCsvData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
};

export type LeadCandidate = {
  id: string;
  nameFirstName?: string;
  nameLastName?: string;
  emailsPrimaryEmail?: string;
  phonesPrimaryPhoneNumber?: string;
  addressCustomAddressCity?: string;
  addressCustomAddressState?: string;
};

export type MatchResult = {
  score: number;
  candidateId: string;
  breakdown: Record<string, number>;
};

const normalizePhone = (phone: string): string =>
  phone.replace(/[^0-9]/g, '').replace(/^1(\d{10})$/, '$1');

const fuzzyNameMatch = (a: string, b: string): boolean => {
  const la = a.toLowerCase();
  const lb = b.toLowerCase();

  if (la === lb) return true;
  if (la.length >= 3 && lb.length >= 3 && la.slice(0, 3) === lb.slice(0, 3))
    return true;

  return false;
};

export const scoreLeadMatch = (
  candidate: LeadCandidate,
  csvData: LeadCsvData,
): MatchResult => {
  const breakdown: Record<string, number> = {};
  let score = 0;

  // Email — 40 points (exact, case-insensitive)
  if (candidate.emailsPrimaryEmail && csvData.email) {
    if (
      candidate.emailsPrimaryEmail.toLowerCase() ===
      csvData.email.toLowerCase()
    ) {
      breakdown.email = 40;
      score += 40;
    }
  }

  // First Name — 15 exact, 10 fuzzy
  if (candidate.nameFirstName && csvData.firstName) {
    if (
      candidate.nameFirstName.toLowerCase() ===
      csvData.firstName.toLowerCase()
    ) {
      breakdown.firstName = 15;
      score += 15;
    } else if (fuzzyNameMatch(candidate.nameFirstName, csvData.firstName)) {
      breakdown.firstName = 10;
      score += 10;
    }
  }

  // Last Name — 15 exact, 10 fuzzy
  if (candidate.nameLastName && csvData.lastName) {
    if (
      candidate.nameLastName.toLowerCase() === csvData.lastName.toLowerCase()
    ) {
      breakdown.lastName = 15;
      score += 15;
    } else if (fuzzyNameMatch(candidate.nameLastName, csvData.lastName)) {
      breakdown.lastName = 10;
      score += 10;
    }
  }

  // Phone — 20 points (normalized digits)
  if (candidate.phonesPrimaryPhoneNumber && csvData.phone) {
    if (
      normalizePhone(candidate.phonesPrimaryPhoneNumber) ===
      normalizePhone(csvData.phone)
    ) {
      breakdown.phone = 20;
      score += 20;
    }
  }

  // City — 5 points
  if (candidate.addressCustomAddressCity && csvData.city) {
    if (
      candidate.addressCustomAddressCity.toLowerCase() ===
      csvData.city.toLowerCase()
    ) {
      breakdown.city = 5;
      score += 5;
    }
  }

  // State — 5 points
  if (candidate.addressCustomAddressState && csvData.state) {
    if (
      candidate.addressCustomAddressState.toLowerCase() ===
      csvData.state.toLowerCase()
    ) {
      breakdown.state = 5;
      score += 5;
    }
  }

  return { score, candidateId: candidate.id, breakdown };
};

/**
 * Extract Lead-specific CSV data from a structured import row.
 * The field keys follow the spreadsheet import naming convention.
 */
export const extractLeadCsvData = (
  row: Record<string, unknown>,
  relationFieldName: string,
): LeadCsvData => ({
  firstName: row[`update:firstName-name (${relationFieldName})`] as
    | string
    | undefined,
  lastName: row[`update:lastName-name (${relationFieldName})`] as
    | string
    | undefined,
  email: row[`update:primaryEmail-emails (${relationFieldName})`] as
    | string
    | undefined,
  phone: row[
    `primaryPhoneNumber-phones (${relationFieldName})`
  ] as string | undefined,
  city: row[
    `update:addressCity-addressCustom (${relationFieldName})`
  ] as string | undefined,
  state: row[
    `update:addressState-addressCustom (${relationFieldName})`
  ] as string | undefined,
});

export const AUTO_RESOLVE_THRESHOLD = 95;
export const REVIEW_THRESHOLD = 70;
