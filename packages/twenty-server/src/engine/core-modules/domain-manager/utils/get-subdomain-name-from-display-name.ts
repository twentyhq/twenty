import { isDefined } from 'src/utils/is-defined';

export const getSubdomainNameFromDisplayName = (displayName?: string) => {
  if (!isDefined(displayName)) return;
  const displayNameWords = displayName.match(/(\w|\d)+/g);

  console.log('>>>>>>>>>>>>>>', displayNameWords);
  if (displayNameWords) {
    return displayNameWords.join('-').replace(/ /g, '').toLowerCase();
  }
};
