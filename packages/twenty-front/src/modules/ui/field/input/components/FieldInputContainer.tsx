import { styled } from '@linaria/react';

import { FIELD_INPUT_ANCHOR_WIDTH_CSS_VARIABLE } from '@/ui/field/input/constants/FieldInputAnchorWidthCssVariable';

// oxlint-disable-next-line twenty/styled-components-prefixed-with-styled
export const FieldInputContainer = styled.div`
  align-items: center;
  display: flex;
  min-height: 32px;
  min-width: max(200px, var(${FIELD_INPUT_ANCHOR_WIDTH_CSS_VARIABLE}, 0px));
  width: 100%;
`;
