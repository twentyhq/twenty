import styled from '@emotion/styled';

import { getSettingsControlStyles } from 'src/front-components/utils/get-settings-control-styles.util';

export const StyledSettingsTextInput = styled.input`
  display: flex;
  flex-grow: 1;
  height: 32px;
  text-overflow: ellipsis;
  ${getSettingsControlStyles}
`;
