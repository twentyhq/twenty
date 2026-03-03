import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { IconLock } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledEmailBodyNotSharedContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.spacing[1]};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};

  height: 80px;
  justify-content: center;

  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  width: 100%;
`;

const StyledEmailBodyNotSharedIconContainer = styled.div`
  display: flex;
  width: calc(${themeCssVariables.icon.size.sm} * 1px);
  height: calc(${themeCssVariables.icon.size.sm} * 1px);
  justify-content: center;
  align-items: center;
`;

const StyledEmailBodyNotShared = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const EventCardMessageBodyNotShared = ({
  notSharedByFullName,
}: {
  notSharedByFullName: string;
}) => {
  return (
    <StyledEmailBodyNotSharedContainer>
      <StyledEmailBodyNotShared>
        <StyledEmailBodyNotSharedIconContainer>
          <IconLock />
        </StyledEmailBodyNotSharedIconContainer>
        <span>
          <Trans>Not shared by {notSharedByFullName}</Trans>
        </span>
      </StyledEmailBodyNotShared>
    </StyledEmailBodyNotSharedContainer>
  );
};
