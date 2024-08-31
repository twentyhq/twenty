export const isValidUrl = (url: string) => {
  const urlRegex =
    /^(https?:\/\/)?((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|(localhost))(:\d+)?(\/[^\s]*)?(\?[^\s]*)?$/;

  const urlPattern = new RegExp(urlRegex, 'i');

  return !!urlPattern.test(url);
};
