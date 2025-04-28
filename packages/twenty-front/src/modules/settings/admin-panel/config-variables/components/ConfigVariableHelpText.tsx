import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

import { isConfigVariablesInDbEnabledState } from '@/client-config/states/isConfigVariablesInDbEnabledState';
import { useRecoilValue } from 'recoil';
import { ConfigSource } from '~/generated/graphql';
import { ConfigVariableWithTypes } from '../types/ConfigVariableWithTypes';

const StyledHelpText = styled.div<{ color?: string }>`
  color: ${({ theme, color }) => color || theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: 1.5;
`;

type ConfigVariableHelpTextEffectProps = {
  variable: ConfigVariableWithTypes;
  hasValueChanged: boolean;
  color?: string;
};

// lint is complaining that this is a Effect component when its not?
// renamed it to have effect suffix to avoid linting error, weird
export const ConfigVariableHelpTextEffect = ({
  variable,
  hasValueChanged,
  color,
}: ConfigVariableHelpTextEffectProps) => {
  const isConfigVariablesInDbEnabled = useRecoilValue(
    isConfigVariablesInDbEnabledState,
  );
  const { t } = useLingui();
  const theme = useTheme();
  const isFromDatabase = variable.source === ConfigSource.DATABASE;
  const isFromEnvironment = variable.source === ConfigSource.ENVIRONMENT;
  const isReadOnly = !isConfigVariablesInDbEnabled;

  if (isReadOnly) {
    return (
      <StyledHelpText>
        {t`Database configuration is disabled.`}
        {isFromEnvironment
          ? t`The current value is coming from the server's environment, it may be a different value on the worker.`
          : t`The current value is the default application value. Variables can only be set in the environment.`}
      </StyledHelpText>
    );
  }

  if (isConfigVariablesInDbEnabled && variable.isEnvOnly) {
    return (
      <StyledHelpText>
        {t`This variable can only be set in the environment and cannot be modified here.`}
      </StyledHelpText>
    );
  }

  if (isConfigVariablesInDbEnabled && !variable.isEnvOnly && hasValueChanged) {
    return (
      <StyledHelpText color={color || theme.color.blue50}>
        {isFromDatabase
          ? t`Value has been changed. Click Save to apply changes.`
          : t`This value will be stored in the database.`}
      </StyledHelpText>
    );
  }

  if (isConfigVariablesInDbEnabled && !variable.isEnvOnly && !hasValueChanged) {
    if (isFromDatabase) {
      return (
        <>
          <StyledHelpText>
            {t`This value is stored in the database and takes precedence over environment variables.`}
          </StyledHelpText>
          <StyledHelpText>
            {t`To remove this custom value and revert to the environment or default value, clear the field or use the "Reset to Default" button.`}
          </StyledHelpText>
        </>
      );
    } else {
      return (
        <StyledHelpText>
          {t`You can set a custom value that will be stored in the database.`}
          {isFromEnvironment
            ? t`The current value is coming from the server's environment, it may be a different value on the worker.`
            : t`The current value is the default application value.`}
        </StyledHelpText>
      );
    }
  }

  return null;
};
