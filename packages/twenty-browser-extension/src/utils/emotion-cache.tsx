import { default as createCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { type FC } from 'react';
import { Theme } from '~ui/theme/context';

export const withTheme = (Component: FC, container: Element) => {
  return function withEmotionCache() {
    const styleCache = createCache({
      key: "twenty-extension-cache",
      prepend: true,
      container
    });

    return (
      <Theme>
        <CacheProvider value={styleCache}>
          <Component/>
        </CacheProvider>
      </Theme>
    );
  }
}
