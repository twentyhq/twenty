/* @license Enterprise */
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { TextInput } from '@/ui/input/components/TextInput';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { H2Title, IconReload, IconTrash } from 'twenty-ui/display';
import { Button, ButtonGroup } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { SettingsDomainRecords } from '@/settings/domains/components/SettingsDomainRecords';
import { CheckCustomDomainValidRecordsEffect } from '@/settings/domains/components/CheckCustomDomainValidRecordsEffect';
import { useCheckCustomDomainValidRecords } from '@/settings/domains/hooks/useCheckCustomDomainValidRecords';
import { customDomainRecordsState } from '@/settings/domains/states/customDomainRecordsState';

const StyledDomainFormWrapper = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledButtonGroupContainer = styled.div`
  > * > :not(:first-of-type) > button {
    border-left: none;
  }
`;

const StyledButtonContainer = styled.div`
  align-self: flex-start;
`;

const StyledRecordsWrapper = styled.div`
  margin-top: ${themeCssVariables.spacing[2]};

  & > :not(:first-of-type) {
    margin-top: ${themeCssVariables.spacing[4]};
  }
`;

type SettingsCustomDomainProps = {
  value: string | null;
  onChange: (value: string) => void;
  onDelete: () => void;
  error?: string;
};

export const SettingsCustomDomain = ({
  value,
  onChange,
  onDelete,
  error,
}: SettingsCustomDomainProps) => {
  const { customDomainRecords, isLoading } = useAtomStateValue(
    customDomainRecordsState,
  );

  const { checkCustomDomainRecords } = useCheckCustomDomainValidRecords();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { t } = useLingui();

  return (
    <Section>
      <H2Title
        title={t`Custom Domain`}
        description={t`Set the name of your custom domain and configure your DNS records.`}
      />
      <CheckCustomDomainValidRecordsEffect />
      <StyledDomainFormWrapper>
        <TextInput
          value={value ?? ''}
          type="text"
          onChange={onChange}
          placeholder="crm.yourdomain.com"
          error={error}
          fullWidth
        />
        {currentWorkspace?.customDomain && (
          <StyledButtonGroupContainer>
            <ButtonGroup>
              <StyledButtonContainer>
                <Button
                  isLoading={isLoading}
                  Icon={IconReload}
                  title={t`Reload`}
                  variant="primary"
                  onClick={checkCustomDomainRecords}
                  type="button"
                />
              </StyledButtonContainer>
              <StyledButtonContainer>
                <Button Icon={IconTrash} variant="primary" onClick={onDelete} />
              </StyledButtonContainer>
            </ButtonGroup>
          </StyledButtonGroupContainer>
        )}
      </StyledDomainFormWrapper>
      {currentWorkspace?.customDomain && (
        <StyledRecordsWrapper>
          {customDomainRecords && (
            <SettingsDomainRecords records={customDomainRecords.records} />
          )}
        </StyledRecordsWrapper>
      )}
    </Section>
  );
};
