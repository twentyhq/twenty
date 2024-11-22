import { LinkType } from 'twenty-ui';

export const checkUrlType = (url: string) => {
  if (/^(https?:\/\/)?(www\.)?linkedin\.com\/.+$/.test(url)) {
    return LinkType.LinkedIn;
  }
  if (/^(https?:\/\/)?(www\.)?twitter\.com\/.+$/.test(url)) {
    return LinkType.Twitter;
  }
  if (/^(https?:\/\/)?(www\.)?x\.com\/.+$/.test(url)) {
    return LinkType.Twitter;
  }

  return LinkType.Url;
};
