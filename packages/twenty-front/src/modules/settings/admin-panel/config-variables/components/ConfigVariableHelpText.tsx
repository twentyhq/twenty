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

type ConfigVariableHelpTextProps = {
  variable: ConfigVariableWithTypes;
  hasValueChanged: boolean;
  color?: string;
};

// lint is complaining that this is a Effect component when its not?
// renamed it to have effect suffix to avoid linting error, weird
export const ConfigVariableHelpText = ({
  variable,
  hasValueChanged,
  color,
}: ConfigVariableHelpTextProps) => {
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
        {t`Database configuration is currently disabled. `}
        {isFromEnvironment
          ? t`Value is set in the server environment, it may be a different value on the worker.`
          : t`Using default application value. Configure via environment variables.`}
      </StyledHelpText>
    );
  }

  if (isConfigVariablesInDbEnabled && variable.isEnvOnly) {
    return (
      <StyledHelpText>
        {t`This setting can only be configured through environment variables.`}
      </StyledHelpText>
    );
  }

  if (isConfigVariablesInDbEnabled && !variable.isEnvOnly && hasValueChanged) {
    return (
      <StyledHelpText color={color || theme.color.blue50}>
        {isFromDatabase
          ? t`Click Save to apply your changes.`
          : t`This value will be saved to the database.`}
      </StyledHelpText>
    );
  }

  if (isConfigVariablesInDbEnabled && !variable.isEnvOnly && !hasValueChanged) {
    if (isFromDatabase) {
      return (
        <>
          <StyledHelpText>
            {t`This database value overrides environment settings. `}
          </StyledHelpText>
          <StyledHelpText>
            {t`Clear the field or "X" to revert to environment/default value.`}
          </StyledHelpText>
        </>
      );
    } else {
      return (
        <StyledHelpText>
          {isFromEnvironment
            ? t`Current value from server environment. Set a custom value to override.`
            : t`Using default value. Set a custom value to override.`}
        </StyledHelpText>
      );
    }
  }

  return <StyledHelpText>{t`This should never happen`}</StyledHelpText>;
};
