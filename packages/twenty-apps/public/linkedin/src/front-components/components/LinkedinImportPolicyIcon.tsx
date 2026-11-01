import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme';

import { type LinkedinImportPolicy } from 'src/types/linkedin-import-policy.type';

const StyledCardMedia = styled.div`
  background-color: ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: 40px;
  padding: 2px;
  width: 32px;
`;

const StyledCardMediaContent = styled.div`
  background-color: ${() => themeCssVariables.background.secondary};
  border-radius: ${() => themeCssVariables.border.radius.xs};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  justify-content: center;
  padding: 2px;
`;

const StyledRow = styled.div`
  display: flex;
  flex: 1 0 0;
  gap: 2px;
  min-height: 0;
`;

const StyledBullet = styled.div<{ $isActive: boolean }>`
  background-color: ${({ $isActive }) =>
    $isActive
      ? themeCssVariables.accent.accent7
      : themeCssVariables.border.color.medium};
  border-radius: 1px;
  width: 4.8px;
`;

const StyledLabel = styled(StyledBullet)`
  flex: 1;
  width: auto;
`;

const ROW_IS_ACTIVE_FOR_CONTACTS_ONLY = [false, false, true, false, true];

type LinkedinImportPolicyIconProps = {
  importPolicy: LinkedinImportPolicy;
};

export const LinkedinImportPolicyIcon = ({
  importPolicy,
}: LinkedinImportPolicyIconProps) => (
  <StyledCardMedia>
    <StyledCardMediaContent>
      {ROW_IS_ACTIVE_FOR_CONTACTS_ONLY.map((isActiveForContactsOnly, index) => {
        const isActive = importPolicy === 'ALL' || isActiveForContactsOnly;

        return (
          <StyledRow key={index}>
            <StyledBullet $isActive={isActive} />
            <StyledLabel $isActive={isActive} />
          </StyledRow>
        );
      })}
    </StyledCardMediaContent>
  </StyledCardMedia>
);
