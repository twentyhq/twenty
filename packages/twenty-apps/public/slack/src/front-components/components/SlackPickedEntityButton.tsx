import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledPickedEntity = styled.button`
  align-items: center;
  background: ${() => themeCssVariables.background.secondary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  padding: ${() => themeCssVariables.spacing[2]};
  text-align: left;
  width: 100%;

  &:hover:enabled {
    border-color: ${() => themeCssVariables.color.blue};
  }

  &:disabled {
    cursor: default;
  }
`;

const StyledDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledName = styled.span`
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
`;

const StyledMeta = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

type SlackPickedEntityButtonProps = {
  name: string;
  meta?: string;
  changeLabel: string;
  onChangeRequest: () => void;
  disabled?: boolean;
};

export const SlackPickedEntityButton = ({
  name,
  meta,
  changeLabel,
  onChangeRequest,
  disabled,
}: SlackPickedEntityButtonProps) => (
  <StyledPickedEntity
    type="button"
    onClick={onChangeRequest}
    disabled={disabled}
    aria-label={changeLabel}
  >
    <StyledDetails>
      <StyledName>{name}</StyledName>
      {isNonEmptyString(meta) && <StyledMeta>{meta}</StyledMeta>}
    </StyledDetails>
  </StyledPickedEntity>
);
