import styled from '@emotion/styled';

import { MessageFolderImportPolicy } from '@/accounts/types/MessageChannel';
import { SettingsAccountsCardMedia } from '@/settings/accounts/components/SettingsAccountsCardMedia';

type SettingsAccountsMessageFolderIconProps = {
  className?: string;
  value?: MessageFolderImportPolicy;
};

const StyledCardMedia = styled(SettingsAccountsCardMedia)`
  align-items: stretch;
  flex-direction: column;
`;

const StyledFolderRow = styled.div`
  align-items: center;
  display: flex;
  gap: 2px;
`;

const StyledFolderIcon = styled.div<{ isDisabled?: boolean }>`
  background-color: ${({ isDisabled, theme }) =>
    isDisabled ? theme.background.quaternary : theme.accent.accent4060};
  border-radius: 1px;
  height: 5px;
  width: 5px;
`;

const StyledFolderLabel = styled.div<{ isDisabled?: boolean }>`
  background-color: ${({ isDisabled, theme }) =>
    isDisabled ? theme.background.quaternary : theme.accent.accent4060};
  border-radius: 1px;
  flex: 1;
  height: 5px;
`;

export const SettingsAccountsMessageFolderIcon = ({
  className,
  value,
}: SettingsAccountsMessageFolderIconProps) => {
  const isSelectedFolders =
    value === MessageFolderImportPolicy.SELECTED_FOLDERS;

  return (
    <StyledCardMedia className={className}>
      <StyledFolderRow>
        <StyledFolderIcon isDisabled={isSelectedFolders} />
        <StyledFolderLabel isDisabled={isSelectedFolders} />
      </StyledFolderRow>
      <StyledFolderRow>
        <StyledFolderIcon isDisabled={isSelectedFolders} />
        <StyledFolderLabel isDisabled={isSelectedFolders} />
      </StyledFolderRow>
      <StyledFolderRow>
        <StyledFolderIcon />
        <StyledFolderLabel />
      </StyledFolderRow>
      <StyledFolderRow>
        <StyledFolderIcon isDisabled={isSelectedFolders} />
        <StyledFolderLabel isDisabled={isSelectedFolders} />
      </StyledFolderRow>
      <StyledFolderRow>
        <StyledFolderIcon />
        <StyledFolderLabel />
      </StyledFolderRow>
    </StyledCardMedia>
  );
};
