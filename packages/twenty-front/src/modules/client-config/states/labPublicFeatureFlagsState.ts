import { atom } from "recoil";
import { PublicFeatureFlagObject } from "~/generated/graphql";
export const labPublicFeatureFlagsState = atom<PublicFeatureFlagObject[]>({
  key: 'labPublicFeatureFlagsState',
  default: [],
});
