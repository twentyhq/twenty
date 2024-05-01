import { ExtensionResolverType } from 'src/engine/api/graphql/workspace-schema-extension/types/extension-resolver';
import { TypedReflect } from 'src/utils/typed-reflect';

export const ExtensionResolver = (type: ExtensionResolverType) => {
  return (target: any, propertyKey: string) => {
    TypedReflect.defineMetadata(
      'extensionResolverType',
      type,
      target,
      propertyKey,
    );
  };
};
