import { splitCssDeclarations } from '@/polyfills/dom/utils/splitCssDeclarations';

const camelToKebab = (property: string): string =>
  property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

export const createLocalStyleDeclaration = (): Record<string, unknown> => {
  const styleStore: Record<string, string> = {};

  const serializeCssText = (): string =>
    Object.entries(styleStore)
      .map(([key, value]) => `${key}:${value}`)
      .join(';');

  return new Proxy(styleStore, {
    get: (target, property) => {
      if (property === 'cssText') {
        return serializeCssText();
      }

      if (property === 'setProperty') {
        return (name: string, value: string | null) => {
          if (value === null || value === '') {
            delete target[name];
            return;
          }

          target[name] = String(value);
        };
      }

      if (property === 'removeProperty') {
        return (name: string): string => {
          const previousValue = target[name] ?? '';
          delete target[name];

          return previousValue;
        };
      }

      if (property === 'getPropertyValue') {
        return (name: string): string => target[name] ?? '';
      }

      if (typeof property === 'string') {
        return target[camelToKebab(property)] ?? '';
      }

      return undefined;
    },
    set: (target, property, value) => {
      if (typeof property !== 'string') {
        return true;
      }

      if (property === 'cssText') {
        for (const key of Object.keys(target)) {
          delete target[key];
        }

        for (const declaration of splitCssDeclarations(String(value))) {
          const colonIndex = declaration.indexOf(':');

          if (colonIndex <= 0) {
            continue;
          }

          const declarationKey = declaration.slice(0, colonIndex).trim();
          const declarationValue = declaration.slice(colonIndex + 1).trim();

          if (declarationKey !== '' && declarationValue !== '') {
            target[declarationKey] = declarationValue;
          }
        }

        return true;
      }

      const kebabKey = camelToKebab(property);

      if (value === null || value === undefined || value === '') {
        delete target[kebabKey];

        return true;
      }

      target[kebabKey] = String(value);

      return true;
    },
  });
};
