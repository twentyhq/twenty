import path from 'path';

import { computePackageJsonFilesAndExportsConfig } from './utils/computePackageJsonFilesAndExportsConfig';
import { computeProjectNxBuildOutputsPath } from './utils/computeProjectNxBuildOutputsPath';
import { createTypeScriptFile } from './utils/createTypeScriptFile';
import { generateModuleIndexFiles } from './utils/generateModuleIndexFiles';
import { getSubDirectoryPaths } from './utils/getSubDirectoryPaths';
import { retrieveExportsByBarrel } from './utils/retrieveExportsByBarrel';
import { updateNxProjectConfigurationBuildOutputs } from './utils/updateNxProjectConfigurationBuildOutputs';
import { writeInPackageJson } from './utils/writeInPackageJson';

const parseArgs = (
  args: string[],
): { packagePath: string; withStyleCssExport: boolean } => {
  let packagePath: string | undefined;
  let withStyleCssExport = false;

  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--package-path' && index + 1 < args.length) {
      packagePath = args[index + 1];
      index++;
    } else if (args[index] === '--with-style-css-export') {
      withStyleCssExport = true;
    }
  }

  if (!packagePath) {
    throw new Error(
      'Usage: generate-barrels --package-path <path> [--with-style-css-export]',
    );
  }

  return { packagePath, withStyleCssExport };
};

const main = () => {
  const { packagePath, withStyleCssExport } = parseArgs(process.argv.slice(2));

  const resolvedPackagePath = path.resolve(packagePath);
  const srcPath = path.resolve(`${resolvedPackagePath}/src`);
  const packageJsonPath = path.join(resolvedPackagePath, 'package.json');
  const projectConfigPath = path.join(resolvedPackagePath, 'project.json');

  const moduleDirectories = getSubDirectoryPaths(srcPath, srcPath);
  const exportsByBarrel = retrieveExportsByBarrel(moduleDirectories, srcPath);
  const moduleIndexFiles = generateModuleIndexFiles(exportsByBarrel);
  const packageJsonConfig = computePackageJsonFilesAndExportsConfig(
    moduleDirectories,
    withStyleCssExport,
  );
  const nxBuildOutputsPath =
    computeProjectNxBuildOutputsPath(moduleDirectories);

  updateNxProjectConfigurationBuildOutputs(
    projectConfigPath,
    nxBuildOutputsPath,
  );
  writeInPackageJson(packageJsonPath, packageJsonConfig);
  moduleIndexFiles.forEach(createTypeScriptFile);
};

main();
