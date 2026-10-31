const LINKEDIN_PROFILE_SLUG_PATTERN = /linkedin\.com\/in\/([^/?#]+)/i;

const decodeSlug = (slug: string): string => {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
};

export const getLinkedinProfileSlug = (url: string): string | null => {
  const slug = LINKEDIN_PROFILE_SLUG_PATTERN.exec(url)?.[1];

  return slug ? decodeSlug(slug).normalize('NFC').toLowerCase() : null;
};
