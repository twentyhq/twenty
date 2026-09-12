import { globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REFERENCE_IMPORT_PATTERN =
  /^import\s+\w+\s+from\s+'\/snippets\/ui\/generated\/([^']+)';?$/gm;

export const checkUiReferenceImports = ({
  pagesDirectory,
  outputs,
}: {
  pagesDirectory: string;
  outputs: { name: string }[];
}): string[] => {
  const errors: string[] = [];
  const generatedNames = new Set(outputs.map((output) => output.name));
  const importedNames = new Set<string>();

  for (const page of globSync('**/*.mdx', { cwd: pagesDirectory }).sort()) {
    const content = readFileSync(resolve(pagesDirectory, page), 'utf8');

    for (const [, name] of content.matchAll(REFERENCE_IMPORT_PATTERN)) {
      importedNames.add(name);

      if (!generatedNames.has(name)) {
        errors.push(
          `Missing UI reference: ${page} imports ${name}, which is not generated.`,
        );
      }
    }
  }

  for (const name of generatedNames) {
    if (!importedNames.has(name)) {
      errors.push(`Unused UI reference: ${name} is not imported by any page.`);
    }
  }

  return errors;
};
