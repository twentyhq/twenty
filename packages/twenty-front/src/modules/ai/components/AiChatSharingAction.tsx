import { styled } from '@linaria/react';
import { MenuItem, type MenuItemProps } from 'twenty-ui/primitives/navigation';

const StyledAction = styled.button`
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  padding: 0;
  text-align: left;
  width: 100%;
`;

type AiChatSharingActionProps = Pick<
  MenuItemProps,
  'text' | 'contextualText' | 'LeftIcon' | 'disabled'
> & {
  onClick: () => void;
};

export const AiChatSharingAction = ({
  onClick,
  disabled,
  text,
  contextualText,
  LeftIcon,
}: AiChatSharingActionProps) => (
  <StyledAction type="button" disabled={disabled} onClick={onClick}>
    <MenuItem
      text={text}
      contextualText={contextualText}
      LeftIcon={LeftIcon}
      disabled={disabled}
    />
  </StyledAction>
);
