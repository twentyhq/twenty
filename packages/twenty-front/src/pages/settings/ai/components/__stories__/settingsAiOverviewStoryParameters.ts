import { graphql, HttpResponse } from 'msw';
import { graphqlMocks } from '~/testing/graphqlMocks';

export const settingsAiOverviewStoryParameters = {
  msw: {
    handlers: [
      graphql.query('GetAiSystemPromptPreview', () =>
        HttpResponse.json({
          data: {
            getAiSystemPromptPreview: {
              __typename: 'AiSystemPromptPreview',
              estimatedTokenCount: 12400,
              sections: [],
            },
          },
        }),
      ),
      ...graphqlMocks.handlers,
    ],
  },
};
