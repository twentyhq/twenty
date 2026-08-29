import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  GENERATED_CORE_DIR,
  generateCoreClientFromSchema,
  replaceCoreClient,
} from '../generate-core-client';
import { generateMetadataClient } from '../generate-metadata-client';
import { WORKSPACE_SCHEMA_FIXTURE } from './fixtures/workspace-schema.fixture';

const METADATA_SCHEMA = `
scalar JSON
scalar Upload

type Query {
  currentWorkspace: Workspace
}

type Mutation {
  uploadWorkspaceLogo(file: Upload!): String!
}

type Workspace {
  id: ID!
  metadataVersion: Int!
  featureFlags: JSON
}

schema {
  query: Query
  mutation: Mutation
}
`;

describe('Client generation pipeline', () => {
  let temporaryDir: string;

  beforeEach(async () => {
    temporaryDir = await mkdtemp(join(tmpdir(), 'twenty-client-pipeline-'));
  });

  afterEach(async () => {
    await rm(temporaryDir, { recursive: true, force: true });
  });

  describe('generateMetadataClient', () => {
    it('emits a client wired to the metadata endpoint', async () => {
      const outputPath = join(temporaryDir, 'metadata');

      await generateMetadataClient({
        schema: METADATA_SCHEMA,
        outputPath,
      });

      const generatedTypes = await readFile(
        join(outputPath, 'schema.ts'),
        'utf-8',
      );
      const generatedIndex = await readFile(
        join(outputPath, 'index.ts'),
        'utf-8',
      );

      expect(generatedTypes).toContain('Upload: File,');
      expect(generatedTypes).toContain("featureFlags?: Scalars['JSON']");
      expect(generatedIndex).toContain('export class MetadataApiClient');
      expect(generatedIndex).toContain('/metadata');
    });

    it('drops files left by a previous generation', async () => {
      const outputPath = join(temporaryDir, 'metadata');

      await mkdir(outputPath, { recursive: true });
      await writeFile(
        join(outputPath, 'stale.ts'),
        'export const stale = true',
      );

      await generateMetadataClient({
        schema: METADATA_SCHEMA,
        outputPath,
      });

      expect(await readdir(outputPath)).not.toContain('stale.ts');
    });
  });

  describe('replaceCoreClient', () => {
    it('swaps the packaged core bundles for the generated ones', async () => {
      const packageRoot = join(temporaryDir, 'twenty-client-sdk');
      const distPath = join(packageRoot, 'dist');

      await mkdir(distPath, { recursive: true });
      await writeFile(
        join(distPath, 'core.mjs'),
        'export const createClient = () => { throw new Error("stub") }',
      );
      await writeFile(join(distPath, 'core.cjs'), 'module.exports = {}');

      await replaceCoreClient({
        packageRoot,
        schema: WORKSPACE_SCHEMA_FIXTURE,
      });

      const generatedTypes = await readFile(
        join(distPath, GENERATED_CORE_DIR, 'schema.ts'),
        'utf-8',
      );

      expect(generatedTypes).toContain('additionalEmails?: string[]');

      const replacedCoreModule = await import(
        `${pathToFileURL(join(distPath, 'core.mjs')).href}?t=${Date.now()}`
      );

      expect(typeof replacedCoreModule.createClient).toBe('function');
      expect(typeof replacedCoreModule.CoreApiClient).toBe('function');
    }, 60000);
  });

  describe('when the schema cannot be generated', () => {
    it('rejects without leaving a temporary directory behind', async () => {
      const outputPath = join(temporaryDir, 'core');

      await expect(
        generateCoreClientFromSchema({
          schema: 'type Query { person: MissingType }',
          outputPath,
        }),
      ).rejects.toThrow();

      expect(await readdir(temporaryDir)).toEqual([]);
    });
  });
});
