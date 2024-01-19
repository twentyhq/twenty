import { I18nextProvider } from 'react-i18next';

import i18n from '../index';

type AppI18nProviderProps = {
  children: JSX.Element;
};

export const AppI18nProvider = ({ children }: AppI18nProviderProps) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
