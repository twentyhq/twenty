import React, { useState } from 'react';

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
  return (
    <>
      <TokenForm
        setOpenApiJson={setOpenApiJson}
        setToken={setToken}
        setBaseUrl={setBaseUrl}
        isTokenValid={isTokenValid}
        setIsTokenValid={setIsTokenValid}
        subdocName={subdocName}
      />
      {isTokenValid && children}
    </>
  );
};

export default Playground;
