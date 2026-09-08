import { type ReactNode, useSyncExternalStore } from 'react';
import { ThemeProvider } from '@ui/theme-constants/ThemeProvider';
import '@ui/theme-constants/theme-light.css';
import '@ui/theme-constants/theme-dark.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import { type Settings } from '../shared/types';

const subscribe = (listener: () => void) => {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
};
const getSnapshot = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches;

export const CompanionTheme = ({
  appearance,
  children,
}: {
  appearance: Settings['appearance'];
  children: ReactNode;
}) => {
  const systemDark = useSyncExternalStore(subscribe, getSnapshot);
  const colorScheme =
    appearance === 'system' ? (systemDark ? 'dark' : 'light') : appearance;
  return <ThemeProvider colorScheme={colorScheme}>{children}</ThemeProvider>;
};
