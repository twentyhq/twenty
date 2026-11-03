import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type PullEntity } from '@/app/pull/build-pull-entities';
import { findLocalCodeStepFiles } from '@/app/pull/find-local-code-step-files';
import { type ScannedSourceFile } from '@/app/source/scan-project-source-files';

const WORKFLOW_UID = '11111111-1111-4111-8111-111111111111';
const FIRST_STEP_UID = '44444444-4444-4444-8444-444444444444';
const SECOND_STEP_UID = '55555555-5555-4555-8555-555555555555';
const THIRD_STEP_UID = '66666666-6666-4666-8666-666666666666';
const WORKFLOW_PATH = 'src/workflows/greet.workflow.ts';
const FOLDER_PATH = 'src/workflows/greet';
const SOURCE = 'export const main = async () => ({});\n';

const readingStep = (universalIdentifier: string, fileName: string) => `{
  universalIdentifier: '${universalIdentifier}',
  type: 'CODE',
  input: { code: readFileSync(join(__dirname, 'greet', '${fileName}'), 'utf8') },
}`;

const baseWorkflow = (steps: { universalIdentifier: string; name: string }[]) =>
  ({
    kind: 'workflow',
    universalIdentifier: WORKFLOW_UID,
    definer: 'defineWorkflow',
    enumBindings: [],
    defaultFolder: 'src/workflows',
    fileSuffix: '.workflow.ts',
    fileBaseName: 'greet',
    parentName: null,
    config: {
      universalIdentifier: WORKFLOW_UID,
      version: {
        steps: steps.map((step) => ({
          ...step,
          type: 'CODE',
          input: { code: SOURCE },
        })),
      },
    },
  }) satisfies PullEntity;

describe('findLocalCodeStepFiles', () => {
  let appPath: string;

  const writeAppFile = (relativePath: string, content: string) =>
    writeFile(join(appPath, relativePath), content);

  const find = (fileNames: string[], baseEntities: PullEntity[] = []) =>
    findLocalCodeStepFiles({
      appPath,
      baseEntities,
      scannedFiles: [
        {
          relativePath: WORKFLOW_PATH,
          entityKey: 'workflows',
          targetFunctionName: 'defineWorkflow',
          universalIdentifier: WORKFLOW_UID,
          isReadable: true,
        },
        ...fileNames.map((fileName): ScannedSourceFile => ({
          relativePath: `${FOLDER_PATH}/${fileName}`,
          entityKey: null,
          targetFunctionName: null,
          universalIdentifier: null,
          isReadable: true,
        })),
      ],
    });

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-code-step-files-'));
    await mkdir(join(appPath, FOLDER_PATH), { recursive: true });
  });

  afterEach(async () => {
    await rm(appPath, { recursive: true, force: true });
  });

  it('gives each step the file its workflow reads, even when sources are identical', async () => {
    await writeAppFile(
      WORKFLOW_PATH,
      `export default defineWorkflow({ version: { steps: [
${readingStep(FIRST_STEP_UID, 'second.code.ts')},
${readingStep(SECOND_STEP_UID, 'first.code.ts')},
${readingStep(THIRD_STEP_UID, 'first.code.ts')},
] } });
`,
    );
    await writeAppFile(`${FOLDER_PATH}/first.code.ts`, SOURCE);
    await writeAppFile(`${FOLDER_PATH}/second.code.ts`, SOURCE);

    expect(
      (await find(['first.code.ts', 'second.code.ts'])).get(WORKFLOW_PATH),
    ).toEqual([
      {
        universalIdentifier: FIRST_STEP_UID,
        relativePath: `${FOLDER_PATH}/second.code.ts`,
      },
      {
        universalIdentifier: SECOND_STEP_UID,
        relativePath: `${FOLDER_PATH}/first.code.ts`,
      },
    ]);
  });

  it('keeps the unchanged file of a step removed locally, but no other file at its name', async () => {
    await writeAppFile(
      WORKFLOW_PATH,
      'export default defineWorkflow({ version: { steps: [] } });\n',
    );
    await writeAppFile(`${FOLDER_PATH}/format-name.code.ts`, SOURCE);
    await writeAppFile(
      `${FOLDER_PATH}/shout-name.code.ts`,
      'export const unrelated = true;\n',
    );

    expect(
      (
        await find(
          ['format-name.code.ts', 'shout-name.code.ts'],
          [
            baseWorkflow([
              { universalIdentifier: FIRST_STEP_UID, name: 'Format name' },
              { universalIdentifier: SECOND_STEP_UID, name: 'Shout name' },
            ]),
          ],
        )
      ).get(WORKFLOW_PATH),
    ).toEqual([
      {
        universalIdentifier: FIRST_STEP_UID,
        relativePath: `${FOLDER_PATH}/format-name.code.ts`,
      },
    ]);
  });
});
