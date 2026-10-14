import { RICH_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';

const CATEGORY_FIELD_UNIVERSAL_IDENTIFIER =
  'b602dbd9-e511-49ce-b6d3-b697218dc69c';
const POST_CARD_OBJECT_UNIVERSAL_IDENTIFIER =
  '54b589ca-eeed-4950-a176-358418b85c05';

describe('buildManifest messages', () => {
  it('serializes msg() texts and records them with their catalog context', async () => {
    const { manifest, errors, manifestMessages } =
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
    expect(manifest?.application.description).toBe('A simple rich app');
    expect(manifest?.application.applicationVariables?.DEFAULT_REGION).toEqual(
      expect.objectContaining({
        description: 'Default shipping region',
        options: expect.arrayContaining([{ label: 'Europe', value: 'eu' }]),
      }),
    );
    expect(
      manifest?.application.serverVariables?.POSTCARD_DELIVERY_SPEED.options,
    ).toEqual([
      { label: 'Standard', value: 'standard' },
      { label: 'Express', value: 'express' },
    ]);
    expect(manifest?.roles.map(({ label }) => label)).toContain('Root role');
    expect(
      manifest?.logicFunctions.map(({ description }) => description),
    ).toContain('Enrich post cards of a company');
    expect(
      manifest?.frontComponents.map(({ description }) => description),
    ).toContain('A root-level front component');

    expect(manifestMessages).toEqual(
      expect.arrayContaining([
        { message: 'Personal', context: 'fieldMetadata.label' },
        { message: 'Sent', context: 'fieldMetadata.label' },
        { message: 'A simple rich app', context: 'application.description' },
        {
          message: 'Default shipping region',
          context: 'applicationVariable.description',
        },
        { message: 'Europe', context: 'applicationVariable.label' },
        {
          message:
            'Send postcards through the provider sandbox instead of production',
          context: 'serverVariable.description',
        },
        { message: 'Express', context: 'serverVariable.label' },
        { message: 'Root role', context: 'role.label' },
        {
          message: 'Enrich post cards of a company',
          context: 'logicFunction.description',
        },
        {
          message: 'A root-level front component',
          context: 'frontComponent.description',
        },
      ]),
    );
    expect(manifestMessages).toHaveLength(10);
  }, 60000);
});
