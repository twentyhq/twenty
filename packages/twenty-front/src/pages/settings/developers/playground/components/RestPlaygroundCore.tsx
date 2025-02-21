import Playground from '@/settings/api/playground/playgrounds/playground';
import { RestApiWrapper } from '@/settings/api/playground/playgrounds/rest-api-wrapper';
import styled from '@emotion/styled';
import { useState } from 'react';

const StyledContainer = styled.div`
  width: 100vw;
`;

const RestPlaygroundCore = () => {
  const [openApiJson, setOpenApiJson] = useState({});

  const children = <RestApiWrapper openApiJson={openApiJson} />;

  return (
    <StyledContainer>
      <Playground
        children={children}
        setOpenApiJson={setOpenApiJson}
        subDoc="core"
      />
    </StyledContainer>
  );
};

export default RestPlaygroundCore;
