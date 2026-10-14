import { registerHooks } from 'node:module';

const sourceRoot = new URL('../src/', import.meta.url);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      context.parentURL?.startsWith(sourceRoot.href) &&
      specifier.startsWith('src/')
    ) {
      return nextResolve(
        new URL(`${specifier.slice(4)}.ts`, sourceRoot).href,
        context,
      );
    }
    return nextResolve(specifier, context);
  },
});
