import { type AtomEffect } from 'recoil';

export const cssVariableEffect =
  (cssVariableName: string): AtomEffect<number> =>
  ({ node, onSet, trigger, getLoadable }) => {
    if (trigger === 'get') {
      const loadable = getLoadable(node);
      if (loadable.state === 'hasValue') {
        document.documentElement.style.setProperty(
          cssVariableName,
          `${loadable.contents}px`,
        );
      }
    }

    onSet((newValue) => {
      document.documentElement.style.setProperty(
        cssVariableName,
        `${newValue}px`,
      );
    });
  };
