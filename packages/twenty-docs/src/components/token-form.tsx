import React, { useEffect, useState } from 'react';
import { TbLoader2 } from 'react-icons/tb';
import { parseJson } from 'nx/src/utils/json';

import tokenForm from '!css-loader!./token-form.css';

export type TokenFormProps = {
  setOpenApiJson?: (json: object) => void;
  setToken?: (token: string) => void;
  isTokenValid: boolean;
  setIsTokenValid: (boolean) => void;
};

const TokenForm = ({
  setOpenApiJson,
  setToken,
  isTokenValid,
  setIsTokenValid,
}: TokenFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const token =
    parseJson(localStorage.getItem('TryIt_securitySchemeValues'))?.bearerAuth ??
    '';

  const updateToken = async (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem(
      'TryIt_securitySchemeValues',
      JSON.stringify({ bearerAuth: event.target.value }),
    );
    await submitToken(event.target.value);
  };

  const validateToken = (openApiJson) => setIsTokenValid(!!openApiJson.tags);

  const getJson = async (token: string) => {
    setIsLoading(true);

    return await fetch('https://api.twenty.com/open-api', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((result) => {
        validateToken(result);
        setIsLoading(false);

        return result;
      })
      .catch(() => setIsLoading(false));
  };

  const submitToken = async (token) => {
    if (isLoading) return;

    const json = await getJson(token);

    setToken && setToken(token);

    setOpenApiJson && setOpenApiJson(json);
  };

  useEffect(() => {
    (async () => {
      await submitToken(token);
    })();
  }, []);

  // We load playground style using useEffect as it breaks remaining docs style
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = tokenForm.toString();
    document.head.append(styleElement);

    return () => styleElement.remove();
  }, []);

  return (
    !isTokenValid && (
      <div>
        <div className="container">
          <form className="form">
            <label>
              To load your playground schema,{' '}
              <a
                className="link"
                href="https://app.twenty.com/settings/developers"
              >
                generate an API key
              </a>{' '}
              and paste it here:
            </label>
            <p>
              <input
                className={token && !isLoading ? 'input invalid' : 'input'}
                type="text"
                readOnly={isLoading}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMD..."
                defaultValue={token}
                onChange={updateToken}
              />
              <span
                className={`token-invalid ${
                  (!token || isLoading) && 'not-visible'
                }`}
              >
                Token invalid
              </span>
              <div className="loader-container">
                <TbLoader2
                  className={`loader ${!isLoading && 'not-visible'}`}
                />
              </div>
            </p>
          </form>
        </div>
      </div>
    )
  );
};

export default TokenForm;
