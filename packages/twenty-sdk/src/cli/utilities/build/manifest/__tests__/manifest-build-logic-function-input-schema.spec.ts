import { RICH_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

const ENRICH_POST_CARDS_FUNCTION_UNIVERSAL_IDENTIFIER =
  'a1b2c3d4-ac10-4a7b-8c9d-0e1f2a3b4c5d';
const POST_CARD_OBJECT_UNIVERSAL_IDENTIFIER =
  '54b589ca-eeed-4950-a176-358418b85c05';

describe('buildManifest logic function input schema inference', () => {
  it('resolves record-typed inputs to standard and app object universal identifiers', async () => {
    const { manifest, errors } = await buildManifest(RICH_APP_PATH);

    expect(errors).toEqual([]);
    expect(manifest).not.toBeNull();

    const logicFunction = manifest?.logicFunctions.find(
      (entry) =>
        entry.universalIdentifier ===
        ENRICH_POST_CARDS_FUNCTION_UNIVERSAL_IDENTIFIER,
    );

    expect(logicFunction).toBeDefined();
    expect(logicFunction?.workflowActionTriggerSettings?.inputSchema).toEqual([
      {
        type: 'object',
        properties: {
          companyId: {
            type: 'record',
            objectUniversalIdentifier:
              STANDARD_OBJECTS.company.universalIdentifier,
          },
          postCardIds: {
            type: 'records',
            objectUniversalIdentifier: POST_CARD_OBJECT_UNIVERSAL_IDENTIFIER,
          },
        },
      },
    ]);
  }, 60000);
});
