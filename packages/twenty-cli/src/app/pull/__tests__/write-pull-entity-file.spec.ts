import { describe, expect, it } from 'vitest';

import { WORKFLOW_ENUM_BINDINGS } from '@/app/pull/write-define-file';
import { writePullEntityFile } from '@/app/pull/write-pull-entity-file';

const FORMAT_STEP_UID = '44444444-4444-4444-8444-444444444444';
const SECOND_FORMAT_STEP_UID = '55555555-5555-4555-8555-555555555555';
const SOURCE = `export const main = async (params: { name: string }) => {
  return { greeting: \`Hello \${params.name}\` };
};
`;

const codeStep = (universalIdentifier: string, name: string) => ({
  universalIdentifier,
  name,
  type: 'CODE',
  nextStepIds: [],
  input: { code: SOURCE, logicFunctionInput: { name: '{{trigger.name}}' } },
});

const workflowEntity = (steps: unknown[]) => ({
  kind: 'workflow' as const,
  definer: 'defineWorkflow',
  enumBindings: WORKFLOW_ENUM_BINDINGS,
  config: {
    universalIdentifier: '11111111-1111-4111-8111-111111111111',
    name: 'Greet new pets',
    version: {
      trigger: { type: 'MANUAL', nextStepIds: [FORMAT_STEP_UID] },
      steps,
    },
  },
});

describe('writePullEntityFile', () => {
  it('writes the source of each code step next to its workflow and reads it from there', () => {
    const { content, requiredSdkExports, codeStepFiles } = writePullEntityFile({
      entity: workflowEntity([
        codeStep(FORMAT_STEP_UID, 'Format name'),
        codeStep(SECOND_FORMAT_STEP_UID, 'Format name'),
      ]),
      relativePath: 'src/workflows/greet-new-pets.workflow.ts',
    });

    expect(codeStepFiles).toEqual([
      {
        universalIdentifier: FORMAT_STEP_UID,
        relativePath: 'src/workflows/greet-new-pets/format-name.code.ts',
        content: SOURCE,
      },
      {
        universalIdentifier: SECOND_FORMAT_STEP_UID,
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
      entity: workflowEntity([codeStep(FORMAT_STEP_UID, '')]),
      relativePath: 'src/automations/welcome.ts',
    });

    expect(codeStepFiles.map(({ relativePath }) => relativePath)).toEqual([
      'src/automations/welcome/44444444.code.ts',
    ]);
  });

  it('writes a workflow without code steps as a single file', () => {
    const { content, codeStepFiles } = writePullEntityFile({
      entity: workflowEntity([
        {
          universalIdentifier: FORMAT_STEP_UID,
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
