import React, { useState } from 'react';
import { TbLoader2 } from 'react-icons/tb';

import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import TokenForm, { TokenFormProps } from './token-form';

const StyledContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  padding-top: 15px;
`;

const AbsoluteDiv = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  background: rgba(23, 23, 23, 0.2);
`;

const StyledBox = styled.div`
  width: 50%;
  background: rgba(23, 23, 23, 0.8);
  color: white;
  padding: 16px;
  border-radius: 8px;
`;

const Link = styled.a`
  color: white;
  text-decoration: underline;
  position: relative;
  font-weight: bold;
  transition: color 0.3s ease;

  &:hover {
    color: #ddd;
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
`;

const animate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(720deg);
  }
`;

const Loader = styled(TbLoader2)`
  color: #16233f;
  font-size: 2rem;
  animation: ${animate} 2s infinite;
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
        <AbsoluteDiv>
          <StyledBox>
            A token is required as APIs are dynamically generated for each
            workspace based on their unique metadata. <br /> Generate your token
            under{' '}
            <Link
              href="https://app.twenty.com/settings/developers"
            >
              Settings &gt; Developers
            </Link>
          </StyledBox>
          {isLoading && (
            <LoaderContainer>
              <Loader />
            </LoaderContainer>
          )}
        </AbsoluteDiv>
      )}
      {children}
    </StyledContainer>
  );
};

export default Playground;
