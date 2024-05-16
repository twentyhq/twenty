import React, { useEffect, useState } from 'react';
import { TbApi, TbChevronLeft, TbLink } from 'react-icons/tb';
import { useHistory, useLocation } from '@docusaurus/router';
import { parseJson } from 'nx/src/utils/json';

import tokenForm from '!css-loader!./token-form.css';

export type SubDoc = 'core' | 'metadata';
export type TokenFormProps = {
  setOpenApiJson?: (json: object) => void;
  setToken?: (token: string) => void;
  setBaseUrl?: (baseUrl: string) => void;
  isTokenValid?: boolean;
  setIsTokenValid?: (boolean) => void;
  setLoadingState?: (boolean) => void;
  subDoc?: SubDoc;
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
  const [locationSetting, setLocationSetting] = useState(
    parseJson(localStorage.getItem('baseUrl'))?.locationSetting ??
      'production',
  );
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

  const updateBaseUrl = (baseUrl: string, locationSetting: string) => {
    let url: string;
    if (locationSetting === 'production') {
      url = 'https://api.twenty.com';
    } else if (locationSetting === 'demo') {
      url = 'https://api-demo.twenty.com';
    } else if (locationSetting === 'localhost') {
      url = 'http://localhost:3000';
    } else {
      url = baseUrl?.endsWith('/')
      ? baseUrl.substring(0, baseUrl.length - 1)
      : baseUrl
    }
    
    setBaseUrl(url);
    setLocationSetting(locationSetting);
    submitBaseUrl?.(url);
    localStorage.setItem('baseUrl', JSON.stringify({ baseUrl: url, locationSetting }));
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
      updateBaseUrl(baseUrl, locationSetting);
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
          <select
            className="select"
            onChange={(event) => {
              updateBaseUrl(baseUrl, event.target.value)
            }}
            value={locationSetting}
          >
            <option value="production">Production API</option>
            <option value="demo">Demo API</option>
            <option value="localhost">Localhost</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="inputWrapper">
          <div className="inputIcon" title="Base URL">
            <TbLink size={20} />
          </div>
          <input
            className={'input'}
            type="text"
            readOnly={isLoading}
            disabled={locationSetting !== 'other'}
            placeholder="Base URL"
            value={baseUrl}
            onChange={(event) => updateBaseUrl(event.target.value, locationSetting)}
            onBlur={() => submitToken(token)}
          />
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
      </form>
    </div>
  );
};

export default TokenForm;
