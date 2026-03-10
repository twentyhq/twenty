import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { IconLock } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledEmailBodyNotSharedContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.spacing[1]};
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex-direction: column;

  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};

  gap: ${themeCssVariables.spacing[3]};
  height: 80px;
  justify-content: center;
  width: 100%;
`;

const StyledEmailBodyNotSharedIconContainer = styled.div`
  align-items: center;
  display: flex;
  height: calc(${themeCssVariables.icon.size.sm} * 1px);
  justify-content: center;
  width: calc(${themeCssVariables.icon.size.sm} * 1px);
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
