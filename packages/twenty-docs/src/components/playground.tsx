import React, { useState } from 'react';
import { TbLoader2 } from 'react-icons/tb';

import TokenForm, { TokenFormProps } from '../components/token-form';

const Playground = ({
  children,
  setOpenApiJson,
  setToken,
  setBaseUrl,
  subdocName,
}: Partial<React.PropsWithChildren | TokenFormProps> & {
  subdocName: string;
}) => {
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <>
      <TokenForm
        setOpenApiJson={setOpenApiJson}
        setToken={setToken}
        setBaseUrl={setBaseUrl}
        isTokenValid={isTokenValid}
        setIsTokenValid={setIsTokenValid}
        subdocName={subdocName}
        setLoadingState={setIsLoading}
      />
      {!isTokenValid && !isLoading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <label>
            To load your playground schema,{' '}
            <a
              className="link"
              href="https://app.twenty.com/settings/developers"
            >
              generate an API key
            </a>{' '}
            or use your own tenant.
          </label>
        </div>
      )}
      {!isTokenValid && isLoading && (
        <div className="loader-container">
          <TbLoader2 className="loader" />
        </div>
      )}
      {isTokenValid && children}
    </>
  );
};

export default Playground;
