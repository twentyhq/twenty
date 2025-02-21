import { PlaygroundSchemas } from '@/settings/api/playground/form/ApiPlaygroundSetupForm';
import { openAPIReference } from '@/settings/api/playground/state/openAPIReference';
import styled from '@emotion/styled';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useRecoilState } from 'recoil';

const StyledContainer = styled.div`
  height: 100vh;
  position: relative;
  width: 100vw;
`;

export const RestApiWrapper = ({
  schema
} : {
  schema: PlaygroundSchemas
}) => {
  const [ openApiJson ] = useRecoilState(openAPIReference)
  return (
    <StyledContainer>
      <ApiReferenceReact
        configuration={{
          spec: {
            content: openApiJson,
          },
        }}
      />
    </StyledContainer>
  );
};
