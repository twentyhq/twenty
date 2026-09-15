export const buildApplicationName = (
  partnerName: string | null | undefined,
  opportunityName: string | null | undefined,
): string => {
  const resolvedPartnerName = partnerName ?? 'Unassigned';
  const resolvedOpportunityName = opportunityName ?? 'No brief';
  return `${resolvedPartnerName} · ${resolvedOpportunityName}`;
};
