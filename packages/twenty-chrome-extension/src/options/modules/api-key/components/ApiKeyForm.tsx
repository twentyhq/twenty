import { useEffect, useState } from 'react';
import styled from '@emotion/styled';

import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/Button';
import { TextInput } from '@/ui/input/components/TextInput';
import { Toggle } from '@/ui/input/components/Toggle';

const StyledContainer = styled.div<{ isToggleOn: boolean }>`
  width: 400px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.background.primary};
  padding: ${({ theme }) => theme.spacing(10)};
  overflow: hidden;
  transition: height 0.3s ease;

  height: ${({ isToggleOn }) => (isToggleOn ? '450px' : '390px')};
  max-height: ${({ isToggleOn }) => (isToggleOn ? '450px' : '390px')};
`;

const StyledHeader = styled.header`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledImgLogo = styled.img`
  &:hover {
    cursor: pointer;
  }
`;

const StyledMain = styled.main`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

const StyledFooter = styled.footer`
  display: flex;
`;

const StyledTitleContainer = styled.div`
  flex: 0 0 80%;
`;

const StyledToggleContainer = styled.div`
  flex: 0 0 20%;
  display: flex;
  justify-content: flex-end;
`;

const StyledSection = styled.div<{ showSection: boolean }>`
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
  overflow: hidden;
  max-height: ${({ showSection }) => (showSection ? '200px' : '0')};
`;

const StyledButtonHorizontalContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

export const ApiKeyForm = () => {
  const [apiKey, setApiKey] = useState('');
  const [route, setRoute] = useState('');
  const [showSection, setShowSection] = useState(false);

  useEffect(() => {
    const getState = async () => {
      const localStorage = await chrome.storage.local.get();

      if (localStorage.apiKey) {
        setApiKey(localStorage.apiKey);
      }

      if (localStorage.serverBaseUrl) {
        setShowSection(true);
        setRoute(localStorage.serverBaseUrl);
      }
    };

    void getState();
  }, []);

  useEffect(() => {
    if (import.meta.env.VITE_SERVER_BASE_URL !== route) {
      chrome.storage.local.set({ serverBaseUrl: route });
    } else {
      chrome.storage.local.set({ serverBaseUrl: '' });
    }
  }, [route]);

  const handleValidateKey = () => {
    chrome.storage.local.set({ apiKey });

    window.close();
  };

  const handleGenerateClick = () => {
    window.open(`${import.meta.env.VITE_FRONT_BASE_URL}/settings/developers`);
  };

  const handleGoToTwenty = () => {
    window.open(`${import.meta.env.VITE_FRONT_BASE_URL}`);
  };

  const handleToggle = () => {
    setShowSection(!showSection);
  };

  return (
    <StyledContainer isToggleOn={showSection}>
      <StyledHeader>
        <StyledImgLogo
          src="/logo/32-32.svg"
          alt="Twenty Logo"
          onClick={handleGoToTwenty}
        />
      </StyledHeader>
      <StyledMain>
        <H2Title
          title="Connect your account"
          description="Input your key to link the extension to your workspace."
        />
        <TextInput
          label="Api key"
          value={apiKey}
          onChange={setApiKey}
          placeholder="My API key"
        />
        <StyledButtonHorizontalContainer>
          <Button
            title="Generate a key"
            fullWidth={true}
            variant="primary"
            accent="default"
            size="small"
            position="standalone"
            soon={false}
            disabled={false}
            onClick={handleGenerateClick}
          />
          <Button
            title="Validate key"
            fullWidth={true}
            variant="primary"
            accent="default"
            size="small"
            position="standalone"
            soon={false}
            disabled={apiKey === ''}
            onClick={handleValidateKey}
          />
        </StyledButtonHorizontalContainer>
      </StyledMain>

      <StyledFooter>
        <StyledTitleContainer>
          <H2Title
            title="Custom route"
            description="For developers interested in self-hosting or local testing of the extension."
          />
        </StyledTitleContainer>
        <StyledToggleContainer>
          <Toggle value={showSection} onChange={handleToggle} />
        </StyledToggleContainer>
      </StyledFooter>

      <StyledSection showSection={showSection}>
        {showSection && (
          <TextInput
            label="Route"
            value={route}
            onChange={setRoute}
            placeholder="My Route"
          />
        )}
      </StyledSection>
    </StyledContainer>
  );
};
