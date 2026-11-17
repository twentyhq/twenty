import { createCssInjectionPlugin } from 'twenty-shared/front-component-build';

import { getWatchInputPlugins } from '@/app/dev/collect-watch-inputs';

export const createAppCssInjectionPlugin = ({
  onSourceFiles,
}: {
  onSourceFiles?: ({
    paths,
    entryPath,
  }: {
    paths: string[];
    entryPath: string;
  }) => void;
} = {}) =>
  createCssInjectionPlugin({
    getBuildPlugins: getWatchInputPlugins,
    onSourceFiles,
  });
