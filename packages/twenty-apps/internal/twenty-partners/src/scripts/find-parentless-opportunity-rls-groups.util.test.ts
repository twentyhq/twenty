import { describe, expect, it } from 'vitest';

import { findParentlessOpportunityRlsGroups } from './find-parentless-opportunity-rls-groups.util';

const OPPORTUNITY_OBJECT_ID = 'opportunity-object';

describe('findParentlessOpportunityRlsGroups', () => {
  it('returns only parentless groups on the opportunity object', () => {
    const groups = findParentlessOpportunityRlsGroups(
      [
        {
          id: 'manifest',
          objectMetadataId: OPPORTUNITY_OBJECT_ID,
          parentRowLevelPermissionPredicateGroupId: null,
        },
        {
          id: 'leftover',
          objectMetadataId: OPPORTUNITY_OBJECT_ID,
        },
        {
          id: 'nested',
          objectMetadataId: OPPORTUNITY_OBJECT_ID,
          parentRowLevelPermissionPredicateGroupId: 'manifest',
        },
        {
          id: 'other-object',
          objectMetadataId: 'application-object',
          parentRowLevelPermissionPredicateGroupId: null,
        },
      ],
      OPPORTUNITY_OBJECT_ID,
    );

    expect(groups.map((group) => group.id)).toEqual(['manifest', 'leftover']);
  });
});
