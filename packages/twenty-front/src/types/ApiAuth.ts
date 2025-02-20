export interface LaunchHandlerInput{
    authChecker: (args: authCheckerInput) => Promise<any>,
    navigate: (args: any) => void,
    beginLoading: (args: void) => void,
    stopLoading: (args: void) => void,
    setInvalidToken: (args: string) => void,
    setGlobalApiToken: (args: string) => void,
    setOpenapiJson: (args: string) => void,
    apitype: 'rest' | 'graphql',
    apikey: string,
    baseurl: string,
    schemaType: 'core' | 'metadata'
}

export interface authCheckerInput {
    apikey: string,
    baseurl: string,
    schemaType: string
}