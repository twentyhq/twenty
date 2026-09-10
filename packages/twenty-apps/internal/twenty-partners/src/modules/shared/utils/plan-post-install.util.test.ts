import { describe, expect, it } from 'vitest';

import { planPostInstall } from './plan-post-install.util';

describe('planPostInstall', () => {
  it('runs both backfills on a fresh install', () => {
    expect(planPostInstall(undefined)).toEqual({
      stampPartnerUser: true,
      grantApplicantVisibility: true,
    });
  });

  it('runs only the applicant grant when upgrading from 1.8.0', () => {
    expect(planPostInstall('1.8.0')).toEqual({
      stampPartnerUser: false,
      grantApplicantVisibility: true,
    });
  });

  // 1.8.1 is another PR; 1.8.2 never shipped on main. Both still need the grant.
  it('runs only the applicant grant when upgrading from a release below 1.8.3', () => {
    for (const previousVersion of ['1.8.1', '1.8.2']) {
      expect(planPostInstall(previousVersion)).toEqual({
        stampPartnerUser: false,
        grantApplicantVisibility: true,
      });
    }
  });

  it('skips both backfills when already on 1.8.3 or later', () => {
    expect(planPostInstall('1.8.3')).toEqual({
      stampPartnerUser: false,
      grantApplicantVisibility: false,
    });
    expect(planPostInstall('1.9.0')).toEqual({
      stampPartnerUser: false,
      grantApplicantVisibility: false,
    });
  });
});
