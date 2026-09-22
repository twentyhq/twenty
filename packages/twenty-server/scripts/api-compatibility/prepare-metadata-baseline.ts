import { readFileSync, writeFileSync } from 'node:fs';

import { isNonEmptyString } from '@sniptt/guards';
import { buildSchema, introspectionFromSchema } from 'graphql';

import { allowUnreleasedFieldRemovals } from './allow-unreleased-field-removals';

const [mainPath, currentPath, releasedPath, outputPath] = process.argv.slice(2);

if (
  !isNonEmptyString(mainPath) ||
  !isNonEmptyString(currentPath) ||
  !isNonEmptyString(releasedPath) ||
  !isNonEmptyString(outputPath)
) {
  throw new Error('Expected main, current, released, and output schema paths');
}

const main = JSON.parse(readFileSync(mainPath, 'utf8'));
const current = JSON.parse(readFileSync(currentPath, 'utf8'));
const released = introspectionFromSchema(
  buildSchema(readFileSync(releasedPath, 'utf8')),
);

writeFileSync(
  outputPath,
  JSON.stringify({
    data: allowUnreleasedFieldRemovals(main.data, current.data, released),
  }),
);
