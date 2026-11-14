import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const SET_APP_MESSAGE_THREAD_READ_STATE_MUTATION = `
  mutation SetAppMessageThreadReadState(
    $input: SetAppMessageThreadReadStateInput!
  ) {
    setAppMessageThreadReadState(input: $input) {
      updatedMessageCount
    }
  }
`;

export type SetMessageThreadReadStateInput = {
  messageChannelId: string;
  threadExternalId: string;
  isRead: boolean;
};

export const setMessageThreadReadState = async (
  input: SetMessageThreadReadStateInput,
): Promise<{ updatedMessageCount: number }> => {
  const { setAppMessageThreadReadState } = await postGraphqlRequest<
    { input: SetMessageThreadReadStateInput },
    { setAppMessageThreadReadState: { updatedMessageCount: number } }
  >({
    query: SET_APP_MESSAGE_THREAD_READ_STATE_MUTATION,
    variables: { input },
    caller: 'setMessageThreadReadState',
  });

  return setAppMessageThreadReadState;
};
