import { SettingsPageContainer } from "@/settings/components/SettingsPageContainer"
import { SettingsReadDocumentationButton } from "@/settings/developers/components/SettingsReadDocumentationButton"
import { SettingsWebhooksTable } from "@/settings/developers/components/SettingsWebhooksTable"
import { SettingsPath } from "@/types/SettingsPath"
import { SubMenuTopBarContainer } from "@/ui/layout/page/components/SubMenuTopBarContainer"
import { Trans, useLingui } from "@lingui/react/macro"
import { Button, H2Title, IconPlus, Section, useIsMobile } from "twenty-ui"
import { v4 } from "uuid"
import { StyledButtonContainer, StyledContainer } from "~/pages/settings/developers/SettingsDevelopers"
import { getSettingsPath } from "~/utils/navigation/getSettingsPath"

export const SettingsDevelopersWebhooksMain = () => {
          const { t } = useLingui();
            const isMobile = useIsMobile()
    return (
            <SubMenuTopBarContainer
              title={t`Webhooks`}
              actionButton={<SettingsReadDocumentationButton />}
              links={[
                {
                  children: <Trans>Developers</Trans>,
                  href: getSettingsPath(SettingsPath.Developers),
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
    )
}