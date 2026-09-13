import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type GranolaFolderPolicy } from 'src/front-components/types/granola-folder-policy.type';

// Mirrors twenty-front's SettingsAccountsMessageFolderIcon, which a front component cannot import.
const StyledCardMedia = styled.div`
  align-items: center;
  background-color: ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  padding: 2px;
  width: 32px;
`;

const StyledCardMediaContent = styled.div`
  align-items: stretch;
  background-color: ${() => themeCssVariables.background.secondary};
  border-radius: ${() => themeCssVariables.border.radius.xs};
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

const StyledFolderIcon = styled.div<{ $isDisabled: boolean }>`
  background-color: ${({ $isDisabled }) =>
    $isDisabled
      ? themeCssVariables.border.color.medium
      : themeCssVariables.accent.accent7};
  border-radius: 1px;
  height: 100%;
  width: 4.8px;
`;

const StyledFolderLabel = styled.div<{ $isDisabled: boolean }>`
  background-color: ${({ $isDisabled }) =>
    $isDisabled
      ? themeCssVariables.border.color.medium
      : themeCssVariables.accent.accent7};
  border-radius: 1px;
  flex: 1;
  height: 100%;
`;

const ROW_IS_DISABLED_WHEN_SELECTING = [true, true, false, true, false];

type GranolaFolderPolicyIconProps = {
  policy: GranolaFolderPolicy;
};

export const GranolaFolderPolicyIcon = ({
  policy,
}: GranolaFolderPolicyIconProps) => {
  const isSelectedFolders = policy === 'SELECTED_FOLDERS';

  return (
    <StyledCardMedia>
      <StyledCardMediaContent>
        {ROW_IS_DISABLED_WHEN_SELECTING.map(
          (isDisabledWhenSelecting, index) => {
            const isDisabled = isSelectedFolders && isDisabledWhenSelecting;

            return (
              <StyledFolderRow key={index}>
                <StyledFolderIcon $isDisabled={isDisabled} />
                <StyledFolderLabel $isDisabled={isDisabled} />
              </StyledFolderRow>
            );
          },
        )}
      </StyledCardMediaContent>
    </StyledCardMedia>
  );
};
