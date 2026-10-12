import {
  type FrontComponent,
  type FrontComponentSurface,
} from '~/generated-metadata/graphql';

export const isFrontComponentAvailableOn = ({
  frontComponent,
  surface,
}: {
  frontComponent: Pick<FrontComponent, 'isHeadless' | 'availableOn'>;
  surface: FrontComponentSurface;
}): boolean => {
  return (
    !frontComponent.isHeadless && frontComponent.availableOn.includes(surface)
  );
};
