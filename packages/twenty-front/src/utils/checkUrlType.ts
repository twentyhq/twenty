import { LinkType } from '@/ui/navigation/link/components/SocialLink';

import { isNonNullable } from './isNonNullable';

export const checkUrlType = (url: string) => {
  if (
    /^(http|https):\/\/(?:www\.)?linkedin.com(\w+:{0,1}\w*@)?(\S+)(:([0-9])+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(
      url,
    )
  ) {
    return LinkType.LinkedIn;
  }
  if (
    isNonNullable(
      /^((http|https):\/\/)?(?:www\.)?twitter\.com\/(\w+)?/i.exec(url),
    )
  ) {
    return LinkType.Twitter;
  }

  return LinkType.Url;
};
