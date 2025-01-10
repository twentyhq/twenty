import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';

const StyledContainer = styled.div`
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

export const FooterNote = () => {
  const { t } = useTranslation();
  return (
  <StyledContainer>
    {t('youAgreeWith')}{' '}
    <a
      href="https://twenty.com/legal/terms"
      target="_blank"
      rel="noopener noreferrer"
    >
      {t('termsOfService')}
    </a>{' '}
    {t('and')}{' '}
    <a
      href="https://twenty.com/legal/privacy"
      target="_blank"
      rel="noopener noreferrer"
    >
      {t('privacyPolicy')}
    </a>
    .
  </StyledContainer>
)};
