const LINKEDIN_PROFILE_SLUG_PATTERN = /linkedin\.com\/in\/([^/?#]+)/i;

export const getLinkedinProfileSlug = (url: string): string | null => {
  const slug = LINKEDIN_PROFILE_SLUG_PATTERN.exec(url)?.[1];

  return slug ? decodeURIComponent(slug).toLowerCase() : null;
};
