import { isNonEmptyString } from '@sniptt/guards';

export const buildAdOpportunityName = ({
  personName,
  adTitle,
}: {
  personName: { firstName?: string | null; lastName?: string | null } | null;
  adTitle: string | undefined;
}) => {
  const fullName = [personName?.firstName, personName?.lastName]
    .filter(isNonEmptyString)
    .join(' ');
  const source = isNonEmptyString(adTitle) ? adTitle : 'Messenger ad';

  return isNonEmptyString(fullName) ? `${fullName} · ${source}` : source;
};
