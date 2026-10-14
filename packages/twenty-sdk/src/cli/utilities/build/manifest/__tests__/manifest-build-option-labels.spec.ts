import { RICH_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';

const CATEGORY_FIELD_UNIVERSAL_IDENTIFIER =
  'b602dbd9-e511-49ce-b6d3-b697218dc69c';
const POST_CARD_OBJECT_UNIVERSAL_IDENTIFIER =
  '54b589ca-eeed-4950-a176-358418b85c05';

describe('buildManifest option labels', () => {
  it('serializes msg() option labels and records them with their owner context', async () => {
    const { manifest, errors, optionLabelMessages } =
      await buildManifest(RICH_APP_PATH);

    expect(errors).toEqual([]);

    const categoryLabels = manifest?.fields
      .find(
        ({ universalIdentifier }) =>
          universalIdentifier === CATEGORY_FIELD_UNIVERSAL_IDENTIFIER,
      )
      ?.options?.map(({ label }) => label);
    const statusLabels = manifest?.objects
      .find(
        ({ universalIdentifier }) =>
          universalIdentifier === POST_CARD_OBJECT_UNIVERSAL_IDENTIFIER,
      )
      ?.fields.find(({ name }) => name === 'status')
      ?.options?.map(({ label }) => label);

    expect(categoryLabels).toEqual([
      'Personal',
      'Business',
      'Promotional',
      'Other',
    ]);
    expect(statusLabels).toContain('Sent');
    expect(
      manifest?.application.applicationVariables?.DEFAULT_REGION.options,
    ).toContainEqual({ label: 'Europe', value: 'eu' });
    expect(
      manifest?.application.serverVariables?.POSTCARD_DELIVERY_SPEED.options,
    ).toEqual([
      { label: 'Standard', value: 'standard' },
      { label: 'Express', value: 'express' },
    ]);

    expect(optionLabelMessages).toEqual(
      expect.arrayContaining([
        { message: 'Personal', context: 'fieldMetadata.label' },
        { message: 'Sent', context: 'fieldMetadata.label' },
        { message: 'Europe', context: 'applicationVariable.label' },
        { message: 'Express', context: 'serverVariable.label' },
      ]),
    );
    expect(optionLabelMessages).toHaveLength(4);
  }, 60000);
});
