import { describe, expect, it } from 'vitest';

import downlineReferralRelationshipsOnAmbassador from './downline-referral-relationships-on-ambassador.field';
import sponsoredAmbassadorOnReferralRelationship from './sponsored-ambassador-on-referral-relationship.field';
import sponsoredReferralRelationshipsOnAmbassador from './sponsored-referral-relationships-on-ambassador.field';
import sponsorAmbassadorOnReferralRelationship from './sponsor-ambassador-on-referral-relationship.field';
import referralRelationshipsNavigationMenuItem from '../navigation-menu-items/referral-relationships.navigation-menu-item';
import { XOPURE_AMBASSADOR_OBJECT_ID } from '../objects/xopure-ambassador.object';
import { XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID } from '../objects/xopure-referral-relationship.object';
import referralRelationshipDownlineView from '../views/referral-relationship-downline.view';

describe('referral relationship downline metadata', () => {
  it('wires sponsor and sponsored ambassador relations bidirectionally', () => {
    expect(sponsorAmbassadorOnReferralRelationship.success).toBe(true);
    expect(sponsoredReferralRelationshipsOnAmbassador.success).toBe(true);
    expect(sponsoredAmbassadorOnReferralRelationship.success).toBe(true);
    expect(downlineReferralRelationshipsOnAmbassador.success).toBe(true);

    expect(sponsorAmbassadorOnReferralRelationship.config).toMatchObject({
      objectUniversalIdentifier: XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID,
      name: 'sponsor',
      relationTargetObjectMetadataUniversalIdentifier:
        XOPURE_AMBASSADOR_OBJECT_ID,
      universalSettings: {
        relationType: 'MANY_TO_ONE',
        joinColumnName: 'sponsorId',
      },
    });
    expect(sponsoredAmbassadorOnReferralRelationship.config).toMatchObject({
      objectUniversalIdentifier: XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID,
      name: 'sponsored',
      relationTargetObjectMetadataUniversalIdentifier:
        XOPURE_AMBASSADOR_OBJECT_ID,
      universalSettings: {
        relationType: 'MANY_TO_ONE',
        joinColumnName: 'sponsoredId',
      },
    });
    expect(downlineReferralRelationshipsOnAmbassador.config).toMatchObject({
      objectUniversalIdentifier: XOPURE_AMBASSADOR_OBJECT_ID,
      name: 'downlineReferralRelationships',
      relationTargetObjectMetadataUniversalIdentifier:
        XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID,
      universalSettings: {
        relationType: 'ONE_TO_MANY',
      },
    });
  });

  it('exposes referral relationships in navigation and table view', () => {
    expect(referralRelationshipsNavigationMenuItem.success).toBe(true);
    expect(referralRelationshipDownlineView.success).toBe(true);
    expect(referralRelationshipsNavigationMenuItem.config).toMatchObject({
      targetObjectUniversalIdentifier: XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID,
    });
    expect(referralRelationshipDownlineView.config).toMatchObject({
      name: 'Ambassador Downline',
      objectUniversalIdentifier: XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID,
      type: 'TABLE',
    });
  });
});
