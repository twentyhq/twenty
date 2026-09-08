import { packager } from '@electron/packager';
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import './build.mjs';

const paths = await packager({
  dir: '.',
  out: process.env.TWENTY_COMPANION_OUTPUT_DIR ?? 'release',
  name: 'Twenty',
  executableName: 'Twenty',
  appBundleId: 'com.twenty.companion',
  icon: join(process.cwd(), 'assets/twenty.icns'),
  platform: 'darwin',
  arch: 'arm64',
  overwrite: true,
  prune: true,
  electronZipDir: process.env.TWENTY_COMPANION_ELECTRON_ZIP_DIR,
  // Recall launches its native framework by path outside the Electron archive.
  asar: { unpackDir: 'node_modules/@recallai/desktop-sdk' },
  ignore: [
    /^\/src($|\/)/,
    /^\/scripts($|\/)/,
    /^\/release($|\/)/,
    /^\/\.env/,
    /^\/node_modules\/\.cache/,
  ],
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
