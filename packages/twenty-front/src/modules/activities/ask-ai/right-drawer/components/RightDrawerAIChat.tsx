import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { askAIQueryState } from '@/activities/ask-ai/right-drawer/states/askAIQueryState';
import { useGetAskAiQuery } from '~/generated/graphql';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
  overflow-y: auto;
  position: relative;
`;

export const RightDrawerAIChat = () => {
  // TODO: Create chat entity

  const askAIQuery = useRecoilValue(askAIQueryState);

  const { data, loading, error } = useGetAskAiQuery({
    variables: {
      text: askAIQuery,
    },
  });

  return (
    <StyledContainer>
      {askAIQuery}
      <br />
      {data?.getAskAI.sqlQuery}
      <br />
      {data?.getAskAI.sqlQueryResult}
    </StyledContainer>
  );
};
