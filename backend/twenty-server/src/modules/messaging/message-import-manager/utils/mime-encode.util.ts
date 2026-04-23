export const mimeEncode = (raw: string) => {
  return `=?UTF-8?B?${Buffer.from(raw).toString('base64')}?=`;
};
