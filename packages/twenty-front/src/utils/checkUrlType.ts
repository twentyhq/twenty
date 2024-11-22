import { LinkType } from 'twenty-ui';

export const checkUrlType = (url: string) => {
  if (/^(https?:\/\/)?(www\.)?linkedin\.com(\/[\w\-/?#:.%=&]*)?$/.test(url)) {
    return LinkType.LinkedIn;
  }
  if (/^(https?:\/\/)?(www\.)?twitter\.com(\/[\w\-/?#:.%=&]*)?$/.test(url)) {
    return LinkType.Twitter;
  }

  return LinkType.Url;
};
