import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type ApplicationTokenPair } from '~/generated-metadata/graphql';

type FrontComponentApplicationTokenPairEffectProps = {
  frontComponentId: string;
  queriedApplicationTokenPair: ApplicationTokenPair | null | undefined;
  onApplicationTokenPairChange: (
    applicationTokenPair: ApplicationTokenPair | null,
  ) => void;
};

export const FrontComponentApplicationTokenPairEffect = ({
  frontComponentId,
  queriedApplicationTokenPair,
  onApplicationTokenPairChange,
}: FrontComponentApplicationTokenPairEffectProps) => {
  useEffect(() => {
    onApplicationTokenPairChange(null);
  }, [frontComponentId, onApplicationTokenPairChange]);

  useEffect(() => {
    if (!isDefined(queriedApplicationTokenPair)) {
      return;
    }

    onApplicationTokenPairChange(queriedApplicationTokenPair);
  }, [onApplicationTokenPairChange, queriedApplicationTokenPair]);

  return null;
};
