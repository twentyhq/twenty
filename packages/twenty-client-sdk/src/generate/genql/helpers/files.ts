import { promises as fs } from 'node:fs';
import { parse, resolve } from 'node:path';

// Guard against `clear` ever wiping a filesystem root or a top-level directory
// if a caller passes a misconfigured output path.
const assertSafeToClear = (target: string) => {
  const { root } = parse(target);
  const depthBelowRoot = target
    .slice(root.length)
    .split(/[\\/]/)
    .filter(Boolean).length;

  if (target === root || depthBelowRoot < 2) {
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
