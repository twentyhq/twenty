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

    // Relative or malformed URLs must not throw — that aborts debounced rich
    // text persistence (see #23028). Leave the original URL unchanged when
    // it cannot be parsed as an absolute URL.
    try {
      const parsedImageUrl = new URL(imageUrl);

      return {
        ...block,
        props: {
          ...block.props,
          url: parsedImageUrl.toString(),
        },
      };
    } catch {
      return block;
    }
  });

  return JSON.stringify(bodyWithSignedPayload);
};
