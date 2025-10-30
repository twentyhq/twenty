import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';

import { useWorkspaceBypass } from '@/auth/sign-in-up/hooks/useWorkspaceBypass';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';

const StyledCopyContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  max-width: 280px;
  text-align: center;

  & > a {
    color: ${({ theme }) => theme.font.color.tertiary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const StyledLinksContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex-wrap: nowrap;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  max-width: 100%;
  text-align: center;
  white-space: nowrap;

  & > a,
  & > button {
    background: none;
    border: none;
    color: ${({ theme }) => theme.font.color.tertiary};
    cursor: pointer;
    font: inherit;
    padding: 0;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const StyledSeparator = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const FooterNote = () => {
  const isOnAWorkspace = useIsCurrentLocationOnAWorkspace();

  const { shouldOfferBypass, shouldUseBypass, enableBypass } =
    useWorkspaceBypass();

  if (!isOnAWorkspace) {
    return (
      <StyledCopyContainer>
        <Trans>By using Twenty, you agree to the</Trans>{' '}
        <a
          href="https://twenty.com/legal/terms"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Trans>Terms of Service</Trans>
        </a>{' '}
        <Trans>and</Trans>{' '}
        <a
          href="https://twenty.com/legal/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Trans>Privacy Policy</Trans>
        </a>
        .
      </StyledCopyContainer>
    );
  }

  return (
    <StyledLinksContainer>
      {shouldOfferBypass && !shouldUseBypass && (
        <>
          <button type="button" onClick={enableBypass}>
            <Trans>Bypass SSO</Trans>
          </button>
          <StyledSeparator>•</StyledSeparator>
        </>
      )}
      <a
        href="https://twenty.com/legal/privacy"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Trans>Privacy Policy</Trans>
      </a>
      <StyledSeparator>•</StyledSeparator>
      <a
        href="https://twenty.com/legal/terms"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Trans>Terms of Service</Trans>
      </a>
    </StyledLinksContainer>
  );
};
