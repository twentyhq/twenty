import { isNonEmptyString } from '@sniptt/guards';

const normalizeHostname = (hostname: string) =>
  hostname.trim().toLowerCase().replace(/\.$/, '');

export const isInstanceHostname = ({
  hostname,
  instanceHostnames,
}: {
  hostname: string;
  instanceHostnames: (string | undefined)[];
}): boolean => {
  const normalizedHostname = normalizeHostname(hostname);

  return instanceHostnames
    .filter(isNonEmptyString)
    .map(normalizeHostname)
    .some(
      (instanceHostname) =>
        normalizedHostname === instanceHostname ||
        normalizedHostname.endsWith(`.${instanceHostname}`),
    );
};
