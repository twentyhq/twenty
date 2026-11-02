export const UNLINKED_PERSON_FILTER = {
  or: [
    { linkedinLink: { primaryLinkUrl: { is: 'NULL' as const } } },
    { linkedinLink: { primaryLinkUrl: { eq: '' } } },
  ],
};
