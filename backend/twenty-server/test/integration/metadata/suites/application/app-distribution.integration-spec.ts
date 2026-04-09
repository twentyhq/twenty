import crypto from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import request from 'supertest';
import * as tar from 'tar';
import { type DataSource } from 'typeorm';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';

const TEST_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const createTestTarball = async (
  files: Record<string, string>,
): Promise<Buffer> => {
  const tempId = crypto.randomUUID();
  const sourceDir = join(tmpdir(), `test-tarball-src-${tempId}`);
  const tarballPath = join(tmpdir(), `test-tarball-${tempId}.tar.gz`);

  await fs.mkdir(sourceDir, { recursive: true });

  for (const [name, content] of Object.entries(files)) {
    const filePath = join(sourceDir, name);
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));

    if (dir !== sourceDir) {
      await fs.mkdir(dir, { recursive: true });
    }
    await fs.writeFile(filePath, content);
  }

  await tar.create(
    {
      file: tarballPath,
      gzip: true,
      cwd: sourceDir,
    },
    Object.keys(files),
  );

  const buffer = await fs.readFile(tarballPath);

  await fs.rm(sourceDir, { recursive: true, force: true });
  await fs.rm(tarballPath, { force: true });

  return buffer;
};

const createValidManifest = (universalIdentifier: string) =>
  JSON.stringify({
    application: {
      universalIdentifier,
      displayName: 'Test Tarball App',
      description: 'A test app',
      icon: 'IconTestPipe',
      defaultRoleUniversalIdentifier: crypto.randomUUID(),
      applicationVariables: {},
      packageJsonChecksum: null,
      yarnLockChecksum: null,
    },
    roles: [],
    skills: [],
    objects: [],
    fields: [],
    logicFunctions: [],
    frontComponents: [],
    publicAssets: [],
    views: [],
    navigationMenuItems: [],
    pageLayouts: [],
  });

