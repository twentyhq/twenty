import { isDefined } from './isDefined';

export const isURL = (url: string | undefined | null) =>
  isDefined(url) &&
  url.match(
    /^(https?:\/\/)?(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,63}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/i,
  );
