import { isDefined } from 'twenty-shared/utils';
import { type FindOneFrontComponentQuery } from '~/generated-metadata/graphql';

type FrontComponentChecksums = Pick<
  NonNullable<FindOneFrontComponentQuery['frontComponent']>,
  'builtComponentChecksum' | 'frontComponentSharedDependenciesChecksum'
>;

export const hasFrontComponentChecksumChanged = ({
  previousFrontComponent,
  nextFrontComponent,
}: {
  previousFrontComponent: FrontComponentChecksums | null | undefined;
  nextFrontComponent: FrontComponentChecksums | null | undefined;
}): boolean => {
  if (!isDefined(previousFrontComponent) || !isDefined(nextFrontComponent)) {
    return false;
  }

  return (
    previousFrontComponent.builtComponentChecksum !==
      nextFrontComponent.builtComponentChecksum ||
    previousFrontComponent.frontComponentSharedDependenciesChecksum !==
      nextFrontComponent.frontComponentSharedDependenciesChecksum
  );
};
