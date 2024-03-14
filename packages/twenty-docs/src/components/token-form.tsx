import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from '@docusaurus/router';
import { TbApi, TbChevronLeft, TbLink } from '@theme/icons';
import { parseJson } from 'nx/src/utils/json';

import tokenForm from '!css-loader!./token-form.css';

export type TokenFormProps = {
  setOpenApiJson?: (json: object) => void;
  setToken?: (token: string) => void;
  setBaseUrl?: (baseUrl: string) => void;
  isTokenValid: boolean;
  setIsTokenValid: (boolean) => void;
  setLoadingState: (boolean) => void;
  subDoc?: string;
};

const TokenForm = ({
  setOpenApiJson,
  setToken,
  setBaseUrl: submitBaseUrl,
  isTokenValid,
  setIsTokenValid,
  subDoc,
  setLoadingState,
}: TokenFormProps) => {
  const history = useHistory();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState(
    parseJson(localStorage.getItem('baseUrl'))?.baseUrl ??
      'https://api.twenty.com',
  );
  const token =
    parseJson(localStorage.getItem('TryIt_securitySchemeValues'))?.bearerAuth ??
    '';

  const updateLoading = (loading: boolean) => {
    setIsLoading(loading);
    setLoadingState(loading);
  };

  const updateToken = async (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem(
      'TryIt_securitySchemeValues',
      JSON.stringify({ bearerAuth: event.target.value }),
    );
    await submitToken(event.target.value);
  };

  const updateBaseUrl = (baseUrl: string) => {
    const url = baseUrl?.endsWith('/')
      ? baseUrl.substring(0, baseUrl.length - 1)
      : baseUrl;
    setBaseUrl(url);
    submitBaseUrl?.(url);
    localStorage.setItem('baseUrl', JSON.stringify({ baseUrl: url }));
  };

  const validateToken = (openApiJson) => {
    setIsTokenValid(!!openApiJson.tags);
  };

  const getJson = async (token: string) => {
    updateLoading(true);

    return await fetch(baseUrl + '/open-api/' + (subDoc ?? 'core'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((result) => {
        validateToken(result);
        updateLoading(false);

        return result;
      })
      .catch(() => {
        updateLoading(false);
        setIsTokenValid(false);
      });
  };

  const submitToken = async (token) => {
    if (isLoading) return;

    const json = await getJson(token);

    setToken && setToken(token);

    setOpenApiJson && setOpenApiJson(json);
  };

  useEffect(() => {
    (async () => {
      updateBaseUrl(baseUrl);
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
    <div className="form-container">
      <form className="form">
        <div className="backButton" onClick={() => history.goBack()}>
          <TbChevronLeft size={18} />
          <span>Back</span>
        </div>

        <div className="inputWrapper">
          <div className="inputIcon" title="Api Key">
            <TbApi size={20} />
          </div>
          <input
            className={!isTokenValid && !isLoading ? 'input invalid' : 'input'}
            type="text"
            readOnly={isLoading}
            placeholder="API Key"
            defaultValue={token}
            onChange={updateToken}
          />
        </div>
        <div className="inputWrapper">
          <div className="inputIcon" title="Base URL">
            <TbLink size={20} />
          </div>
          <input
            className={'input'}
            type="text"
            readOnly={isLoading}
            placeholder="Base URL"
            defaultValue={baseUrl}
            onChange={(event) => updateBaseUrl(event.target.value)}
            onBlur={() => submitToken(token)}
          />
        </div>
        {!location.pathname.includes('rest-api') && (
          <div className="inputWrapper" style={{ maxWidth: '100px' }}>
            <select
              className="select"
              onChange={(event) =>
                history.replace(
                  '/' +
                    location.pathname.split('/').at(-2) +
                    '/' +
                    event.target.value,
                )
              }
              value={location.pathname.split('/').at(-1)}
            >
              <option value="core">Core</option>
              <option value="metadata">Metadata</option>
            </select>
          </div>
        )}
      </form>
    </div>
  );
};

export default TokenForm;
