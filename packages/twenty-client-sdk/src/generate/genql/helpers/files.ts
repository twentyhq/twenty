import { promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import { parse, resolve } from 'node:path';

// Guard against `clear` ever wiping something significant if a caller passes a
// misconfigured output path: refuse the filesystem root, shallow top-level
// directories, and the user's home directory or any of its ancestors.
const assertSafeToClear = (target: string) => {
  const { root } = parse(target);
  const depthBelowRoot = target
    .slice(root.length)
    .split(/[\\/]/)
    .filter(Boolean).length;

  const home = resolve(homedir());
  const isHomeOrAncestor = target === home || home.startsWith(`${target}/`);

  if (target === root || depthBelowRoot < 2 || isHomeOrAncestor) {
    throw new Error(`Refusing to recursively clear unsafe path: ${target}`);
  }
};

export const ensurePath = async (path: string[], clear: boolean = false) => {
  const target = resolve(...path);
  if (clear) {
    assertSafeToClear(target);
    await fs.rm(target, { recursive: true, force: true });
  }
  await fs.mkdir(target, { recursive: true });
};

export const writeFileToPath = async (path: string[], content: string) => {
  const folder = resolve(...path, '..');
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(resolve(...path), content);
};
