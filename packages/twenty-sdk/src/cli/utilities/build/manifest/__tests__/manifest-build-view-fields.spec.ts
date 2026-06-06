import { RICH_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';

const POST_CARD_NUMBER_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  'cd582d11-ea21-4dc3-b9c1-0298ce3b6b54';
const ALL_POST_CARDS_VIEW_ID = 'b1a2b3c4-0001-4a7b-8c9d-0e1f2a3b4c5d';
const POST_CARD_NUMBER_FIELD_UNIVERSAL_IDENTIFIER =
  '7b57bd63-5a4c-46ca-9d52-42c8f02d1df6';

describe('buildManifest standalone view fields', () => {
  it('collects top-level defineViewField exports into manifest.viewFields', async () => {
    const { manifest, errors } = await buildManifest(RICH_APP_PATH);

    expect(errors).toEqual([]);
    expect(manifest).not.toBeNull();

    const viewField = manifest?.viewFields.find(
      (entry) =>
        entry.universalIdentifier ===
        POST_CARD_NUMBER_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
    );

    expect(viewField).toBeDefined();
    expect(viewField?.viewUniversalIdentifier).toBe(ALL_POST_CARDS_VIEW_ID);
    expect(viewField?.fieldMetadataUniversalIdentifier).toBe(
      POST_CARD_NUMBER_FIELD_UNIVERSAL_IDENTIFIER,
    );
    expect(viewField?.position).toBe(5);
    expect(viewField?.isVisible).toBe(true);
  }, 60000);
});
