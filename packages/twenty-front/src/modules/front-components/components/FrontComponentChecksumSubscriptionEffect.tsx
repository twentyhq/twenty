import { useOnFrontComponentUpdated } from '@/front-components/hooks/useOnFrontComponentUpdated';
import { useCallback } from 'react';

type FrontComponentChecksumSubscriptionEffectProps = {
  frontComponentId: string;
  onChecksumUpdate: (checksum: string) => void;
};

export const FrontComponentChecksumSubscriptionEffect = ({
  frontComponentId,
  onChecksumUpdate,
}: FrontComponentChecksumSubscriptionEffectProps) => {
  const handleFrontComponentUpdated = useCallback(
    (eventData: {
      onFrontComponentUpdated: {
        id: string;
        builtComponentChecksum: string;
        updatedAt: string;
      };
    }) => {
      const newChecksum =
        eventData.onFrontComponentUpdated.builtComponentChecksum;

      onChecksumUpdate(newChecksum);
    },
    [onChecksumUpdate],
  );

  useOnFrontComponentUpdated({
    frontComponentId,
    onData: handleFrontComponentUpdated,
  });

  return null;
};
