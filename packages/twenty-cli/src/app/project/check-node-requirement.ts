import { isNull } from '@sniptt/guards';
import satisfies from 'semver/functions/satisfies';
import validRange from 'semver/ranges/valid';

type NodeRequirementCheck = 'satisfied' | 'unsatisfied' | 'invalid';

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

  return satisfies(version, range) ? 'satisfied' : 'unsatisfied';
};
