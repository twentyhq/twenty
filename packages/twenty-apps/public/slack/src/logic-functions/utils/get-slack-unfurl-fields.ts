import { isDefined } from 'twenty-sdk/utils';

import { type SlackUnfurlOptions } from 'src/logic-functions/types/slack-unfurl-options.type';

type SlackUnfurlFields = {
  unfurl_links?: boolean;
  unfurl_media?: boolean;
};

export const getSlackUnfurlFields = ({
  unfurlLinks,
  unfurlMedia,
}: SlackUnfurlOptions): SlackUnfurlFields => ({
  ...(isDefined(unfurlLinks) ? { unfurl_links: unfurlLinks } : {}),
  ...(isDefined(unfurlMedia) ? { unfurl_media: unfurlMedia } : {}),
});
