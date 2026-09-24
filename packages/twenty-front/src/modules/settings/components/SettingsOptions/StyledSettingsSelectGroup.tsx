import { styled } from '@linaria/react';

export const StyledSettingsSelectGroup = styled.div<{ controlWidth: number }>`
  --settings-select-control-width: ${({ controlWidth }) => controlWidth}px;
  container-name: settings-select-group;
  container-type: inline-size;
`;
