import { Section } from 'twenty-ui/layout';
import { H2Title, IconReload, IconTrash } from 'twenty-ui/display';
import { Trans, useLingui } from '@lingui/react/macro';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { TextInput } from '@/ui/input/components/TextInput';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { Button, ButtonGroup } from 'twenty-ui/input';
import styled from '@emotion/styled';
import { SettingsDomainRecords } from '@/settings/domains/components/SettingsDomainRecords';
import { useCheckPublicDomainValidRecords } from '@/settings/domains/hooks/useCheckPublicDomainValidRecords';
import {
  useCreatePublicDomainMutation,
  useDeletePublicDomainMutation,
  useFindManyPublicDomainsQuery,
} from '~/generated-metadata/graphql';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CheckPublicDomainValidRecordsEffect } from '@/settings/domains/components/CheckPublicDomainValidRecordsEffect';
import { selectedPublicDomainState } from '@/settings/domains/states/selectedPublicDomainState';
import { useRecoilState } from 'recoil';
import { useState } from 'react';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { getDomainValidationSchema } from '@/settings/domains/utils/get-domain-validation-schema';

const StyledButtonGroup = styled(ButtonGroup)`
  & > :not(:first-of-type) > button {
    border-left: none;
  }
`;

const StyledButton = styled(Button)`
  align-self: flex-start;
`;

const StyledDomainFormWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledRecordsWrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};

  & > :not(:first-of-type) {
    margin-top: ${({ theme }) => theme.spacing(4)};
  }
`;

export const SettingPublicDomain = () => {
  const [selectedPublicDomain, setSelectedPublicDomain] = useRecoilState(
    selectedPublicDomainState,
  );
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [createPublicDomain, { loading }] = useCreatePublicDomainMutation();

  const [newPublicDomain, setNewPublicDomain] = useState<string | undefined>(
    selectedPublicDomain?.domain ?? '',
  );

  const [newPublicDomainError, setNewPublicDomainError] = useState<
    string | undefined
  >(undefined);

  const { refetch: refetchPublicDomains } = useFindManyPublicDomainsQuery();

  const [deletePublicDomain] = useDeletePublicDomainMutation();

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
        navigate(SettingsPath.Domains);
        refetchPublicDomains();
      },
      onError: (error) =>
        enqueueErrorSnackBar({
          apolloError: error,
        }),
    });
  };

  const validationSchema = getDomainValidationSchema(t);

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
      variables: { domain: newPublicDomain },
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

  return (
    <SubMenuTopBarContainer
      title={t`Public domain`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>Domains</Trans>,
          href: getSettingsPath(SettingsPath.Domains),
        },
        { children: <Trans>Public Domain</Trans> },
      ]}
      actionButton={
        <SaveAndCancelButtons
          onCancel={() => navigate(SettingsPath.Domains)}
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
              <StyledButtonGroup>
                <StyledButton
                  isLoading={isLoading}
                  Icon={IconReload}
                  title={t`Reload`}
                  variant="primary"
                  onClick={() =>
                    checkPublicDomainRecords(selectedPublicDomain.domain)
                  }
                  type="button"
                />
                <StyledButton
                  Icon={IconTrash}
                  variant="primary"
                  onClick={onDelete}
                />
              </StyledButtonGroup>
            )}
          </StyledDomainFormWrapper>
          {isDefined(selectedPublicDomain) && publicDomainRecords?.domain && (
            <StyledRecordsWrapper>
              {publicDomainRecords.records && (
                <SettingsDomainRecords records={publicDomainRecords.records} />
              )}
            </StyledRecordsWrapper>
          )}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
