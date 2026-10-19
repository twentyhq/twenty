import { isNull } from '@sniptt/guards';
import satisfies from 'semver/functions/satisfies';
import ltr from 'semver/ranges/ltr';
import validRange from 'semver/ranges/valid';

type NodeRequirementCheck =
  | 'satisfied'
  | 'belowMinimum'
  | 'outsideRange'
  | 'invalid';

export const checkNodeRequirement = ({
  version,
  range,
}: {
  version: string;
  range: string;
}): NodeRequirementCheck => {
  if (isNull(validRange(range))) {
    return 'invalid';
  }

  if (satisfies(version, range)) {
    return 'satisfied';
  }

  return ltr(version, range) ? 'belowMinimum' : 'outsideRange';
};
