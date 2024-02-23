import { LinkType } from '@/ui/navigation/link/components/SocialLink';

export const checkUrlType = (url: string) => {
  if (
    /^(http|https):\/\/(?:www\.)?linkedin.com(\w+:{0,1}\w*@)?(\S+)(:([0-9])+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(
      url,
    )
  ) {
    return LinkType.LinkedIn;
  }
  if (url.match(/^((http|https):\/\/)?(?:www\.)?twitter\.com\/(\w+)?/i)) {
    return LinkType.Twitter;
  }

  return LinkType.Url;
};
