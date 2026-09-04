import styled from '@emotion/styled';

import { getSettingsControlStyles } from 'src/front-components/utils/get-settings-control-styles.util';

export const StyledSettingsTextArea = styled.textarea`
  display: block;
  line-height: 1.5;
  min-height: 96px;
  resize: vertical;
  ${getSettingsControlStyles}
`;
