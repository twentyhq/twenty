import { type FrontComponent } from '~/generated-metadata/graphql';

export const isFrontComponentSelectableAsWidget = (
  frontComponent: Pick<
    FrontComponent,
    'isHeadless' | 'excludeFromWidgetSelection'
  >,
): boolean =>
  !frontComponent.isHeadless && !frontComponent.excludeFromWidgetSelection;
