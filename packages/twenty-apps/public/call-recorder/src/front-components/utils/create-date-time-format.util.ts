export const createDateTimeFormat = ({
  locale,
  formatOptions,
}: {
  locale: string | undefined;
  formatOptions: Intl.DateTimeFormatOptions;
}): Intl.DateTimeFormat => {
  try {
    return new Intl.DateTimeFormat(locale, formatOptions);
  } catch {
    // Host locales such as pseudo-locales are not always valid BCP 47 tags.
    return new Intl.DateTimeFormat(undefined, formatOptions);
  }
};
