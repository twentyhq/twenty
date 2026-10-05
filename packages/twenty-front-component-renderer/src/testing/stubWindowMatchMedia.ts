export const stubWindowMatchMedia = (matchingQueries: string[] = []) => {
  const createdMediaQueryLists: EventTarget[] = [];

  const matchMedia = jest.fn((media: string) => {
    const mediaQueryList = Object.assign(new EventTarget(), {
      media,
      matches: matchingQueries.includes(media),
    });

    createdMediaQueryLists.push(mediaQueryList);

    return mediaQueryList;
  });

  Object.defineProperty(window, 'matchMedia', {
    value: matchMedia,
    configurable: true,
    writable: true,
  });

  return { matchMedia, createdMediaQueryLists };
};
