import { resolve } from 'node:path';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';

describe('workflow application manifest', () => {
  it('builds the example application with its workflow and exposed function', async () => {
    const { manifest, errors } = await buildManifest(
      resolve(process.cwd(), '../twenty-apps/fixtures/workflow-poc-app'),
    );
    expect(errors).toEqual([]);
    expect(manifest?.workflows).toHaveLength(1);
    expect(manifest?.logicFunctions).toHaveLength(1);
    const step = manifest?.workflows?.[0].version.steps[0];
    expect(step?.type).toBe('LOGIC_FUNCTION');
    if (step?.type !== 'LOGIC_FUNCTION') { throw new Error('Expected a function step'); }
    expect(step.logicFunctionUniversalIdentifier).toBe(manifest?.logicFunctions[0].universalIdentifier);
  });

});
