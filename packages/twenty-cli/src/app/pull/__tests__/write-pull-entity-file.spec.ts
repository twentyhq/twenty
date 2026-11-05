import { type WorkflowStepManifest } from 'twenty-shared/application';
import { describe, expect, it } from 'vitest';

import { type IsCodeStepPathAvailable } from '@/app/pull/extract-workflow-code-step-files';
import { WORKFLOW_ENUM_BINDINGS } from '@/app/pull/write-define-file';
import { writePullEntityFile } from '@/app/pull/write-pull-entity-file';

const FORMAT_STEP_UNIVERSAL_IDENTIFIER = '44444444-4444-4444-8444-444444444444';
const SECOND_FORMAT_STEP_UNIVERSAL_IDENTIFIER =
  '55555555-5555-4555-8555-555555555555';
const SOURCE = `export const main = async (params: { name: string }) => {
  return { greeting: \`Hello \${params.name}\` };
};
`;

const codeStep = ({
  universalIdentifier,
  name,
}: {
  universalIdentifier: string;
  name: string;
}): WorkflowStepManifest => ({
  universalIdentifier,
  name,
  type: 'CODE',
  nextStepIds: [],
  input: { code: SOURCE, logicFunctionInput: { name: '{{trigger.name}}' } },
});

const workflowEntity = (steps: WorkflowStepManifest[]) => ({
  kind: 'workflow' as const,
  definer: 'defineWorkflow',
  enumBindings: WORKFLOW_ENUM_BINDINGS,
  config: {
    universalIdentifier: '11111111-1111-4111-8111-111111111111',
    name: 'Greet new pets',
    version: {
      trigger: {
        type: 'MANUAL',
        nextStepIds: steps
          .slice(0, 1)
          .map(({ universalIdentifier }) => universalIdentifier),
      },
      steps,
    },
  },
});

// Fails instead of hanging the worker if name probing stops terminating
const boundedProbing = (): IsCodeStepPathAvailable => {
  let probeCount = 0;

  return () => {
    probeCount++;

    if (probeCount > 100) {
      throw new Error('Code step file name probing did not terminate');
    }

    return true;
  };
};

