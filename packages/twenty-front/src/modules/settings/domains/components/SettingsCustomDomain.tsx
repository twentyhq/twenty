/* @license Enterprise */
import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { CheckCustomDomainValidRecordsEffect } from '@/settings/domains/components/CheckCustomDomainValidRecordsEffect';
import { SettingsDomainRecords } from '@/settings/domains/components/SettingsDomainRecords';
import { useCheckCustomDomainValidRecords } from '@/settings/domains/hooks/useCheckCustomDomainValidRecords';
import { customDomainRecordsState } from '@/settings/domains/states/customDomainRecordsState';
import { getDomainValidationSchema } from '@/settings/domains/utils/getDomainValidationSchema';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { H2Title, IconReload, IconTrash } from 'twenty-ui/display';
import { Button, ButtonGroup } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

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

const StyledSaveButtonContainer = styled.div`
  margin-left: auto;
  margin-top: 8px;
`;

export const SettingsCustomDomain = () => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { checkCustomDomainRecords } = useCheckCustomDomainValidRecords();
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const { customDomainRecords, isLoading: isRecordsLoading } =
    useAtomStateValue(customDomainRecordsState);

  const domainSchema = getDomainValidationSchema(t);

  const [customDomain, setCustomDomain] = useState(
    currentWorkspace?.customDomain ?? '',
  );
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (value: string) => {
    setCustomDomain(value);

    const result = domainSchema.safeParse(value);

    setError(result.success ? undefined : result.error.issues[0].message);
  };

  const handleDelete = () => {
    setCustomDomain('');
    setError(undefined);
  };

  const hasChanged =
    customDomain !== (currentWorkspace?.customDomain ?? '');
  const isSaveDisabled = !hasChanged || isDefined(error) || isSubmitting;

  const handleSave = () => {
    if (!isDefined(currentWorkspace) || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const domainValue =
      isDefined(customDomain) && customDomain.length > 0
        ? customDomain
        : null;

    updateWorkspace({
      variables: {
        input: { customDomain: domainValue },
      },
      onCompleted: () => {
        setCurrentWorkspace({
          ...(currentWorkspace as CurrentWorkspace),
          customDomain: domainValue,
        });
        enqueueSuccessSnackBar({ message: t`Custom domain updated` });
        setIsSubmitting(false);
        checkCustomDomainRecords();
      },
      onError: (mutationError) => {
        if (
          CombinedGraphQLErrors.is(mutationError) &&
          mutationError.errors[0]?.extensions?.code === 'CONFLICT'
        ) {
          setError(t`Domain already taken`);
          setIsSubmitting(false);

          return;
        }
        if (CombinedGraphQLErrors.is(mutationError)) {
          enqueueErrorSnackBar({ apolloError: mutationError });
        } else {
          enqueueErrorSnackBar({});
        }
        setIsSubmitting(false);
      },
    });
  };

  return (
    <Section>
      <H2Title
        title={t`Custom Domain`}
        description={t`Set the name of your custom domain and configure your DNS records.`}
      />
      <CheckCustomDomainValidRecordsEffect />
      <StyledDomainFormWrapper>
        <TextInput
          value={customDomain}
          type="text"
          onChange={handleChange}
          placeholder="crm.yourdomain.com"
          error={error}
          fullWidth
        />
        {currentWorkspace?.customDomain && (
          <StyledButtonGroupContainer>
            <ButtonGroup>
              <StyledButtonContainer>
                <Button
                  isLoading={isRecordsLoading}
                  Icon={IconReload}
                  title={t`Reload`}
                  variant="primary"
                  onClick={checkCustomDomainRecords}
                  type="button"
                />
              </StyledButtonContainer>
              <StyledButtonContainer>
                <Button
                  Icon={IconTrash}
                  variant="primary"
                  onClick={handleDelete}
                />
              </StyledButtonContainer>
            </ButtonGroup>
          </StyledButtonGroupContainer>
        )}
      </StyledDomainFormWrapper>
      <StyledSaveButtonContainer>
        <SaveAndCancelButtons
          isSaveDisabled={isSaveDisabled}
          isLoading={isSubmitting}
          onSave={handleSave}
          onCancel={() => {
            setCustomDomain(currentWorkspace?.customDomain ?? '');
            setError(undefined);
          }}
        />
      </StyledSaveButtonContainer>
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
