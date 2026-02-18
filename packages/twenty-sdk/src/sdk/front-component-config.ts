import {
  type CommandMenuItemManifest,
  type FrontComponentManifest,
} from 'twenty-shared/application';

export type FrontComponentType = React.ComponentType<any>;

export type FrontComponentCommandConfig = Omit<
  CommandMenuItemManifest,
  'frontComponentUniversalIdentifier'
>;

export type FrontComponentConfig = Omit<
  FrontComponentManifest,
  | 'sourceComponentPath'
  | 'builtComponentPath'
  | 'builtComponentChecksum'
  | 'componentName'
> & {
  component: FrontComponentType;
  command?: FrontComponentCommandConfig;
};
