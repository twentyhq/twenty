import { type FullNameNode } from 'src/front-components/types/full-name-node.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const getFullName = (
  name: FullNameNode | null | undefined,
): string | undefined => {
  const fullName = [name?.firstName, name?.lastName]
    .filter(isNonEmptyString)
    .map((namePart) => namePart.trim())
    .join(' ');

  return isNonEmptyString(fullName) ? fullName : undefined;
};
