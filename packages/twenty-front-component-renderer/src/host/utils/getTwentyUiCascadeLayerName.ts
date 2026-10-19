import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { TWENTY_UI_CASCADE_LAYER_NAME } from '@/host/constants/TwentyUiCascadeLayerName';

const ANONYMOUS_IMPORT_LAYER_PREFIX = 'anonymous-';

export const getTwentyUiCascadeLayerName = (
  layerName: string | null,
): string => {
  if (!isDefined(layerName)) {
    return TWENTY_UI_CASCADE_LAYER_NAME;
  }

  if (!isNonEmptyString(layerName)) {
    const anonymousLayerIdentifier = crypto
      .getRandomValues(new Uint32Array(4))
      .join('-');

    return `${TWENTY_UI_CASCADE_LAYER_NAME}.${ANONYMOUS_IMPORT_LAYER_PREFIX}${anonymousLayerIdentifier}`;
  }

  const isTwentyUiLayer =
    layerName === TWENTY_UI_CASCADE_LAYER_NAME ||
    layerName.startsWith(`${TWENTY_UI_CASCADE_LAYER_NAME}.`);

  return isTwentyUiLayer
    ? layerName
    : `${TWENTY_UI_CASCADE_LAYER_NAME}.${layerName}`;
};
