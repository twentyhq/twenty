import { isArray, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

export const collectIdentifiers = ({
  value,
  identifiers,
}: {
  value: unknown;
  identifiers: Set<string>;
}): void => {
  if (isArray(value)) {
    value.forEach((entry) => collectIdentifiers({ value: entry, identifiers }));
  } else if (isPlainObject(value)) {
    if (isString(value.universalIdentifier)) {
      identifiers.add(value.universalIdentifier.toLowerCase());
    }
    Object.values(value).forEach((entry) =>
      collectIdentifiers({ value: entry, identifiers }),
    );
  }
};
