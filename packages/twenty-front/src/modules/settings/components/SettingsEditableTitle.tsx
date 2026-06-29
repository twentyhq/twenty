import {
  TitleInput,
  type TitleInputProps,
} from '@/ui/input/components/TitleInput';
import { styled } from '@linaria/react';

const StyledTitleInputContainer = styled.div`
  max-width: 420px;
  min-width: 0;
  width: fit-content;
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
