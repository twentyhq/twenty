import { LinkType } from 'twenty-ui/navigation';
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
  if (/^(https?:\/\/)?(www\.)?facebook\.com\/.+$/.test(url)) {
    return LinkType.Facebook;
  }

  return LinkType.Url;
};
