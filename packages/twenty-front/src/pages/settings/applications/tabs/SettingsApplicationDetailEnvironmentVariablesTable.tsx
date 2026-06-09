import { TextInput } from '@/ui/input/components/TextInput';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useState } from 'react';
import {
  AppTooltip,
  H2Title,
  IconInfoCircle,
  TooltipDelay,
} from 'twenty-ui-deprecated/display';
import { Section } from 'twenty-ui-deprecated/layout';
import {
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui-deprecated/theme-constants';
import { useDebouncedCallback } from 'use-debounce';
import { type ApplicationVariable } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledLabelRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

export const SettingsApplicationDetailEnvironmentVariablesTable = ({
  envVariables,
  onUpdate,
}: {
  envVariables: ApplicationVariable[];
  onUpdate: (newEnv: Pick<ApplicationVariable, 'key' | 'value'>) => void;
  readonly?: boolean;
}) => {
  const { theme } = useContext(ThemeContext);
  const [editedEnvVariables, setEditedEnvVariables] = useState(envVariables);
  const onUpdateDebounced = useDebouncedCallback(
    (value: Pick<ApplicationVariable, 'key' | 'value'>) => {
      onUpdate(value);
    },
    250,
  );
  const sectionDescription =
    editedEnvVariables.length > 0
      ? t`Set your application configuration variables`
      : t`No variables to set for this application`;
  return (
    <Section>
      <H2Title title={t`Configuration`} description={sectionDescription} />
      <StyledContainer>
        {editedEnvVariables.map((editedEnvVariable) => {
          const tooltipId = `env-var-desc-${editedEnvVariable.key}`;
          return (
            <div key={editedEnvVariable.key}>
              <StyledLabelRow>
                <StyledLabel>{editedEnvVariable.key}</StyledLabel>
                {isNonEmptyString(editedEnvVariable.description) && (
                  <>
                    <IconInfoCircle
                      id={`env-var-desc-${editedEnvVariable.key}`}
                      size={theme.icon.size.sm}
                      color={theme.font.color.tertiary}
                      style={{ outline: 'none', cursor: 'pointer' }}
                    />
                    <AppTooltip
                      anchorSelect={`#${tooltipId}`}
                      content={editedEnvVariable.description}
                      offset={5}
                      noArrow
                      place="bottom"
                      positionStrategy="fixed"
                      delay={TooltipDelay.shortDelay}
                    />
                  </>
                )}
              </StyledLabelRow>
              <TextInput
                value={editedEnvVariable.value}
                onChange={(newValue) => {
                  setEditedEnvVariables((prevState) =>
                    prevState.map((val) => {
                      if (val.key === editedEnvVariable.key) {
                        return { ...val, value: newValue };
                      }
                      return val;
                    }),
                  );
                  onUpdateDebounced({ ...editedEnvVariable, value: newValue });
                }}
                placeholder={t`Value`}
                fullWidth
              />
            </div>
          );
        })}
      </StyledContainer>
    </Section>
  );
};
