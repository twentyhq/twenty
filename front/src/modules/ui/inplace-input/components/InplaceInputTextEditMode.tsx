import styled from '@emotion/styled';

import { bigTextInputStyle, textInputStyle } from '@/ui/themes/effects';

export const InplaceInputTextEditMode = styled.input<{ isTitle?: boolean }>`
  margin: 0;
  width: 100%;
  ${({ isTitle }) => (isTitle ? bigTextInputStyle : textInputStyle)}
`;
