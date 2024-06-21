import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { SQLQueryBuilder } from '@/activities/ask-ai/right-drawer/components/SQLQueryBuilder';
import { SQLQueryResultTable } from '@/activities/ask-ai/right-drawer/components/SQLQueryResultTable';
import { askAIQueryState } from '@/activities/ask-ai/right-drawer/states/askAIQueryState';
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
  overflow-x: scroll;
  padding-bottom: 24px;
`;

const StyledNewMessageArea = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 24px 24px;
`;

export const RightDrawerAIChat = () => {
  const [askAIQuery, setAskAIQuery] = useRecoilState(askAIQueryState);

  const { data, loading } = useGetAskAiQuery({
    variables: {
      text: askAIQuery,
    },
    skip: !askAIQuery,
  });

  return (
    <StyledContainer>
      <StyledChatArea>
        <div>
          <StyledAskAIQuery>{askAIQuery}</StyledAskAIQuery>
          <SQLQueryBuilder
            loading={loading}
            sqlQuery={data?.getAskAI.sqlQuery}
          />
          {!loading && (
            <StyledSQLQueryResult>
              {typeof data?.getAskAI.sqlQueryResult === 'string' ? (
                <SQLQueryResultTable
                  sqlQueryResult={data.getAskAI.sqlQueryResult}
                />
              ) : (
                'Invalid SQL query.'
              )}
            </StyledSQLQueryResult>
          )}
        </div>
      </StyledChatArea>
      <StyledNewMessageArea>
        <AutosizeTextInput
          autoFocus
          placeholder="Ask about anything in Twenty"
          variant={AutosizeTextInputVariant.Icon}
          onValidate={(text) => {
            setAskAIQuery(text);
          }}
        />
      </StyledNewMessageArea>
    </StyledContainer>
  );
};
