import { frontComponentApplicationTokenPairComponentState } from '@/front-components/states/frontComponentApplicationTokenPairComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';
import { type ApplicationTokenPair } from '~/generated-metadata/graphql';

type FrontComponentApplicationTokenPairEffectProps = {
  frontComponentId: string;
  applicationTokenPair: ApplicationTokenPair | null;
};

export const FrontComponentApplicationTokenPairEffect = ({
  frontComponentId,
  applicationTokenPair,
}: FrontComponentApplicationTokenPairEffectProps) => {
  const setFrontComponentApplicationTokenPair = useSetAtomComponentState(
    frontComponentApplicationTokenPairComponentState,
    frontComponentId,
  );

  useEffect(() => {
    setFrontComponentApplicationTokenPair(applicationTokenPair);
  }, [applicationTokenPair, setFrontComponentApplicationTokenPair]);

  return null;
};
