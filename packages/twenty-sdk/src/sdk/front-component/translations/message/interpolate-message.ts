import { type TranslationValues } from './translation-values.type';

export const interpolateMessage = (
  template: string,
  values?: TranslationValues,
): string => {
  if (values === undefined) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name)
      ? String(values[name])
      : placeholder,
  );
};
