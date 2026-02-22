import {
  type FrontComponentCommandManifest,
  type FrontComponentManifest,
} from 'twenty-shared/application';

export type FrontComponentType = React.ComponentType<any>;

export type FrontComponentCommandConfig = FrontComponentCommandManifest;

export type FrontComponentConfig = Omit<
  FrontComponentManifest,
  | 'sourceComponentPath'
  | 'builtComponentPath'
  | 'builtComponentChecksum'
  | 'componentName'
> & {
  component: FrontComponentType;
};
