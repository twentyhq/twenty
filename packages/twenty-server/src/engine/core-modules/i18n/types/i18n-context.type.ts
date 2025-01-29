export type I18nContext = {
  req: {
    headers: {
      'x-locale': string | undefined;
    };
  };
};
