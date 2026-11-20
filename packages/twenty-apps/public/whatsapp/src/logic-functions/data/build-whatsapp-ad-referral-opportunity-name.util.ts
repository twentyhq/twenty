import { isNonEmptyString } from '@sniptt/guards';

export const buildWhatsAppAdReferralOpportunityName = ({
  person,
  adHeadline,
}: {
  person: { name: { firstName: string | null; lastName: string | null } | null } | null;
  adHeadline: string;
}) => {
  const personName = [person?.name?.firstName, person?.name?.lastName].filter(isNonEmptyString).join(' ');

  return isNonEmptyString(personName) ? `${personName} · ${adHeadline}` : adHeadline;
};