describe('writePullEntityFile', () => {
  it('writes the source of each code step next to its workflow and reads it from there', () => {
    const { content, requiredSdkExports, codeStepFiles } = writePullEntityFile({
      entity: workflowEntity([
        codeStep({
          universalIdentifier: FORMAT_STEP_UNIVERSAL_IDENTIFIER,
          name: 'Format name',
        }),
        codeStep({
          universalIdentifier: SECOND_FORMAT_STEP_UNIVERSAL_IDENTIFIER,
          name: 'Format name',
        }),
      ]),
      relativePath: 'src/workflows/greet-new-pets.workflow.ts',
    });

    expect(codeStepFiles).toEqual([
      {
        universalIdentifier: FORMAT_STEP_UNIVERSAL_IDENTIFIER,
        relativePath: 'src/workflows/greet-new-pets/format-name.code.ts',
        content: SOURCE,
      },
      {
        universalIdentifier: SECOND_FORMAT_STEP_UNIVERSAL_IDENTIFIER,
        relativePath:
          'src/workflows/greet-new-pets/55555555-format-name.code.ts',
        content: SOURCE,
      },
    ]);
    expect(content).toMatch(
      /^import { readFileSync } from 'node:fs';\nimport { join } from 'node:path';\nimport { defineWorkflow } from 'twenty-sdk\/define';\n/,
    );
    expect(content).toContain(
      "code: readFileSync(join(__dirname, 'greet-new-pets', 'format-name.code.ts'), 'utf8'),",
    );
    expect(content).toContain(
      "code: readFileSync(join(__dirname, 'greet-new-pets', '55555555-format-name.code.ts'), 'utf8'),",
    );
    expect(content).not.toContain('export const main');
    expect(requiredSdkExports).toEqual(['defineWorkflow']);
  });

  it('names the code step folder after a workflow file without the usual suffix', () => {
    const { codeStepFiles } = writePullEntityFile({
      entity: workflowEntity([
        codeStep({
          universalIdentifier: FORMAT_STEP_UNIVERSAL_IDENTIFIER,
          name: '',
        }),
      ]),
      relativePath: 'src/automations/welcome.ts',
    });

    expect(codeStepFiles.map(({ relativePath }) => relativePath)).toEqual([
      'src/automations/welcome/44444444.code.ts',
    ]);
  });

  it('probes further names while a fallback name is taken', () => {
    const thirdFormatStepUid = '55555555-6666-4666-8666-666666666666';
    const { codeStepFiles } = writePullEntityFile({
      entity: workflowEntity([
        codeStep({
          universalIdentifier: FORMAT_STEP_UNIVERSAL_IDENTIFIER,
          name: 'Format name',
        }),
        codeStep({
          universalIdentifier: SECOND_FORMAT_STEP_UNIVERSAL_IDENTIFIER,
          name: 'Format name',
        }),
        codeStep({
          universalIdentifier: thirdFormatStepUid,
          name: 'Format name',
        }),
      ]),
      relativePath: 'src/workflows/greet-new-pets.workflow.ts',
      isCodeStepPathAvailable: ({ relativePath }) =>
        relativePath !== 'src/workflows/greet-new-pets/format-name.code.ts',
    });

    expect(codeStepFiles.map(({ relativePath }) => relativePath)).toEqual([
      'src/workflows/greet-new-pets/44444444-format-name.code.ts',
      'src/workflows/greet-new-pets/55555555-format-name.code.ts',
      'src/workflows/greet-new-pets/55555555-format-name-2.code.ts',
    ]);
  });

  it('keeps the local name of a code step when it could have generated it', () => {
    const { codeStepFiles } = writePullEntityFile({
      entity: workflowEntity([
        codeStep({
          universalIdentifier: FORMAT_STEP_UNIVERSAL_IDENTIFIER,
          name: 'Format name',
        }),
      ]),
      relativePath: 'src/workflows/greet-new-pets.workflow.ts',
      isCodeStepPathAvailable: boundedProbing(),
      localCodeStepPathByStepIdentifier: new Map([
        [
          FORMAT_STEP_UNIVERSAL_IDENTIFIER,
          'src/workflows/greet-new-pets/44444444-format-name-3.code.ts',
        ],
      ]),
    });

    expect(codeStepFiles.map(({ relativePath }) => relativePath)).toEqual([
      'src/workflows/greet-new-pets/44444444-format-name-3.code.ts',
    ]);
  });

  it('matches a local code step file whatever the case of its step identifier', () => {
    const upperCaseStepUniversalIdentifier =
      'ABCDEF44-4444-4444-8444-444444444444';
    const { codeStepFiles } = writePullEntityFile({
      entity: workflowEntity([
        codeStep({
          universalIdentifier: upperCaseStepUniversalIdentifier,
          name: 'Format name',
        }),
      ]),
      relativePath: 'src/workflows/greet-new-pets.workflow.ts',
      isCodeStepPathAvailable: boundedProbing(),
      localCodeStepPathByStepIdentifier: new Map([
        [
          upperCaseStepUniversalIdentifier.toLowerCase(),
          'src/workflows/greet-new-pets/ABCDEF44-format-name-3.code.ts',
        ],
      ]),
    });

    expect(codeStepFiles.map(({ relativePath }) => relativePath)).toEqual([
      'src/workflows/greet-new-pets/ABCDEF44-format-name-3.code.ts',
    ]);
  });

  it('generates names for code steps whose local files it could not have named', () => {
    const steps = [
      codeStep({
        universalIdentifier: FORMAT_STEP_UNIVERSAL_IDENTIFIER,
        name: 'Format name',
      }),
      codeStep({
        universalIdentifier: SECOND_FORMAT_STEP_UNIVERSAL_IDENTIFIER,
        name: 'Format name',
      }),
    ];
    const expectedPaths = [
      'src/workflows/greet-new-pets/format-name.code.ts',
      'src/workflows/greet-new-pets/55555555-format-name.code.ts',
    ];
    const generatePaths = (localPaths: [string, string]) =>
      writePullEntityFile({
        entity: workflowEntity(steps),
        relativePath: 'src/workflows/greet-new-pets.workflow.ts',
        isCodeStepPathAvailable: boundedProbing(),
        localCodeStepPathByStepIdentifier: new Map([
          [FORMAT_STEP_UNIVERSAL_IDENTIFIER, localPaths[0]],
          [SECOND_FORMAT_STEP_UNIVERSAL_IDENTIFIER, localPaths[1]],
        ]),
      }).codeStepFiles.map(({ relativePath }) => relativePath);

    // Identical code matched each step to the other's file
    expect(generatePaths([expectedPaths[1], expectedPaths[0]])).toEqual(
      expectedPaths,
    );
    expect(
      generatePaths([
        'src/workflows/greet-new-pets/renamed.code.ts',
        'src/workflows/moved/55555555-format-name.code.ts',
      ]),
    ).toEqual(expectedPaths);
  });

  it('writes a workflow without code steps as a single file', () => {
    const { content, codeStepFiles } = writePullEntityFile({
      entity: workflowEntity([
        {
          universalIdentifier: FORMAT_STEP_UNIVERSAL_IDENTIFIER,
          name: 'Wait',
          type: 'EMPTY',
          nextStepIds: [],
          input: {},
        },
      ]),
      relativePath: 'src/workflows/greet-new-pets.workflow.ts',
    });

    expect(codeStepFiles).toEqual([]);
    expect(content).toMatch(
      /^import { defineWorkflow } from 'twenty-sdk\/define';/,
    );
  });
});
