import { useTranslation } from 'react-i18next';

const useI18n = (nameSpaces: any) => {
  const { t: translate, i18n, ready } = useTranslation(nameSpaces);

  return { translate, i18n, ready };
};

export default useI18n;
