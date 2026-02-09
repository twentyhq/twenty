import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { type EntityFilePaths } from '@/cli/utilities/build/manifest/manifest-extract-config';
import {
  manifestUpdateChecksums,
  type UpdateManifestChecksumParams,
} from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { manifestValidate } from '@/cli/utilities/build/manifest/manifest-validate';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import {
  createFrontComponentsWatcher,
  createLogicFunctionsWatcher,
} from '@/cli/utilities/build/common/esbuild-watcher';
import crypto from 'crypto';
import * as fs from 'fs-extra';
import { dirname, join } from 'path';
import {
  type Manifest,
  ASSETS_DIR,
  OUTPUT_DIR,
} from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

export type BuildPipelineResult = {
  success: boolean;
  manifest: Manifest | null;
  errors: string[];
  warnings: string[];
  filePaths: EntityFilePaths;
};

const copyFileToOutput = async (
  appPath: string,
  sourcePath: string,
  fileFolder: FileFolder,
  builtFileInfos: UpdateManifestChecksumParams['builtFileInfos'],
) => {
  const absoluteSourcePath = join(appPath, sourcePath);
  const outputPath = join(OUTPUT_DIR, sourcePath);
  const absoluteOutputPath = join(appPath, outputPath);

  await fs.ensureDir(dirname(absoluteOutputPath));
  await fs.copy(absoluteSourcePath, absoluteOutputPath);

  const content = await fs.readFile(absoluteOutputPath);
  const checksum = crypto.createHash('md5').update(content).digest('hex');

  builtFileInfos.set(outputPath, {
    checksum,
    builtPath: outputPath,
    fileFolder,
  });
};

// Runs the full build pipeline in-process without any API calls.
// Replicates what DevModeOrchestrator.performSync does, minus the
// server interaction (validateAuth, checkApplicationExist,
// createApplication, uploadFile, syncApplication).
export const runBuildPipeline = async (
  appPath: string,
): Promise<BuildPipelineResult> => {
  const outputDir = join(appPath, OUTPUT_DIR);

  await fs.ensureDir(outputDir);
  await fs.emptyDir(outputDir);

  const result = await buildManifest(appPath);

  if (result.errors.length > 0 || !result.manifest) {
    return {
      success: false,
      manifest: null,
      errors: result.errors,
      warnings: [],
      filePaths: result.filePaths,
    };
  }

  const validation = manifestValidate(result.manifest);

  if (!validation.isValid) {
    return {
      success: false,
      manifest: null,
      errors: validation.errors,
      warnings: validation.warnings,
      filePaths: result.filePaths,
    };
  }

  const builtFileInfos: UpdateManifestChecksumParams['builtFileInfos'] =
    new Map();

  const buildErrors: string[] = [];

  const logicFunctionsWatcher = createLogicFunctionsWatcher({
    appPath,
    sourcePaths: result.filePaths.logicFunctions,
    watch: false,
    handleFileBuilt: ({ builtPath, checksum, fileFolder }) => {
      builtFileInfos.set(builtPath, { checksum, builtPath, fileFolder });
    },
    handleBuildError: (errors) => {
      for (const error of errors) {
        buildErrors.push(error.error);
      }
    },
  });

  const frontComponentsWatcher = createFrontComponentsWatcher({
    appPath,
    sourcePaths: result.filePaths.frontComponents,
    watch: false,
    handleFileBuilt: ({ builtPath, checksum, fileFolder }) => {
      builtFileInfos.set(builtPath, { checksum, builtPath, fileFolder });
    },
    handleBuildError: (errors) => {
      for (const error of errors) {
        buildErrors.push(error.error);
      }
    },
  });

  await logicFunctionsWatcher.start();
  await frontComponentsWatcher.start();

  // Copy public assets to output
  const assetsDir = join(appPath, ASSETS_DIR);

  if (await fs.pathExists(assetsDir)) {
    const { glob } = await import('fast-glob');
    const assetFiles = await glob([`${ASSETS_DIR}/**/*`], {
      cwd: appPath,
      onlyFiles: true,
    });

    for (const assetFile of assetFiles) {
      await copyFileToOutput(
        appPath,
        assetFile,
        FileFolder.PublicAsset,
        builtFileInfos,
      );
    }
  }

  // Copy dependency files to output
  for (const depFile of ['package.json', 'yarn.lock']) {
    const depFilePath = join(appPath, depFile);

    if (await fs.pathExists(depFilePath)) {
      await copyFileToOutput(
        appPath,
        depFile,
        FileFolder.Dependencies,
        builtFileInfos,
      );
    }
  }

  const manifest = manifestUpdateChecksums({
    manifest: result.manifest,
    builtFileInfos,
  });

  await writeManifestToOutput(appPath, manifest);

  await logicFunctionsWatcher.close();
  await frontComponentsWatcher.close();

  if (buildErrors.length > 0) {
    return {
      success: false,
      manifest,
      errors: buildErrors,
      warnings: validation.warnings,
      filePaths: result.filePaths,
    };
  }

  return {
    success: true,
    manifest,
    errors: [],
    warnings: validation.warnings,
    filePaths: result.filePaths,
  };
};
