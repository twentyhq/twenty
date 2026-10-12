import { isFunction } from '@sniptt/guards';

import { DEFAULT_INPUT_MEDIA_FEATURES } from '@/constants/DefaultInputMediaFeatures';
import { INPUT_MEDIA_FEATURE_QUERIES } from '@/host/geometry/constants/InputMediaFeatureQueries';
import { type InputMediaFeatures } from '@/types/InputMediaFeatures';
import { type PointerMediaFeatureValue } from '@/types/PointerMediaFeatureValue';

const readPointerMediaFeature = (): PointerMediaFeatureValue => {
  if (window.matchMedia(INPUT_MEDIA_FEATURE_QUERIES.finePointer).matches) {
    return 'fine';
  }

  return window.matchMedia(INPUT_MEDIA_FEATURE_QUERIES.coarsePointer).matches
    ? 'coarse'
    : 'none';
};

export const readInputMediaFeatures = (): InputMediaFeatures => {
  if (!isFunction(window.matchMedia)) {
    return DEFAULT_INPUT_MEDIA_FEATURES;
  }

  return {
    hover: window.matchMedia(INPUT_MEDIA_FEATURE_QUERIES.hover).matches
      ? 'hover'
      : 'none',
    pointer: readPointerMediaFeature(),
  };
};
