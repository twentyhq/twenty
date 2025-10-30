import { ViewVisibility } from '@/views/types/ViewVisibility';
import { ViewVisibility as CoreViewVisibility } from '~/generated-metadata/graphql';

export const convertViewVisibilityToCore = (
  viewVisibility: ViewVisibility,
): CoreViewVisibility => {
  const viewVisibilityToCoreViewVisibilityMapping: Record<
    ViewVisibility,
    CoreViewVisibility
  > = {
    [ViewVisibility.WORKSPACE]: CoreViewVisibility.WORKSPACE,
    [ViewVisibility.UNLISTED]: CoreViewVisibility.UNLISTED,
  };

  return (
    viewVisibilityToCoreViewVisibilityMapping[viewVisibility] ??
    CoreViewVisibility.WORKSPACE
  );
};
