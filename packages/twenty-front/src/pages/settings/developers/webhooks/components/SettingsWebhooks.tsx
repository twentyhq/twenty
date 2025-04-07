import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsWebhooksTable } from '@/settings/developers/components/SettingsWebhooksTable';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { v4 } from 'uuid';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { Button } from 'twenty-ui/input';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { Section } from 'twenty-ui/layout';

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

export const SettingsWebhooks = () => {
  const isMobile = useIsMobile();
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`Webhooks`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Webhooks</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <StyledContainer isMobile={isMobile}>
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
                to={getSettingsPath(
                  SettingsPath.DevelopersNewWebhookDetail,
                  {
                    webhookId: v4(),
                  },
                  {
                    creationMode: true,
                  },
                )}
              />
            </StyledButtonContainer>
          </Section>
        </StyledContainer>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
