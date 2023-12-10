export const stringToHslColor = (
  str: string,
  saturation: number,
  lightness: number,
) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = hash % 360;
  return 'hsl(' + h + ', ' + saturation + '%, ' + lightness + '%)';
};
