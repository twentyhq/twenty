export const toStyleKey = (cssText: string) => {
  let cssTextHash = 0;
  for (
    let characterIndex = 0;
    characterIndex < cssText.length;
    characterIndex++
  ) {
    cssTextHash =
      ((cssTextHash << 5) - cssTextHash + cssText.charCodeAt(characterIndex)) |
      0;
  }
  return 'jsx-style-' + cssTextHash;
};
