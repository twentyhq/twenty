import { useRecoilValue } from 'recoil';
import {
  DEFAULT_OUTPUT_VALUE,
  settingsServerlessFunctionOutputState,
} from '@/settings/serverless-functions/states/settingsServerlessFunctionOutputState';
import styled from '@emotion/styled';
import { IconSquareRoundedCheck } from 'twenty-ui';
import { useTheme } from '@emotion/react';

const StyledOutput = styled.div<{ status?: number }>`
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme, status }) =>
    status === 200 ? theme.color.turquoise : theme.color.red};
  display: flex;
`;

export const SettingsServerlessFunctionsOutputMetadataInfo = () => {
  const theme = useTheme();
  const settingsServerlessFunctionOutput = useRecoilValue(
    settingsServerlessFunctionOutputState,
  );
  return settingsServerlessFunctionOutput.data === DEFAULT_OUTPUT_VALUE ? (
    'Output'
  ) : (
    <StyledOutput status={settingsServerlessFunctionOutput.status}>
      <IconSquareRoundedCheck size={theme.icon.size.md} />
      {settingsServerlessFunctionOutput.status}{' '}
      {settingsServerlessFunctionOutput.status === 200 ? 'OK' : 'Error'} -{' '}
      {settingsServerlessFunctionOutput.duration}ms
    </StyledOutput>
  );
};
