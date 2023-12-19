import React, { useState } from 'react';
import TokenForm, { TokenFormProps } from '../components/token-form';

const Playground = (
  {
    children,
    setOpenApiJson,
    setToken
  }: Partial<React.PropsWithChildren | TokenFormProps>
) => {
  const [isTokenValid, setIsTokenValid] = useState(false)
  return (
    <>
      <TokenForm
        setOpenApiJson={setOpenApiJson}
        setToken={setToken}
        isTokenValid={isTokenValid}
        setIsTokenValid={setIsTokenValid}
      />
      {
        isTokenValid && children
      }
    </>
  )
}

export default Playground;
