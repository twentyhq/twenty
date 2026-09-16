import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { describe, expect, it } from 'vitest';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  GOOGLE_CONTACTS_ID_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

describe('App installation', () => {
  it('should find the installed app in the applications list', async () => {
    const client = new MetadataApiClient();

    const result = await client.query({
      findManyApplications: {
        id: true,
        name: true,
        universalIdentifier: true,
      },
    });

    const app = result.findManyApplications.find(
      (application: { universalIdentifier: string }) =>
        application.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    expect(app).toBeDefined();
  });
});

describe('App schema', () => {
  it('should extend person with a unique googleContactsId field', async () => {
    const client = new MetadataApiClient();

    const result = await client.query({
      objects: {
        __args: {
          paging: { first: 1 },
          filter: {
            universalIdentifier: {
              eq: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person
                .universalIdentifier,
            },
          },
        },
        edges: {
          node: {
            nameSingular: true,
            fields: {
              __args: { paging: { first: 200 }, filter: {} },
              edges: {
                node: {
                  universalIdentifier: true,
                  name: true,
                  isUnique: true,
                },
              },
            },
          },
        },
      },
    });

    const googleContactsIdField = result.objects.edges[0]?.node.fields.edges
      .map((edge) => edge.node)
      .find(
        (field) =>
          field.universalIdentifier ===
          GOOGLE_CONTACTS_ID_FIELD_UNIVERSAL_IDENTIFIER,
      );

    expect(googleContactsIdField?.name).toBe('googleContactsId');
    expect(googleContactsIdField?.isUnique).toBe(true);
  });
});
