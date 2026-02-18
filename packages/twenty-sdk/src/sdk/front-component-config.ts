import { type FrontComponentManifest } from 'twenty-shared/application';

export type FrontComponentRenderFunction = (
  container: HTMLElement,
) => void | (() => void);

export type FrontComponentType =
  | React.ComponentType<any>
  | FrontComponentRenderFunction;

export type FrontComponentConfig = Omit<
  FrontComponentManifest,
  | 'sourceComponentPath'
  | 'builtComponentPath'
  | 'builtComponentChecksum'
  | 'componentName'
> & {
  component: FrontComponentType;
};
