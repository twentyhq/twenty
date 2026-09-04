export const extractHttpUrls = (text: string): string[] =>
  [...text.matchAll(/https?:\/\/[^\s<>|()[\]"'`*]+/g)].map((match) => {
    const url = match[0];

    // ? and ! are only real URL characters inside a query or fragment, so
    // they are trimmed as sentence punctuation when there is none
    return /[?#]./.test(url)
      ? url.replace(/[.,;:]+$/, '')
      : url.replace(/[.,;:!?]+$/, '');
  });
