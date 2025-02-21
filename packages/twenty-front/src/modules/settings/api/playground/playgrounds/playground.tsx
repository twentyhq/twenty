import React, { useState } from 'react';
import { TbLoader2 } from 'react-icons/tb';

import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import TokenForm, { TokenFormProps } from './token-form';

const StyledContainer = styled.div`
  height: 100%;
  padding-top: 15px;
  position: relative;
  width: 100%;
`;

const StyledDiv = styled.div`
  align-items: center;
  background: rgba(23, 23, 23, 0.2);
  display: flex;
  flex-flow: column;
  height: 100%;
  justify-content: center;
  position: absolute;
  width: 100%;
  z-index: 2;
`;

const StyledBox = styled.div`
  width: 50%;
  background: rgba(23, 23, 23, 0.8);
  color: white;
  padding: 16px;
  border-radius: 8px;
`;

const StyledLink = styled.a`
  color: white;
  text-decoration: underline;
  position: relative;
  font-weight: bold;
  transition: color 0.3s ease;

  &:hover {
    color: #ddd;
  }
`;

const StyledLoaderContainer = styled.div`
  align-items: center;
  display: flex;
  height: 50px;
  justify-content: center;
`;

const animate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(720deg);
  }
`;

const StyledLoader = styled(TbLoader2)`
  animation: ${animate} 2s infinite;
  color: #16233f;
  font-size: 2rem;
`;

const Playground = ({
  children,
  setOpenApiJson,
  setToken,
  setBaseUrl,
  subDoc,
}: Partial<React.PropsWithChildren> &
  Omit<
    TokenFormProps,
    'isTokenValid' | 'setIsTokenValid' | 'setLoadingState'
  >) => {
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <StyledContainer>
      <TokenForm
        setOpenApiJson={setOpenApiJson}
        setToken={setToken}
        setBaseUrl={setBaseUrl}
        isTokenValid={isTokenValid}
        setIsTokenValid={setIsTokenValid}
        subDoc={subDoc}
        setLoadingState={setIsLoading}
      />
      {!isTokenValid && (
        <StyledDiv>
          <StyledBox>
            A token is required as APIs are dynamically generated for each
            workspace based on their unique metadata. <br /> Generate your token
            under{' '}
            <StyledLink href="https://app.twenty.com/settings/developers">
              Settings &gt; Developers
            </StyledLink>
          </StyledBox>
          {isLoading && (
            <StyledLoaderContainer>
              <StyledLoader />
            </StyledLoaderContainer>
          )}
        </StyledDiv>
      )}
      {children}
    </StyledContainer>
  );
};

export default Playground;
