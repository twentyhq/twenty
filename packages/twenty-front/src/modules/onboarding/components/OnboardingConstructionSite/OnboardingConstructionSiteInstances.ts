export type OnboardingConstructionSiteMeshName =
  | 'cube'
  | 'cylinder'
  | 'cone'
  | 'mixerDrum';

export type OnboardingConstructionSiteInstanceBatch = {
  data: Float32Array;
  count: number;
};

export type OnboardingConstructionSiteInstances = Record<
  OnboardingConstructionSiteMeshName,
  OnboardingConstructionSiteInstanceBatch
>;
