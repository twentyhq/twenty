import { useLingui } from '@lingui/react';
import { type ReactNode } from 'react';
import { getLocaleTextDirection } from 'twenty-shared/translations';
import { DirectionProvider } from 'twenty-ui/primitives/layout';

type LocaleDirectionProviderProps = {
  children: ReactNode;
};

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
