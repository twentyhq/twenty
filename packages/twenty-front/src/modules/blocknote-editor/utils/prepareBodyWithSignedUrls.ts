import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';

// TODO: This function is extracted but its not doing what it is supposed to do. It is not signing the urls. It is just parsing the image urls.
// tracking issue - https://github.com/twentyhq/twenty/issues/8351
export const prepareBodyWithSignedUrls = (
  newStringifiedBody: string,
): string => {
  if (!newStringifiedBody) return newStringifiedBody;

  const body = parseInitialBlocknote(newStringifiedBody);

  if (!body) return newStringifiedBody;

  const bodyWithSignedPayload = body.map((block) => {
    if (block.type !== 'image' || !block.props?.url) {
      return block;
    }

    const imageUrl = block.props.url;
    const parsedImageUrl = new URL(imageUrl);

    return {
      ...block,
      props: {
        ...block.props,
        url: parsedImageUrl.toString(),
      },
    };
  });

  return JSON.stringify(bodyWithSignedPayload);
};
