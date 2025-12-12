import type { PartialBlock } from '@blocknote/core';

export const prepareBodyWithSignedUrls = (
  newStringifiedBody: string,
): string => {
  if (!newStringifiedBody) return newStringifiedBody;

  const body: PartialBlock[] = JSON.parse(newStringifiedBody);

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
