import { type FrontComponentConfig } from '@/app/manifest/types/front-component-config.type';
import { type FrontComponentManifest } from 'twenty-shared/application';

export const fromFrontComponentConfigToFrontComponentManifest = ({
  frontComponentConfig,
  sourcePath,
}: {
  frontComponentConfig: FrontComponentConfig;
  sourcePath: string;
}): FrontComponentManifest => {
  const { component, ...rest } = frontComponentConfig;

  return {
    ...rest,
    componentName: component.name,
    sourceComponentPath: sourcePath,
    builtComponentPath: sourcePath.replace(/\.tsx?$/, '.mjs'),
    builtComponentChecksum: '',
    isHeadless: rest.isHeadless ?? false,
  };
};
