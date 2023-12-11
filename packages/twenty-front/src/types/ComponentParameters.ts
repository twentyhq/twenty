export type ComponentParameters<
  ComponentTypeToExtract extends (args: object) => JSX.Element,
> = Parameters<ComponentTypeToExtract>[0];
