import {
  TitleInput,
  type TitleInputProps,
} from '@/ui/input/components/TitleInput';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTitleInputContainer = styled.div`
  border-radius: ${themeCssVariables.border.radius.sm};
  max-width: 420px;
  min-width: 0;
  padding-left: ${themeCssVariables.spacing[1]};
  padding-right: ${themeCssVariables.spacing[1]};
  width: fit-content;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  & > div:hover {
    background: transparent;
  }

  & > div :hover {
    background: transparent;
  }

  & > input:disabled {
    color: ${themeCssVariables.font.color.primary};
  }
`;

export type SettingsEditableTitleProps = TitleInputProps;

export const SettingsEditableTitle = (props: SettingsEditableTitleProps) => (
  <StyledTitleInputContainer>
    <TitleInput
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
      sizeVariant={props.sizeVariant ?? 'sm'}
    />
  </StyledTitleInputContainer>
);
