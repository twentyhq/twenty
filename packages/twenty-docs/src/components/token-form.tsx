import React, { useEffect, useState } from 'react';
import { useHistory } from '@docusaurus/router';
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
  subdocName?: string;
};

const TokenForm = ({
  setOpenApiJson,
  setToken,
  setBaseUrl: submitBaseUrl,
  isTokenValid,
  setIsTokenValid,
  subdocName,
  setLoadingState,
}: TokenFormProps) => {
  const history = useHistory();
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

  const updateBaseUrl = (baseUrl) => {
    localStorage.setItem('baseUrl', JSON.stringify({ baseUrl: baseUrl }));
    setBaseUrl(baseUrl);
    submitBaseUrl?.(baseUrl);
  };

  const validateToken = (openApiJson) => setIsTokenValid(!!openApiJson.tags);

  const getJson = async (token: string) => {
    updateLoading(true);

    return await fetch(baseUrl + '/open-api/' + subdocName, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((result) => {
        validateToken(result);
        updateLoading(false);

        return result;
      })
      .catch(() => updateLoading(false));
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
      </form>
    </div>
  );
};

export default TokenForm;
