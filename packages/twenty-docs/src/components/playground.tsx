import React, { useState } from 'react';
import { TbLoader2 } from 'react-icons/tb';

import TokenForm, { TokenFormProps } from '../components/token-form';

const Playground = ({
  children,
  setOpenApiJson,
  setToken,
  setBaseUrl,
  subDoc,
}: Partial<React.PropsWithChildren | TokenFormProps> & {
  subDoc: string;
}) => {
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
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
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: 'calc(100vh - var(--ifm-navbar-height) - 45px)',
            top: '45px',
            display: 'flex',
            flexFlow: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            background: 'rgba(23,23,23, 0.2)',
          }}
        >
          <div
            style={{
              width: '50%',
              background: 'rgba(23,23,23, 0.8)',
              color: 'white',
              padding: '16px',
              borderRadius: '8px',
            }}
          >
            A token is required as APIs are dynamically generated for each
            workspace based on their unique metadata. <br /> Generate your token
            under{' '}
            <a
              className="link"
              href="https://app.twenty.com/settings/developers"
            >
              Settings &gt; Developers
            </a>
          </div>
          {isLoading && (
            <div className="loader-container">
              <TbLoader2 className="loader" />
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Playground;
