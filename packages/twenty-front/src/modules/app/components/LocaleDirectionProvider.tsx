import { DirectionProvider } from '@base-ui/react/direction-provider';
import { useLingui } from '@lingui/react';
import { type ReactNode } from 'react';
import { getLocaleTextDirection } from 'twenty-shared/translations';

type LocaleDirectionProviderProps = {
  children: ReactNode;
};

// twenty-ui components already read their direction from Base UI, but nothing
// ever provided one, so they all resolved to its ltr default no matter which
// locale was active.
export const LocaleDirectionProvider = ({
  children,
}: LocaleDirectionProviderProps) => {
  const { i18n } = useLingui();

  return (
    <DirectionProvider direction={getLocaleTextDirection(i18n.locale)}>
      {children}
    </DirectionProvider>
  );
};
