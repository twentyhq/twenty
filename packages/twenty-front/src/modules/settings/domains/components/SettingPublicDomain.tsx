import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { CheckPublicDomainValidRecordsEffect } from '@/settings/domains/components/CheckPublicDomainValidRecordsEffect';
import { SettingsDomainRecords } from '@/settings/domains/components/SettingsDomainRecords';
import { useCheckPublicDomainValidRecords } from '@/settings/domains/hooks/useCheckPublicDomainValidRecords';
import { getDomainValidationSchema } from '@/settings/domains/utils/getDomainValidationSchema';
import { TextInput } from '@/ui/input/components/TextInput';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section, useToast } from 'twenty-ui/components';
import { IconReload, IconTrash } from 'twenty-ui/icon';
import { Button, ButtonGroup } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  CreatePublicDomainDocument,
  DeletePublicDomainDocument,
  FindManyPublicDomainsDocument,
  FindOneApplicationNameDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

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
  const { enqueueToast } = useToast();

  const [createPublicDomain, { loading }] = useMutation(
    CreatePublicDomainDocument,
  );

  const {
    data: publicDomainsData,
    loading: publicDomainsLoading,
    refetch: refetchPublicDomains,
  } = useQuery(FindManyPublicDomainsDocument);

  const isEditingPublicDomain = isDefined(publicDomainId);

  // Scoped to the application in the URL: the query is workspace-wide, so a
  // domain id from another application would otherwise be editable and
  // deletable from this page.
  const selectedPublicDomain = isEditingPublicDomain
    ? publicDomainsData?.findManyPublicDomains?.find(
        (publicDomain) =>
          publicDomain.id === publicDomainId &&
          publicDomain.applicationId === applicationId,
      )
    : undefined;

  const isLoadingSelectedPublicDomain =
    isEditingPublicDomain && publicDomainsLoading;
  const isPublicDomainNotFound =
    isEditingPublicDomain &&
    !publicDomainsLoading &&
    !isDefined(selectedPublicDomain);

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
        enqueueToast({
          variant: 'success',
          children: t`Custom domain successfully deleted`,
        });
        await refetchPublicDomains();
        navigateToApplication();
      },
      onError: (error) => enqueueToast(getToastOptionsFromError({ error })),
    });
  };

  const validationSchema = getDomainValidationSchema();

  const onCreate = async () => {
    if (!isDefined(newPublicDomain) || !isNonEmptyString(applicationId)) {
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
        enqueueToast({
          variant: 'success',
          children: t`Custom domain successfully created`,
        });
        await refetchPublicDomains();
        navigateToApplication();
      },
      onError: (error) => {
        setNewPublicDomainError(error.message);
        enqueueToast(getToastOptionsFromError({ error }));
      },
    });
  };

  const renderContent = () => {
    if (isLoadingSelectedPublicDomain) {
      return <SettingsSectionSkeletonLoader />;
    }

    if (isPublicDomainNotFound) {
      return (
        <Section.Root>
          <Section.Header
            title={t`Custom domain not found`}
            description={t`This custom domain does not exist or does not belong to this application.`}
          />
        </Section.Root>
      );
    }

    return (
      <Section.Root>
        <Section.Header
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
                    loading={isLoading}
                    startIcon={<IconReload />}
                    onClick={() =>
                      checkPublicDomainRecords(selectedPublicDomain.domain)
                    }
                    type="button"
                    variant="outline"
                  >{t`Reload`}</Button>
                </StyledButtonContainer>
                <StyledButtonContainer>
                  <Button
                    startIcon={<IconTrash />}
                    aria-label={t`Delete`}
                    onClick={onDelete}
                    variant="outline"
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
      </Section.Root>
    );
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
          isSaveDisabled={loading || isEditingPublicDomain}
          onSave={onCreate}
        />
      }
    >
      <SettingsPageContainer>{renderContent()}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
