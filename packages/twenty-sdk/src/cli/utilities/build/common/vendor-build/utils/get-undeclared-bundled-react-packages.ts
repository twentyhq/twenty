import type * as esbuild from 'esbuild';

import { REACT_VENDOR_SPECIFIERS } from '@/cli/utilities/build/common/vendor-build/constants/react-vendor-specifiers.constant';

const REACT_PACKAGE_NAMES = [
  REACT_VENDOR_SPECIFIERS.react,
  REACT_VENDOR_SPECIFIERS.reactDom,
];

const buildPackageInputPattern = (packageName: string): RegExp =>
  new RegExp(`(^|/)node_modules/${packageName}/`);

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