const insertRegistrationWithSource = async (
  ds: DataSource,
  params: {
    universalIdentifier: string;
    name: string;
    sourceType: 'npm' | 'tarball' | 'local';
    sourcePackage?: string;
  },
): Promise<string> => {
  const id = crypto.randomUUID();
  const oAuthClientId = crypto.randomUUID();

  await ds.query(
    `INSERT INTO core."applicationRegistration"
      (id, "universalIdentifier", name, "oAuthClientId",
       "oAuthRedirectUris", "oAuthScopes", "workspaceId",
       "sourceType", "sourcePackage")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      id,
      params.universalIdentifier,
      params.name,
      oAuthClientId,
      [],
      [],
      TEST_WORKSPACE_ID,
      params.sourceType,
      params.sourcePackage ?? null,
    ],
  );

  return id;
};

describe('App Distribution (integration)', () => {
  let ds: DataSource;
  const createdRegistrationIds: string[] = [];

  beforeAll(() => {
    jest.useRealTimers();
    ds = global.testDataSource;
  });

  afterAll(async () => {
    for (const id of createdRegistrationIds) {
      await ds.query(
        `DELETE FROM core."applicationRegistration" WHERE id = $1`,
        [id],
      );
    }
    jest.useFakeTimers();
  });

  describe('Upload tarball via GraphQL', () => {
    it('should reject tarball without manifest.json', async () => {
      const tarball = await createTestTarball({
        'readme.txt': 'no manifest here',
      });

      const { errors } = await uploadAppTarball({
        tarballBuffer: tarball,
        expectToFail: true,
      });

      expect(errors).toBeDefined();
      expect(
        errors?.some((error: { message: string }) =>
          error.message.includes('manifest.json'),
        ),
      ).toBe(true);
    });

    it('should successfully upload a valid tarball and create registration', async () => {
      const uid = crypto.randomUUID();
      const manifest = createValidManifest(uid);

      const tarball = await createTestTarball({
        'manifest.json': manifest,
        'package.json': JSON.stringify({
          name: 'test-app',
          version: '1.0.0',
        }),
      });

      const { data, errors } = await uploadAppTarball({
        tarballBuffer: tarball,
        universalIdentifier: uid,
      });

      expect(errors).toBeUndefined();
      expect(data?.uploadAppTarball.id).toBeDefined();
      expect(data?.uploadAppTarball.universalIdentifier).toBe(uid);
      createdRegistrationIds.push(data!.uploadAppTarball.id);

      const rows = await ds.query(
        `SELECT "sourceType" FROM core."applicationRegistration"
         WHERE id = $1`,
        [data!.uploadAppTarball.id],
      );

      expect(rows[0].sourceType).toBe('tarball');
    });

    it('should update existing tarball registration on re-upload', async () => {
      const uid = crypto.randomUUID();
      const manifest = createValidManifest(uid);

      const tarball = await createTestTarball({
        'manifest.json': manifest,
        'package.json': JSON.stringify({
          name: 'test-app',
          version: '1.0.0',
        }),
      });

      const firstResult = await uploadAppTarball({
        tarballBuffer: tarball,
        universalIdentifier: uid,
      });

      createdRegistrationIds.push(firstResult.data!.uploadAppTarball.id);

      const secondResult = await uploadAppTarball({
        tarballBuffer: tarball,
        universalIdentifier: uid,
      });

      expect(secondResult.data?.uploadAppTarball.id).toBe(
        firstResult.data?.uploadAppTarball.id,
      );
    });
  });

  describe('Source channel enforcement', () => {
    it('should reject tarball upload for npm-sourced registration', async () => {
      const uid = crypto.randomUUID();

      const regId = await insertRegistrationWithSource(ds, {
        universalIdentifier: uid,
        name: 'NPM App',
        sourceType: 'npm',
        sourcePackage: '@test/npm-app',
      });

      createdRegistrationIds.push(regId);

      const manifest = createValidManifest(uid);
      const tarball = await createTestTarball({
        'manifest.json': manifest,
        'package.json': JSON.stringify({
          name: 'test-app',
          version: '1.0.0',
        }),
      });

      const { errors } = await uploadAppTarball({
        tarballBuffer: tarball,
        universalIdentifier: uid,
        expectToFail: true,
      });

      expect(errors).toBeDefined();
      expect(
        errors?.some((error: { message: string }) =>
          error.message.includes('registered as npm'),
        ),
      ).toBe(true);
    });

    it('should allow tarball upload for local-sourced registration', async () => {
      const uid = crypto.randomUUID();

      const regId = await insertRegistrationWithSource(ds, {
        universalIdentifier: uid,
        name: 'Local Source App',
        sourceType: 'local',
      });

      createdRegistrationIds.push(regId);

      const manifest = createValidManifest(uid);
      const tarball = await createTestTarball({
        'manifest.json': manifest,
        'package.json': JSON.stringify({
          name: 'test-app',
          version: '1.0.0',
        }),
      });

      const { data, errors } = await uploadAppTarball({
        tarballBuffer: tarball,
        universalIdentifier: uid,
      });

      expect(errors).toBeUndefined();
      expect(data?.uploadAppTarball.id).toBe(regId);

      const rows = await ds.query(
        `SELECT "sourceType" FROM core."applicationRegistration"
         WHERE id = $1`,
        [regId],
      );

      expect(rows[0].sourceType).toBe('tarball');
    });
  });

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      const baseUrl = `http://localhost:${APP_PORT}`;

      const response = await request(baseUrl)
        .post('/metadata')
        .field(
          'operations',
          JSON.stringify({
            query: `mutation UploadAppTarball($file: Upload!) {
              uploadAppTarball(file: $file) { id }
            }`,
            variables: { file: null },
          }),
        )
        .field('map', JSON.stringify({ '0': ['variables.file'] }))
        .attach('0', Buffer.from('test'), {
          filename: 'app.tar.gz',
          contentType: 'application/gzip',
        });

      expect(response.body.errors).toBeDefined();
    });
  });
});
