import { readFileSync, writeFileSync } from 'node:fs';

const version = Number(process.argv[2]);

if (![1, 2, 3].includes(version)) {
  console.error('Usage: yarn use-version <1|2|3> [package version]');
  process.exit(1);
}

const appDirectory = new URL('..', import.meta.url);
const packageJsonUrl = new URL('package.json', appDirectory);
const packageJson = JSON.parse(readFileSync(packageJsonUrl, 'utf8'));

packageJson.version = process.argv[3] ?? `0.${version}.0`;
writeFileSync(packageJsonUrl, `${JSON.stringify(packageJson, null, 2)}\n`);

writeFileSync(
  new URL('src/constants/requested-access-version.ts', appDirectory),
  `// Rewritten by \`yarn use-version <1|2|3>\`, together with the package.json version\nexport const REQUESTED_ACCESS_VERSION: 1 | 2 | 3 = ${version};\n`,
);

console.log(`Grant demo now requests version ${version} (package ${packageJson.version})`);
