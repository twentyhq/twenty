export type OnboardingHomeIllustrationPoint = readonly [number, number];

export type OnboardingHomeIllustrationFurniture = {
  name: string;
  polygon: readonly OnboardingHomeIllustrationPoint[];
};
