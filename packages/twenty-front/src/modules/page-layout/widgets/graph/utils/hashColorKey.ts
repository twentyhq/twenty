export const hashColorKey = (colorKey: string): number => {
  let hash = 0;
  for (let i = 0; i < colorKey.length; i++) {
    hash = colorKey.charCodeAt(i) + ((hash << 5) - hash);
  }

  return Math.abs(hash);
};
