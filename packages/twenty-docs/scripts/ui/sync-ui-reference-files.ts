import {
  existsSync,
  globSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';

export const syncUiReferenceFiles = ({
  directory,
  outputs,
  isCheckMode,
}: {
  directory: string;
  outputs: { name: string; content: string }[];
  isCheckMode: boolean;
}): string[] => {
  const errors: string[] = [];
  const expectedPaths = new Set(
    outputs.map((output) => resolve(directory, output.name)),
  );

  for (const name of globSync('**/*.mdx', { cwd: directory })) {
    const filePath = resolve(directory, name);

    if (expectedPaths.has(filePath)) {
      continue;
    }

    if (isCheckMode) {
      errors.push(`Obsolete UI reference: ${name}`);
    } else {
      unlinkSync(filePath);
    }
  }

  for (const { name, content } of outputs) {
    const filePath = resolve(directory, name);

    if (isCheckMode) {
      if (!existsSync(filePath) || readFileSync(filePath, 'utf8') !== content) {
        errors.push(`Stale UI reference: ${name}`);
      }
    } else {
      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, content);
    }
  }

  return errors;
};
