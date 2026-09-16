import { Section } from 'twenty-ui/primitives/layout';
import { IconReload, IconTrash } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/primitives/typography';
import { Trans, useLingui } from '@lingui/react/macro';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { TextInput } from '@/ui/input/components/TextInput';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { Button, ButtonGroup } from 'twenty-ui/primitives/input';
import { styled } from '@linaria/react';
import { SettingsDomainRecords } from '@/settings/domains/components/SettingsDomainRecords';
import { useCheckPublicDomainValidRecords } from '@/settings/domains/hooks/useCheckPublicDomainValidRecords';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  CreatePublicDomainDocument,
  DeletePublicDomainDocument,
  FindManyPublicDomainsDocument,
  FindOneApplicationNameDocument,
} from '~/generated-metadata/graphql';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CheckPublicDomainValidRecordsEffect } from '@/settings/domains/components/CheckPublicDomainValidRecordsEffect';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { getDomainValidationSchema } from '@/settings/domains/utils/getDomainValidationSchema';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledButtonGroupContainer = styled.div`
  > * > :not(:first-of-type) > button {
    border-left: none;
  }
`;

const StyledButtonContainer = styled.div`
  align-self: flex-start;
`;

const StyledDomainFormWrapper = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledRecordsWrapper = styled.div`
  margin-top: ${themeCssVariables.spacing[2]};

  & > :not(:first-of-type) {
    margin-top: ${themeCssVariables.spacing[4]};
  }
`;

export const SettingPublicDomain = () => {
  const { applicationId = '', publicDomainId } = useParams<{
    applicationId: string;
    publicDomainId: string;
  }>();

  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [createPublicDomain, { loading }] = useMutation(
    CreatePublicDomainDocument,
  );

  const { data: publicDomainsData, refetch: refetchPublicDomains } = useQuery(
    FindManyPublicDomainsDocument,
  );

  const selectedPublicDomain = isDefined(publicDomainId)
    ? publicDomainsData?.findManyPublicDomains?.find(
        ({ id }) => id === publicDomainId,
      )
    : undefined;

  const { data: applicationData } = useQuery(FindOneApplicationNameDocument, {
    variables: { id: applicationId },
    skip: !applicationId,
  });

  const applicationName =
    applicationData?.findOneApplication?.name ?? t`Application`;

  const [newPublicDomain, setNewPublicDomain] = useState<string | undefined>(
    '',
  );

  const [newPublicDomainError, setNewPublicDomainError] = useState<
    string | undefined
  >(undefined);

  const [deletePublicDomain] = useMutation(DeletePublicDomainDocument);

  const { isLoading, publicDomainRecords, checkPublicDomainRecords } =
    useCheckPublicDomainValidRecords();

  // Also used once the create and delete mutations resolve, so it cannot be
  // replaced by a Link.
  // oxlint-disable-next-line twenty/no-navigate-prefer-link
  const navigateToApplication = () =>
    navigate(SettingsPath.ApplicationDetail, { applicationId });

  const onDelete = async () => {
    if (!selectedPublicDomain) {
      return;
    }

    await deletePublicDomain({
      variables: { domain: selectedPublicDomain.domain },
      onCompleted: async () => {
        enqueueSuccessSnackBar({
          message: t`Custom domain successfully deleted`,
        });
        await refetchPublicDomains();
        navigateToApplication();
      },
      onError: (error) =>
        enqueueErrorSnackBar({
          apolloError: error,
        }),
    });
  };

  const validationSchema = getDomainValidationSchema();

  const onCreate = async () => {
    if (!isDefined(newPublicDomain) || !isDefined(applicationId)) {
      return;
    }

    const result = validationSchema.safeParse(newPublicDomain);

    if (!result.success) {
      setNewPublicDomainError(result.error?.issues[0].message);
      return;
    }

    setNewPublicDomainError(undefined);

    await createPublicDomain({
      variables: {
        domain: newPublicDomain,
        applicationId,
      },
      onCompleted: async () => {
        enqueueSuccessSnackBar({
          message: t`Custom domain successfully created`,
        });
        await refetchPublicDomains();
        navigateToApplication();
      },
      onError: (error) => {
        setNewPublicDomainError(error.message);
        enqueueErrorSnackBar({
          apolloError: error,
        });
      },
    });
  };

  return (
    <SettingsPageLayout
      title={t`Custom Domain`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: <Trans>Apps</Trans>,
          href: getSettingsPath(SettingsPath.Applications),
        },
        {
          children: applicationName,
          href: getSettingsPath(SettingsPath.ApplicationDetail, {
            applicationId,
          }),
        },
        { children: <Trans>Custom Domain</Trans> },
      ]}
      actionButton={
        <SaveAndCancelButtons
          onCancel={navigateToApplication}
          isSaveDisabled={loading || isDefined(selectedPublicDomain)}
          onSave={onCreate}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Custom Domain`}
            description={t`Set the name of your custom domain and configure your DNS records.`}
          />
          {isDefined(selectedPublicDomain) && (
            <CheckPublicDomainValidRecordsEffect
              publicDomain={selectedPublicDomain}
            />
          )}
          <StyledDomainFormWrapper>
            <TextInput
              value={selectedPublicDomain?.domain ?? newPublicDomain}
              onChange={setNewPublicDomain}
              error={newPublicDomainError}
              type="text"
              disabled={isDefined(selectedPublicDomain)}
              placeholder="app.yourdomain.com"
              fullWidth
            />
            {isDefined(selectedPublicDomain) && (
              <StyledButtonGroupContainer>
                <ButtonGroup>
                  <StyledButtonContainer>
                    <Button
                      isLoading={isLoading}
                      Icon={IconReload}
                      title={t`Reload`}
                      variant="primary"
                      onClick={() =>
                        checkPublicDomainRecords(selectedPublicDomain.domain)
                      }
                      type="button"
                    />
                  </StyledButtonContainer>
                  <StyledButtonContainer>
                    <Button
                      Icon={IconTrash}
                      variant="primary"
                      onClick={onDelete}
                    />
                  </StyledButtonContainer>
                </ButtonGroup>
              </StyledButtonGroupContainer>
            )}
          </StyledDomainFormWrapper>
          {isDefined(selectedPublicDomain) && publicDomainRecords?.domain && (
            <StyledRecordsWrapper>
              {isDefined(publicDomainRecords.records) && (
                <SettingsDomainRecords records={publicDomainRecords.records} />
              )}
            </StyledRecordsWrapper>
          )}
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
