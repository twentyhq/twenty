import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { describe, expect, it } from 'vitest';

import { TELEGRAM_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

describe('App installation', () => {
  it('deploys the Telegram logic functions', async () => {
    const result = await new MetadataApiClient().query({
      findManyLogicFunctions: { name: true },
    });

    expect(
      result.findManyLogicFunctions.map((logicFunction) => logicFunction.name),
    ).toEqual(
      expect.arrayContaining([
        'telegram-updates-resolver',
        'telegram-update-handler',
        'telegram-start-user-link',
        'telegram-remove-user-link',
        'telegram-uninstall',
      ]),
    );
  });

  it('creates the Telegram user link object', async () => {
    const { objects } = await new MetadataApiClient().query({
      objects: {
        __args: { paging: { first: 200 }, filter: {} },
        edges: { node: { universalIdentifier: true, nameSingular: true } },
      },
    });

    expect(objects.edges.map((edge) => edge.node)).toContainEqual({
      universalIdentifier: TELEGRAM_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
      nameSingular: 'telegramUserLink',
    });
  });
});
