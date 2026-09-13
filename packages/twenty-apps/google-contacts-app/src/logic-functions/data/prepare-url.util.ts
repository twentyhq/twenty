import { isNonEmptyString } from "@sniptt/guards";

const GOOGLE_PAGE_SIZE = 1000;

const PERSON_FIELDS = [
  'emailAddresses',
  'names',
  'organizations',
  'phoneNumbers',
  'photos',
  'urls',
].join(',');

export const prepareUrl = ({
  syncToken,
  pageToken,
}: {
  syncToken: string | null;
  pageToken: string | undefined;
}): string => {
  const searchParams = new URLSearchParams({
    pageSize: String(GOOGLE_PAGE_SIZE),
    requestSyncToken: 'true',
    personFields: PERSON_FIELDS,
  });

  if (isNonEmptyString(syncToken)) {
    searchParams.set('syncToken', syncToken);
  }

  if (isNonEmptyString(pageToken)) {
    searchParams.set('pageToken', pageToken);
  }

  return `/people/me/connections?${searchParams.toString()}`;
};
