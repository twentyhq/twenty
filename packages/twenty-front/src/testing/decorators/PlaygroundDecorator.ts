import { PlaygroundSchemas } from "@/settings/playground/types/PlaygroundConfig"
import { Decorator } from "@storybook/react"
import { REACT_APP_SERVER_BASE_URL } from "~/config"
import { mockedUserJWT } from "~/testing/mock-data/jwt"

let playgroundSession: any = null

export const usePlaygroundSession = () => {
    return playgroundSession
}

export const PlaygroundDecorator: Decorator = (story, { parameters }) => {
    if (parameters && parameters.session) {
        playgroundSession = parameters.session
    }

    return story()
}

export const getValidMockSession = () => ({
    apiKey: mockedUserJWT,
    baseUrl: REACT_APP_SERVER_BASE_URL + '/graphql',
    schema: PlaygroundSchemas.CORE,
    isValid: true
})