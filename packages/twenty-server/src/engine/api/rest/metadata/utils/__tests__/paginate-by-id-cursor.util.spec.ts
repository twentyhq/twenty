import { BadRequestException } from '@nestjs/common';

import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import {
  isMetadataRestRequest,
  paginateMetadataRestItems,
} from 'src/engine/api/rest/metadata/utils/paginate-by-id-cursor.util';

const UUID_A = '00000000-0000-4000-8000-00000000000a';
const UUID_B = '00000000-0000-4000-8000-00000000000b';
const UUID_C = '00000000-0000-4000-8000-00000000000c';

const requestWithQuery = (
  query: Record<string, string>,
): AuthenticatedRequest => ({ query }) as unknown as AuthenticatedRequest;

describe('paginateMetadataRestItems', () => {
  it('parses REST arguments and returns the unified direct envelope', () => {
    const page = paginateMetadataRestItems({
      items: [{ id: UUID_A }, { id: UUID_B }, { id: UUID_C }],
      request: requestWithQuery({ limit: '1', starting_after: UUID_A }),
    });

    expect(page).toEqual({
      data: [{ id: UUID_B }],
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: true,
        startCursor: UUID_B,
        endCursor: UUID_B,
      },
      totalCount: 3,
    });
  });

  it('rejects mutually exclusive cursors', () => {
    expect(() =>
      paginateMetadataRestItems({
        items: [],
        request: requestWithQuery({
          starting_after: UUID_A,
          ending_before: UUID_B,
        }),
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects malformed identity cursors', () => {
    expect(() =>
      paginateMetadataRestItems({
        items: [],
        request: requestWithQuery({ starting_after: 'not-a-uuid' }),
      }),
    ).toThrow('Invalid cursor');
  });
});

describe('isMetadataRestRequest', () => {
  it('distinguishes metadata routes from deprecated aliases', () => {
    expect(
      isMetadataRestRequest({
        originalUrl: '/rest/metadata/webhooks?limit=1',
      } as AuthenticatedRequest),
    ).toBe(true);
    expect(
      isMetadataRestRequest({
        originalUrl: '/rest/webhooks?limit=1',
      } as AuthenticatedRequest),
    ).toBe(false);
  });
});
