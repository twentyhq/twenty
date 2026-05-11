import { Section } from 'twenty-ui/layout';
import { H2Title, IconReload, IconTrash } from 'twenty-ui/display';
import { Trans, useLingui } from '@lingui/react/macro';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { Button, ButtonGroup, type SelectOption } from 'twenty-ui/input';
import { styled } from '@linaria/react';
import { SettingsDomainRecords } from '@/settings/domains/components/SettingsDomainRecords';
import { useCheckPublicDomainValidRecords } from '@/settings/domains/hooks/useCheckPublicDomainValidRecords';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  CreatePublicDomainDocument,
  DeletePublicDomainDocument,
  FindManyApplicationsDocument,
  FindManyPublicDomainsDocument,
  UpdatePublicDomainDocument,
} from '~/generated-metadata/graphql';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CheckPublicDomainValidRecordsEffect } from '@/settings/domains/components/CheckPublicDomainValidRecordsEffect';
import { selectedPublicDomainState } from '@/settings/domains/states/selectedPublicDomainState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useState } from 'react';
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
  const [selectedPublicDomain, setSelectedPublicDomain] = useAtomState(
    selectedPublicDomainState,
  );
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [createPublicDomain, { loading }] = useMutation(
    CreatePublicDomainDocument,
  );

  const [updatePublicDomain] = useMutation(UpdatePublicDomainDocument);

  const [newPublicDomain, setNewPublicDomain] = useState<string | undefined>(
    selectedPublicDomain?.domain ?? '',
  );

  // Holds the chosen application before the public domain is created.
  // Once selectedPublicDomain exists, the dropdown reads from it directly.
  const [draftApplicationId, setDraftApplicationId] = useState<string | null>(
    null,
  );

  const selectedApplicationId = isDefined(selectedPublicDomain)
    ? (selectedPublicDomain.applicationId ?? null)
    : draftApplicationId;

  const [newPublicDomainError, setNewPublicDomainError] = useState<
    string | undefined
  >(undefined);

  const { refetch: refetchPublicDomains } = useQuery(
    FindManyPublicDomainsDocument,
  );

  const { data: applicationsData } = useQuery(FindManyApplicationsDocument);

  const applicationPinnedOption: SelectOption<string | null> = {
    value: null,
    label: t`Workspace (all apps)`,
  };

  const applicationOptions: SelectOption<string | null>[] = (
    applicationsData?.findManyApplications ?? []
  ).map((application) => ({
    value: application.id,
    label: application.name,
  }));

  const [deletePublicDomain] = useMutation(DeletePublicDomainDocument);

  const { isLoading, publicDomainRecords, checkPublicDomainRecords } =
    useCheckPublicDomainValidRecords();

  const onDelete = async () => {
    if (!selectedPublicDomain) {
      return;
    }

    await deletePublicDomain({
      variables: { domain: selectedPublicDomain.domain },
      onCompleted: () => {
        enqueueSuccessSnackBar({
          message: t`Public domain successfully deleted`,
        });
        navigate(SettingsPath.Applications);
        refetchPublicDomains();
      },
      onError: (error) =>
        enqueueErrorSnackBar({
          apolloError: error,
        }),
    });
  };

  const validationSchema = getDomainValidationSchema();

  const onCreate = async () => {
    if (!isDefined(newPublicDomain)) {
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
        applicationId: draftApplicationId,
      },
      onCompleted: (data) => {
        setSelectedPublicDomain(data.createPublicDomain);
        enqueueSuccessSnackBar({
          message: t`Public domain created successfully`,
        });
      },
      onError: (error) => {
        setNewPublicDomainError(error.message);
        enqueueErrorSnackBar({
          apolloError: error,
        });
      },
    });
  };

  const onApplicationChange = async (nextApplicationId: string | null) => {
    if (!isDefined(selectedPublicDomain)) {
      setDraftApplicationId(nextApplicationId);
      return;
    }

    if (nextApplicationId === (selectedPublicDomain.applicationId ?? null)) {
      return;
    }

    await updatePublicDomain({
      variables: {
        domain: selectedPublicDomain.domain,
        applicationId: nextApplicationId,
      },
      onCompleted: (data) => {
        setSelectedPublicDomain(data.updatePublicDomain);
        enqueueSuccessSnackBar({
          message: t`Public domain updated successfully`,
        });
        refetchPublicDomains();
      },
      onError: (error) =>
        enqueueErrorSnackBar({
          apolloError: error,
        }),
    });
  };

  return (
    <SubMenuTopBarContainer
      title={t`Public domain`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>Apps</Trans>,
          href: getSettingsPath(SettingsPath.Applications),
        },
        { children: <Trans>Public Domain</Trans> },
      ]}
      actionButton={
        <SaveAndCancelButtons
          onCancel={() => navigate(SettingsPath.Applications)}
          isSaveDisabled={loading || isDefined(selectedPublicDomain)}
          onSave={onCreate}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Public domain`}
            description={t`Set the name of your public domain and configure your DNS records.`}
          />
          {isDefined(selectedPublicDomain) && (
            <CheckPublicDomainValidRecordsEffect
              publicDomain={selectedPublicDomain}
            />
          )}
          <StyledDomainFormWrapper>
            <TextInput
              value={newPublicDomain}
              onChange={setNewPublicDomain}
              error={newPublicDomainError}
              type="text"
              disabled={isDefined(selectedPublicDomain)}
              placeholder="crm.yourPublicDomain.com"
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
        <Section>
          <H2Title
            title={t`Bound App`}
            description={t`Restrict this domain to the HTTP routes of a specific app. Leave empty to expose all workspace HTTP routes.`}
          />
          <Select
            dropdownId="public-domain-application"
            label={t`Application`}
            fullWidth
            value={selectedApplicationId}
            pinnedOption={applicationPinnedOption}
            options={applicationOptions}
            onChange={onApplicationChange}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
