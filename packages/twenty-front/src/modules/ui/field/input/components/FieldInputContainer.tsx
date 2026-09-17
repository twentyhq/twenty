import { styled } from '@linaria/react';

import { FIELD_INPUT_ANCHOR_WIDTH_CSS_VARIABLE } from '@/ui/field/input/constants/FieldInputAnchorWidthCssVariable';

// Inputs that fill their container should also fill the field they float over, when that width is known.
// oxlint-disable-next-line twenty/styled-components-prefixed-with-styled
export const FieldInputContainer = styled.div`
  align-items: center;
  display: flex;
  min-height: 32px;
  min-width: max(200px, var(${FIELD_INPUT_ANCHOR_WIDTH_CSS_VARIABLE}, 0px));
  width: 100%;
`;
