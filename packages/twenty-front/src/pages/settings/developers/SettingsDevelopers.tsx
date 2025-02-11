import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsApiKeysTable } from '@/settings/developers/components/SettingsApiKeysTable';
import { SettingsReadDocumentationButton } from '@/settings/developers/components/SettingsReadDocumentationButton';
import { SettingsWebhooksTable } from '@/settings/developers/components/SettingsWebhooksTable';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button, H2Title, IconPlus, MOBILE_VIEWPORT, Section } from 'twenty-ui';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { Webhook } from '@/settings/developers/types/webhook/Webhook';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-top: ${({ theme }) => theme.spacing(5)};
  }
`;

const StyledContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsDevelopers = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigateSettings();
  const { t } = useLingui();
  const { createOneRecord: createOneWebhook } = useCreateOneRecord<Webhook>({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const createNewWebhook = async () => {
    const newWebhook = await createOneWebhook({
      targetUrl: '',
      operations: ['*.*'],
    });
    if (!newWebhook) {
      return;
    }
    navigate(SettingsPath.DevelopersNewWebhookDetail, {
      webhookId: newWebhook.id,
    });
  };

  return (
    <SubMenuTopBarContainer
      title={t`Developers`}
      actionButton={<SettingsReadDocumentationButton />}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Developers</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <StyledContainer isMobile={isMobile}>
          <Section>
            <H2Title
              title={t`API keys`}
              description={t`Active API keys created by you or your team.`}
            />
            <SettingsApiKeysTable />
            <StyledButtonContainer>
              <Button
                Icon={IconPlus}
                title={t`Create API key`}
                size="small"
                variant="secondary"
                to={getSettingsPath(SettingsPath.DevelopersNewApiKey)}
              />
            </StyledButtonContainer>
          </Section>
          <Section>
            <H2Title
              title={t`Webhooks`}
              description={t`Establish Webhook endpoints for notifications on asynchronous events.`}
            />
            <SettingsWebhooksTable />
            <StyledButtonContainer>
              <Button
                Icon={IconPlus}
                title={t`Create Webhook`}
                size="small"
                variant="secondary"
                onClick={createNewWebhook}
              />
            </StyledButtonContainer>
          </Section>
        </StyledContainer>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
