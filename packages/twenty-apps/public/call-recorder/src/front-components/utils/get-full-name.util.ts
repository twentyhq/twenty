import { isNonEmptyString } from '@sniptt/guards';

import { type FullNameNode } from 'src/front-components/types/full-name-node.type';

export const getFullName = (
  name: FullNameNode | null | undefined,
): string | undefined => {
  const fullName = [name?.firstName, name?.lastName]
    .map((namePart) => namePart?.trim())
    .filter((namePart): namePart is string => isNonEmptyString(namePart))
    .join(' ');

  return isNonEmptyString(fullName) ? fullName : undefined;
};
