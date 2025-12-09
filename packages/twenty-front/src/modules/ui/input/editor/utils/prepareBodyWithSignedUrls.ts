export const prepareBodyWithSignedUrls = (
  newStringifiedBody: string,
): string => {
  if (!newStringifiedBody) return newStringifiedBody;

  const body = JSON.parse(newStringifiedBody);

  const bodyWithSignedPayload = body.map((block: any) => {
    if (block.type !== 'image' || !block.props?.url) {
      return block;
    }

    const imageProps = block.props;
    const imageUrl = new URL(imageProps.url);

    return {
      ...block,
      props: {
        ...imageProps,
        url: `${imageUrl.toString()}`,
      },
    };
  });

  return JSON.stringify(bodyWithSignedPayload);
};
