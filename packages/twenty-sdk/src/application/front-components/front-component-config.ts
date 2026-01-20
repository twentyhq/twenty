import { type FrontComponentManifest } from 'twenty-shared/application';

export type FrontComponentType = React.ComponentType<any>;

export type FrontComponentConfig = Omit<
  FrontComponentManifest,
  'componentPath' | 'componentName'
> & {
  name?: string;
  description?: string;
  component: FrontComponentType;
};
