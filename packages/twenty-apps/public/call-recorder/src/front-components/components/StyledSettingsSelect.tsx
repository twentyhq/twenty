import styled from '@emotion/styled';

import { getSettingsControlStyles } from 'src/front-components/utils/get-settings-control-styles.util';

export const StyledSettingsSelect = styled.select`
  cursor: pointer;
  display: block;
  height: 32px;
  ${getSettingsControlStyles}
`;
