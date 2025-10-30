import { ViewVisibility } from '@/views/types/ViewVisibility';
import { ViewVisibility as CoreViewVisibility } from '~/generated-metadata/graphql';

export const convertCoreViewVisibilityToViewVisibility = (
  coreViewVisibility: CoreViewVisibility | null | undefined,
): ViewVisibility => {
  if (!coreViewVisibility) {
    return ViewVisibility.WORKSPACE;
  }

  const coreViewVisibilityToViewVisibilityMapping: Record<
    CoreViewVisibility,
    ViewVisibility
  > = {
    [CoreViewVisibility.WORKSPACE]: ViewVisibility.WORKSPACE,
    [CoreViewVisibility.UNLISTED]: ViewVisibility.UNLISTED,
  };

  return (
    coreViewVisibilityToViewVisibilityMapping[coreViewVisibility] ??
    ViewVisibility.WORKSPACE
  );
};
