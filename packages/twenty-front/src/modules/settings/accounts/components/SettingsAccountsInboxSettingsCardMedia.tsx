import styled from '@emotion/styled';

const StyledCardMedia = styled.div`
  align-items: center;
  border: 2px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex-direction: column;
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(0.5)};
  width: ${({ theme }) => theme.spacing(6)};
`;

export { StyledCardMedia as SettingsAccountsInboxSettingsCardMedia };
