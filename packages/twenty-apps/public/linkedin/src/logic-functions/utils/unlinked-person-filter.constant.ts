export const UNLINKED_PERSON_FILTER = {
  or: [
    { linkedinLink: { primaryLinkUrl: { is: 'NULL' } } },
    { linkedinLink: { primaryLinkUrl: { eq: '' } } },
  ],
};
