import type * as esbuild from 'esbuild';

const REACT_PACKAGE_NAMES = ['react', 'react-dom'];

const buildPackageInputPattern = (packageName: string): RegExp =>
  new RegExp(`(^|/)node_modules/${packageName}/`);

// A react copy bundled inside the vendor is a different instance from the one
// each component bundles, so hooks called by the vendored library read a null
// dispatcher and every render throws. Declaring react makes both sides share
// the vendored copy.
export const getUndeclaredBundledReactPackages = ({
  metafile,
  dependencies,
}: {
  metafile: esbuild.Metafile;
  dependencies: string[];
}): string[] => {
  const inputPaths = Object.keys(metafile.inputs);

  return REACT_PACKAGE_NAMES.filter((packageName) => {
    const isDeclared = dependencies.some(
      (dependency) =>
        dependency === packageName || dependency.startsWith(`${packageName}/`),
    );

    if (isDeclared) {
      return false;
    }

    const packageInputPattern = buildPackageInputPattern(packageName);

    return inputPaths.some((inputPath) => packageInputPattern.test(inputPath));
  });
};
