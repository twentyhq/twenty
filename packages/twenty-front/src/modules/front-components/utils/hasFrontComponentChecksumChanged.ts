import { type FrontComponentChecksums } from '@/front-components/types/FrontComponentChecksums';
import { isDefined } from 'twenty-shared/utils';

export const hasFrontComponentChecksumChanged = ({
  previousFrontComponent,
  nextFrontComponent,
}: {
  previousFrontComponent: FrontComponentChecksums;
  nextFrontComponent: FrontComponentChecksums | null | undefined;
}): boolean => {
  if (!isDefined(nextFrontComponent)) {
    return false;
  }

  return (
    previousFrontComponent.builtComponentChecksum !==
      nextFrontComponent.builtComponentChecksum ||
    (previousFrontComponent.frontComponentSharedDependenciesChecksum ??
      null) !==
      (nextFrontComponent.frontComponentSharedDependenciesChecksum ?? null)
  );
};
