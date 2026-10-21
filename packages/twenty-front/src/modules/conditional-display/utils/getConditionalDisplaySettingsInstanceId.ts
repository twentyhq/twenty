import { type ConditionalDisplaySurface } from 'twenty-shared/types';

export const getConditionalDisplaySettingsInstanceId = ({
  surface,
  surfaceId,
}: {
  surface: ConditionalDisplaySurface;
  surfaceId: string;
}) => {
  const instanceId = `conditional-display-${surface}-${surfaceId}`;

  return {
    instanceId,
  };
};
