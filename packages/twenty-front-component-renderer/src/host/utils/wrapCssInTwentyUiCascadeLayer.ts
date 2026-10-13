import { TWENTY_UI_CASCADE_LAYER_NAME } from '@/host/constants/TwentyUiCascadeLayerName';

const TWENTY_UI_CASCADE_LAYER_DECLARATION = `@layer ${TWENTY_UI_CASCADE_LAYER_NAME}`;

export const wrapCssInTwentyUiCascadeLayer = (cssText: string): string =>
  cssText.includes(TWENTY_UI_CASCADE_LAYER_DECLARATION)
    ? cssText
    : `${TWENTY_UI_CASCADE_LAYER_DECLARATION} {\n${cssText}\n}`;
