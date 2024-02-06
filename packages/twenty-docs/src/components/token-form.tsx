import React, { useEffect, useState } from 'react';
import { TbLoader2 } from 'react-icons/tb';
import { parseJson } from 'nx/src/utils/json';

import tokenForm from '!css-loader!./token-form.css';

export type TokenFormProps = {
  setOpenApiJson?: (json: object) => void;
  setToken?: (token: string) => void;
  setBaseUrl?: (baseUrl: string) => void;
  isTokenValid: boolean;
  setIsTokenValid: (boolean) => void;
  subdocName?: string;
};

const TokenForm = ({
  setOpenApiJson,
  setToken,
  setBaseUrl: submitBaseUrl,
  isTokenValid,
  setIsTokenValid,
  subdocName,
}: TokenFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState(
    parseJson(localStorage.getItem('baseUrl'))?.baseUrl ??
      'https://api.twenty.com',
  );
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

  const updateBaseUrl = (baseUrl) => {
    localStorage.setItem('baseUrl', JSON.stringify({ baseUrl: baseUrl }));
    setBaseUrl(baseUrl);
    submitBaseUrl?.(baseUrl);
  };

  const validateToken = (openApiJson) => setIsTokenValid(!!openApiJson.tags);

  const getJson = async (token: string) => {
    setIsLoading(true);

    return await fetch(baseUrl + '/open-api/' + subdocName, {
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
      submitBaseUrl?.(baseUrl);
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
            <label>Base Url</label>
            <p>
              <input
                className={'input'}
                type="text"
                readOnly={isLoading}
                placeholder="https://api.twenty.com"
                defaultValue={baseUrl}
                onChange={(event) => updateBaseUrl(event.target.value)}
                onBlur={() => submitToken(token)}
              />
            </p>
          </form>
        </div>
      </div>
    )
  );
};

export default TokenForm;
