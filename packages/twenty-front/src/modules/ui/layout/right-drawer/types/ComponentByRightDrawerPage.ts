import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';

export type ComponentByRightDrawerPage = {
  [componentName in RightDrawerPages]?: JSX.Element;
};
