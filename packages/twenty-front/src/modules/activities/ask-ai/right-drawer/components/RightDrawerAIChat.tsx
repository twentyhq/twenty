import { useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { IconRotate } from 'twenty-ui';

import { SQLQueryBuilder } from '@/activities/ask-ai/right-drawer/components/SQLQueryBuilder';
import { askAIQueryState } from '@/activities/ask-ai/right-drawer/states/askAIQueryState';
import { Button } from '@/ui/input/button/components/Button';
import {
  AutosizeTextInput,
  AutosizeTextInputVariant,
} from '@/ui/input/components/AutosizeTextInput';
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

const StyledChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  padding: 24px 24px 0px;
`;

const StyledAskAIQuery = styled.div`
  font-weight: bold;
  padding-bottom: 12px;
`;

const StyledSQLQueryResult = styled.div`
  padding-bottom: 24px;
`;

const StyledNewMessageArea = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 24px 24px;
`;

export const RightDrawerAIChat = () => {
  // TODO: Create chat entity

  const [askAIQuery, setAskAIQuery] = useRecoilState(askAIQueryState);
  const [messageInputVisible, setMessageInputVisible] = useState(!askAIQuery);

  const { data, loading } = useGetAskAiQuery({
    variables: {
      text: askAIQuery,
    },
    skip: messageInputVisible,
  });

  return (
    <StyledContainer>
      <StyledChatArea>
        {!messageInputVisible && (
          <>
            <StyledAskAIQuery>{askAIQuery}</StyledAskAIQuery>
            <SQLQueryBuilder
              loading={loading}
              sqlQuery={data?.getAskAI.sqlQuery}
            />
            {!loading && (
              <StyledSQLQueryResult>
                {typeof data?.getAskAI.sqlQueryResult === 'string'
                  ? data?.getAskAI.sqlQueryResult
                  : 'Invalid SQL query.'}
              </StyledSQLQueryResult>
            )}
            <div>
              <Button
                onClick={() => {
                  setAskAIQuery('');
                  setMessageInputVisible(true);
                }}
                title="Ask again"
                Icon={IconRotate}
                accent="blue"
              />
            </div>
          </>
        )}
      </StyledChatArea>
      {messageInputVisible && (
        <StyledNewMessageArea>
          <AutosizeTextInput
            autoFocus
            placeholder="Ask about anything in Twenty"
            value={askAIQuery}
            variant={AutosizeTextInputVariant.Icon}
            onValidate={(text) => {
              setAskAIQuery(text);
              setMessageInputVisible(false);
            }}
          />
        </StyledNewMessageArea>
      )}
    </StyledContainer>
  );
};
