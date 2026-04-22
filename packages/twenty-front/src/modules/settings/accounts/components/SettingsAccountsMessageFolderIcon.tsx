import { styled } from '@linaria/react';
import { MessageFolderImportPolicy } from 'twenty-shared/types';

import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsAccountsMessageFolderIconProps = {
  className?: string;
  value?: MessageFolderImportPolicy;
};

const StyledCardMedia = styled.div`
  align-items: stretch;
  border: 2px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  height: ${themeCssVariables.spacing[8]};
  justify-content: center;
  padding: ${themeCssVariables.spacing['0.5']};
  width: ${themeCssVariables.spacing[6]};
`;

const StyledFolderRow = styled.div`
  align-items: center;
  display: flex;
  gap: 2px;
`;

const StyledFolderIcon = styled.div<{ isDisabled?: boolean }>`
  background-color: ${({ isDisabled }) =>
    isDisabled
      ? themeCssVariables.background.quaternary
      : themeCssVariables.accent.accent4060};
  border-radius: 1px;
  height: 5px;
  width: 5px;
`;

const StyledFolderLabel = styled.div<{ isDisabled?: boolean }>`
  background-color: ${({ isDisabled }) =>
    isDisabled
      ? themeCssVariables.background.quaternary
      : themeCssVariables.accent.accent4060};
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
