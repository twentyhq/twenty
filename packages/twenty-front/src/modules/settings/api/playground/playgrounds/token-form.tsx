import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { TbApi, TbChevronLeft, TbLink } from 'react-icons/tb';

export type SubDoc = 'core' | 'metadata';
export type TokenFormProps = {
  setOpenApiJson?: (json: object) => void;
  setToken?: (token: string) => void;
  setBaseUrl?: (baseUrl: string) => void;
  isTokenValid?: boolean;
  setIsTokenValid?: (arg: boolean) => void;
  setLoadingState?: (arg: boolean) => void;
  subDoc?: SubDoc;
};

const FormContainer = styled.div`
    height: 45px;
    overflow: hidden;
    border-bottom: 1px solid var(--ifm-color-secondary-light);
    position: sticky;
    top: calc(var(--ifm-navbar-height) + 10px);
    padding: 0 8px;
    background: var(--ifm-color-secondary-contrast-background);
    z-index: 2;
    display: flex;
`;

const Form = styled.form`
    display: flex;
    height: 45px;
    gap: 10px;
    width: 50%;
    margin-left: auto;
    flex: 0.7;
`;

const InputWrapper = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
    position: relative;
`;

const BackButton = styled.div`
    position: absolute;
    display: flex;
    left: 8px;
    height: 100%;
    align-items: center;
    cursor: pointer;
    color: #999999;

    &:hover {
        color: #16233f;
    }
`;

const InputIcon = styled.div`
    display: flex;
    align-items: center;
    position: absolute;
    top: 0;
    height: 100%;
    padding: 5px;
    color: #B3B3B3;
`;

const Input = styled.input`
    padding: 6px;
    margin: 5px 0;
    max-width: 460px;
    width: 100%;
    box-sizing: border-box;
    background-color: #f3f3f3;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding-left: 30px;
    height: 32px;

    &:disabled {
        color: rgb(153, 153, 153);
    }

    &[data-isinvalid="true"] {
        border: 1px solid #f83e3e;
    }
`;

const Select = styled.select`
  padding: 6px;
  margin: 5px 0;
  max-width: 460px;
  width: 100%;
  box-sizing: border-box;
  background-color: #f3f3f3;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 32px;
  flex: 1;
`;



const TokenForm = ({
  setOpenApiJson,
  setToken,
  setBaseUrl: submitBaseUrl,
  isTokenValid,
  setIsTokenValid,
  subDoc,
  setLoadingState,
}: TokenFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [locationSetting, setLocationSetting] = useState(
    (typeof window !== 'undefined' &&
      window.localStorage.getItem('baseUrl') &&
      JSON.parse(window.localStorage.getItem('baseUrl') ?? '')
        ?.locationSetting) ??
      'production',
  );
  const [baseUrl, setBaseUrl] = useState(
    (typeof window !== 'undefined' &&
      window.localStorage.getItem('baseUrl') &&
      JSON.parse(window.localStorage.getItem('baseUrl') ?? '')?.baseUrl) ??
      'https://api.twenty.com',
  );

  const tokenLocal = (
    typeof window !== 'undefined'
      ? window?.localStorage?.getItem?.('TryIt_securitySchemeValues')
      : '{}'
  ) as string;

  const token = JSON.parse(tokenLocal)?.bearerAuth ?? '';

  const updateLoading = (loading = false) => {
    setIsLoading(loading);
    setLoadingState?.(!!loading);
  };

  const updateToken = async (event: React.ChangeEvent<HTMLInputElement>) => {
    window.localStorage.setItem(
      'TryIt_securitySchemeValues',
      JSON.stringify({ bearerAuth: event.target.value }),
    );
    await submitToken(event.target.value);
  };

  const updateBaseUrl = (baseUrl: string, locationSetting: string) => {
    let url: string;
    if (locationSetting === 'production') {
      url = 'https://api.twenty.com';
    } else if (locationSetting === 'next') {
      url = 'https://api.twenty-next.com';
    } else if (locationSetting === 'localhost') {
      url = 'http://localhost:3000';
    } else {
      url = baseUrl;
    }

    setBaseUrl(url);
    setLocationSetting(locationSetting);
    submitBaseUrl?.(url);
    window.localStorage.setItem(
      'baseUrl',
      JSON.stringify({ baseUrl: url, locationSetting }),
    );
  };

  const validateToken = (openApiJson: any) => {
    setIsTokenValid?.(!!openApiJson.tags);
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
        setIsTokenValid?.(false);
      });
  };

  const submitToken = async (token: any) => {
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

  return (
    <FormContainer>
      <Form>
        <BackButton>
          <TbChevronLeft size={18} />
          <span>Back</span>
        </BackButton>
        <InputWrapper>
          <Select
            onChange={(event) => {
              updateBaseUrl(baseUrl, event.target.value);
            }}
            value={locationSetting}
          >
            <option value="production">Production API</option>
            <option value="demo">Demo API</option>
            <option value="localhost">Localhost</option>
            <option value="other">Other</option>
          </Select>
        </InputWrapper>
        <InputWrapper>
          <InputIcon title="Base URL">
            <TbLink size={20} />
          </InputIcon>
          <Input
            type="text"
            readOnly={isLoading}
            disabled={locationSetting !== 'other'}
            placeholder="Base URL"
            value={baseUrl}
            onChange={(event) =>
              updateBaseUrl(event.target.value, locationSetting)
            }
            onBlur={() => submitToken(token)}
          />
        </InputWrapper>
        <InputWrapper>
          <InputIcon>
            <TbApi size={20} />
          </InputIcon>
          <Input
            data-isinvalid={!isTokenValid && !isLoading}
            type="text"
            readOnly={isLoading}
            placeholder="API Key"
            defaultValue={token}
            onChange={updateToken}
          />
        </InputWrapper>
        <InputWrapper>
          <Select
            onChange={(event) => console.log("hey")
              // router.replace(
              //   pathname.split('/').slice(0, -1).join('/') +
              //     '/' +
              //     event.target.value,
            }
            // value={pathname.split('/').at(-1)}
          >
            <option value="core">Core</option>
            <option value="metadata">Metadata</option>
          </Select>
        </InputWrapper>
      </Form>
    </FormContainer>
  );
};

export default TokenForm;
