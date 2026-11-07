import { createCssInjectionPlugin } from 'twenty-shared/front-component-build';

import { getWatchInputPlugins } from '@/app/dev/collect-watch-inputs';

export const cssInjectionPlugin = createCssInjectionPlugin({
  getBuildPlugins: getWatchInputPlugins,
});
