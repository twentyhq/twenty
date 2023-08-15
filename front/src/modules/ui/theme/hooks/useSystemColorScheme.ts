import { useEffect, useMemo, useState } from 'react';

import { ColorScheme } from '~/generated/graphql';

type SystemColorScheme = ColorScheme.Light | ColorScheme.Dark;

export function useSystemColorScheme(): SystemColorScheme {
  const mediaQuery = useMemo(
    () => window.matchMedia('(prefers-color-scheme: dark)'),
    [],
  );

  const [preferredColorScheme, setPreferredColorScheme] =
    useState<SystemColorScheme>(
      !window.matchMedia || !mediaQuery.matches
        ? ColorScheme.Light
        : ColorScheme.Dark,
    );

  useEffect(() => {
    if (!window.matchMedia) {
      return;
    }

    function handleChange(event: MediaQueryListEvent): void {
      setPreferredColorScheme(
        event.matches ? ColorScheme.Dark : ColorScheme.Light,
      );
    }

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [mediaQuery]);

  return preferredColorScheme;
}
