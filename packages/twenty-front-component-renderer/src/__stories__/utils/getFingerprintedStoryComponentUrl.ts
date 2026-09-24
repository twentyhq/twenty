export const getFingerprintedStoryComponentUrl = (checksum: string): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return `${origin}/built/${checksum}.js`;
};
