import { packager } from '@electron/packager';
import { access, cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import './build.mjs';

const manifest = JSON.parse(await readFile('package.json', 'utf8'));
const stagingDirectory = await mkdtemp(
  join(tmpdir(), 'twenty-desktop-package-'),
);

// Resolve each dependency from its owner so hoisting cannot change the packaged runtime.
const copyRuntimeDependency = async (name, ownerManifest, destination) => {
  const manifestPath = createRequire(ownerManifest).resolve(
    `${name}/package.json`,
  );
  const dependency = JSON.parse(await readFile(manifestPath, 'utf8'));
  const target = join(destination, 'node_modules', name);
  await cp(dirname(manifestPath), target, {
    recursive: true,
    verbatimSymlinks: true,
    filter: (source) => source !== join(dirname(manifestPath), 'node_modules'),
  });
  for (const child of Object.keys(dependency.dependencies ?? {}))
    await copyRuntimeDependency(child, manifestPath, target);
};

try {
  await cp('dist', join(stagingDirectory, 'dist'), { recursive: true });
  await cp('assets', join(stagingDirectory, 'assets'), { recursive: true });
  await writeFile(
    join(stagingDirectory, 'package.json'),
    JSON.stringify(
      {
        name: manifest.name,
        productName: manifest.productName,
        version: manifest.version,
        description: manifest.description,
        license: manifest.license,
        main: manifest.main,
        dependencies: {
          '@recallai/desktop-sdk':
            manifest.dependencies['@recallai/desktop-sdk'],
        },
      },
      null,
      2,
    ),
  );
  await copyRuntimeDependency(
    '@recallai/desktop-sdk',
    resolve('package.json'),
    stagingDirectory,
  );
  const paths = await packager({
    dir: stagingDirectory,
    out: process.env.TWENTY_COMPANION_OUTPUT_DIR ?? 'release',
    name: 'Twenty',
    executableName: 'Twenty',
    appBundleId: 'com.twenty.companion',
    icon: join(process.cwd(), 'assets/twenty.icns'),
    platform: 'darwin',
    electronVersion: manifest.devDependencies.electron,
    arch: 'arm64',
    overwrite: true,
    prune: false,
    electronZipDir: process.env.TWENTY_COMPANION_ELECTRON_ZIP_DIR,
    // Recall launches its native framework by path outside the Electron archive.
    asar: { unpackDir: 'node_modules/@recallai/desktop-sdk' },
    extendInfo: {
      LSUIElement: false,
      LSMinimumSystemVersion: '14.2',
      NSMicrophoneUsageDescription:
        'Twenty records your voice during calls you choose to capture.',
      NSAudioCaptureUsageDescription:
        'Twenty records call audio so it can be saved to your Twenty workspace.',
      NSAccessibilityUsageDescription:
        'Twenty detects meetings and shows recording controls.',
    },
  });
  for (const directory of paths)
    await access(
      join(
        directory,
        'Twenty.app/Contents/Resources/app.asar.unpacked/node_modules/@recallai/desktop-sdk/desktop_sdk_macos_exe',
      ),
    );
  console.log(paths.join('\n'));
} finally {
  await rm(stagingDirectory, { recursive: true, force: true });
}
