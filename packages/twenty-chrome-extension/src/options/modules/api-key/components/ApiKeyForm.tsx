import styled from '@emotion/styled';
import { H2Title } from '../../ui/display/typography/components/H2Title';
import { useEffect, useState } from 'react';
import { TextInput } from '../../ui/input/components/TextInput';
import { Button } from '../../ui/input/button/Button';
import { Toggle } from '../../ui/input/components/Toggle';

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
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

const StyledImg = styled.img``;

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
        setRoute(localStorage.serverBaseUrl);
      }
    };

    void getState();
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ apiKey });
  }, [apiKey]);

  useEffect(() => {
    chrome.storage.local.set({ serverBaseUrl: route });
  }, [route]);

  const handleGenerateClick = () => {
    window.open(
      `${import.meta.env.VITE_FRONT_BASE_URL}/settings/developers/api-keys`,
    );
  };

  const handleToggle = () => {
    setShowSection(!showSection);
  };

  return (
    <StyledContainer isToggleOn={showSection}>
      <StyledHeader>
        <StyledImg src="/logo/32-32.png" alt="Twenty Logo" />
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
        <Button
          title="Generate a key"
          fullWidth={false}
          variant="primary"
          accent="default"
          size="small"
          position="standalone"
          soon={false}
          disabled={false}
          onClick={handleGenerateClick}
        />
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
