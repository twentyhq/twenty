import { playgroundApiToken } from "@/activities/states/playgroundApiToken"
import { playgroundOpenapiJson } from "@/activities/states/playgroundOpenapiJson"
import { SettingsPageContainer } from "@/settings/components/SettingsPageContainer"
import { SettingsApiKeysTable } from "@/settings/developers/components/SettingsApiKeysTable"
import { SettingsReadDocumentationButton } from "@/settings/developers/components/SettingsReadDocumentationButton"
import { SettingsPath } from "@/types/SettingsPath"
import { Select } from "@/ui/input/components/Select"
import { TextInput } from "@/ui/input/components/TextInput"
import { SubMenuTopBarContainer } from "@/ui/layout/page/components/SubMenuTopBarContainer"
import { useColorScheme } from "@/ui/theme/hooks/useColorScheme"
import { useSystemColorScheme } from "@/ui/theme/hooks/useSystemColorScheme"
import { Trans, useLingui } from "@lingui/react/macro"
import { IconBrandGraphql, IconFolderRoot } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useRecoilState } from "recoil"
import { Button, H2Title, IconApi, IconCode, IconPlus, Loader, Section, useIsMobile } from "twenty-ui"
import { useApikeyAuth } from "~/hooks/useApikeyAuth"
import { FormContainer, StyledButtonContainer, StyledContainer } from "~/pages/settings/developers/SettingsDevelopers"
import { getSettingsPath } from "~/utils/navigation/getSettingsPath"

export const SettingsDevelopersApiKeysMain = () => {
      const { t } = useLingui();

      //theme management for the image
      const colorScheme = useColorScheme().colorScheme === 'System' ? useSystemColorScheme() : useColorScheme().colorScheme;
      const colorToPlaceholder:Record<string, string> = {
        Dark: 'dark-api-docs.png',
        Light: 'light-api-docs.png',
      }
      const navigate = useNavigate()


      //the states
      const [apitype, setApiType] = useState<'rest' | 'graphql'>("rest");
      const [schemaType, setSchemaType] = useState<'core' | 'metadata'>("core");
      const [apikey, setApiKey] = useState<string>("");
      const [isLoading, setIsLoading] = useState<boolean>(false)
      const [invalidToken, setInvalidToken] = useState<string>("");
      const [globalApiToken, setGlobalApiToken] = useRecoilState(playgroundApiToken)
      const [, setOpenapiJson] = useRecoilState(playgroundOpenapiJson)
      
      //the event handlers
      const beginLoading = () => setIsLoading(true);
      const stopLoading = () => setIsLoading(false);
      const baseurl = "https://api.twenty.com"
      const changeSchemaType = (val:string | any) => setSchemaType(val);
      const changeApiType = (val:string | any) => setApiType(val);
      const changeApiKey = (val:string) => setApiKey(val.trim())
      const {authChecker, LaunchHandler} = useApikeyAuth()
      const StartAuthProcess = () => {
        //ik these are so many params, but still better than filling one single with all the states, and app ui knowing nothing abt it
        LaunchHandler({authChecker, navigate, beginLoading, stopLoading, setInvalidToken, setGlobalApiToken, setOpenapiJson, apikey, apitype, baseurl, schemaType})
      }




      //so once we get the global api, we set the value of local to it THIS IS A FEATURE, NOT A BUG, to ensure convenience for the user, we dont want him continously entering the CORRECT api token while we already have it in the state
      useEffect(()=>{
        if(globalApiToken !== '' && apikey === ''){
          setApiKey(globalApiToken)
        }
      }, [globalApiToken])

        const isMobile = useIsMobile();
    return (
            <SubMenuTopBarContainer
              title={t`APIs`}
              actionButton={<SettingsReadDocumentationButton />}
              links={[
                {
                  children: <Trans>Developers</Trans>,
                  href: getSettingsPath(SettingsPath.Developers),
                },
                { children: <Trans>APIs</Trans> },
              ]}
            >
        <SettingsPageContainer >
        <StyledContainer isMobile={isMobile}>

        <Section>
                    <H2Title
                      title={t`Documentation`}
                      description={t`Try our REST or GraphQL API playgrounds`}
                    />
                    <img style={{width: '512px'}} alt="api docs playground" src={`/images/placeholders/${colorToPlaceholder[colorScheme]}`} />
                    <FormContainer>
                      <TextInput value={apikey} error={invalidToken} disabled={isLoading} onChange={changeApiKey} className="grow" label={t`API Key`} />
                      <Select
                        dropdownId="schemaDropdown"
                          label="Schema"
                          disabled={isLoading}
                          options={[
                            { value: 'core', label: 'Core', Icon: IconFolderRoot },
                            { value: 'metadata', label: 'Metadata', Icon: IconCode },
                          ]}
                          value={schemaType}
                          onChange={changeSchemaType}
                      />
                     <Select
                        dropdownId="apiTypeDropdown"
                          label="API"
                          disabled={isLoading}
                          options={[
                            { value: 'rest', label: 'REST', Icon: IconApi },
                            { value: 'graphql', label: 'GraphQL', Icon: IconBrandGraphql },
                          ]}
                          value={apitype}
                          onChange={changeApiType}
                      />
                      <Button 
                      title="Launch"
                      variant="primary"
                      accent="blue"
                      disabled={isLoading || apikey === ''}
                      Icon={() => (isLoading ? <Loader/> : null)}
                      onClick={StartAuthProcess}
                      />

                    </FormContainer>
                </Section>
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
        </StyledContainer>
        </SettingsPageContainer>
        </SubMenuTopBarContainer>
    )
}