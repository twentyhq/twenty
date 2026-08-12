import { type SlackUnfurlOptions } from 'src/logic-functions/types/slack-unfurl-options.type';

type SlackUnfurlFields = {
  unfurl_links?: boolean;
  unfurl_media?: boolean;
};

export const getSlackUnfurlFields = ({
  unfurlLinks,
  unfurlMedia,
}: SlackUnfurlOptions): SlackUnfurlFields => ({
  ...(unfurlLinks === undefined ? {} : { unfurl_links: unfurlLinks }),
  ...(unfurlMedia === undefined ? {} : { unfurl_media: unfurlMedia }),
});
