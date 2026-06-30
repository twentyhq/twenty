import { describe, expect, it } from 'vitest';

import { deriveDeploymentExpertise } from './derive-deployment-expertise';

describe('deriveDeploymentExpertise', () => {
  it('defaults to CLOUD for everyone', () => {
    expect(deriveDeploymentExpertise(undefined)).toEqual(['CLOUD']);
    expect(deriveDeploymentExpertise([])).toEqual(['CLOUD']);
    expect(deriveDeploymentExpertise(['ADVISORY', 'SUPPORT'])).toEqual(['CLOUD']);
  });

  it('adds SELF_HOST when the partner covers HOSTING', () => {
    expect(deriveDeploymentExpertise(['HOSTING'])).toEqual(['CLOUD', 'SELF_HOST']);
    expect(deriveDeploymentExpertise(['DEVELOPMENT', 'HOSTING'])).toEqual(['CLOUD', 'SELF_HOST']);
  });
});
