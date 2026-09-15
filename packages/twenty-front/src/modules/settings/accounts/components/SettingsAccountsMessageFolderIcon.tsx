import { styled } from '@linaria/react';
import { MessageFolderImportPolicy } from 'twenty-shared/types';

import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsAccountsMessageFolderIconProps = {
  className?: string;
  value?: MessageFolderImportPolicy;
};

const StyledCardMedia = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  height: 40px;
  justify-content: center;
  padding: 2px;
  width: 32px;
`;

const StyledCardMediaContent = styled.div`
  align-items: stretch;
  background-color: ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.xs};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  height: 100%;
  justify-content: center;
  min-width: 0;
  padding: 2px;
`;

const StyledFolderRow = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 0;
  gap: 2px;
  min-height: 0;
`;

const StyledFolderIcon = styled.div<{ isDisabled?: boolean }>`
  background-color: ${({ isDisabled }) =>
    isDisabled
      ? themeCssVariables.border.color.medium
      : themeCssVariables.accent.accent7};
  border-radius: 1px;
  height: 100%;
  width: 4.8px;
`;

const StyledFolderLabel = styled.div<{ isDisabled?: boolean }>`
  background-color: ${({ isDisabled }) =>
    isDisabled
      ? themeCssVariables.border.color.medium
      : themeCssVariables.accent.accent7};
  border-radius: 1px;
  flex: 1;
  height: 100%;
`;

export const SettingsAccountsMessageFolderIcon = ({
  className,
  value,
}: SettingsAccountsMessageFolderIconProps) => {
  const isSelectedFolders =
    value === MessageFolderImportPolicy.SELECTED_FOLDERS;

  return (
    <StyledCardMedia className={className}>
      <StyledCardMediaContent>
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
      </StyledCardMediaContent>
    </StyledCardMedia>
  );
};
