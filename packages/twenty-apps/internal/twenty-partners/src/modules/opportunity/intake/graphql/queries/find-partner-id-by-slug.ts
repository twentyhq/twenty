import type { CoreApiClient } from 'twenty-client-sdk/core';

// Slug-only: a partner who referred a brief stays the referrer even if they
// later go unavailable or lose validation.
export function findPartnerIdBySlug(client: CoreApiClient, slug: string) {
  return client.query({
    partners: {
      __args: { filter: { slug: { eq: slug } }, first: 1 },
      edges: { node: { id: true, name: true } },
    },
  });
}
