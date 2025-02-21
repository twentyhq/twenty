import Playground from '@/settings/api/playground/components/Playground';
import { RestApiWrapper } from '@/settings/api/playground/components/RestApiWrapper';
import styled from '@emotion/styled';
import { useState } from 'react';

const StyledContainer = styled.div`
  width: 100vw;
`;

const RestPlaygroundCore = () => {
  const [openApiJson, setOpenApiJson] = useState({});

  return (
    <StyledContainer>
      <Playground
        setOpenApiJson={setOpenApiJson}
        subDoc="core"
      >
        <RestApiWrapper openApiJson={openApiJson} />;
      </Playground>
    </StyledContainer>
  );
};

export default RestPlaygroundCore;
