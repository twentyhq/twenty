import { type FrontComponentManifest } from 'twenty-shared/application';

export type FrontComponentType = React.ComponentType<any>;

// `settingsTab` is derived from the `tab` option of
// defineSettingsFrontComponent(), never authored: accepting it here would let a
// regular component mark itself a settings tab without that function's checks.
export type FrontComponentConfig = Omit<
  FrontComponentManifest,
  | 'sourceComponentPath'
  | 'builtComponentPath'
  | 'builtComponentChecksum'
  | 'componentName'
  | 'usesSdkClient'
  | 'settingsTab'
> & {
  component: FrontComponentType;
};
